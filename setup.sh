#!/bin/bash

# iPhone MCP Servers Setup Script
# This script helps you set up the environment for the MCP servers

echo "🚀 iPhone MCP Servers Setup"
echo "================================"
echo

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install Node.js first."
    exit 1
fi

# Check if TypeScript is available
if ! command -v tsc &> /dev/null; then
    echo "📦 Installing TypeScript globally..."
    npm install -g typescript
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Google Services (Gmail, Drive, Calendar)
# Get these from Google Cloud Console
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REFRESH_TOKEN=your_refresh_token

# Dropbox
# Get this from Dropbox App Console
DROPBOX_ACCESS_TOKEN=your_access_token

# Notion
# Get these from Notion Integrations
NOTION_INTEGRATION_SECRET=your_integration_secret
NOTION_PAGE_URL=your_page_url

# OpenAI
# Get this from OpenAI API Keys
OPENAI_API_KEY=your_api_key

# Perplexity
# Get this from Perplexity API Settings
PERPLEXITY_API_KEY=your_api_key

# Puppeteer (no configuration needed)
EOF
    echo "✅ .env file created! Please update it with your actual API keys."
else
    echo "✅ .env file already exists."
fi

echo
echo "📋 Setup Instructions:"
echo "1. Edit the .env file with your actual API keys"
echo "2. Run individual servers with: npm run <service>"
echo "3. Available services: gmail, drive, calendar, dropbox, notion, openai, perplexity, puppeteer"
echo "4. Run the main hub with: npm run dev"
echo
echo "📚 For detailed setup instructions, see README.md"
echo "✅ Setup complete!"