import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Mock API endpoints for demonstration
app.get('/api/servers', (req, res) => {
  res.json([
    {
      name: 'gmail',
      status: 'online',
      description: 'Complete Gmail integration for email management',
      tools: ['search_emails', 'send_email', 'get_email', 'mark_as_read', 'mark_as_unread', 'delete_email', 'get_attachments']
    },
    {
      name: 'drive',
      status: 'online',
      description: 'Google Drive file management and sharing',
      tools: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'copy_file', 'delete_file']
    },
    {
      name: 'calendar',
      status: 'online',
      description: 'Google Calendar event management',
      tools: ['list_events', 'create_event', 'update_event', 'delete_event', 'search_events', 'get_busy_times']
    },
    {
      name: 'dropbox',
      status: 'online',
      description: 'Dropbox cloud storage integration',
      tools: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'get_space_usage']
    },
    {
      name: 'notion',
      status: 'online',
      description: 'Notion workspace and knowledge management',
      tools: ['search_pages', 'create_page', 'update_page', 'query_database', 'create_database_entry', 'append_block_children']
    },
    {
      name: 'openai',
      status: 'online',
      description: 'OpenAI AI capabilities and models',
      tools: ['chat_completion', 'generate_image', 'analyze_image', 'transcribe_audio', 'text_to_speech', 'create_embedding']
    },
    {
      name: 'perplexity',
      status: 'online',
      description: 'Perplexity real-time web search and research',
      tools: ['search_and_answer', 'fact_check', 'research_topic', 'compare_topics', 'latest_news', 'generate_summary']
    },
    {
      name: 'puppeteer',
      status: 'online',
      description: 'Web scraping and browser automation',
      tools: ['scrape_page', 'take_screenshot', 'generate_pdf', 'fill_form', 'click_element', 'extract_links']
    }
  ]);
});

app.get('/api/servers/:serverName/tools', (req, res) => {
  const { serverName } = req.params;
  const toolMap = {
    gmail: ['search_emails', 'send_email', 'get_email', 'mark_as_read', 'mark_as_unread', 'delete_email', 'get_attachments'],
    drive: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'copy_file', 'delete_file'],
    calendar: ['list_events', 'create_event', 'update_event', 'delete_event', 'search_events', 'get_busy_times'],
    dropbox: ['list_files', 'upload_file', 'download_file', 'share_file', 'move_file', 'get_space_usage'],
    notion: ['search_pages', 'create_page', 'update_page', 'query_database', 'create_database_entry', 'append_block_children'],
    openai: ['chat_completion', 'generate_image', 'analyze_image', 'transcribe_audio', 'text_to_speech', 'create_embedding'],
    perplexity: ['search_and_answer', 'fact_check', 'research_topic', 'compare_topics', 'latest_news', 'generate_summary'],
    puppeteer: ['scrape_page', 'take_screenshot', 'generate_pdf', 'fill_form', 'click_element', 'extract_links']
  };
  
  res.json(toolMap[serverName] || []);
});

app.post('/api/execute', (req, res) => {
  const { server, tool, input } = req.body;
  
  if (!server || !tool || !input) {
    return res.status(400).json({ error: 'Missing required parameters: server, tool, input' });
  }
  
  // Return a message indicating this is a demonstration
  res.json({
    success: true,
    result: {
      message: `This is a demonstration of the MCP tool interface. Tool "${tool}" would be executed on the "${server}" server with input: "${input}".`,
      note: "To use actual API endpoints, configure your environment variables with proper API keys and secrets.",
      server: server,
      tool: tool,
      input: input,
      timestamp: new Date().toISOString(),
      status: "demo_mode"
    },
    server,
    tool,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: 'demonstration'
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 MCP Web Interface running on port ${PORT}`);
  console.log(`📱 Open: http://localhost:${PORT}`);
  console.log(`🔧 Mode: Demonstration (configure API keys for real functionality)`);
});