type OpenSearchResponseType = [string, string[], string[], string[]];

type WikipediaArticleType = {
  title: string;
  url: string;
};

export const searchWikipediaArticles = async (
  query: string
): Promise<WikipediaArticleType[]> => {
  const wikiApiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&search=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(wikiApiUrl);
    const data: OpenSearchResponseType = await response.json();

    const titles = data[1];
    const urls = data[3];

    const articles = titles.map((title, index) => ({
      title,
      url: urls[index],
    }));

    return articles;
  } catch (error) {
    console.error('Error fetching Wikipedia data:', error);
    return [];
  }
};
