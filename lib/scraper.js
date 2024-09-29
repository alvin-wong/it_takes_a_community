const puppeteer = require('puppeteer');

let browserInstance = null;

// Launch the browser instance
async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: true });
  }
  return browserInstance;
}

// Process metric string
function processMetric(metric) {
  return metric
    .replace('_raw_value', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

async function scrapeResources(metric, countyName, maxResults = 10) {
  const processedMetric = processMetric(metric);
  const query = `${processedMetric} help resources in ${countyName}`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });

    // Extract the search results in parallel
    const resources = await page.evaluate((maxResults) => {
      const results = [];
      const searchResults = document.querySelectorAll('.g');

      for (let i = 0; i < Math.min(searchResults.length, maxResults); i++) {
        const result = searchResults[i];
        const titleElement = result.querySelector('h3');
        const linkElement = result.querySelector('a');
        
        if (titleElement && linkElement) {
          results.push({
            title: titleElement.textContent,
            link: linkElement.href,
          });
        }
      }

      return results;
    }, maxResults);

    // Use promise.all to fetch multiple resources in parallel
    const detailedResources = await Promise.all(
      resources.map(async (resource) => {
        const newPage = await browser.newPage();
        try {
          await newPage.goto(resource.link, { waitUntil: 'domcontentloaded', timeout: 25000 });
          
          const content = await newPage.evaluate(() => {
            const mainContent = document.querySelector('main, article, .content, #content');
            return mainContent ? mainContent.innerText : document.body.innerText;
          });

          return {
            ...resource,
            content: content.slice(0, 200).replace(/\s+/g, ' ').trim(),
          };
        } catch (error) {
          console.error(`Error fetching content for ${resource.link}: ${error.message}`);
          return { ...resource, content: '' };
        } finally {
          await newPage.close();
        }
      })
    );

    return detailedResources;

  } catch (error) {
    console.error(`Scraping failed: ${error.message}`);
    throw error;
  } finally {
    await page.close();
  }
}

process.on('exit', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
});

module.exports = { scrapeResources };
