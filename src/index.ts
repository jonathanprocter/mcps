#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Helper function to check for secrets
function checkSecrets() {
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN,
    NOTION_INTEGRATION_SECRET: process.env.NOTION_INTEGRATION_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
    OTTER_API_TOKEN: process.env.OTTER_API_TOKEN,
  };
}
class MainMCPServer {
  private server: Server;
  private availableServers: string[] = [];

  constructor() {
    this.server = new Server(
      {
        name: 'iphone-mcp-servers',
        version: '1.0.0',
        description: 'Main MCP server hub for iPhone integration with Gmail, Google Drive, Google Calendar, Dropbox, Notion, OpenAI, Perplexity, and Puppeteer'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.checkAvailableServers();
    this.setupHandlers();
  }

  private checkAvailableServers() {
    const secrets = checkSecrets();

    if (secrets.GOOGLE_CLIENT_ID && secrets.GOOGLE_CLIENT_SECRET && secrets.GOOGLE_REFRESH_TOKEN) {
      this.availableServers.push('Gmail', 'Google Drive', 'Google Calendar');
    }

    if (secrets.DROPBOX_ACCESS_TOKEN) {
      this.availableServers.push('Dropbox');
    }

    if (secrets.NOTION_INTEGRATION_SECRET) {
      this.availableServers.push('Notion');
    }

    if (secrets.OPENAI_API_KEY) {
      this.availableServers.push('OpenAI');
    }

    if (secrets.PERPLEXITY_API_KEY) {
      this.availableServers.push('Perplexity');
    }

    if (secrets.OTTER_API_TOKEN) {
      this.availableServers.push('Otter.ai');
    }

    // Puppeteer is always available (no API key needed)
    this.availableServers.push('Puppeteer');
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'list_available_servers':
            return await this.listAvailableServers();
          case 'get_server_info':
            return await this.getServerInfo(args as any);
          case 'check_requirements':
            return await this.checkRequirements();
          case 'get_setup_instructions':
            return await this.getSetupInstructions(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'list_available_servers',
        description: 'List all available MCP servers based on configured credentials',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_server_info',
        description: 'Get detailed information about a specific MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            server: {
              type: 'string',
              enum: ['Gmail', 'Google Drive', 'Google Calendar', 'Dropbox', 'Notion', 'OpenAI', 'Perplexity', 'Puppeteer'],
              description: 'Server name to get information about',
            },
          },
          required: ['server'],
        },
      },
      {
        name: 'check_requirements',
        description: 'Check system requirements and missing credentials',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_setup_instructions',
        description: 'Get setup instructions for a specific service',
        inputSchema: {
          type: 'object',
          properties: {
            service: {
              type: 'string',
              enum: ['Gmail', 'Google Drive', 'Google Calendar', 'Dropbox', 'Notion', 'OpenAI', 'Perplexity', 'Puppeteer'],
              description: 'Service to get setup instructions for',
            },
          },
          required: ['service'],
        },
      },
    ];
  }

  private async listAvailableServers(): Promise<any> {
    const serverInfo = this.availableServers.map(server => ({
      name: server,
      status: 'Available',
      runCommand: `npm run ${server.toLowerCase().replace(' ', '-')}`,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            availableServers: serverInfo,
            totalServers: this.availableServers.length,
            note: 'Run individual servers using the specified commands',
          }, null, 2),
        },
      ],
    };
  }

  private async getServerInfo(args: { server: string }): Promise<any> {
    const { server } = args;

    const serverInfoMap: Record<string, any> = {
      'Gmail': {
        name: 'Gmail MCP Server',
        description: 'Comprehensive Gmail integration for iPhone',
        capabilities: [
          'Search emails with advanced filters',
          'Get email details and attachments',
          'Send emails with CC/BCC support',
          'Mark emails as read/unread',
          'Delete emails',
          'Get Gmail labels',
          'Thread management',
        ],
        requiredSecrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
        runCommand: 'npm run gmail',
      },
      'Google Drive': {
        name: 'Google Drive MCP Server',
        description: 'Full Google Drive integration for iPhone',
        capabilities: [
          'List and search files',
          'Upload and download files',
          'Create and manage folders',
          'Share files with permissions',
          'Move and copy files',
          'Get file metadata',
        ],
        requiredSecrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
        runCommand: 'npm run drive',
      },
      'Google Calendar': {
        name: 'Google Calendar MCP Server',
        description: 'Complete Google Calendar integration for iPhone',
        capabilities: [
          'List and search events',
          'Create and update events',
          'Manage attendees',
          'Set reminders and recurring events',
          'Get busy/free time information',
          'Quick add events with natural language',
        ],
        requiredSecrets: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
        runCommand: 'npm run calendar',
      },
      'Dropbox': {
        name: 'Dropbox MCP Server',
        description: 'Full Dropbox integration for iPhone',
        capabilities: [
          'Upload and download files',
          'Create and manage folders',
          'Search files and folders',
          'Share files with links',
          'Move and copy files',
          'Get space usage information',
        ],
        requiredSecrets: ['DROPBOX_ACCESS_TOKEN'],
        runCommand: 'npm run dropbox',
      },
      'Notion': {
        name: 'Notion MCP Server',
        description: 'Complete Notion workspace integration for iPhone',
        capabilities: [
          'Search pages and databases',
          'Create and update pages',
          'Manage database entries',
          'Work with blocks and content',
          'User and workspace management',
          'Advanced filtering and sorting',
        ],
        requiredSecrets: ['NOTION_INTEGRATION_SECRET'],
        runCommand: 'npm run notion',
      },
      'OpenAI': {
        name: 'OpenAI MCP Server',
        description: 'Full OpenAI API integration for iPhone',
        capabilities: [
          'Chat completions with GPT-4o',
          'Image generation with DALL-E',
          'Image editing and variations',
          'Audio transcription and translation',
          'Text-to-speech conversion',
          'Content moderation',
          'Embeddings creation',
        ],
        requiredSecrets: ['OPENAI_API_KEY'],
        runCommand: 'npm run openai',
      },
      'Perplexity': {
        name: 'Perplexity MCP Server',
        description: 'Perplexity AI search and research integration for iPhone',
        capabilities: [
          'Real-time web search and answers',
          'Fact-checking with citations',
          'Research topic analysis',
          'Topic comparisons',
          'Latest news retrieval',
          'Content summarization',
        ],
        requiredSecrets: ['PERPLEXITY_API_KEY'],
        runCommand: 'npm run perplexity',
      },
      'Puppeteer': {
        name: 'Puppeteer MCP Server',
        description: 'Web scraping and automation for iPhone',
        capabilities: [
          'Web page scraping',
          'Screenshot capture',
          'PDF generation',
          'Form filling and clicking',
          'Link and image extraction',
          'JavaScript execution',
          'Cookie management',
        ],
        requiredSecrets: [],
        runCommand: 'npm run puppeteer',
      },
    };

    const info = serverInfoMap[server];
    if (!info) {
      throw new Error(`Unknown server: ${server}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(info, null, 2),
        },
      ],
    };
  }

  private async checkRequirements(): Promise<any> {
    const secrets = checkSecrets();
    const requirements = {
      system: {
        nodejs: 'Required (18+)',
        typescript: 'Installed',
        dependencies: 'Installed',
      },
      services: {
        'Google Services (Gmail, Drive, Calendar)': {
          required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
          status: (secrets.GOOGLE_CLIENT_ID && secrets.GOOGLE_CLIENT_SECRET && secrets.GOOGLE_REFRESH_TOKEN) ? 'Configured' : 'Missing',
        },
        'Dropbox': {
          required: ['DROPBOX_ACCESS_TOKEN'],
          status: secrets.DROPBOX_ACCESS_TOKEN ? 'Configured' : 'Missing',
        },
        'Notion': {
          required: ['NOTION_INTEGRATION_SECRET'],
          status: secrets.NOTION_INTEGRATION_SECRET ? 'Configured' : 'Missing',
        },
        'OpenAI': {
          required: ['OPENAI_API_KEY'],
          status: secrets.OPENAI_API_KEY ? 'Configured' : 'Missing',
        },
        'Perplexity': {
          required: ['PERPLEXITY_API_KEY'],
          status: secrets.PERPLEXITY_API_KEY ? 'Configured' : 'Missing',
        },
        'Puppeteer': {
          required: [],
          status: 'Ready (No API key needed)',
        },
      },
    };

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(requirements, null, 2),
        },
      ],
    };
  }

  private async getSetupInstructions(args: { service: string }): Promise<any> {
    const { service } = args;

    const instructionsMap: Record<string, string> = {
      'Gmail': `
## Gmail Setup Instructions

1. **Enable Gmail API**:
   - Go to the Google Cloud Console (https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Create credentials (OAuth 2.0 Client ID)
   - Download the credentials JSON file

2. **Set Environment Variables**:
   \`\`\`bash
   export GOOGLE_CLIENT_ID="your_client_id"
   export GOOGLE_CLIENT_SECRET="your_client_secret"
   export GOOGLE_REFRESH_TOKEN="your_refresh_token"
   \`\`\`

3. **Get Refresh Token**:
   - Use the OAuth2 flow to get a refresh token
   - You can use Google's OAuth2 Playground (https://developers.google.com/oauthplayground/)
   - Select Gmail API v1 scope
   - Exchange authorization code for tokens

4. **Run the server**:
   \`\`\`bash
   npm run gmail
   \`\`\`
      `,
      'Google Drive': `
## Google Drive Setup Instructions

1. **Enable Google Drive API**:
   - Go to the Google Cloud Console (https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Drive API
   - Create credentials (OAuth 2.0 Client ID)

2. **Set Environment Variables**:
   \`\`\`bash
   export GOOGLE_CLIENT_ID="your_client_id"
   export GOOGLE_CLIENT_SECRET="your_client_secret"
   export GOOGLE_REFRESH_TOKEN="your_refresh_token"
   \`\`\`

3. **Run the server**:
   \`\`\`bash
   npm run drive
   \`\`\`
      `,
      'Google Calendar': `
## Google Calendar Setup Instructions

1. **Enable Google Calendar API**:
   - Go to the Google Cloud Console (https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Create credentials (OAuth 2.0 Client ID)

2. **Set Environment Variables**:
   \`\`\`bash
   export GOOGLE_CLIENT_ID="your_client_id"
   export GOOGLE_CLIENT_SECRET="your_client_secret"
   export GOOGLE_REFRESH_TOKEN="your_refresh_token"
   \`\`\`

3. **Run the server**:
   \`\`\`bash
   npm run calendar
   \`\`\`
      `,
      'Dropbox': `
## Dropbox Setup Instructions

1. **Create a Dropbox App**:
   - Go to the Dropbox App Console (https://www.dropbox.com/developers/apps)
   - Create a new app
   - Choose "Scoped access" and "Full Dropbox" access
   - Generate an access token

2. **Set Environment Variables**:
   \`\`\`bash
   export DROPBOX_ACCESS_TOKEN="your_access_token"
   \`\`\`

3. **Run the server**:
   \`\`\`bash
   npm run dropbox
   \`\`\`
      `,
      'Notion': `
## Notion Setup Instructions

1. **Create a Notion Integration**:
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the integration secret

2. **Share a Page with Integration**:
   - Open a Notion page
   - Click "Share" -> "Add people"
   - Select your integration
   - Copy the page URL

3. **Set Environment Variables**:
   \`\`\`bash
   export NOTION_INTEGRATION_SECRET="your_integration_secret"
   export NOTION_PAGE_URL="your_page_url"
   \`\`\`

4. **Run the server**:
   \`\`\`bash
   npm run notion
   \`\`\`
      `,
      'OpenAI': `
## OpenAI Setup Instructions

1. **Get OpenAI API Key**:
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

2. **Set Environment Variables**:
   \`\`\`bash
   export OPENAI_API_KEY="your_api_key"
   \`\`\`

3. **Run the server**:
   \`\`\`bash
   npm run openai
   \`\`\`
      `,
      'Perplexity': `
## Perplexity Setup Instructions

1. **Get Perplexity API Key**:
   - Go to https://www.perplexity.ai/settings/api
   - Create a new API key
   - Copy the key

2. **Set Environment Variables**:
   \`\`\`bash
   export PERPLEXITY_API_KEY="your_api_key"
   \`\`\`

3. **Run the server**:
   \`\`\`bash
   npm run perplexity
   \`\`\`
      `,
      'Puppeteer': `
## Puppeteer Setup Instructions

1. **No API Key Required**:
   - Puppeteer works without any API keys
   - All dependencies are already installed

2. **Run the server**:
   \`\`\`bash
   npm run puppeteer
   \`\`\`

3. **Note**: Puppeteer will download Chrome automatically on first run
      `,
    };

    const instructions = instructionsMap[service];
    if (!instructions) {
      throw new Error(`Unknown service: ${service}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: instructions,
        },
      ],
    };
  }

  private setupHttpServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get('/', (req, res) => {
      const secrets = checkSecrets();
      res.json({
        name: 'iPhone MCP Server Hub',
        version: '1.0.0',
        status: 'running',
        availableServers: this.availableServers,
        configuration: {
          googleServices: !!(secrets.GOOGLE_CLIENT_ID && secrets.GOOGLE_CLIENT_SECRET && secrets.GOOGLE_REFRESH_TOKEN),
          dropbox: !!secrets.DROPBOX_ACCESS_TOKEN,
          notion: !!secrets.NOTION_INTEGRATION_SECRET,
          openai: !!secrets.OPENAI_API_KEY,
          perplexity: !!secrets.PERPLEXITY_API_KEY,
          puppeteer: true
        },
        endpoints: {
          health: '/',
          servers: '/api/servers',
          serverInfo: '/api/servers/:name',
          requirements: '/api/requirements',
          setup: '/api/setup/:service'
        }
      });
    });

    // List available servers
    app.get('/api/servers', async (req, res) => {
      try {
        const result = await this.listAvailableServers();
        res.json(JSON.parse(result.content[0].text));
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Get server info
    app.get('/api/servers/:name', async (req, res) => {
      try {
        const result = await this.getServerInfo({ server: req.params.name });
        res.json(JSON.parse(result.content[0].text));
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Check requirements
    app.get('/api/requirements', async (req, res) => {
      try {
        const result = await this.checkRequirements();
        res.json(JSON.parse(result.content[0].text));
      } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Get setup instructions
    app.get('/api/setup/:service', async (req, res) => {
      try {
        const result = await this.getSetupInstructions({ service: req.params.service });
        res.json({ instructions: result.content[0].text });
      } catch (error) {
        res.status(400).json({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    const PORT = Number(process.env.PORT) || 5000;
    const HOST = process.env.HOST || '0.0.0.0';

    const server = app.listen(PORT, HOST, () => {
      console.log(`🌐 HTTP API server running on http://${HOST}:${PORT}`);
      console.log(`📊 Health check: http://${HOST}:${PORT}/`);
      console.log(`🔗 API docs: http://${HOST}:${PORT}/api/servers`);
      console.log(`🚀 Server ready for deployment on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('📴 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('🔴 Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('📴 Received SIGINT, shutting down gracefully...');
      server.close(() => {
        console.log('🔴 Server closed');
        process.exit(0);
      });
    });
  }

  async run() {
    // Check if we're in development mode (when run directly)
    if (process.argv.includes('--dev') || process.env.NODE_ENV === 'development') {
      console.log('🚀 iPhone MCP Server Hub - Development Mode\n');

      const secrets = checkSecrets();
      console.log('📋 Available Servers:');
      this.availableServers.forEach(server => {
        console.log(`  ✅ ${server}`);
      });

      console.log('\n🔧 Configuration Status:');
      console.log(`  Google Services: ${secrets.GOOGLE_CLIENT_ID ? '✅' : '❌'} Configured`);
      console.log(`  Dropbox: ${secrets.DROPBOX_ACCESS_TOKEN ? '✅' : '❌'} Configured`);
      console.log(`  Notion: ${secrets.NOTION_INTEGRATION_SECRET ? '✅' : '❌'} Configured`);
      console.log(`  OpenAI: ${secrets.OPENAI_API_KEY ? '✅' : '❌'} Configured`);
      console.log(`  Perplexity: ${secrets.PERPLEXITY_API_KEY ? '✅' : '❌'} Configured`);
      console.log(`  Puppeteer: ✅ Ready (No API key needed)`);

      console.log('\n🏃 Run individual servers:');
      console.log('  npm run gmail      # Gmail MCP server');
      console.log('  npm run drive      # Google Drive MCP server');
      console.log('  npm run calendar   # Google Calendar MCP server');
      console.log('  npm run dropbox    # Dropbox MCP server');
      console.log('  npm run notion     # Notion MCP server');
      console.log('  npm run openai     # OpenAI MCP server');
      console.log('  npm run perplexity # Perplexity MCP server');
      console.log('  npm run puppeteer  # Puppeteer MCP server');

      console.log('\n💡 To connect an MCP client, run this server via stdio transport');
      console.log('🌐 Starting HTTP API server for web access...\n');

      // Start HTTP server in dev mode
      this.setupHttpServer();
      return;
    }

    // Production mode - check if we should run HTTP server for deployment
    if (process.env.NODE_ENV === 'production' || process.env.RUN_HTTP_SERVER === 'true') {
      console.log('🌐 iPhone MCP Server Hub - Production Mode (HTTP Server)');
      console.log('🚀 Starting HTTP API server for web deployment...\n');

      // Start HTTP server in production mode
      this.setupHttpServer();
      return;
    }

    // Default MCP stdio transport for MCP clients
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Main MCP server hub running on stdio');
  }
}

const server = new MainMCPServer();
server.run().catch(console.error);

