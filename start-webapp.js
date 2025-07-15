#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting MCP Web Application...');

// Build the TypeScript files first
console.log('📦 Building TypeScript files...');
const build = spawn('npx', ['tsc', '--build'], {
  stdio: 'inherit',
  env: { ...process.env }
});

build.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ TypeScript build failed');
    process.exit(1);
  }
  
  console.log('✅ TypeScript build successful');
  
  // Start the backend server
  console.log('🔙 Starting backend server...');
  const server = spawn('node', ['-r', 'ts-node/register', 'server/server.ts'], {
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_ENV: 'development',
      PORT: '3001'
    }
  });

  server.on('error', (error) => {
    console.error('❌ Server startup failed:', error);
    process.exit(1);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.kill();
    process.exit(0);
  });

  console.log('✅ Application started!');
  console.log('🖥️  Open: http://localhost:3001');
  console.log('📖 API Health: http://localhost:3001/api/health');
  console.log('🔧 Environment: development');
});