#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variables for production deployment
process.env.NODE_ENV = 'production';
process.env.RUN_HTTP_SERVER = 'true';

// Ensure proper port configuration
if (!process.env.PORT) {
  process.env.PORT = '5000';
}

// Ensure proper host configuration
if (!process.env.HOST) {
  process.env.HOST = '0.0.0.0';
}

console.log('🚀 Starting iPhone MCP Server Hub in production mode...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🌐 Port: ${process.env.PORT}`);
console.log(`🏠 Host: ${process.env.HOST}`);

// Start the compiled server
const startProcess = spawn('node', ['dist/index.js'], {
  stdio: 'inherit',
  env: process.env
});

startProcess.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

startProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Received SIGTERM, shutting down...');
  startProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('📴 Received SIGINT, shutting down...');
  startProcess.kill('SIGINT');
});