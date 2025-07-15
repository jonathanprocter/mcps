#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import FormData from 'form-data';
import { getRequiredEnv } from '../utils/env.js';
import { OtterTranscript } from '../types/index.js';

class OtterMCPServer {
  private server: Server;
  private apiToken!: string;
  private baseUrl = 'https://api.otter.ai';

  constructor() {
    this.server = new Server(
      {
        name: 'otter-ai-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Otter.ai integration on iPhone'
      },
      {
        capabilities: {
          tools: {}
        }
      }
    );

    this.setupAuth();
    this.setupHandlers();
  }

  private setupAuth() {
    try {
      this.apiToken = getRequiredEnv('OTTER_API_TOKEN');
    } catch (error) {
      console.error('Otter.ai authentication setup failed:', error);
      throw error;
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return { tools: this.getTools() };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'upload_audio':
            return await this.uploadAudio(args as any);
          case 'list_transcripts':
            return await this.listTranscripts();
          case 'get_transcript':
            return await this.getTranscript(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ]
        };
      }
    });
  }

  private getAxios() {
    return axios.create({
      baseURL: this.baseUrl,
      headers: { Authorization: `Bearer ${this.apiToken}` }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'upload_audio',
        description: 'Upload an audio file for transcription',
        inputSchema: {
          type: 'object',
          properties: {
            file: { type: 'string', description: 'Base64 encoded audio file' },
            filename: { type: 'string', description: 'Filename for the upload' }
          },
          required: ['file', 'filename']
        }
      },
      {
        name: 'list_transcripts',
        description: 'List available transcripts',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'get_transcript',
        description: 'Retrieve a specific transcript',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Transcript ID' }
          },
          required: ['id']
        }
      }
    ];
  }

  private async uploadAudio(args: { file: string; filename: string }) {
    const buffer = Buffer.from(args.file, 'base64');
    const form = new FormData();
    form.append('file', buffer, args.filename);

    const axiosInstance = this.getAxios();
    const response = await axiosInstance.post('/v1/import', form, {
      headers: form.getHeaders()
    });

    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }

  private async listTranscripts() {
    const axiosInstance = this.getAxios();
    const response = await axiosInstance.get('/v1/transcripts');
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }

  private async getTranscript(args: { id: string }) {
    const axiosInstance = this.getAxios();
    const response = await axiosInstance.get(`/v1/transcripts/${args.id}`);
    return { content: [{ type: 'text', text: JSON.stringify(response.data, null, 2) }] };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Otter.ai MCP server running on stdio');
  }
}

const server = new OtterMCPServer();
server.run().catch(console.error);

