#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { Client } from '@notionhq/client';
import { getRequiredEnv } from '../utils/env.js';
class NotionMCPServer {
    constructor() {
        this.server = new Server({
            name: 'notion-mcp-server',
            version: '1.0.0',
            description: 'MCP server for Notion integration on iPhone'
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupNotionAuth();
        this.setupHandlers();
    }
    setupNotionAuth() {
        try {
            const integrationSecret = getRequiredEnv('NOTION_INTEGRATION_SECRET');
            this.notion = new Client({
                auth: integrationSecret,
            });
        }
        catch (error) {
            console.error('Notion authentication setup failed:', error);
            throw error;
        }
    }
    setupHandlers() {
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
                        return await this.searchPages(args);
                    case 'get_page':
                        return await this.getPage(args);
                    case 'create_page':
                        return await this.createPage(args);
                    case 'update_page':
                        return await this.updatePage(args);
                    case 'delete_page':
                        return await this.deletePage(args);
                    case 'get_database':
                        return await this.getDatabase(args);
                    case 'create_database':
                        return await this.createDatabase(args);
                    case 'query_database':
                        return await this.queryDatabase(args);
                    case 'create_database_entry':
                        return await this.createDatabaseEntry(args);
                    case 'update_database_entry':
                        return await this.updateDatabaseEntry(args);
                    case 'get_block_children':
                        return await this.getBlockChildren(args);
                    case 'append_block_children':
                        return await this.appendBlockChildren(args);
                    case 'update_block':
                        return await this.updateBlock(args);
                    case 'delete_block':
                        return await this.deleteBlock(args);
                    case 'get_users':
                        return await this.getUsers();
                    case 'get_user':
                        return await this.getUser(args);
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
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
    getTools() {
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
    async searchPages(args) {
        const { query, filter, sort, pageSize } = args;
        const searchParams = {
            query,
            page_size: pageSize,
        };
        if (filter) {
            searchParams.filter = {
                property: 'object',
                value: filter.value,
            };
        }
        if (sort) {
            searchParams.sort = {
                timestamp: 'last_edited_time',
                direction: sort.direction,
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
    async getPage(args) {
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
    async createPage(args) {
        const { parent, properties, children } = args;
        const response = await this.notion.pages.create({
            parent: parent,
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
    async updatePage(args) {
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
    async deletePage(args) {
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
    async getDatabase(args) {
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
    async createDatabase(args) {
        const { parent, title, properties } = args;
        const response = await this.notion.databases.create({
            parent: parent,
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
    async queryDatabase(args) {
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
    async createDatabaseEntry(args) {
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
    async updateDatabaseEntry(args) {
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
    async getBlockChildren(args) {
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
    async appendBlockChildren(args) {
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
    async updateBlock(args) {
        const { blockId, properties, archived } = args;
        const updateData = {};
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
    async deleteBlock(args) {
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
    async getUsers(args) {
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
    async getUser(args) {
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
//# sourceMappingURL=notion.js.map