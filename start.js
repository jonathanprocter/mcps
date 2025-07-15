#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Set environment variables for web server
process.env.NODE_ENV = 'development';
process.env.RUN_HTTP_SERVER = 'true';
process.env.PORT = '3001';
process.env.HOST = '0.0.0.0';

console.log('🚀 Starting MCP Dashboard...\n');

// Build first
console.log('📦 Building application...');
const buildProcess = spawn('node', ['simple-build.js'], { 
  cwd: __dirname, 
  stdio: 'inherit' 
});

buildProcess.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Build completed!\n');
    
    // Start server
    console.log('🌐 Starting web server...');
    const serverProcess = spawn('node', ['dist/index.js'], {
      cwd: __dirname,
      stdio: 'inherit',
      env: process.env
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('\n📴 Shutting down gracefully...');
      serverProcess.kill('SIGTERM');
    });

    process.on('SIGINT', () => {
      console.log('\n📴 Shutting down gracefully...');
      serverProcess.kill('SIGINT');
    });

    serverProcess.on('close', (code) => {
      console.log(`\n🔴 Server exited with code: ${code}`);
    });

  } else {
    console.error('❌ Build failed!');
    process.exit(1);
  }
});

buildProcess.on('error', (error) => {
  console.error('❌ Build error:', error);
  process.exit(1);
});