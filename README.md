# LinksAI

An AI-powered agent for automating link building outreach.

## Project Overview

LinksAI is an automated system that:
- Searches Google for websites in specific niches (e.g., "interior design blog sponsored posts")
- Compiles a list of websites with contact information
- Checks each site's Domain Rating (DR) using the Ahrefs API
- Sends automated emails to sites with DR above a specified threshold
- Handles follow-ups and negotiates prices
- Provides a dashboard to review and manage link opportunities

## Architecture

- **Backend**: Node.js for handling scraping, API integrations, and email automation
- **Database**: Supabase (PostgreSQL) for storing niches, websites, and email interactions
- **Email Service**: Resend for sending emails and managing outreach
- **Frontend**: React.js for a user-friendly dashboard
- **AI Tools**: OpenAI GPT for generating and interpreting email responses

## Setup Instructions

### Prerequisites

1. Node.js and npm installed
2. Accounts and API keys for:
   - Supabase (database)
   - Resend (email service)
   - Ahrefs (DR metrics)
   - OpenAI (for email AI)

### Installation

1. Clone the repository
   ```
   git clone [repository-url]
   cd linksai
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure API keys
   - Create a `.env` file in the root directory
   - Add your API keys following the format in `.env.example`

4. Start the development server
   ```
   npm run dev
   ```

## Project Structure

```
linksai/
├── src/
│   ├── backend/       # Node.js backend code
│   ├── frontend/      # React.js frontend code
│   └── config/        # Configuration files
├── package.json       # Project dependencies
└── README.md          # Project documentation
```

## License

[MIT License](LICENSE)
