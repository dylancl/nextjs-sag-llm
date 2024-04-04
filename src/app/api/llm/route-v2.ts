import { asChatMessages } from '@modelfusion/vercel-ai';
import { Message } from 'ai';
import {
  llamacpp,
  retrieve,
  splitAtCharacter,
  splitAtToken,
  streamText,
  upsertIntoVectorIndex,
  VectorIndexRetriever,
} from 'modelfusion';
import keyword_extractor from 'keyword-extractor';
import { getDuckDuckGoData } from '@/utils/get-duckduckgo-data';
import { getGoogleSearchResults } from '@/utils/get-google-search-results';
import { dedent, stringify } from '@/utils/general';
import { AIEvent, SearchResult } from '@/types/types';
import { Stringified } from '@/types/utility';
import { formatSearchResults } from '@/utils/format-search-results';
import vectorIndex from '../db/MemoryVectorIndex';
import { scrapeWebsite } from '@/utils/scrape-website';
import { ContextCache } from '../db/ContextCache';

const contextCache = new ContextCache();

const model = llamacpp
  .CompletionTextGenerator({
    promptTemplate: llamacpp.prompt.ChatML,
    temperature: 0.5,
  })
  .withChatPrompt();

async function* generateEvents(
  messages: Message[],
  conversationId: number,
  disableContext?: boolean
): AsyncGenerator<AIEvent, void, void> {
  let retrievedContextUrls: string[] = [];
  let retrievedContextTexts: string[] = [];

  // Get the context of the conversation
  const cachedContext = contextCache.get(conversationId.toString());
  if (cachedContext) {
    retrievedContextUrls = cachedContext.retrievedContextUrls;
    retrievedContextTexts = cachedContext.retrievedContextTexts;
  }

  if (messages.length === 1 && !disableContext) {
    const lastUserMessage = messages[messages.length - 1];

    const extractedKeyWords = keyword_extractor.extract(
      lastUserMessage.content,
      {
        language: 'english',
        remove_digits: true,
        return_changed_case: true,
        remove_duplicates: true,
      }
    );

    let extraContext: { searchResults: SearchResult[] } = {
      searchResults: [],
    };

    yield {
      type: 'search_started',
      message: `Searching Google and DuckDuckGo for ${extractedKeyWords.join(
        ' '
      )}...`,
    };

    try {
      const [ddgSearchResults, googleSearchResults] = await Promise.all([
        getDuckDuckGoData(extractedKeyWords.join(' ')),
        getGoogleSearchResults(extractedKeyWords.join(' ')),
      ]);

      extraContext = {
        searchResults: [...ddgSearchResults, ...googleSearchResults],
      };
    } catch (e) {
      console.error(e);
    }

    // Retrieve & scrape the most relevant source
    yield {
      type: 'scraping_site',
      message: 'Scraping most relevant source for more information...',
    };

    let possibleScrapedText = '';
    if (extraContext.searchResults.length) {
      try {
        possibleScrapedText = await scrapeWebsite(
          extraContext.searchResults[0].url
        );
      } catch (e) {
        console.error(e);
      }
    }

    yield {
      type: 'embed_data',
      message: 'Generating embeddings and storing in vector index...',
    };

    const embeddingModel = llamacpp.TextEmbedder({
      api: llamacpp.Api({
        baseUrl: {
          port: '8081',
        },
      }),
    });

    const split = splitAtCharacter({ maxCharactersPerChunk: 256 });

    const textToEmbed = [
      ...formatSearchResults(extraContext.searchResults),
      ...(possibleScrapedText
        ? await split({ text: possibleScrapedText })
        : []),
    ];

    // Upsert the search results into the vector index
    await upsertIntoVectorIndex({
      vectorIndex,
      embeddingModel,
      objects: textToEmbed,
      getValueToEmbed: (text) => text,
    });

    yield {
      type: 'retrieve_embeddings',
      message: 'Retrieving embeddings...',
    };

    retrievedContextUrls = await retrieve(
      new VectorIndexRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.4,
        // We only want to search the results here, not the scraped text
        filter: (vectorString) => !!vectorString.includes('{"title":'),
      }),
      extractedKeyWords.join(' ')
    );

    retrievedContextTexts = await retrieve(
      new VectorIndexRetriever({
        vectorIndex,
        embeddingModel,
        maxResults: 5,
        similarityThreshold: 0.6,
        // We only want to search the results here, not the scraped text
        filter: (vectorString) => !vectorString.includes('{"title":'),
      }),
      extractedKeyWords.join(' ')
    );

    const parsedContextUrls = JSON.parse(`[${retrievedContextUrls.join(',')}]`);
    yield {
      type: 'search_results',
      message: JSON.stringify(parsedContextUrls, null, 2),
    };

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 1000));

    yield {
      type: 'generating_response',
      message: 'Assistant is generating a response...',
    };

    const textStream = await streamText({
      model,
      prompt: {
        system: dedent`
          Date:  ${new Date().toLocaleString()}
          You're an AI assistant helping a user with a question. Your response should be informative and helpful.
          Your response will be rendered in a text box which supports markdown (Github flavor).
          ${
            !!retrievedContextUrls.length &&
            `
            Ground your response in the context provided below. When using information from the context, always cite the source 
            using the format: [Website name](url). For example, [Wikipedia](https://en.wikipedia.org/wiki/Artificial_intelligence).
            ----CONTEXT----
            [search_results: {${retrievedContextUrls
              .map((text) => `${text}`)
              .join('\n')}}]
            ${
              !!retrievedContextTexts &&
              `[scraped_text: {${retrievedContextTexts
                .map((text) => `${text}`)
                .join('\n')}}]`
            } 
            ----END OF CONTEXT----
          `
          }
        `,
        messages: asChatMessages(messages),
      },
      logging: 'detailed-object',
    });

    for await (const chunk of textStream) {
      yield {
        type: 'response_chunk',
        message: chunk,
      };
    }
  }
}

export const POST = async (req: Request) => {
  const {
    messages,
    disableContext,
    conversationId,
  }: { messages: Message[]; disableContext?: boolean; conversationId: number } =
    await req.json();

  const readableStream = new ReadableStream<Stringified<AIEvent>>({
    async start(controller) {
      for await (const event of generateEvents(
        messages,
        conversationId,
        disableContext
      )) {
        controller.enqueue(stringify(event));
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
};
