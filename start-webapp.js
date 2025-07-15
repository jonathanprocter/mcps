#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting MCP Web Application...');

// Start the backend server
const server = spawn('node', ['-r', 'ts-node/register', 'server/server.ts'], {
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.stdout.on('data', (data) => {
  console.log(`🔙 Server: ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
  console.error(`❌ Server Error: ${data.toString().trim()}`);
});

// Start the frontend development server
const client = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  env: { ...process.env, NODE_ENV: 'development' }
});

client.stdout.on('data', (data) => {
  console.log(`🖥️  Client: ${data.toString().trim()}`);
});

client.stderr.on('data', (data) => {
  console.error(`❌ Client Error: ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  client.kill();
  process.exit(0);
});

console.log('✅ Application started!');
console.log('🖥️  Frontend: http://localhost:3000');
console.log('🔙 Backend: http://localhost:3001');
console.log('📖 API Docs: http://localhost:3001/api/health');