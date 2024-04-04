import { SearchResult } from '@/types/types';

/**
 * Format the search results we receive from DDG & Google
 * into a string to be upserted into the vector index for the model.
 */
export const formatSearchResults = (
  searchResults: SearchResult[]
): string[] => {
  return searchResults.map((result) => {
    return JSON.stringify({
      title: result.title,
      description: result.description,
      url: result.url,
    });
  });
};
