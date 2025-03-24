const axios = require('axios');
const config = require('../config/config');

/**
 * Check domain ratings for a list of websites using Ahrefs API
 * @param {Array} websites - Array of website objects with domain property
 * @returns {Promise<Array>} - Array of website objects with DR property added
 */
async function checkDomainRatings(websites) {
  console.log(`Checking domain ratings for ${websites.length} websites`);
  
  const ahrefsApiKey = process.env.AHREFS_API_KEY || config.ahrefs.apiKey;
  
  if (!ahrefsApiKey || ahrefsApiKey === 'your-ahrefs-api-key') {
    console.warn('Ahrefs API key not configured. Using mock data for domain ratings.');
    return websites.map(website => ({
      ...website,
      dr: Math.floor(Math.random() * 100), // Mock DR value between 0-99
      drChecked: new Date().toISOString(),
      drSource: 'mock'
    }));
  }
  
  try {
    // Process websites in batches to avoid rate limits
    const batchSize = 5;
    const results = [];
    
    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(website => checkSingleDomainRating(website, ahrefsApiKey))
      );
      
      results.push(...batchResults);
      
      // Add delay between batches to avoid rate limits
      if (i + batchSize < websites.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error checking domain ratings:', error);
    throw error;
  }
}

/**
 * Check domain rating for a single website using Ahrefs API
 * @param {Object} website - Website object with domain property
 * @param {string} apiKey - Ahrefs API key
 * @returns {Promise<Object>} - Website object with DR property added
 */
async function checkSingleDomainRating(website, apiKey) {
  try {
    const domain = website.domain;
    console.log(`Checking DR for: ${domain}`);
    
    // Ahrefs API endpoint
    const apiUrl = 'https://apiv2.ahrefs.com';
    
    // Prepare request parameters
    const params = {
      token: apiKey,
      from: 'domain',
      target: domain,
      mode: 'domain',
      output: 'json',
      limit: 1
    };
    
    // Make API request
    const response = await axios.get(`${apiUrl}/site-explorer/overview`, { params });
    
    // Extract domain rating from response
    const dr = response.data?.domain?.domain_rating || 0;
    
    return {
      ...website,
      dr,
      drChecked: new Date().toISOString(),
      drSource: 'ahrefs'
    };
  } catch (error) {
    console.error(`Error checking DR for ${website.domain}:`, error);
    
    // Return website with error information
    return {
      ...website,
      dr: 0,
      drChecked: new Date().toISOString(),
      drSource: 'error',
      drError: error.message
    };
  }
}

/**
 * Store website data in Supabase database
 * @param {Array} websites - Array of website objects
 * @returns {Promise<Array>} - Array of stored website objects
 */
async function storeWebsitesInDatabase(websites) {
  // This would be implemented with Supabase client
  console.log(`Storing ${websites.length} websites in database`);
  
  // Mock implementation for now
  return websites.map(website => ({
    ...website,
    id: Math.random().toString(36).substring(2, 15),
    stored: true,
    storedAt: new Date().toISOString()
  }));
}

module.exports = {
  checkDomainRatings,
  storeWebsitesInDatabase
};
