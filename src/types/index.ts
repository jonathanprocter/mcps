export interface ServerConfig {
  name: string;
  version: string;
  description: string;
}

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface ResourceDefinition {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

// Gmail Types
export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  body: string;
  date: string;
  labels: string[];
  attachments?: GmailAttachment[];
}

export interface GmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
}

export interface GmailSearchOptions {
  query?: string;
  maxResults?: number;
  labelIds?: string[];
  includeSpamTrash?: boolean;
}

// Google Drive Types
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  parents: string[];
  webViewLink?: string;
  webContentLink?: string;
  permissions?: DrivePermission[];
}

export interface DrivePermission {
  id: string;
  type: 'user' | 'group' | 'domain' | 'anyone';
  role: 'owner' | 'organizer' | 'fileOrganizer' | 'writer' | 'commenter' | 'reader';
  emailAddress?: string;
}

// Dropbox Types
export interface DropboxFile {
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
  client_modified: string;
  server_modified: string;
  size: number;
  is_downloadable: boolean;
  content_hash?: string;
}

export interface DropboxFolder {
  name: string;
  path_lower: string;
  path_display: string;
  id: string;
}

// Notion Types
export interface NotionPage {
  id: string;
  title: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  parent: {
    type: string;
    page_id?: string;
    database_id?: string;
  };
}

export interface NotionDatabase {
  id: string;
  title: string;
  description?: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
}

// Google Calendar Types
export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: CalendarAttendee[];
  location?: string;
  status: 'confirmed' | 'tentative' | 'cancelled';
  htmlLink: string;
  created: string;
  updated: string;
}

export interface CalendarAttendee {
  email: string;
  displayName?: string;
  responseStatus: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  organizer?: boolean;
}

export interface Calendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  accessRole: string;
  backgroundColor?: string;
  foregroundColor?: string;
}

// OpenAI Types
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAICompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: OpenAIMessage;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIImageGeneration {
  created: number;
  data: {
    url: string;
    b64_json?: string;
  }[];
}

// Perplexity Types
export interface PerplexityMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PerplexityCompletion {
  id: string;
  model: string;
  object: string;
  created: number;
  choices: {
    index: number;
    finish_reason: string;
    message: PerplexityMessage;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  citations?: string[];
}

// Puppeteer Types
export interface PuppeteerScreenshot {
  path?: string;
  type: 'png' | 'jpeg' | 'webp';
  quality?: number;
  fullPage?: boolean;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PuppeteerPDFOptions {
  path?: string;
  format?: 'A4' | 'A3' | 'A2' | 'A1' | 'A0' | 'Legal' | 'Letter' | 'Tabloid';
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  printBackground?: boolean;
  landscape?: boolean;
}

export interface ScrapingResult {
  url: string;
  title: string;
  content: string;
  links?: string[];
  images?: string[];
  metadata?: Record<string, any>;
}