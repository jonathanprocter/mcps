#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';

console.log('🔨 Simple TypeScript build process starting...');

// Create dist directory if it doesn't exist
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

try {
  // Set memory options for compilation
  process.env.NODE_OPTIONS = '--max-old-space-size=2048';
  
  // Use esbuild for faster compilation if available, otherwise use tsc
  try {
    console.log('📦 Attempting fast build with esbuild...');
    execSync('npx esbuild src/index.ts --bundle --platform=node --target=node18 --outfile=dist/index.js --format=esm --external:@modelcontextprotocol/sdk --external:@notionhq/client --external:axios --external:cors --external:dotenv --external:dropbox --external:express --external:googleapis --external:openai --external:puppeteer', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ Fast build completed successfully!');
  } catch (esbuildError) {
    console.log('⚠️  esbuild not available, falling back to tsc...');
    
    // Fallback to TypeScript compiler with minimal options
    execSync('npx tsc --target ES2020 --module ESNext --moduleResolution node --outDir dist --skipLibCheck --noEmit false --declaration false --sourceMap false', {
      stdio: 'inherit',
      env: process.env
    });
    console.log('✅ TypeScript build completed successfully!');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}