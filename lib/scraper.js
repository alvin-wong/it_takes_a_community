// const puppeteer = require('puppeteer');
// const cheerio = require('cheerio');

// // Function to scrape the web based on a search query (metric + FIPS code)
// export async function scrapeResources(metric, location) {
//   const query = `${metric} help resources in ${location}`;
//   const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(url);

//   // Extract content using Cheerio for ease
//   const content = await page.content();
//   const $ = cheerio.load(content);

//   const resources = [];

//   // Extract relevant links from the search results (this example assumes Google's search result structure)
//   $('a').each((index, element) => {
//     const title = $(element).text();
//     const link = $(element).attr('href');
//     if (title && link) {
//       resources.push({ title, link });
//     }
//   });

//   await browser.close();
//   return resources; // List of links and titles
// }
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Function to scrape the web based on a search query (metric + County Name)
export async function scrapeResources(metric, countyName) {
  const query = `${metric} help resources in ${countyName}`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  // Extract content using Cheerio for ease
  const content = await page.content();
  const $ = cheerio.load(content);

  const resources = [];

  // Extract relevant links from the search results (this example assumes Google's search result structure)
  $('a').each((index, element) => {
    const title = $(element).text();
    const link = $(element).attr('href');
    if (title && link && link.startsWith('http')) {
      resources.push({ title, link });
    }
  });

  await browser.close();
  return resources; // List of links and titles
}
