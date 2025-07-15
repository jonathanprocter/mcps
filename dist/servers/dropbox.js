#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { Dropbox } from 'dropbox';
import { getRequiredEnv } from '../utils/env.js';
class DropboxMCPServer {
    constructor() {
        this.server = new Server({
            name: 'dropbox-mcp-server',
            version: '1.0.0',
            description: 'MCP server for Dropbox integration on iPhone'
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupDropboxAuth();
        this.setupHandlers();
    }
    setupDropboxAuth() {
        try {
            const accessToken = getRequiredEnv('DROPBOX_ACCESS_TOKEN');
            this.dropbox = new Dropbox({ accessToken });
        }
        catch (error) {
            console.error('Dropbox authentication setup failed:', error);
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
                    case 'list_files':
                        return await this.listFiles(args);
                    case 'get_file':
                        return await this.getFile(args);
                    case 'upload_file':
                        return await this.uploadFile(args);
                    case 'download_file':
                        return await this.downloadFile(args);
                    case 'delete_file':
                        return await this.deleteFile(args);
                    case 'move_file':
                        return await this.moveFile(args);
                    case 'copy_file':
                        return await this.copyFile(args);
                    case 'create_folder':
                        return await this.createFolder(args);
                    case 'delete_folder':
                        return await this.deleteFolder(args);
                    case 'search_files':
                        return await this.searchFiles(args);
                    case 'get_file_metadata':
                        return await this.getFileMetadata(args);
                    case 'share_file':
                        return await this.shareFile(args);
                    case 'get_shared_links':
                        return await this.getSharedLinks(args);
                    case 'get_space_usage':
                        return await this.getSpaceUsage();
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
                name: 'list_files',
                description: 'List files and folders in a Dropbox directory',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to list files from (default: root)',
                        },
                        recursive: {
                            type: 'boolean',
                            description: 'Whether to list files recursively (default: false)',
                        },
                        limit: {
                            type: 'number',
                            description: 'Maximum number of files to return (default: 100)',
                        },
                    },
                },
            },
            {
                name: 'get_file',
                description: 'Get file information by path',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the file',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'upload_file',
                description: 'Upload a file to Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Destination path for the file',
                        },
                        content: {
                            type: 'string',
                            description: 'File content (base64 encoded for binary files)',
                        },
                        mode: {
                            type: 'string',
                            enum: ['add', 'overwrite', 'update'],
                            description: 'Upload mode (default: add)',
                        },
                        autorename: {
                            type: 'boolean',
                            description: 'Whether to auto-rename if file exists (default: false)',
                        },
                    },
                    required: ['path', 'content'],
                },
            },
            {
                name: 'download_file',
                description: 'Download a file from Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the file to download',
                        },
                        rev: {
                            type: 'string',
                            description: 'Specific revision to download (optional)',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'delete_file',
                description: 'Delete a file from Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the file to delete',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'move_file',
                description: 'Move a file or folder to a new location',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fromPath: {
                            type: 'string',
                            description: 'Current path of the file/folder',
                        },
                        toPath: {
                            type: 'string',
                            description: 'New path for the file/folder',
                        },
                        allowSharedFolder: {
                            type: 'boolean',
                            description: 'Whether to allow moving shared folders (default: false)',
                        },
                        autorename: {
                            type: 'boolean',
                            description: 'Whether to auto-rename if destination exists (default: false)',
                        },
                    },
                    required: ['fromPath', 'toPath'],
                },
            },
            {
                name: 'copy_file',
                description: 'Copy a file or folder to a new location',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fromPath: {
                            type: 'string',
                            description: 'Source path of the file/folder',
                        },
                        toPath: {
                            type: 'string',
                            description: 'Destination path for the copy',
                        },
                        allowSharedFolder: {
                            type: 'boolean',
                            description: 'Whether to allow copying shared folders (default: false)',
                        },
                        autorename: {
                            type: 'boolean',
                            description: 'Whether to auto-rename if destination exists (default: false)',
                        },
                    },
                    required: ['fromPath', 'toPath'],
                },
            },
            {
                name: 'create_folder',
                description: 'Create a new folder in Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path for the new folder',
                        },
                        autorename: {
                            type: 'boolean',
                            description: 'Whether to auto-rename if folder exists (default: false)',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'delete_folder',
                description: 'Delete a folder from Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the folder to delete',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'search_files',
                description: 'Search for files in Dropbox',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query',
                        },
                        path: {
                            type: 'string',
                            description: 'Path to search within (optional)',
                        },
                        maxResults: {
                            type: 'number',
                            description: 'Maximum number of results (default: 100)',
                        },
                        fileExtensions: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'File extensions to filter by',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'get_file_metadata',
                description: 'Get detailed metadata for a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the file',
                        },
                        includeMediaInfo: {
                            type: 'boolean',
                            description: 'Whether to include media metadata (default: false)',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'share_file',
                description: 'Create a shared link for a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to the file to share',
                        },
                        shortUrl: {
                            type: 'boolean',
                            description: 'Whether to create a short URL (default: false)',
                        },
                        pendingUpload: {
                            type: 'boolean',
                            description: 'Whether to allow pending uploads (default: false)',
                        },
                    },
                    required: ['path'],
                },
            },
            {
                name: 'get_shared_links',
                description: 'Get shared links for files',
                inputSchema: {
                    type: 'object',
                    properties: {
                        path: {
                            type: 'string',
                            description: 'Path to get shared links for (optional)',
                        },
                        directOnly: {
                            type: 'boolean',
                            description: 'Whether to return only direct links (default: false)',
                        },
                    },
                },
            },
            {
                name: 'get_space_usage',
                description: 'Get Dropbox account space usage information',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    async listFiles(args) {
        const { path = '', recursive = false, limit = 100 } = args;
        const response = await this.dropbox.filesListFolder({
            path,
            recursive,
            limit,
        });
        const files = response.result.entries.map((entry) => {
            if (entry['.tag'] === 'file') {
                return {
                    name: entry.name,
                    path_lower: entry.path_lower,
                    path_display: entry.path_display,
                    id: entry.id,
                    client_modified: entry.client_modified,
                    server_modified: entry.server_modified,
                    size: entry.size,
                    is_downloadable: entry.is_downloadable,
                    content_hash: entry.content_hash,
                };
            }
            else if (entry['.tag'] === 'folder') {
                return {
                    name: entry.name,
                    path_lower: entry.path_lower,
                    path_display: entry.path_display,
                    id: entry.id,
                };
            }
            return entry;
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(files, null, 2),
                },
            ],
        };
    }
    async getFile(args) {
        const { path } = args;
        const response = await this.dropbox.filesGetMetadata({ path });
        const file = response.result;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(file, null, 2),
                },
            ],
        };
    }
    async uploadFile(args) {
        const { path, content, mode = 'add', autorename = false } = args;
        const buffer = Buffer.from(content, 'base64');
        const response = await this.dropbox.filesUpload({
            path,
            contents: buffer,
            mode: { '.tag': mode },
            autorename,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async downloadFile(args) {
        const { path, rev } = args;
        const response = await this.dropbox.filesDownload({ path, rev });
        const fileBuffer = response.result.fileBinary;
        const base64Content = Buffer.from(fileBuffer).toString('base64');
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({
                        path,
                        metadata: response.result,
                        content: base64Content,
                    }, null, 2),
                },
            ],
        };
    }
    async deleteFile(args) {
        const { path } = args;
        const response = await this.dropbox.filesDeleteV2({ path });
        return {
            content: [
                {
                    type: 'text',
                    text: `Successfully deleted: ${path}`,
                },
            ],
        };
    }
    async moveFile(args) {
        const { fromPath, toPath, allowSharedFolder = false, autorename = false } = args;
        const response = await this.dropbox.filesMoveV2({
            from_path: fromPath,
            to_path: toPath,
            allow_shared_folder: allowSharedFolder,
            autorename,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async copyFile(args) {
        const { fromPath, toPath, allowSharedFolder = false, autorename = false } = args;
        const response = await this.dropbox.filesCopyV2({
            from_path: fromPath,
            to_path: toPath,
            allow_shared_folder: allowSharedFolder,
            autorename,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async createFolder(args) {
        const { path, autorename = false } = args;
        const response = await this.dropbox.filesCreateFolderV2({
            path,
            autorename,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async deleteFolder(args) {
        const { path } = args;
        const response = await this.dropbox.filesDeleteV2({ path });
        return {
            content: [
                {
                    type: 'text',
                    text: `Successfully deleted folder: ${path}`,
                },
            ],
        };
    }
    async searchFiles(args) {
        const { query, path, maxResults = 100, fileExtensions } = args;
        const options = {
            query,
            options: {
                path,
                max_results: maxResults,
            },
        };
        if (fileExtensions && fileExtensions.length > 0) {
            options.options.file_extensions = fileExtensions;
        }
        const response = await this.dropbox.filesSearchV2(options);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async getFileMetadata(args) {
        const { path, includeMediaInfo = false } = args;
        const response = await this.dropbox.filesGetMetadata({
            path,
            include_media_info: includeMediaInfo,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async shareFile(args) {
        const { path, shortUrl = false, pendingUpload = false } = args;
        const response = await this.dropbox.sharingCreateSharedLinkWithSettings({
            path,
            settings: {
                short_url: shortUrl,
                pending_upload: pendingUpload,
            },
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async getSharedLinks(args) {
        const { path, directOnly = false } = args;
        const response = await this.dropbox.sharingGetSharedLinks({
            path,
            direct_only: directOnly,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async getSpaceUsage() {
        const response = await this.dropbox.usersGetSpaceUsage();
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(response.result, null, 2),
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Dropbox MCP server running on stdio');
    }
}
const server = new DropboxMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=dropbox.js.map