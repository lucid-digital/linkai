require('dotenv').config();
const express = require('express');
const scraper = require('./scraper');
const api = require('./api');
const email = require('./email');
const config = require('../config/config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static('../frontend'));

// API Routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'LinksAI API is running' });
});

// Search route - initiates a search for websites in a specific niche
app.post('/api/search', async (req, res) => {
  try {
    const { niche, limit = 10 } = req.body;
    if (!niche) {
      return res.status(400).json({ error: 'Niche is required' });
    }
    
    const searchTerm = `${niche} blog sponsored posts`;
    console.log(`Searching for: ${searchTerm}`);
    
    // This would be implemented in scraper.js
    const websites = await scraper.searchGoogle(searchTerm, limit);
    
    res.status(200).json({ websites });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
});

// Check DR route - checks domain rating for a list of websites
app.post('/api/check-dr', async (req, res) => {
  try {
    const { websites } = req.body;
    if (!websites || !Array.isArray(websites)) {
      return res.status(400).json({ error: 'Valid websites array is required' });
    }
    
    // This would be implemented in api.js
    const websitesWithDR = await api.checkDomainRatings(websites);
    
    res.status(200).json({ websites: websitesWithDR });
  } catch (error) {
    console.error('DR check error:', error);
    res.status(500).json({ error: 'Failed to check domain ratings' });
  }
});

// Send email route - sends outreach emails to websites
app.post('/api/send-email', async (req, res) => {
  try {
    const { website, emailType = 'initial' } = req.body;
    if (!website || !website.email) {
      return res.status(400).json({ error: 'Valid website with email is required' });
    }
    
    // This would be implemented in email.js
    const emailResult = await email.sendOutreachEmail(website, emailType);
    
    res.status(200).json({ result: emailResult });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`LinksAI server running on port ${PORT}`);
  console.log(`API Health check: http://localhost:${PORT}/api/health`);
});
