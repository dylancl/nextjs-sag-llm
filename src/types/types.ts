type SearchResult = {
  title: string;
  description: string;
  url: string;
  icon: string;
};

type AIEvent = {
  type:
    | 'transforming_message'
    | 'extracted_keywords'
    | 'search_started'
    | 'search_results'
    | 'embed_data'
    | 'retrieve_embeddings'
    | 'response_chunk'
    | 'scraping_site'
    | 'generating_response';
  message?: string;
};

type ChatEvent = {
  createdAt: Date;
  type: AIEvent['type'];
  loading: boolean;
  message?: string;
};

export type { SearchResult, AIEvent, ChatEvent };
