import { SearchResult } from '@/types/types';
import { search } from 'duck-duck-scrape';

export const getDuckDuckGoData = async (
  query: string
): Promise<SearchResult[]> => {
  const searchResults = await search(query);

  return searchResults.results.map((result) => ({
    title: result.title,
    description: result.description,
    url: result.url,
    icon: result.icon,
  }));
};
