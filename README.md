# iPhone MCP Servers

A comprehensive collection of Model Context Protocol (MCP) servers designed for iPhone integration with popular services including Gmail, Google Drive, Google Calendar, Dropbox, Notion, OpenAI, Perplexity, and Puppeteer.

## Features

### 🔗 Available MCP Servers

- **Gmail** - Full email management with search, send, receive, and organization capabilities
- **Google Drive** - Complete file management with upload, download, share, and organization features
- **Google Calendar** - Comprehensive calendar management with event creation, scheduling, and reminders
- **Dropbox** - Full cloud storage integration with file sync and sharing capabilities
- **Notion** - Complete workspace integration with page, database, and block management
- **OpenAI** - Full AI capabilities including chat, image generation, audio processing, and more
- **Perplexity** - Real-time web search and research with citations and fact-checking
- **Puppeteer** - Web scraping and automation for data extraction and testing
- **Otter.ai** - Transcription management with audio upload and transcript retrieval

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Each service requires specific environment variables. See the [Setup Instructions](#setup-instructions) section for detailed configuration.

### 3. Run Individual Servers

```bash
# Gmail MCP Server
npm run gmail

# Google Drive MCP Server
npm run drive

# Google Calendar MCP Server
npm run calendar

# Dropbox MCP Server
npm run dropbox

# Notion MCP Server
npm run notion

# OpenAI MCP Server
npm run openai

# Perplexity MCP Server
npm run perplexity

# Puppeteer MCP Server
npm run puppeteer

# Main hub server (shows available servers)
npm run dev
```

## Setup Instructions

### Google Services (Gmail, Drive, Calendar)

1. **Enable APIs**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the required APIs (Gmail, Drive, Calendar)
   - Create OAuth 2.0 credentials

2. **Set Environment Variables**:
   ```bash
   export GOOGLE_CLIENT_ID="your_client_id"
   export GOOGLE_CLIENT_SECRET="your_client_secret"
   export GOOGLE_REFRESH_TOKEN="your_refresh_token"
   ```

3. **Get Refresh Token**:
   - Use [OAuth2 Playground](https://developers.google.com/oauthplayground/)
   - Select appropriate scopes for each service
   - Exchange authorization code for tokens

### Dropbox

1. **Create App**:
   - Go to [Dropbox App Console](https://www.dropbox.com/developers/apps)
   - Create a new app with "Scoped access" and "Full Dropbox" access
   - Generate an access token

2. **Set Environment Variables**:
   ```bash
   export DROPBOX_ACCESS_TOKEN="your_access_token"
   ```

### Notion

1. **Create Integration**:
   - Go to [Notion Integrations](https://www.notion.so/my-integrations)
   - Create a new integration and copy the secret

2. **Share Page**:
   - Open a Notion page and share it with your integration
   - Copy the page URL

3. **Set Environment Variables**:
   ```bash
   export NOTION_INTEGRATION_SECRET="your_integration_secret"
   export NOTION_PAGE_URL="your_page_url"
   ```

### OpenAI

1. **Get API Key**:
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key

2. **Set Environment Variables**:
   ```bash
   export OPENAI_API_KEY="your_api_key"
   ```

### Perplexity

1. **Get API Key**:
   - Go to [Perplexity API Settings](https://www.perplexity.ai/settings/api)
   - Create a new API key

2. **Set Environment Variables**:
   ```bash
   export PERPLEXITY_API_KEY="your_api_key"
   ```

### Puppeteer

No setup required! Puppeteer works without any API keys.

## iPhone Integration

### Using with iPhone Apps

These MCP servers can be integrated with iPhone applications that support the Model Context Protocol:

1. **Claude Mobile** - Use with Claude's mobile app
2. **Custom iOS Apps** - Integrate using the [Swift MCP SDK](https://github.com/modelcontextprotocol/swift-sdk)
3. **Third-party Apps** - Any app supporting MCP can connect to these servers

### Connection Methods

- **Local Development**: Connect via stdio transport
- **Remote Deployment**: Deploy to cloud services and connect via HTTP/WebSocket
- **Direct Integration**: Embed in iOS apps using Swift MCP SDK

## Available Tools

### Gmail Server
- `search_emails` - Search emails with advanced filters
- `get_email` - Get specific email details
- `send_email` - Send emails with attachments
- `get_labels` - Get Gmail labels
- `mark_as_read/unread` - Manage email status
- `delete_email` - Delete emails
- `get_attachments` - Extract email attachments

### Google Drive Server
- `list_files` - List files and folders
- `search_files` - Search with queries
- `upload_file` - Upload files
- `download_file` - Download files
- `create_folder` - Create folders
- `share_file` - Share with permissions
- `move_file` - Move files/folders
- `copy_file` - Copy files/folders

### Google Calendar Server
- `list_events` - List calendar events
- `create_event` - Create new events
- `update_event` - Update existing events
- `delete_event` - Delete events
- `search_events` - Search events
- `get_busy_times` - Check availability
- `quick_add_event` - Natural language event creation

### Dropbox Server
- `list_files` - List files and folders
- `upload_file` - Upload files
- `download_file` - Download files
- `search_files` - Search with filters
- `share_file` - Create shared links
- `move_file` - Move files/folders
- `get_space_usage` - Check storage usage

### Notion Server
- `search_pages` - Search pages and databases
- `create_page` - Create new pages
- `update_page` - Update existing pages
- `query_database` - Query database entries
- `create_database_entry` - Create database entries
- `get_block_children` - Get page content
- `append_block_children` - Add content to pages

### OpenAI Server
- `chat_completion` - GPT-4o chat completions
- `generate_image` - DALL-E image generation
- `analyze_image` - GPT-4 Vision analysis
- `transcribe_audio` - Whisper transcription
- `text_to_speech` - TTS conversion
- `create_embedding` - Text embeddings
- `moderate_content` - Content moderation

### Perplexity Server
- `search_and_answer` - Real-time web search
- `fact_check` - Fact-check claims
- `research_topic` - Research topics
- `compare_topics` - Compare topics
- `latest_news` - Get latest news
- `generate_summary` - Summarize content

### Puppeteer Server
- `scrape_page` - Extract page content
- `take_screenshot` - Capture screenshots
- `generate_pdf` - Generate PDFs
- `fill_form` - Fill web forms
- `click_element` - Click page elements
- `extract_links` - Extract all links
- `execute_javascript` - Run custom JS

## Architecture

```
src/
├── index.ts              # Main MCP server hub
├── servers/              # Individual MCP servers
│   ├── gmail.ts
│   ├── drive.ts
│   ├── calendar.ts
│   ├── dropbox.ts
│   ├── notion.ts
│   ├── openai.ts
│   ├── perplexity.ts
│   └── puppeteer.ts
├── types/                # TypeScript type definitions
│   └── index.ts
└── utils/                # Utility functions
    └── env.ts
```

## Development

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run dev
```

### TypeScript

The project is fully typed with TypeScript. All servers and tools have comprehensive type definitions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your MCP server implementation
4. Update types and documentation
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
