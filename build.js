#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set Node.js memory allocation for TypeScript compilation
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

function runBuild() {
  console.log('🔨 Building TypeScript project with increased memory allocation...');
  
  const buildProcess = spawn('npx', ['tsc'], {
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  });

  buildProcess.on('close', (code) => {
    if (code === 0) {
      console.log('✅ Build completed successfully!');
    } else {
      console.error(`❌ Build failed with code ${code}`);
      console.log('🔄 Attempting fallback build with optimized settings...');
      
      // Fallback build with more aggressive memory optimization
      const fallbackProcess = spawn('npx', ['tsc', '--skipLibCheck', '--incremental'], {
        stdio: 'inherit',
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=2048'
        }
      });

      fallbackProcess.on('close', (fallbackCode) => {
        if (fallbackCode === 0) {
          console.log('✅ Fallback build completed successfully!');
        } else {
          console.error(`❌ Fallback build also failed with code ${fallbackCode}`);
          process.exit(1);
        }
      });
    }
  });

  buildProcess.on('error', (error) => {
    console.error('❌ Build process error:', error);
    process.exit(1);
  });
}

runBuild();