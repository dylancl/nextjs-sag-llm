/**
 * Returns the content of a Wikipedia article, based on either a title
 * or a direct URL.
 *
 * @param title The title of the Wikipedia article.
 * @param url The URL of the Wikipedia article.
 * @returns The content of the Wikipedia article.
 */
export const getWikipediaArticleContent = async (
  title: string,
  url?: string
): Promise<string> => {
  const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=extracts&titles=${encodeURIComponent(
    title
  )}&exlimit=max&explaintext`;

  try {
    const response = await fetch(wikiApiUrl);
    const data = await response.json();
    const pageId = Object.keys(data.query.pages)[0];
    console.log({ data: data.query.pages[pageId], pageId });
    return data.query.pages[pageId].extract;
  } catch (error) {
    console.error('Error fetching Wikipedia article content:', error);
    return '';
  }
};
