import { config } from 'dotenv';
// Load environment variables from .env file
config();
export function getRequiredEnv(key) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is required`);
    }
    return value;
}
export function getOptionalEnv(key) {
    return process.env[key];
}
export function checkSecrets() {
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
