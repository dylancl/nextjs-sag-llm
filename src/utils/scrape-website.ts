import fetch from 'node-fetch';
import cheerio from 'cheerio';
import striptags from 'striptags';
import { getRandomUserAgent } from './get-random-user-agent';

/**
 * Scrapes a given website using cheerio and simple HTML parsing
 * to extract the text content of the website.
 * We make use of the striptags library to extract only the text content
 *
 * @param url The URL of the website to scrape
 * @returns The text content of the website
 * @throws Error if the website cannot be scraped
 */
export const scrapeWebsite = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Only extract the text content of the website
    // This includes: <p>, <h1>, <h2>, <h3>, <h4>, <h5>, <h6>, <li>, <a>, <span>, <div>
    // We can add more tags as needed
    const textContent = $('p, h1, h2, h3, h4, h5, h6, li, a, span, div')
      .map((_, element) => {
        return $(element).text();
      })
      .get()
      .join(' ');

    // Strip HTML tags from the text content
    const strippedContent = striptags(textContent);

    // Remove all extra whitespace and newlines
    return strippedContent.replace(/\s+/g, ' ').trim();
  } catch (error: any) {
    throw new Error(`Error scraping website: ${error.message}`);
  }
};
