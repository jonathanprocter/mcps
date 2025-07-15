import { z } from 'zod';

// MCP Server Schema
export const mcpServerSchema = z.object({
  name: z.string(),
  status: z.enum(['online', 'offline', 'error', 'testing']),
  description: z.string(),
  tools: z.array(z.string()),
  lastUsed: z.string().optional(),
  version: z.string().optional(),
  uptime: z.string().optional(),
  requestCount: z.number().optional(),
  errorCount: z.number().optional(),
  averageResponseTime: z.number().optional(),
  requiresAuth: z.boolean().optional(),
  authStatus: z.enum(['authenticated', 'unauthenticated', 'error']).optional(),
});

// MCP Tool Execution Schema
export const mcpExecutionSchema = z.object({
  server: z.string(),
  tool: z.string(),
  input: z.string(),
});

// MCP Response Schema
export const mcpResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  server: z.string(),
  tool: z.string(),
  timestamp: z.string(),
  responseTime: z.number().optional(),
});

// Server Status Schema
export const serverStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['online', 'offline', 'error', 'testing']),
  uptime: z.string(),
  lastRequest: z.string(),
  requestCount: z.number(),
  errorCount: z.number().optional(),
  averageResponseTime: z.number().optional(),
  authStatus: z.enum(['authenticated', 'unauthenticated', 'error']).optional(),
});

// Health Check Schema
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy', 'degraded']),
  timestamp: z.string(),
  version: z.string(),
  servers: z.array(z.string()),
  totalRequests: z.number().optional(),
  totalErrors: z.number().optional(),
  averageResponseTime: z.number().optional(),
});

// API Key Management Schema
export const apiKeySchema = z.object({
  service: z.string(),
  name: z.string(),
  required: z.boolean(),
  configured: z.boolean(),
  lastVerified: z.string().optional(),
  status: z.enum(['valid', 'invalid', 'untested']).optional(),
});

// Tool Definition Schema
export const toolDefinitionSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.any()).optional(),
  examples: z.array(z.string()).optional(),
  category: z.string().optional(),
});

// Server Configuration Schema
export const serverConfigSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  autoRestart: z.boolean(),
  rateLimit: z.number().optional(),
  timeout: z.number().optional(),
  retryCount: z.number().optional(),
  cacheEnabled: z.boolean().optional(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).optional(),
});

// Deployment Configuration Schema
export const deploymentConfigSchema = z.object({
  environment: z.enum(['development', 'staging', 'production']),
  port: z.number(),
  host: z.string(),
  httpsEnabled: z.boolean(),
  corsOrigins: z.array(z.string()),
  rateLimit: z.number(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  healthCheck: z.boolean(),
  monitoring: z.boolean(),
});

// Types
export type MCPServer = z.infer<typeof mcpServerSchema>;
export type MCPExecution = z.infer<typeof mcpExecutionSchema>;
export type MCPResponse = z.infer<typeof mcpResponseSchema>;
export type ServerStatus = z.infer<typeof serverStatusSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;
export type APIKey = z.infer<typeof apiKeySchema>;
export type ToolDefinition = z.infer<typeof toolDefinitionSchema>;
export type ServerConfig = z.infer<typeof serverConfigSchema>;
export type DeploymentConfig = z.infer<typeof deploymentConfigSchema>;