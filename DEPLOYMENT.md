# Deployment Guide

## Overview
This guide explains how to deploy the iPhone MCP Server Hub with the optimized build process and proper port configuration.

## Applied Fixes

### 1. Memory Optimization for TypeScript Build
- **Issue**: TypeScript compilation running out of memory during build
- **Solution**: Created optimized build scripts with memory allocation
- **Files**: `simple-build.js`, `build.js`
- **Key Changes**:
  - Uses esbuild for fast compilation (fallback to tsc)
  - Increased Node.js memory limit to 4GB (with 2GB fallback)
  - Disabled heavy TypeScript options (declaration, sourceMap)
  - Added incremental compilation support

### 2. Port Binding Configuration
- **Issue**: Application not opening proper port for web deployment
- **Solution**: Enhanced server configuration with proper host binding
- **Files**: `src/index.ts`, `start.js`
- **Key Changes**:
  - Binds to `0.0.0.0` (all network interfaces) instead of localhost
  - Configurable HOST and PORT environment variables
  - Production mode detection for HTTP server startup
  - Graceful shutdown handling

### 3. Build Process Improvements
- **Issue**: Build failures during deployment
- **Solution**: Simplified and optimized build process
- **Key Changes**:
  - Fast esbuild compilation (39ms vs traditional tsc)
  - Fallback build system for compatibility
  - Optimized TypeScript configuration
  - Removed unnecessary build artifacts

### 4. Production Start Script
- **Issue**: Start script not properly configured for deployment
- **Solution**: Created dedicated production start script
- **Files**: `start.js`, `deploy.config.js`
- **Key Changes**:
  - Proper environment variable configuration
  - Production mode enablement
  - Health check ready endpoints
  - Process management and graceful shutdown

## Build Commands

### Development
```bash
npm run dev
```

### Production Build
```bash
# Fast build (recommended)
node simple-build.js

# Standard build with memory optimization
node build.js

# Manual fallback build
NODE_OPTIONS="--max-old-space-size=2048" npx tsc --skipLibCheck --incremental
```

### Production Start
```bash
# Using custom start script
node start.js

# Direct start with environment variables
NODE_ENV=production RUN_HTTP_SERVER=true PORT=5000 HOST=0.0.0.0 node dist/index.js
```

## Environment Variables

### Required for Deployment
- `NODE_ENV=production`
- `RUN_HTTP_SERVER=true`
- `PORT=5000` (or Replit-provided port)
- `HOST=0.0.0.0`

### Optional for Full Functionality
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- `DROPBOX_ACCESS_TOKEN`
- `NOTION_INTEGRATION_SECRET`
- `OPENAI_API_KEY`
- `PERPLEXITY_API_KEY`

## Health Check Endpoints

- **Main**: `http://0.0.0.0:5000/`
- **Servers**: `http://0.0.0.0:5000/api/servers`
- **Requirements**: `http://0.0.0.0:5000/api/requirements`
- **Setup**: `http://0.0.0.0:5000/api/setup/:service`

## Deployment Flow

1. **Build**: `node simple-build.js`
2. **Start**: `node start.js`
3. **Health Check**: Server responds on configured port
4. **Ready**: All endpoints available for iPhone MCP integration

## Performance Improvements

- **Build Time**: Reduced from minutes to ~39ms with esbuild
- **Memory Usage**: Optimized TypeScript compilation memory allocation
- **Startup Time**: Fast server initialization with proper port binding
- **Resource Usage**: Minimal production footprint

## Troubleshooting

### Build Issues
- Use `simple-build.js` for fastest compilation
- Fallback to `build.js` if esbuild unavailable
- Check Node.js memory limits if build fails

### Port Issues
- Ensure `HOST=0.0.0.0` for external access
- Check `PORT` environment variable configuration
- Verify no other services on the same port

### Server Issues
- Check production environment variables
- Verify `RUN_HTTP_SERVER=true` is set
- Monitor server logs for startup errors

## Next Steps

1. Deploy to Replit with optimized build process
2. Test all health check endpoints
3. Configure API keys for full functionality
4. Connect iPhone MCP clients to deployed server