export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value;
}

export function getOptionalEnv(name: string, defaultValue?: string): string | undefined {
  return process.env[name] || defaultValue;
}

export function validateEnvironmentVariables(required: string[]): void {
  const missing = required.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export interface MCPServerSecrets {
  // Gmail & Google Drive
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  
  // Dropbox
  DROPBOX_ACCESS_TOKEN?: string;
  
  // Notion
  NOTION_INTEGRATION_SECRET?: string;
  NOTION_PAGE_URL?: string;
  
  // OpenAI
  OPENAI_API_KEY?: string;
  
  // Perplexity
  PERPLEXITY_API_KEY?: string;
}

export function checkSecrets(): MCPServerSecrets {
  return {
    GOOGLE_CLIENT_ID: getOptionalEnv('GOOGLE_CLIENT_ID'),
    GOOGLE_CLIENT_SECRET: getOptionalEnv('GOOGLE_CLIENT_SECRET'),
    GOOGLE_REFRESH_TOKEN: getOptionalEnv('GOOGLE_REFRESH_TOKEN'),
    DROPBOX_ACCESS_TOKEN: getOptionalEnv('DROPBOX_ACCESS_TOKEN'),
    NOTION_INTEGRATION_SECRET: getOptionalEnv('NOTION_INTEGRATION_SECRET'),
    NOTION_PAGE_URL: getOptionalEnv('NOTION_PAGE_URL'),
    OPENAI_API_KEY: getOptionalEnv('OPENAI_API_KEY'),
    PERPLEXITY_API_KEY: getOptionalEnv('PERPLEXITY_API_KEY')
  };
}