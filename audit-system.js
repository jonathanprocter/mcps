
import { promises as fs } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

class MCPSystemAudit {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      environment: {},
      configuration: {},
      dependencies: {},
      servers: {},
      compilation: {},
      runtime: {},
      recommendations: []
    };
  }

  async runFullAudit() {
    console.log('🔍 Starting MCP Server System Audit...\n');
    
    try {
      await this.auditEnvironment();
      await this.auditConfiguration();
      await this.auditDependencies();
      await this.auditCompilation();
      await this.auditServerStates();
      await this.auditRuntime();
      await this.generateRecommendations();
      
      await this.saveAuditReport();
      this.displaySummary();
      
    } catch (error) {
      console.error('❌ Audit failed:', error.message);
    }
  }

  async auditEnvironment() {
    console.log('📋 Auditing Environment Variables...');
    
    const requiredSecrets = {
      'Google Services': ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_REFRESH_TOKEN'],
      'Dropbox': ['DROPBOX_ACCESS_TOKEN'],
      'Notion': ['NOTION_INTEGRATION_SECRET'],
      'OpenAI': ['OPENAI_API_KEY'],
      'Perplexity': ['PERPLEXITY_API_KEY'],
      'Puppeteer': [] // No secrets needed
    };

    this.results.environment = {};
    
    Object.entries(requiredSecrets).forEach(([service, secrets]) => {
      const configured = secrets.length === 0 || secrets.every(secret => process.env[secret]);
      this.results.environment[service] = {
        required: secrets,
        configured: configured,
        status: configured ? '✅ Ready' : '❌ Missing credentials'
      };
      console.log(`  ${service}: ${configured ? '✅' : '❌'} ${configured ? 'Configured' : 'Missing credentials'}`);
    });
  }

  async auditConfiguration() {
    console.log('\n⚙️ Auditing Configuration Files...');
    
    const configFiles = [
      'package.json',
      'tsconfig.json',
      'tsconfig.node.json',
      '.env',
      '.replit'
    ];

    this.results.configuration = {};
    
    for (const file of configFiles) {
      try {
        const exists = await fs.access(file).then(() => true).catch(() => false);
        if (exists) {
          const content = await fs.readFile(file, 'utf8');
          this.results.configuration[file] = {
            exists: true,
            size: content.length,
            status: '✅ Present'
          };
          console.log(`  ${file}: ✅ Present (${content.length} bytes)`);
        } else {
          this.results.configuration[file] = { exists: false, status: '❌ Missing' };
          console.log(`  ${file}: ❌ Missing`);
        }
      } catch (error) {
        this.results.configuration[file] = { exists: false, error: error.message, status: '⚠️ Error' };
        console.log(`  ${file}: ⚠️ Error - ${error.message}`);
      }
    }
  }

  async auditDependencies() {
    console.log('\n📦 Auditing Dependencies...');
    
    try {
      const { stdout } = await execAsync('npm list --depth=0 --json');
      const deps = JSON.parse(stdout);
      
      const criticalDeps = [
        '@modelcontextprotocol/sdk',
        'googleapis',
        'dropbox',
        '@notionhq/client',
        'openai',
        'puppeteer',
        'typescript',
        'ts-node'
      ];

      this.results.dependencies = {
        total: Object.keys(deps.dependencies || {}).length,
        critical: {}
      };

      criticalDeps.forEach(dep => {
        const installed = deps.dependencies && deps.dependencies[dep];
        this.results.dependencies.critical[dep] = {
          installed: !!installed,
          version: installed ? installed.version : null,
          status: installed ? '✅ Installed' : '❌ Missing'
        };
        console.log(`  ${dep}: ${installed ? '✅' : '❌'} ${installed ? installed.version : 'Missing'}`);
      });
      
    } catch (error) {
      console.log(`  ⚠️ Could not check dependencies: ${error.message}`);
      this.results.dependencies = { error: error.message };
    }
  }

  async auditCompilation() {
    console.log('\n🔨 Auditing TypeScript Compilation...');
    
    try {
      const { stdout, stderr } = await execAsync('npm run build');
      this.results.compilation = {
        success: true,
        output: stdout,
        status: '✅ Success'
      };
      console.log('  ✅ TypeScript compilation successful');
      
      // Check if dist files exist
      const distExists = await fs.access('dist').then(() => true).catch(() => false);
      console.log(`  ✅ Dist directory: ${distExists ? 'Created' : 'Missing'}`);
      
    } catch (error) {
      this.results.compilation = {
        success: false,
        error: error.message,
        stderr: error.stderr,
        status: '❌ Failed'
      };
      console.log(`  ❌ Compilation failed: ${error.message}`);
    }
  }

  async auditServerStates() {
    console.log('\n🖥️ Auditing MCP Server Files...');
    
    const servers = [
      'gmail', 'drive', 'calendar', 'dropbox', 
      'notion', 'openai', 'perplexity', 'puppeteer'
    ];

    this.results.servers = {};
    
    for (const server of servers) {
      const tsFile = `src/servers/${server}.ts`;
      const jsFile = `dist/servers/${server}.js`;
      
      try {
        const tsExists = await fs.access(tsFile).then(() => true).catch(() => false);
        const jsExists = await fs.access(jsFile).then(() => true).catch(() => false);
        
        this.results.servers[server] = {
          typescript: tsExists ? '✅ Present' : '❌ Missing',
          compiled: jsExists ? '✅ Present' : '❌ Missing',
          status: (tsExists && jsExists) ? '✅ Ready' : '⚠️ Issues'
        };
        
        console.log(`  ${server}: TS ${tsExists ? '✅' : '❌'} | JS ${jsExists ? '✅' : '❌'}`);
      } catch (error) {
        this.results.servers[server] = { error: error.message, status: '❌ Error' };
        console.log(`  ${server}: ❌ Error - ${error.message}`);
      }
    }
  }

  async auditRuntime() {
    console.log('\n🚀 Auditing Runtime Environment...');
    
    try {
      // Check Node.js version
      const { stdout: nodeVersion } = await execAsync('node --version');
      console.log(`  Node.js: ✅ ${nodeVersion.trim()}`);
      
      // Check npm version
      const { stdout: npmVersion } = await execAsync('npm --version');
      console.log(`  npm: ✅ ${npmVersion.trim()}`);
      
      // Check TypeScript version
      const { stdout: tsVersion } = await execAsync('npx tsc --version');
      console.log(`  TypeScript: ✅ ${tsVersion.trim()}`);
      
      this.results.runtime = {
        node: nodeVersion.trim(),
        npm: npmVersion.trim(),
        typescript: tsVersion.trim(),
        status: '✅ Ready'
      };
      
    } catch (error) {
      this.results.runtime = { error: error.message, status: '❌ Issues' };
      console.log(`  ⚠️ Runtime check failed: ${error.message}`);
    }
  }

  generateRecommendations() {
    console.log('\n💡 Generating Recommendations...');
    
    const recommendations = [];
    
    // Check environment
    const missingServices = Object.entries(this.results.environment)
      .filter(([service, config]) => !config.configured)
      .map(([service]) => service);
    
    if (missingServices.length > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Configuration',
        issue: `Missing credentials for: ${missingServices.join(', ')}`,
        solution: 'Configure missing API keys and secrets using the Replit Secrets tool'
      });
    }
    
    // Check compilation
    if (this.results.compilation && !this.results.compilation.success) {
      recommendations.push({
        priority: 'critical',
        category: 'Build',
        issue: 'TypeScript compilation failing',
        solution: 'Fix TypeScript errors before running servers'
      });
    }
    
    // Check servers
    const brokenServers = Object.entries(this.results.servers || {})
      .filter(([name, config]) => config.status !== '✅ Ready')
      .map(([name]) => name);
    
    if (brokenServers.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Servers',
        issue: `Server issues: ${brokenServers.join(', ')}`,
        solution: 'Run npm run build to compile TypeScript files'
      });
    }
    
    // Success recommendations
    const readyServices = Object.entries(this.results.environment)
      .filter(([service, config]) => config.configured)
      .map(([service]) => service);
    
    if (readyServices.length > 0) {
      recommendations.push({
        priority: 'info',
        category: 'Ready',
        issue: `${readyServices.length} services ready to use`,
        solution: `Test services: ${readyServices.map(s => `npm run ${s.toLowerCase().replace(' ', '-')}`).join(', ')}`
      });
    }
    
    this.results.recommendations = recommendations;
    
    recommendations.forEach(rec => {
      const icon = rec.priority === 'critical' ? '🚨' : rec.priority === 'high' ? '⚠️' : rec.priority === 'medium' ? '💫' : '✅';
      console.log(`  ${icon} [${rec.category}] ${rec.issue}`);
      console.log(`     Solution: ${rec.solution}`);
    });
  }

  async saveAuditReport() {
    const report = {
      ...this.results,
      summary: {
        totalServices: Object.keys(this.results.environment).length,
        readyServices: Object.values(this.results.environment).filter(s => s.configured).length,
        compilationStatus: this.results.compilation?.success ? 'Success' : 'Failed',
        criticalIssues: this.results.recommendations?.filter(r => r.priority === 'critical').length || 0,
        overallHealth: this.calculateOverallHealth()
      }
    };
    
    await fs.writeFile('audit-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Audit report saved to audit-report.json');
  }

  calculateOverallHealth() {
    const envHealth = Object.values(this.results.environment).filter(s => s.configured).length / Object.keys(this.results.environment).length;
    const compHealth = this.results.compilation?.success ? 1 : 0;
    const depHealth = this.results.dependencies?.critical ? 
      Object.values(this.results.dependencies.critical).filter(d => d.installed).length / Object.keys(this.results.dependencies.critical).length : 0.5;
    
    const overall = (envHealth + compHealth + depHealth) / 3;
    
    if (overall >= 0.9) return '🟢 Excellent';
    if (overall >= 0.7) return '🟡 Good';
    if (overall >= 0.5) return '🟠 Fair';
    return '🔴 Poor';
  }

  displaySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 AUDIT SUMMARY');
    console.log('='.repeat(60));
    
    const summary = {
      totalServices: Object.keys(this.results.environment).length,
      readyServices: Object.values(this.results.environment).filter(s => s.configured).length,
      compilationStatus: this.results.compilation?.success ? '✅ Success' : '❌ Failed',
      overallHealth: this.calculateOverallHealth()
    };
    
    console.log(`🔧 Services: ${summary.readyServices}/${summary.totalServices} ready`);
    console.log(`🔨 Compilation: ${summary.compilationStatus}`);
    console.log(`💊 Overall Health: ${summary.overallHealth}`);
    
    const criticalIssues = this.results.recommendations?.filter(r => r.priority === 'critical').length || 0;
    const highIssues = this.results.recommendations?.filter(r => r.priority === 'high').length || 0;
    
    if (criticalIssues > 0) {
      console.log(`🚨 Critical Issues: ${criticalIssues}`);
    }
    if (highIssues > 0) {
      console.log(`⚠️  High Priority Issues: ${highIssues}`);
    }
    
    console.log('\n📋 Next Steps:');
    if (summary.readyServices > 0) {
      console.log('  1. Test ready services: npm run dev');
      console.log('  2. Run individual servers for configured services');
    }
    if (criticalIssues > 0 || !this.results.compilation?.success) {
      console.log('  1. Fix compilation errors first');
      console.log('  2. Configure missing API credentials');
    }
    if (summary.readyServices === summary.totalServices && this.results.compilation?.success) {
      console.log('  🎉 System fully operational! Ready for iPhone integration');
    }
    
    console.log('='.repeat(60));
  }
}

// Run the audit
const audit = new MCPSystemAudit();
audit.runFullAudit().catch(console.error);
