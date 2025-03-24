const puppeteer = require('puppeteer');
const axios = require('axios');

/**
 * Search Google for websites in a specific niche
 * @param {string} searchTerm - The search term to use
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of website objects with url, title, and snippet
 */
async function searchGoogle(searchTerm, limit = 10) {
  console.log(`Starting Google search for: ${searchTerm}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to Google
    await page.goto('https://www.google.com/search?q=' + encodeURIComponent(searchTerm));
    
    // Wait for search results to load
    await page.waitForSelector('div.g');
    
    // Extract search results
    const searchResults = await page.evaluate(() => {
      const results = [];
      const elements = document.querySelectorAll('div.g');
      
      elements.forEach((element) => {
        const titleElement = element.querySelector('h3');
        const linkElement = element.querySelector('a');
        const snippetElement = element.querySelector('div.VwiC3b');
        
        if (titleElement && linkElement && snippetElement) {
          const title = titleElement.innerText;
          const url = linkElement.href;
          const snippet = snippetElement.innerText;
          
          results.push({ title, url, snippet });
        }
      });
      
      return results;
    });
    
    console.log(`Found ${searchResults.length} search results`);
    
    // Limit the number of results
    const limitedResults = searchResults.slice(0, limit);
    
    // Extract contact information for each website
    const websitesWithContact = await Promise.all(
      limitedResults.map(async (site) => {
        const contactInfo = await extractContactInfo(site.url);
        return { ...site, ...contactInfo };
      })
    );
    
    return websitesWithContact;
  } catch (error) {
    console.error('Error during Google search:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

/**
 * Extract contact information from a website
 * @param {string} url - The website URL
 * @returns {Promise<Object>} - Object with contact information
 */
async function extractContactInfo(url) {
  console.log(`Extracting contact info from: ${url}`);
  
  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Navigate to the website
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Look for contact page link
    const contactPageUrl = await page.evaluate(() => {
      const contactLinks = Array.from(document.querySelectorAll('a')).filter(link => {
        const text = link.innerText.toLowerCase();
        return text.includes('contact') || text.includes('about');
      });
      
      return contactLinks.length > 0 ? contactLinks[0].href : null;
    });
    
    // If contact page found, navigate to it
    if (contactPageUrl) {
      await page.goto(contactPageUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
    }
    
    // Extract email addresses
    const emailAddresses = await page.evaluate(() => {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const pageText = document.body.innerText;
      return [...new Set(pageText.match(emailRegex) || [])];
    });
    
    // Extract domain from URL
    const domain = new URL(url).hostname.replace('www.', '');
    
    await browser.close();
    
    return {
      domain,
      email: emailAddresses.length > 0 ? emailAddresses[0] : null,
      allEmails: emailAddresses,
      contactPage: contactPageUrl
    };
  } catch (error) {
    console.error(`Error extracting contact info from ${url}:`, error);
    // Return partial information on error
    return {
      domain: new URL(url).hostname.replace('www.', ''),
      email: null,
      allEmails: [],
      contactPage: null,
      error: error.message
    };
  }
}

module.exports = {
  searchGoogle,
  extractContactInfo
};
