#!/usr/bin/env node

// Test script to verify all TypeScript fixes
import { execSync } from 'child_process';

const testFiles = [
  'src/index.ts',
  'src/servers/puppeteer.ts',
  'src/servers/gmail.ts', 
  'src/servers/dropbox.ts',
  'src/servers/notion.ts',
  'src/servers/openai.ts',
  'src/servers/perplexity.ts',
];

console.log('🔍 Testing TypeScript compilation for all fixed files...\n');

let allPassed = true;

for (const file of testFiles) {
  try {
    console.log(`Testing ${file}...`);
    execSync(`npx tsc --noEmit --target es2020 --module esnext --moduleResolution node --allowSyntheticDefaultImports --esModuleInterop --skipLibCheck ${file}`, { 
      stdio: 'pipe',
      timeout: 15000 
    });
    console.log(`✅ ${file} - No errors`);
  } catch (error) {
    console.log(`❌ ${file} - Has errors:`);
    console.log(error.stdout ? error.stdout.toString() : error.stderr.toString());
    allPassed = false;
  }
}

console.log('\n📝 Summary:');
if (allPassed) {
  console.log('🎉 All fixes applied successfully! No TypeScript errors found.');
} else {
  console.log('⚠️  Some files still have TypeScript errors that need attention.');
}