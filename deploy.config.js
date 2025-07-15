#!/usr/bin/env node
export const deployConfig = {
  // Build configuration
  build: {
    command: 'node build.js',
    fallbackCommand: 'NODE_OPTIONS="--max-old-space-size=2048" npx tsc --skipLibCheck --incremental',
    outputDir: 'dist',
    memoryLimit: '4096'
  },

  // Server configuration
  server: {
    startCommand: 'node start.js',
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    environment: 'production'
  },

  // Health check configuration
  healthCheck: {
    enabled: true,
    path: '/',
    timeout: 30000,
    retries: 3
  },

  // Environment variables required for deployment
  requiredEnvVars: [
    'NODE_ENV',
    'PORT',
    'HOST'
  ],

  // Optional environment variables for full functionality
  optionalEnvVars: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET', 
    'GOOGLE_REFRESH_TOKEN',
    'DROPBOX_ACCESS_TOKEN',
    'NOTION_INTEGRATION_SECRET',
    'OPENAI_API_KEY',
    'PERPLEXITY_API_KEY'
  ],

  // Deployment settings
  deployment: {
    platform: 'replit',
    type: 'web',
    healthEndpoint: '/',
    startupTimeout: 60000,
    gracefulShutdownTimeout: 10000
  }
};

export default deployConfig;