import { z } from 'zod';

// MCP Server Schema
export const mcpServerSchema = z.object({
  name: z.string(),
  status: z.enum(['online', 'offline', 'error']),
  description: z.string(),
  tools: z.array(z.string()),
  lastUsed: z.string().optional(),
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
});

// Server Status Schema
export const serverStatusSchema = z.object({
  name: z.string(),
  status: z.enum(['online', 'offline', 'error']),
  uptime: z.string(),
  lastRequest: z.string(),
  requestCount: z.number(),
});

// Health Check Schema
export const healthCheckSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string(),
  version: z.string(),
  servers: z.array(z.string()),
});

// Types
export type MCPServer = z.infer<typeof mcpServerSchema>;
export type MCPExecution = z.infer<typeof mcpExecutionSchema>;
export type MCPResponse = z.infer<typeof mcpResponseSchema>;
export type ServerStatus = z.infer<typeof serverStatusSchema>;
export type HealthCheck = z.infer<typeof healthCheckSchema>;