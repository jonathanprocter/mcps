#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { getRequiredEnv } from '../utils/env.js';
import { GmailMessage, GmailSearchOptions, GmailAttachment } from '../types/index.js';

class GmailMCPServer {
  private gmail: any;
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'gmail-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Gmail integration on iPhone'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupGmailAuth();
    this.setupHandlers();
  }

  private setupGmailAuth() {
    try {
      const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
      const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
      const refreshToken = getRequiredEnv('GOOGLE_REFRESH_TOKEN');

      const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'urn:ietf:wg:oauth:2.0:oob'
      );

      oAuth2Client.setCredentials({
        refresh_token: refreshToken,
      });

      this.gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    } catch (error) {
      console.error('Gmail authentication setup failed:', error);
      throw error;
    }
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getTools(),
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'search_emails':
            return await this.searchEmails(args as any);
          case 'get_email':
            return await this.getEmail(args as any);
          case 'send_email':
            return await this.sendEmail(args as any);
          case 'get_labels':
            return await this.getLabels();
          case 'get_threads':
            return await this.getThreads(args as any);
          case 'mark_as_read':
            return await this.markAsRead(args as any);
          case 'mark_as_unread':
            return await this.markAsUnread(args as any);
          case 'delete_email':
            return await this.deleteEmail(args as any);
          case 'get_attachments':
            return await this.getAttachments(args as any);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'search_emails',
        description: 'Search emails in Gmail with query parameters',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Gmail search query (e.g., "from:user@example.com", "subject:meeting")',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return (default: 10)',
            },
            labelIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of label IDs to filter by',
            },
          },
        },
      },
      {
        name: 'get_email',
        description: 'Get a specific email by ID',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Email message ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'send_email',
        description: 'Send an email',
        inputSchema: {
          type: 'object',
          properties: {
            to: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of recipient email addresses',
            },
            subject: {
              type: 'string',
              description: 'Email subject',
            },
            body: {
              type: 'string',
              description: 'Email body content',
            },
            cc: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of CC recipient email addresses',
            },
            bcc: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of BCC recipient email addresses',
            },
          },
          required: ['to', 'subject', 'body'],
        },
      },
      {
        name: 'get_labels',
        description: 'Get all Gmail labels',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_threads',
        description: 'Get email threads',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Gmail search query for threads',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of threads to return (default: 10)',
            },
          },
        },
      },
      {
        name: 'mark_as_read',
        description: 'Mark an email as read',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Email message ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'mark_as_unread',
        description: 'Mark an email as unread',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Email message ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'delete_email',
        description: 'Delete an email',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Email message ID',
            },
          },
          required: ['id'],
        },
      },
      {
        name: 'get_attachments',
        description: 'Get attachments from an email',
        inputSchema: {
          type: 'object',
          properties: {
            messageId: {
              type: 'string',
              description: 'Email message ID',
            },
          },
          required: ['messageId'],
        },
      },
    ];
  }

  private async searchEmails(options: GmailSearchOptions) {
    const { query = '', maxResults = 10, labelIds } = options;
    
    const response = await this.gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults,
      labelIds,
    });

    const messages = response.data.messages || [];
    const emailDetails = await Promise.all(
      messages.map(async (message: any) => {
        const details = await this.gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        return this.parseGmailMessage(details.data);
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(emailDetails, null, 2),
        },
      ],
    };
  }

  private async getEmail(args: { id: string }) {
    const response = await this.gmail.users.messages.get({
      userId: 'me',
      id: args.id,
    });

    const email = this.parseGmailMessage(response.data);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(email, null, 2),
        },
      ],
    };
  }

  private async sendEmail(args: {
    to: string[];
    subject: string;
    body: string;
    cc?: string[];
    bcc?: string[];
  }) {
    const { to, subject, body, cc, bcc } = args;
    
    const headers = [
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      ...(cc ? [`Cc: ${cc.join(', ')}`] : []),
      ...(bcc ? [`Bcc: ${bcc.join(', ')}`] : []),
      'Content-Type: text/plain; charset=utf-8',
      '',
      body,
    ].join('\n');

    const encodedMessage = Buffer.from(headers).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await this.gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Email sent successfully. Message ID: ${response.data.id}`,
        },
      ],
    };
  }

  private async getLabels() {
    const response = await this.gmail.users.labels.list({
      userId: 'me',
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data.labels, null, 2),
        },
      ],
    };
  }

  private async getThreads(args: { query?: string; maxResults?: number }) {
    const { query = '', maxResults = 10 } = args;
    
    const response = await this.gmail.users.threads.list({
      userId: 'me',
      q: query,
      maxResults,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response.data.threads, null, 2),
        },
      ],
    };
  }

  private async markAsRead(args: { id: string }) {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: args.id,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Email ${args.id} marked as read`,
        },
      ],
    };
  }

  private async markAsUnread(args: { id: string }) {
    await this.gmail.users.messages.modify({
      userId: 'me',
      id: args.id,
      requestBody: {
        addLabelIds: ['UNREAD'],
      },
    });

    return {
      content: [
        {
          type: 'text',
          text: `Email ${args.id} marked as unread`,
        },
      ],
    };
  }

  private async deleteEmail(args: { id: string }) {
    await this.gmail.users.messages.delete({
      userId: 'me',
      id: args.id,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Email ${args.id} deleted`,
        },
      ],
    };
  }

  private async getAttachments(args: { messageId: string }) {
    const message = await this.gmail.users.messages.get({
      userId: 'me',
      id: args.messageId,
    });

    const attachments: GmailAttachment[] = [];
    
    const processPayload = (payload: any) => {
      if (payload.filename && payload.body?.attachmentId) {
        attachments.push({
          filename: payload.filename,
          mimeType: payload.mimeType,
          size: payload.body.size,
          attachmentId: payload.body.attachmentId,
        });
      }
      
      if (payload.parts) {
        payload.parts.forEach(processPayload);
      }
    };

    processPayload(message.data.payload);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(attachments, null, 2),
        },
      ],
    };
  }

  private parseGmailMessage(data: any): GmailMessage {
    const payload = data.payload;
    const headers = payload.headers || [];
    
    const getHeader = (name: string) => 
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const getBody = (payload: any): string => {
      if (payload.body?.data) {
        return Buffer.from(payload.body.data, 'base64').toString('utf8');
      }
      
      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === 'text/plain' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf8');
          }
        }
        
        for (const part of payload.parts) {
          if (part.mimeType === 'text/html' && part.body?.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf8');
          }
        }
        
        for (const part of payload.parts) {
          const bodyText = getBody(part);
          if (bodyText) return bodyText;
        }
      }
      
      return '';
    };

    const parseEmails = (emailString: string): string[] => {
      if (!emailString) return [];
      return emailString.split(',').map(email => email.trim());
    };

    return {
      id: data.id,
      threadId: data.threadId,
      subject: getHeader('Subject'),
      from: getHeader('From'),
      to: parseEmails(getHeader('To')),
      cc: parseEmails(getHeader('Cc')),
      bcc: parseEmails(getHeader('Bcc')),
      body: getBody(payload),
      date: getHeader('Date'),
      labels: data.labelIds || [],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Gmail MCP server running on stdio');
  }
}

const server = new GmailMCPServer();
server.run().catch(console.error);

