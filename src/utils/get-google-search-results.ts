import { load } from 'cheerio';
import { getRandomUserAgent } from './get-random-user-agent';
import { SearchResult } from '@/types/types';

// Wrapper class for a search result
const SEARCH_CLASS = '.MjjYud';
// Title of the search result
const SEARCH_TITLE_CLASS = '.DKV0Md';
// Description of the search result
const SEARCH_DESCRIPTION_CLASS = '.Hdw6tb';

/**
 * Get Google search results for a given query
 * This is done by scraping the Google search results page
 * Be warned as the class names used in this function may change
 * @param query - The search query
 * @returns A list of search results in the format "title - description - url"
 */
export const getGoogleSearchResults = async (
  query: string
): Promise<SearchResult[]> => {
  const url = `https://www.google.com/search?q=${encodeURIComponent(
    query
  )}&gl=us&hl=en`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': getRandomUserAgent(),
    },
  });

  const html = await response.text();
  const $ = load(html);

  // Search for "related questions" in the Google search results
  const searchResults = $(`${SEARCH_CLASS}`).map((_, element) => {
    const title = $(element).find(SEARCH_TITLE_CLASS).text();
    const description = $(element).find(SEARCH_DESCRIPTION_CLASS).text();
    const url = $(element).find('a').attr('href');
    return { title, description, url };
  });

  return (
    searchResults
      .get()
      .map((result) => {
        if (!result.title || !result.description || !result.url) {
          return '';
        }

        return {
          title: result.title,
          description: result.description,
          url: result.url,
          icon: 'https://www.google.com/favicon.ico',
        };
      })
      // Don't include empty results
      .filter((result) => result !== '')
  );
};
