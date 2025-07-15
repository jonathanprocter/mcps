#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';
import { getRequiredEnv } from '../utils/env.js';
import { NotionPage, NotionDatabase } from '../types/index.js';

class NotionMCPServer {
  private notion: Client;
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'notion-mcp-server',
        version: '1.0.0',
        description: 'MCP server for Notion integration on iPhone'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupNotionAuth();
    this.setupHandlers();
  }

  private setupNotionAuth() {
    try {
      const integrationSecret = getRequiredEnv('NOTION_INTEGRATION_SECRET');
      this.notion = new Client({
        auth: integrationSecret,
      });
    } catch (error) {
      console.error('Notion authentication setup failed:', error);
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
          case 'search_pages':
            return await this.searchPages(args as any);
          case 'get_page':
            return await this.getPage(args as any);
          case 'create_page':
            return await this.createPage(args as any);
          case 'update_page':
            return await this.updatePage(args as any);
          case 'delete_page':
            return await this.deletePage(args as any);
          case 'get_database':
            return await this.getDatabase(args as any);
          case 'create_database':
            return await this.createDatabase(args as any);
          case 'query_database':
            return await this.queryDatabase(args as any);
          case 'create_database_entry':
            return await this.createDatabaseEntry(args as any);
          case 'update_database_entry':
            return await this.updateDatabaseEntry(args as any);
          case 'get_block_children':
            return await this.getBlockChildren(args as any);
          case 'append_block_children':
            return await this.appendBlockChildren(args as any);
          case 'update_block':
            return await this.updateBlock(args as any);
          case 'delete_block':
            return await this.deleteBlock(args as any);
          case 'get_users':
            return await this.getUsers();
          case 'get_user':
            return await this.getUser(args as any);
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
        name: 'search_pages',
        description: 'Search for pages and databases in Notion',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            filter: {
              type: 'object',
              properties: {
                value: {
                  type: 'string',
                  enum: ['page', 'database'],
                },
                property: {
                  type: 'string',
                  enum: ['object'],
                },
              },
              description: 'Filter by object type',
            },
            sort: {
              type: 'object',
              properties: {
                direction: {
                  type: 'string',
                  enum: ['ascending', 'descending'],
                },
                timestamp: {
                  type: 'string',
                  enum: ['last_edited_time'],
                },
              },
              description: 'Sort options',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results per page (max 100)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_page',
        description: 'Get a specific page by ID',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'Page ID',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'create_page',
        description: 'Create a new page',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['page_id', 'database_id', 'workspace'],
                },
                page_id: { type: 'string' },
                database_id: { type: 'string' },
              },
              required: ['type'],
              description: 'Parent page, database, or workspace',
            },
            properties: {
              type: 'object',
              description: 'Page properties',
            },
            children: {
              type: 'array',
              description: 'Page content blocks',
            },
          },
          required: ['parent'],
        },
      },
      {
        name: 'update_page',
        description: 'Update an existing page',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'Page ID',
            },
            properties: {
              type: 'object',
              description: 'Updated page properties',
            },
            archived: {
              type: 'boolean',
              description: 'Whether to archive the page',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'delete_page',
        description: 'Delete (archive) a page',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'Page ID',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'get_database',
        description: 'Get database information',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'create_database',
        description: 'Create a new database',
        inputSchema: {
          type: 'object',
          properties: {
            parent: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['page_id'],
                },
                page_id: { type: 'string' },
              },
              required: ['type', 'page_id'],
              description: 'Parent page for the database',
            },
            title: {
              type: 'array',
              description: 'Database title',
            },
            properties: {
              type: 'object',
              description: 'Database schema properties',
            },
          },
          required: ['parent', 'title', 'properties'],
        },
      },
      {
        name: 'query_database',
        description: 'Query database entries',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID',
            },
            filter: {
              type: 'object',
              description: 'Filter conditions',
            },
            sorts: {
              type: 'array',
              description: 'Sort conditions',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results per page (max 100)',
            },
            startCursor: {
              type: 'string',
              description: 'Pagination cursor',
            },
          },
          required: ['databaseId'],
        },
      },
      {
        name: 'create_database_entry',
        description: 'Create a new database entry',
        inputSchema: {
          type: 'object',
          properties: {
            databaseId: {
              type: 'string',
              description: 'Database ID',
            },
            properties: {
              type: 'object',
              description: 'Entry properties',
            },
            children: {
              type: 'array',
              description: 'Entry content blocks',
            },
          },
          required: ['databaseId', 'properties'],
        },
      },
      {
        name: 'update_database_entry',
        description: 'Update an existing database entry',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: {
              type: 'string',
              description: 'Database entry (page) ID',
            },
            properties: {
              type: 'object',
              description: 'Updated entry properties',
            },
            archived: {
              type: 'boolean',
              description: 'Whether to archive the entry',
            },
          },
          required: ['pageId', 'properties'],
        },
      },
      {
        name: 'get_block_children',
        description: 'Get children blocks of a page or block',
        inputSchema: {
          type: 'object',
          properties: {
            blockId: {
              type: 'string',
              description: 'Block ID (page ID for page blocks)',
            },
            pageSize: {
              type: 'number',
              description: 'Number of results per page (max 100)',
            },
            startCursor: {
              type: 'string',
              description: 'Pagination cursor',
            },
          },
          required: ['blockId'],
        },
      },
      {
        name: 'append_block_children',
        description: 'Append blocks to a page or block',
        inputSchema: {
          type: 'object',
          properties: {
            blockId: {
              type: 'string',
              description: 'Block ID (page ID for page blocks)',
            },
            children: {
              type: 'array',
              description: 'Array of block objects to append',
            },
          },
          required: ['blockId', 'children'],
        },
      },
      {
        name: 'update_block',
        description: 'Update a block',
        inputSchema: {
          type: 'object',
          properties: {
            blockId: {
              type: 'string',
              description: 'Block ID',
            },
            properties: {
              type: 'object',
              description: 'Updated block properties',
            },
            archived: {
              type: 'boolean',
              description: 'Whether to archive the block',
            },
          },
          required: ['blockId'],
        },
      },
      {
        name: 'delete_block',
        description: 'Delete a block',
        inputSchema: {
          type: 'object',
          properties: {
            blockId: {
              type: 'string',
              description: 'Block ID',
            },
          },
          required: ['blockId'],
        },
      },
      {
        name: 'get_users',
        description: 'Get all users in the workspace',
        inputSchema: {
          type: 'object',
          properties: {
            pageSize: {
              type: 'number',
              description: 'Number of results per page (max 100)',
            },
            startCursor: {
              type: 'string',
              description: 'Pagination cursor',
            },
          },
        },
      },
      {
        name: 'get_user',
        description: 'Get a specific user by ID',
        inputSchema: {
          type: 'object',
          properties: {
            userId: {
              type: 'string',
              description: 'User ID',
            },
          },
          required: ['userId'],
        },
      },
    ];
  }

  private async searchPages(args: {
    query: string;
    filter?: { value: string; property: string };
    sort?: { direction: string; timestamp: string };
    pageSize?: number;
  }): Promise<any> {
    const { query, filter, sort, pageSize } = args;

    const searchParams: any = {
      query,
      page_size: pageSize,
    };

    if (filter) {
      searchParams.filter = {
        property: 'object',
        value: filter.value as any,
      };
    }

    if (sort) {
      searchParams.sort = {
        timestamp: 'last_edited_time',
        direction: sort.direction as any,
      };
    }

    const response = await this.notion.search(searchParams);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async getPage(args: { pageId: string }): Promise<any> {
    const { pageId } = args;

    const response = await this.notion.pages.retrieve({ page_id: pageId });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async createPage(args: {
    parent: { type: string; page_id?: string; database_id?: string };
    properties?: any;
    children?: any[];
  }): Promise<any> {
    const { parent, properties, children } = args;

    const response = await this.notion.pages.create({
      parent: parent as any,
      properties: properties || {},
      children: children || [],
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async updatePage(args: {
    pageId: string;
    properties?: any;
    archived?: boolean;
  }): Promise<any> {
    const { pageId, properties, archived } = args;

    const response = await this.notion.pages.update({
      page_id: pageId,
      properties: properties || {},
      archived: archived || false,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async deletePage(args: { pageId: string }): Promise<any> {
    const { pageId } = args;

    const response = await this.notion.pages.update({
      page_id: pageId,
      archived: true,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Page ${pageId} has been archived (deleted)`,
        },
      ],
    };
  }

  private async getDatabase(args: { databaseId: string }): Promise<any> {
    const { databaseId } = args;

    const response = await this.notion.databases.retrieve({ database_id: databaseId });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async createDatabase(args: {
    parent: { type: string; page_id: string };
    title: any[];
    properties: any;
  }): Promise<any> {
    const { parent, title, properties } = args;

    const response = await this.notion.databases.create({
      parent: parent as any,
      title,
      properties,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async queryDatabase(args: {
    databaseId: string;
    filter?: any;
    sorts?: any[];
    pageSize?: number;
    startCursor?: string;
  }): Promise<any> {
    const { databaseId, filter, sorts, pageSize, startCursor } = args;

    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter,
      sorts,
      page_size: pageSize,
      start_cursor: startCursor,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async createDatabaseEntry(args: {
    databaseId: string;
    properties: any;
    children?: any[];
  }): Promise<any> {
    const { databaseId, properties, children } = args;

    const response = await this.notion.pages.create({
      parent: { database_id: databaseId },
      properties,
      children: children || [],
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async updateDatabaseEntry(args: {
    pageId: string;
    properties: any;
    archived?: boolean;
  }): Promise<any> {
    const { pageId, properties, archived } = args;

    const response = await this.notion.pages.update({
      page_id: pageId,
      properties,
      archived: archived || false,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async getBlockChildren(args: {
    blockId: string;
    pageSize?: number;
    startCursor?: string;
  }): Promise<any> {
    const { blockId, pageSize, startCursor } = args;

    const response = await this.notion.blocks.children.list({
      block_id: blockId,
      page_size: pageSize,
      start_cursor: startCursor,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async appendBlockChildren(args: {
    blockId: string;
    children: any[];
  }): Promise<any> {
    const { blockId, children } = args;

    const response = await this.notion.blocks.children.append({
      block_id: blockId,
      children,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async updateBlock(args: {
    blockId: string;
    properties?: any;
    archived?: boolean;
  }): Promise<any> {
    const { blockId, properties, archived } = args;

    const updateData: any = {};
    if (properties) {
      // Block-specific properties would go here
      Object.assign(updateData, properties);
    }
    if (archived !== undefined) {
      updateData.archived = archived;
    }

    const response = await this.notion.blocks.update({
      block_id: blockId,
      ...updateData,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async deleteBlock(args: { blockId: string }): Promise<any> {
    const { blockId } = args;

    const response = await this.notion.blocks.delete({
      block_id: blockId,
    });

    return {
      content: [
        {
          type: 'text',
          text: `Block ${blockId} has been deleted`,
        },
      ],
    };
  }

  private async getUsers(args?: { pageSize?: number; startCursor?: string }): Promise<any> {
    const { pageSize, startCursor } = args || {};

    const response = await this.notion.users.list({
      page_size: pageSize,
      start_cursor: startCursor,
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async getUser(args: { userId: string }): Promise<any> {
    const { userId } = args;

    const response = await this.notion.users.retrieve({ user_id: userId });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Notion MCP server running on stdio');
  }
}

const server = new NotionMCPServer();
server.run().catch(console.error);