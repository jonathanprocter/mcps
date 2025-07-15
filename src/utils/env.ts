import { config } from 'dotenv';

// Load environment variables from .env file
config();

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required`);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export interface Secrets {
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  GOOGLE_REFRESH_TOKEN?: string;
  DROPBOX_ACCESS_TOKEN?: string;
  NOTION_INTEGRATION_SECRET?: string;
  OPENAI_API_KEY?: string;
  PERPLEXITY_API_KEY?: string;
}

export function checkSecrets(): Secrets {
  return {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    DROPBOX_ACCESS_TOKEN: process.env.DROPBOX_ACCESS_TOKEN,
    NOTION_INTEGRATION_SECRET: process.env.NOTION_INTEGRATION_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY,
  };
}