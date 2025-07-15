#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting MCP Web Dashboard...');

// Set environment variables
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '3001';
process.env.HOST = process.env.HOST || '0.0.0.0';
process.env.RUN_HTTP_SERVER = 'true';

// Build the TypeScript first
console.log('📦 Building TypeScript...');
const buildProcess = spawn('node', ['simple-build.js'], {
  cwd: __dirname,
  stdio: 'inherit'
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build successful!');
    
    // Start the server
    console.log('🌐 Starting web server...');
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '3001',
        HOST: '0.0.0.0',
        RUN_HTTP_SERVER: 'true'
      }
    });

    serverProcess.on('close', (code) => {
      console.log(`Server process exited with code ${code}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start server:', error);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });

  } else {
    console.error('❌ Build failed with code:', code);
    process.exit(1);
  }
});

buildProcess.on('error', (error) => {
  console.error('Failed to run build:', error);
  process.exit(1);
});