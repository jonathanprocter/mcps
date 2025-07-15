#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { google } from 'googleapis';
import { getRequiredEnv } from '../utils/env.js';
class GoogleDriveMCPServer {
    constructor() {
        this.server = new Server({
            name: 'google-drive-mcp-server',
            version: '1.0.0',
            description: 'MCP server for Google Drive integration on iPhone'
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupDriveAuth();
        this.setupHandlers();
    }
    setupDriveAuth() {
        try {
            const clientId = getRequiredEnv('GOOGLE_CLIENT_ID');
            const clientSecret = getRequiredEnv('GOOGLE_CLIENT_SECRET');
            const refreshToken = getRequiredEnv('GOOGLE_REFRESH_TOKEN');
            const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, 'urn:ietf:wg:oauth:2.0:oob');
            oAuth2Client.setCredentials({
                refresh_token: refreshToken,
            });
            this.drive = google.drive({ version: 'v3', auth: oAuth2Client });
        }
        catch (error) {
            console.error('Google Drive authentication setup failed:', error);
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
                    case 'search_files':
                        return await this.searchFiles(args);
                    case 'create_folder':
                        return await this.createFolder(args);
                    case 'upload_file':
                        return await this.uploadFile(args);
                    case 'delete_file':
                        return await this.deleteFile(args);
                    case 'share_file':
                        return await this.shareFile(args);
                    case 'download_file':
                        return await this.downloadFile(args);
                    case 'move_file':
                        return await this.moveFile(args);
                    case 'copy_file':
                        return await this.copyFile(args);
                    case 'get_permissions':
                        return await this.getPermissions(args);
                    case 'update_permissions':
                        return await this.updatePermissions(args);
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
                description: 'List files in Google Drive',
                inputSchema: {
                    type: 'object',
                    properties: {
                        folderId: {
                            type: 'string',
                            description: 'ID of the folder to list files from (optional, defaults to root)',
                        },
                        pageSize: {
                            type: 'number',
                            description: 'Number of files to return (default: 10)',
                        },
                        orderBy: {
                            type: 'string',
                            description: 'Sort order (name, modifiedTime, size, etc.)',
                        },
                    },
                },
            },
            {
                name: 'get_file',
                description: 'Get file details by ID',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                    },
                    required: ['fileId'],
                },
            },
            {
                name: 'search_files',
                description: 'Search files in Google Drive',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query (e.g., "name contains \'presentation\'")',
                        },
                        mimeType: {
                            type: 'string',
                            description: 'Filter by MIME type',
                        },
                        pageSize: {
                            type: 'number',
                            description: 'Number of results to return (default: 10)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'create_folder',
                description: 'Create a new folder',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Folder name',
                        },
                        parentId: {
                            type: 'string',
                            description: 'Parent folder ID (optional)',
                        },
                    },
                    required: ['name'],
                },
            },
            {
                name: 'upload_file',
                description: 'Upload a file to Google Drive',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'File name',
                        },
                        content: {
                            type: 'string',
                            description: 'File content (base64 encoded for binary files)',
                        },
                        mimeType: {
                            type: 'string',
                            description: 'MIME type of the file',
                        },
                        parentId: {
                            type: 'string',
                            description: 'Parent folder ID (optional)',
                        },
                    },
                    required: ['name', 'content', 'mimeType'],
                },
            },
            {
                name: 'delete_file',
                description: 'Delete a file from Google Drive',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                    },
                    required: ['fileId'],
                },
            },
            {
                name: 'share_file',
                description: 'Share a file with users',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                        email: {
                            type: 'string',
                            description: 'Email address to share with',
                        },
                        role: {
                            type: 'string',
                            enum: ['reader', 'writer', 'commenter'],
                            description: 'Permission role',
                        },
                    },
                    required: ['fileId', 'email', 'role'],
                },
            },
            {
                name: 'download_file',
                description: 'Download file content',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                    },
                    required: ['fileId'],
                },
            },
            {
                name: 'move_file',
                description: 'Move a file to a different folder',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                        newParentId: {
                            type: 'string',
                            description: 'New parent folder ID',
                        },
                    },
                    required: ['fileId', 'newParentId'],
                },
            },
            {
                name: 'copy_file',
                description: 'Copy a file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Name for the copied file',
                        },
                        parentId: {
                            type: 'string',
                            description: 'Parent folder ID for the copy (optional)',
                        },
                    },
                    required: ['fileId', 'name'],
                },
            },
            {
                name: 'get_permissions',
                description: 'Get file permissions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                    },
                    required: ['fileId'],
                },
            },
            {
                name: 'update_permissions',
                description: 'Update file permissions',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fileId: {
                            type: 'string',
                            description: 'Google Drive file ID',
                        },
                        permissionId: {
                            type: 'string',
                            description: 'Permission ID to update',
                        },
                        role: {
                            type: 'string',
                            enum: ['reader', 'writer', 'commenter'],
                            description: 'New permission role',
                        },
                    },
                    required: ['fileId', 'permissionId', 'role'],
                },
            },
        ];
    }
    async listFiles(args) {
        const { folderId, pageSize = 10, orderBy = 'modifiedTime desc' } = args;
        const query = folderId ? `'${folderId}' in parents` : undefined;
        const response = await this.drive.files.list({
            pageSize,
            fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink)',
            q: query,
            orderBy,
        });
        const files = response.data.files || [];
        const driveFiles = files.map((file) => this.parseDriveFile(file));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(driveFiles, null, 2),
                },
            ],
        };
    }
    async getFile(args) {
        const response = await this.drive.files.get({
            fileId: args.fileId,
            fields: 'id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink, permissions',
        });
        const driveFile = this.parseDriveFile(response.data);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(driveFile, null, 2),
                },
            ],
        };
    }
    async searchFiles(args) {
        const { query, mimeType, pageSize = 10 } = args;
        let searchQuery = query;
        if (mimeType) {
            searchQuery += ` and mimeType='${mimeType}'`;
        }
        const response = await this.drive.files.list({
            q: searchQuery,
            pageSize,
            fields: 'nextPageToken, files(id, name, mimeType, size, createdTime, modifiedTime, parents, webViewLink, webContentLink)',
        });
        const files = response.data.files || [];
        const driveFiles = files.map((file) => this.parseDriveFile(file));
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(driveFiles, null, 2),
                },
            ],
        };
    }
    async createFolder(args) {
        const { name, parentId } = args;
        const fileMetadata = {
            name,
            mimeType: 'application/vnd.google-apps.folder',
        };
        if (parentId) {
            fileMetadata.parents = [parentId];
        }
        const response = await this.drive.files.create({
            resource: fileMetadata,
            fields: 'id, name, mimeType, createdTime, parents, webViewLink',
        });
        const folder = this.parseDriveFile(response.data);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(folder, null, 2),
                },
            ],
        };
    }
    async uploadFile(args) {
        const { name, content, mimeType, parentId } = args;
        const fileMetadata = {
            name,
        };
        if (parentId) {
            fileMetadata.parents = [parentId];
        }
        const media = {
            mimeType,
            body: Buffer.from(content, 'base64'),
        };
        const response = await this.drive.files.create({
            resource: fileMetadata,
            media,
            fields: 'id, name, mimeType, size, createdTime, parents, webViewLink, webContentLink',
        });
        const file = this.parseDriveFile(response.data);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(file, null, 2),
                },
            ],
        };
    }
    async deleteFile(args) {
        await this.drive.files.delete({
            fileId: args.fileId,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `File ${args.fileId} deleted successfully`,
                },
            ],
        };
    }
    async shareFile(args) {
        const { fileId, email, role } = args;
        const response = await this.drive.permissions.create({
            fileId,
            resource: {
                type: 'user',
                role,
                emailAddress: email,
            },
            sendNotificationEmail: true,
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `File shared with ${email} as ${role}. Permission ID: ${response.data.id}`,
                },
            ],
        };
    }
    async downloadFile(args) {
        const response = await this.drive.files.get({
            fileId: args.fileId,
            alt: 'media',
        });
        const content = Buffer.from(response.data).toString('base64');
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify({ fileId: args.fileId, content }, null, 2),
                },
            ],
        };
    }
    async moveFile(args) {
        const { fileId, newParentId } = args;
        // Get current parents
        const file = await this.drive.files.get({
            fileId,
            fields: 'parents',
        });
        const previousParents = file.data.parents?.join(',') || '';
        const response = await this.drive.files.update({
            fileId,
            addParents: newParentId,
            removeParents: previousParents,
            fields: 'id, name, parents',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `File ${fileId} moved to folder ${newParentId}`,
                },
            ],
        };
    }
    async copyFile(args) {
        const { fileId, name, parentId } = args;
        const resource = { name };
        if (parentId) {
            resource.parents = [parentId];
        }
        const response = await this.drive.files.copy({
            fileId,
            resource,
            fields: 'id, name, mimeType, size, createdTime, parents, webViewLink, webContentLink',
        });
        const copiedFile = this.parseDriveFile(response.data);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(copiedFile, null, 2),
                },
            ],
        };
    }
    async getPermissions(args) {
        const response = await this.drive.permissions.list({
            fileId: args.fileId,
            fields: 'permissions(id, type, role, emailAddress, displayName)',
        });
        const permissions = response.data.permissions || [];
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(permissions, null, 2),
                },
            ],
        };
    }
    async updatePermissions(args) {
        const { fileId, permissionId, role } = args;
        const response = await this.drive.permissions.update({
            fileId,
            permissionId,
            resource: { role },
            fields: 'id, type, role, emailAddress, displayName',
        });
        return {
            content: [
                {
                    type: 'text',
                    text: `Permission updated: ${JSON.stringify(response.data, null, 2)}`,
                },
            ],
        };
    }
    parseDriveFile(data) {
        return {
            id: data.id,
            name: data.name,
            mimeType: data.mimeType,
            size: data.size,
            createdTime: data.createdTime,
            modifiedTime: data.modifiedTime,
            parents: data.parents || [],
            webViewLink: data.webViewLink,
            webContentLink: data.webContentLink,
            permissions: data.permissions?.map((p) => ({
                id: p.id,
                type: p.type,
                role: p.role,
                emailAddress: p.emailAddress,
            })),
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Google Drive MCP server running on stdio');
    }
}
const server = new GoogleDriveMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=drive.js.map