// Configuration file for API keys and settings

// Environment variables should be used in production
module.exports = {
  // Supabase configuration
  supabase: {
    url: process.env.SUPABASE_URL || 'your-supabase-url',
    key: process.env.SUPABASE_KEY || 'your-supabase-key',
  },
  
  // Resend email service configuration
  resend: {
    apiKey: process.env.RESEND_API_KEY || 'your-resend-api-key',
  },
  
  // Ahrefs API configuration
  ahrefs: {
    apiKey: process.env.AHREFS_API_KEY || 'your-ahrefs-api-key',
  },
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key',
  },
  
  // Application settings
  app: {
    drThreshold: 30, // Minimum Domain Rating to consider for outreach
    emailDelay: 86400000, // Delay between follow-up emails (24 hours in milliseconds)
    maxFollowUps: 2, // Maximum number of follow-up emails
  }
};
