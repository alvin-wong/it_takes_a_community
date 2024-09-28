const puppeteer = require('puppeteer');

let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    browserInstance = await puppeteer.launch({ headless: 'new' });
  }
  return browserInstance;
}

async function scrapeResources(metric, countyName, maxResults = 5) {
  const query = `${metric} help resources in ${countyName}`;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

  const browser = await getBrowser();
  const page = await browser.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle0' });

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
            link: linkElement.href
          });
        }
      }
      
      return results;
    }, maxResults);

    const detailedResources = [];

    for (const resource of resources) {
      const newPage = await browser.newPage();
      try {
        await newPage.goto(resource.link, { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const content = await newPage.evaluate(() => {
          const mainContent = document.querySelector('main, article, .content, #content');
          if (mainContent) {
            return mainContent.innerText;
          }
          return document.body.innerText;
        });

        detailedResources.push({
          ...resource,
          content: content.slice(0, 200).replace(/\s+/g, ' ').trim()
        });

      } catch (error) {
        console.error(`Error fetching content for ${resource.link}: ${error.message}`);
      } finally {
        await newPage.close();
      }
    }

    return detailedResources;

  } catch (error) {
    console.error(`Scraping failed: ${error.message}`);
    throw error;
  } finally {
    await page.close();
    // Do not close the browser here if reusing
  }
}

// Optionally, handle browser shutdown gracefully when the server stops
process.on('exit', async () => {
  if (browserInstance) {
    await browserInstance.close();
  }
});

module.exports = { scrapeResources }