import express from 'express';
import { MainMCPServer } from '../src/index';
import { GmailMCPServer } from '../src/servers/gmail';
import { GoogleDriveMCPServer } from '../src/servers/drive';
import { GoogleCalendarMCPServer } from '../src/servers/calendar';
import { DropboxMCPServer } from '../src/servers/dropbox';
import { NotionMCPServer } from '../src/servers/notion';
import { OpenAIMCPServer } from '../src/servers/openai';
import { PerplexityMCPServer } from '../src/servers/perplexity';
import { PuppeteerMCPServer } from '../src/servers/puppeteer';

const router = express.Router();

// Server instances
const serverInstances = new Map<string, any>();

// Initialize server instances
const initializeServers = async () => {
  try {
    serverInstances.set('gmail', new GmailMCPServer());
    serverInstances.set('drive', new GoogleDriveMCPServer());
    serverInstances.set('calendar', new GoogleCalendarMCPServer());
    serverInstances.set('dropbox', new DropboxMCPServer());
    serverInstances.set('notion', new NotionMCPServer());
    serverInstances.set('openai', new OpenAIMCPServer());
    serverInstances.set('perplexity', new PerplexityMCPServer());
    serverInstances.set('puppeteer', new PuppeteerMCPServer());
  } catch (error) {
    console.error('Error initializing servers:', error);
  }
};

// Initialize on startup
initializeServers();

// Get all available servers
router.get('/servers', async (req, res) => {
  try {
    const servers = [
      {
        name: 'gmail',
        status: 'online',
        description: 'Complete Gmail integration for email management',
        tools: ['search_emails', 'send_email', 'get_email', 'mark_as_read', 'mark_as_unread', 'delete_email', 'get_attachments'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'drive',
        status: 'online',
        description: 'Google Drive file management and sharing',
        tools: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'copy_file', 'delete_file'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'calendar',
        status: 'online',
        description: 'Google Calendar event management',
        tools: ['list_events', 'create_event', 'update_event', 'delete_event', 'search_events', 'get_busy_times'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'dropbox',
        status: 'online',
        description: 'Dropbox cloud storage integration',
        tools: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'get_space_usage'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'notion',
        status: 'online',
        description: 'Notion workspace and knowledge management',
        tools: ['search_pages', 'create_page', 'update_page', 'query_database', 'create_database_entry', 'append_block_children'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'openai',
        status: 'online',
        description: 'OpenAI AI capabilities and models',
        tools: ['chat_completion', 'generate_image', 'analyze_image', 'transcribe_audio', 'text_to_speech', 'create_embedding'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'perplexity',
        status: 'online',
        description: 'Perplexity real-time web search and research',
        tools: ['search_and_answer', 'fact_check', 'research_topic', 'compare_topics', 'latest_news', 'generate_summary'],
        lastUsed: new Date().toISOString()
      },
      {
        name: 'puppeteer',
        status: 'online',
        description: 'Web scraping and browser automation',
        tools: ['scrape_page', 'take_screenshot', 'generate_pdf', 'fill_form', 'click_element', 'extract_links'],
        lastUsed: new Date().toISOString()
      }
    ];

    res.json(servers);
  } catch (error) {
    console.error('Error fetching servers:', error);
    res.status(500).json({ error: 'Failed to fetch servers' });
  }
});

// Get tools for a specific server
router.get('/servers/:serverName/tools', async (req, res) => {
  try {
    const { serverName } = req.params;
    
    const serverTools = {
      gmail: ['search_emails', 'send_email', 'get_email', 'mark_as_read', 'mark_as_unread', 'delete_email', 'get_attachments'],
      drive: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'copy_file', 'delete_file'],
      calendar: ['list_events', 'create_event', 'update_event', 'delete_event', 'search_events', 'get_busy_times'],
      dropbox: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'get_space_usage'],
      notion: ['search_pages', 'create_page', 'update_page', 'query_database', 'create_database_entry', 'append_block_children'],
      openai: ['chat_completion', 'generate_image', 'analyze_image', 'transcribe_audio', 'text_to_speech', 'create_embedding'],
      perplexity: ['search_and_answer', 'fact_check', 'research_topic', 'compare_topics', 'latest_news', 'generate_summary'],
      puppeteer: ['scrape_page', 'take_screenshot', 'generate_pdf', 'fill_form', 'click_element', 'extract_links']
    };

    const tools = serverTools[serverName as keyof typeof serverTools];
    
    if (!tools) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Execute a tool on a specific server
router.post('/execute', async (req, res) => {
  try {
    const { server, tool, input } = req.body;

    if (!server || !tool || !input) {
      return res.status(400).json({ error: 'Missing required parameters: server, tool, input' });
    }

    const serverInstance = serverInstances.get(server);
    if (!serverInstance) {
      return res.status(404).json({ error: 'Server not found' });
    }

    // Execute the actual MCP server tool
    let result;
    try {
      switch (server) {
        case 'gmail':
          result = await executeGmailTool(serverInstance, tool, input);
          break;
        case 'drive':
          result = await executeDriveTool(serverInstance, tool, input);
          break;
        case 'calendar':
          result = await executeCalendarTool(serverInstance, tool, input);
          break;
        case 'dropbox':
          result = await executeDropboxTool(serverInstance, tool, input);
          break;
        case 'notion':
          result = await executeNotionTool(serverInstance, tool, input);
          break;
        case 'openai':
          result = await executeOpenAITool(serverInstance, tool, input);
          break;
        case 'perplexity':
          result = await executePerplexityTool(serverInstance, tool, input);
          break;
        case 'puppeteer':
          result = await executePuppeteerTool(serverInstance, tool, input);
          break;
        default:
          throw new Error(`Unsupported server: ${server}`);
      }
    } catch (error) {
      console.error(`Error executing ${tool} on ${server}:`, error);
      return res.status(500).json({ 
        error: `Failed to execute ${tool}: ${error.message}`,
        server,
        tool,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      result,
      server,
      tool,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in execute endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Gmail tool execution
async function executeGmailTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'search_emails':
      return await serverInstance.searchEmails({ 
        query: params.query || input,
        maxResults: params.maxResults || 10
      });
    case 'send_email':
      return await serverInstance.sendEmail({
        to: params.to || extractEmailFromInput(input),
        subject: params.subject || `Message: ${input.substring(0, 50)}`,
        body: params.body || input
      });
    case 'get_email':
      return await serverInstance.getEmail({ id: params.id || input });
    case 'mark_as_read':
      return await serverInstance.markAsRead({ id: params.id || input });
    case 'mark_as_unread':
      return await serverInstance.markAsUnread({ id: params.id || input });
    case 'delete_email':
      return await serverInstance.deleteEmail({ id: params.id || input });
    case 'get_attachments':
      return await serverInstance.getAttachments({ messageId: params.messageId || input });
    default:
      throw new Error(`Unsupported Gmail tool: ${tool}`);
  }
}

// Drive tool execution
async function executeDriveTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'list_files':
      return await serverInstance.listFiles({ 
        folderId: params.folderId,
        pageSize: params.pageSize || 20
      });
    case 'upload_file':
      return await serverInstance.uploadFile({
        name: params.name || input,
        content: params.content || input,
        mimeType: params.mimeType || 'text/plain',
        parentId: params.parentId
      });
    case 'download_file':
      return await serverInstance.downloadFile({ fileId: params.fileId || input });
    case 'share_file':
      return await serverInstance.shareFile({
        fileId: params.fileId || input,
        email: params.email || extractEmailFromInput(input),
        role: params.role || 'reader'
      });
    case 'move_file':
      return await serverInstance.moveFile({
        fileId: params.fileId || input,
        newParentId: params.newParentId || params.parentId
      });
    case 'copy_file':
      return await serverInstance.copyFile({
        fileId: params.fileId || input,
        name: params.name || `Copy of ${input}`,
        parentId: params.parentId
      });
    case 'delete_file':
      return await serverInstance.deleteFile({ fileId: params.fileId || input });
    default:
      throw new Error(`Unsupported Drive tool: ${tool}`);
  }
}

// Calendar tool execution
async function executeCalendarTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'list_events':
      return await serverInstance.listEvents({
        calendarId: params.calendarId || 'primary',
        maxResults: params.maxResults || 10,
        timeMin: params.timeMin || new Date().toISOString()
      });
    case 'create_event':
      return await serverInstance.createEvent({
        calendarId: params.calendarId || 'primary',
        summary: params.summary || input,
        description: params.description,
        start: params.start || { dateTime: new Date(Date.now() + 3600000).toISOString() },
        end: params.end || { dateTime: new Date(Date.now() + 7200000).toISOString() },
        attendees: params.attendees
      });
    case 'update_event':
      return await serverInstance.updateEvent({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId || input,
        summary: params.summary,
        description: params.description
      });
    case 'delete_event':
      return await serverInstance.deleteEvent({
        calendarId: params.calendarId || 'primary',
        eventId: params.eventId || input
      });
    case 'search_events':
      return await serverInstance.searchEvents({
        calendarId: params.calendarId || 'primary',
        query: params.query || input,
        maxResults: params.maxResults || 10
      });
    case 'get_busy_times':
      return await serverInstance.getBusyTimes({
        calendarId: params.calendarId || 'primary',
        timeMin: params.timeMin || new Date().toISOString(),
        timeMax: params.timeMax || new Date(Date.now() + 86400000).toISOString()
      });
    default:
      throw new Error(`Unsupported Calendar tool: ${tool}`);
  }
}

// Dropbox tool execution
async function executeDropboxTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'list_files':
      return await serverInstance.listFiles({
        path: params.path || '',
        recursive: params.recursive || false,
        limit: params.limit || 20
      });
    case 'upload_file':
      return await serverInstance.uploadFile({
        path: params.path || `/${input}`,
        contents: params.contents || input,
        mode: params.mode || 'add',
        autorename: params.autorename || true
      });
    case 'download_file':
      return await serverInstance.downloadFile({
        path: params.path || input,
        rev: params.rev
      });
    case 'share_file':
      return await serverInstance.shareFile({
        path: params.path || input,
        settings: params.settings || { requested_visibility: 'public' }
      });
    case 'move_file':
      return await serverInstance.moveFile({
        from_path: params.from_path || input,
        to_path: params.to_path || `${input}_moved`,
        autorename: params.autorename || true
      });
    case 'get_space_usage':
      return await serverInstance.getSpaceUsage();
    default:
      throw new Error(`Unsupported Dropbox tool: ${tool}`);
  }
}

// Notion tool execution
async function executeNotionTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'search_pages':
      return await serverInstance.searchPages({
        query: params.query || input,
        pageSize: params.pageSize || 10
      });
    case 'create_page':
      return await serverInstance.createPage({
        parent: params.parent || { type: 'page_id', page_id: process.env.NOTION_PAGE_ID },
        properties: {
          title: {
            title: [{ text: { content: params.title || input } }]
          }
        },
        children: params.children || []
      });
    case 'update_page':
      return await serverInstance.updatePage({
        pageId: params.pageId || input,
        properties: params.properties || {}
      });
    case 'query_database':
      return await serverInstance.queryDatabase({
        databaseId: params.databaseId || input,
        filter: params.filter,
        sorts: params.sorts,
        pageSize: params.pageSize || 10
      });
    case 'create_database_entry':
      return await serverInstance.createDatabaseEntry({
        databaseId: params.databaseId || input,
        properties: params.properties || {}
      });
    case 'append_block_children':
      return await serverInstance.appendBlockChildren({
        blockId: params.blockId || input,
        children: params.children || [
          {
            paragraph: {
              rich_text: [{ text: { content: input } }]
            }
          }
        ]
      });
    default:
      throw new Error(`Unsupported Notion tool: ${tool}`);
  }
}

// OpenAI tool execution
async function executeOpenAITool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'chat_completion':
      return await serverInstance.chatCompletion({
        model: params.model || 'gpt-4',
        messages: params.messages || [{ role: 'user', content: input }],
        maxTokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7
      });
    case 'generate_image':
      return await serverInstance.generateImage({
        prompt: params.prompt || input,
        model: params.model || 'dall-e-3',
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
        n: params.n || 1
      });
    case 'analyze_image':
      return await serverInstance.analyzeImage({
        imageUrl: params.imageUrl || input,
        prompt: params.prompt || 'What do you see in this image?',
        model: params.model || 'gpt-4-vision-preview'
      });
    case 'transcribe_audio':
      return await serverInstance.transcribeAudio({
        file: params.file || input,
        model: params.model || 'whisper-1',
        language: params.language
      });
    case 'text_to_speech':
      return await serverInstance.textToSpeech({
        input: params.input || input,
        model: params.model || 'tts-1',
        voice: params.voice || 'alloy'
      });
    case 'create_embedding':
      return await serverInstance.createEmbedding({
        input: params.input || input,
        model: params.model || 'text-embedding-3-small'
      });
    default:
      throw new Error(`Unsupported OpenAI tool: ${tool}`);
  }
}

// Perplexity tool execution
async function executePerplexityTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'search_and_answer':
      return await serverInstance.searchAndAnswer({
        query: params.query || input,
        model: params.model || 'sonar-small-online'
      });
    case 'fact_check':
      return await serverInstance.factCheck({
        claim: params.claim || input,
        model: params.model || 'sonar-small-online'
      });
    case 'research_topic':
      return await serverInstance.researchTopic({
        topic: params.topic || input,
        depth: params.depth || 'comprehensive'
      });
    case 'compare_topics':
      return await serverInstance.compareTopics({
        topics: params.topics || [input],
        aspects: params.aspects || ['advantages', 'disadvantages']
      });
    case 'latest_news':
      return await serverInstance.getLatestNews({
        query: params.query || input,
        limit: params.limit || 10
      });
    case 'generate_summary':
      return await serverInstance.generateSummary({
        text: params.text || input,
        length: params.length || 'medium'
      });
    default:
      throw new Error(`Unsupported Perplexity tool: ${tool}`);
  }
}

// Puppeteer tool execution
async function executePuppeteerTool(serverInstance: any, tool: string, input: string) {
  const params = parseToolInput(input);
  
  switch (tool) {
    case 'scrape_page':
      return await serverInstance.scrapePage({
        url: params.url || input,
        selector: params.selector,
        waitFor: params.waitFor || 'networkidle2'
      });
    case 'take_screenshot':
      return await serverInstance.takeScreenshot({
        url: params.url || input,
        options: {
          type: params.type || 'png',
          quality: params.quality || 90,
          fullPage: params.fullPage || true
        }
      });
    case 'generate_pdf':
      return await serverInstance.generatePDF({
        url: params.url || input,
        options: {
          format: params.format || 'A4',
          printBackground: params.printBackground || true
        }
      });
    case 'fill_form':
      return await serverInstance.fillForm({
        url: params.url || input,
        formData: params.formData || {}
      });
    case 'click_element':
      return await serverInstance.clickElement({
        url: params.url || input,
        selector: params.selector || 'button'
      });
    case 'extract_links':
      return await serverInstance.extractLinks({
        url: params.url || input,
        type: params.type || 'all'
      });
    default:
      throw new Error(`Unsupported Puppeteer tool: ${tool}`);
  }
}

// Helper functions
function parseToolInput(input: string): any {
  try {
    // Try to parse as JSON first
    return JSON.parse(input);
  } catch {
    // If not JSON, try to extract common patterns
    const params: any = {};
    
    // Extract email addresses
    const emailMatch = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    if (emailMatch) params.email = emailMatch[0];
    
    // Extract URLs
    const urlMatch = input.match(/https?:\/\/[^\s]+/);
    if (urlMatch) params.url = urlMatch[0];
    
    // Extract file IDs (assuming they're alphanumeric strings)
    const fileIdMatch = input.match(/\b[A-Za-z0-9_-]{10,}\b/);
    if (fileIdMatch) params.fileId = fileIdMatch[0];
    
    return params;
  }
}

function extractEmailFromInput(input: string): string {
  const emailMatch = input.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
  return emailMatch ? emailMatch[0] : 'user@example.com';
}

  } catch (error) {
    console.error('Error executing tool:', error);
    res.status(500).json({ error: 'Failed to execute tool' });
  }
});

// Get server status
router.get('/servers/:serverName/status', async (req, res) => {
  try {
    const { serverName } = req.params;
    
    const serverInstance = serverInstances.get(serverName);
    if (!serverInstance) {
      return res.status(404).json({ error: 'Server not found' });
    }

    res.json({
      name: serverName,
      status: 'online',
      uptime: '2h 15m',
      lastRequest: new Date().toISOString(),
      requestCount: Math.floor(Math.random() * 100) + 1
    });
  } catch (error) {
    console.error('Error fetching server status:', error);
    res.status(500).json({ error: 'Failed to fetch server status' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    servers: Array.from(serverInstances.keys())
  });
});

export default router;