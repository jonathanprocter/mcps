#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { getRequiredEnv } from '../utils/env.js';
class PerplexityMCPServer {
    constructor() {
        this.baseUrl = 'https://api.perplexity.ai';
        this.server = new Server({
            name: 'perplexity-mcp-server',
            version: '1.0.0',
            description: 'MCP server for Perplexity AI integration on iPhone'
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.apiKey = getRequiredEnv('PERPLEXITY_API_KEY');
        this.setupHandlers();
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
                    case 'chat_completion':
                        return await this.chatCompletion(args);
                    case 'search_and_answer':
                        return await this.searchAndAnswer(args);
                    case 'generate_summary':
                        return await this.generateSummary(args);
                    case 'fact_check':
                        return await this.factCheck(args);
                    case 'research_topic':
                        return await this.researchTopic(args);
                    case 'compare_topics':
                        return await this.compareTopics(args);
                    case 'latest_news':
                        return await this.getLatestNews(args);
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
                name: 'chat_completion',
                description: 'Get AI chat completion with web search capabilities',
                inputSchema: {
                    type: 'object',
                    properties: {
                        messages: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    role: {
                                        type: 'string',
                                        enum: ['system', 'user', 'assistant'],
                                    },
                                    content: {
                                        type: 'string',
                                    },
                                },
                                required: ['role', 'content'],
                            },
                            description: 'Array of messages in the conversation',
                        },
                        model: {
                            type: 'string',
                            enum: [
                                'llama-3.1-sonar-small-128k-online',
                                'llama-3.1-sonar-large-128k-online',
                                'llama-3.1-sonar-huge-128k-online',
                            ],
                            description: 'Model to use (default: llama-3.1-sonar-small-128k-online)',
                        },
                        temperature: {
                            type: 'number',
                            description: 'Temperature for response generation (0.0-1.0)',
                        },
                        maxTokens: {
                            type: 'number',
                            description: 'Maximum number of tokens to generate',
                        },
                        searchDomainFilter: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of domains to filter search results',
                        },
                        searchRecencyFilter: {
                            type: 'string',
                            enum: ['month', 'week', 'day', 'hour'],
                            description: 'Filter search results by recency',
                        },
                        returnImages: {
                            type: 'boolean',
                            description: 'Whether to return images in response',
                        },
                        returnRelatedQuestions: {
                            type: 'boolean',
                            description: 'Whether to return related questions',
                        },
                    },
                    required: ['messages'],
                },
            },
            {
                name: 'search_and_answer',
                description: 'Search for information and provide a comprehensive answer',
                inputSchema: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: 'Search query or question',
                        },
                        searchRecencyFilter: {
                            type: 'string',
                            enum: ['month', 'week', 'day', 'hour'],
                            description: 'Filter search results by recency',
                        },
                        searchDomainFilter: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of domains to filter search results',
                        },
                        returnCitations: {
                            type: 'boolean',
                            description: 'Whether to return citations (default: true)',
                        },
                    },
                    required: ['query'],
                },
            },
            {
                name: 'generate_summary',
                description: 'Generate a summary of given text or URL',
                inputSchema: {
                    type: 'object',
                    properties: {
                        content: {
                            type: 'string',
                            description: 'Text content to summarize or URL to summarize',
                        },
                        length: {
                            type: 'string',
                            enum: ['short', 'medium', 'long'],
                            description: 'Length of the summary (default: medium)',
                        },
                        focus: {
                            type: 'string',
                            description: 'Specific aspect to focus on in the summary',
                        },
                    },
                    required: ['content'],
                },
            },
            {
                name: 'fact_check',
                description: 'Fact-check a statement or claim',
                inputSchema: {
                    type: 'object',
                    properties: {
                        claim: {
                            type: 'string',
                            description: 'Statement or claim to fact-check',
                        },
                        searchRecencyFilter: {
                            type: 'string',
                            enum: ['month', 'week', 'day', 'hour'],
                            description: 'Filter search results by recency',
                        },
                    },
                    required: ['claim'],
                },
            },
            {
                name: 'research_topic',
                description: 'Research a specific topic comprehensively',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'Topic to research',
                        },
                        depth: {
                            type: 'string',
                            enum: ['basic', 'intermediate', 'detailed'],
                            description: 'Depth of research (default: intermediate)',
                        },
                        aspects: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific aspects to focus on',
                        },
                        searchRecencyFilter: {
                            type: 'string',
                            enum: ['month', 'week', 'day', 'hour'],
                            description: 'Filter search results by recency',
                        },
                    },
                    required: ['topic'],
                },
            },
            {
                name: 'compare_topics',
                description: 'Compare two or more topics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topics: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Topics to compare',
                        },
                        comparisonAspects: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific aspects to compare',
                        },
                        searchRecencyFilter: {
                            type: 'string',
                            enum: ['month', 'week', 'day', 'hour'],
                            description: 'Filter search results by recency',
                        },
                    },
                    required: ['topics'],
                },
            },
            {
                name: 'latest_news',
                description: 'Get latest news on a specific topic',
                inputSchema: {
                    type: 'object',
                    properties: {
                        topic: {
                            type: 'string',
                            description: 'Topic to get news about',
                        },
                        timeframe: {
                            type: 'string',
                            enum: ['hour', 'day', 'week'],
                            description: 'Time frame for news (default: day)',
                        },
                        sources: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific news sources to include',
                        },
                        maxResults: {
                            type: 'number',
                            description: 'Maximum number of news items to return',
                        },
                    },
                    required: ['topic'],
                },
            },
        ];
    }
    async chatCompletion(args) {
        const { messages, model = 'llama-3.1-sonar-small-128k-online', temperature = 0.2, maxTokens, searchDomainFilter, searchRecencyFilter, returnImages = false, returnRelatedQuestions = false, } = args;
        const response = await axios.post(`${this.baseUrl}/chat/completions`, {
            model,
            messages,
            temperature,
            max_tokens: maxTokens,
            search_domain_filter: searchDomainFilter,
            search_recency_filter: searchRecencyFilter,
            return_images: returnImages,
            return_related_questions: returnRelatedQuestions,
            stream: false,
        }, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        const completion = response.data;
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(completion, null, 2),
                },
            ],
        };
    }
    async searchAndAnswer(args) {
        const { query, searchRecencyFilter, searchDomainFilter, returnCitations = true, } = args;
        const messages = [
            {
                role: 'system',
                content: `You are a helpful assistant that provides accurate, well-researched answers based on current information. ${returnCitations ? 'Always include citations for your sources.' : ''}`,
            },
            {
                role: 'user',
                content: query,
            },
        ];
        return await this.chatCompletion({
            messages,
            searchRecencyFilter,
            searchDomainFilter,
            returnRelatedQuestions: true,
        });
    }
    async generateSummary(args) {
        const { content, length = 'medium', focus } = args;
        const lengthInstructions = {
            short: 'Provide a brief summary in 2-3 sentences.',
            medium: 'Provide a comprehensive summary in 1-2 paragraphs.',
            long: 'Provide a detailed summary covering all key points.',
        };
        const systemMessage = `You are a professional summarizer. ${lengthInstructions[length]} ${focus ? `Focus specifically on: ${focus}` : ''}`;
        const messages = [
            {
                role: 'system',
                content: systemMessage,
            },
            {
                role: 'user',
                content: content.startsWith('http') ? `Please summarize the content from this URL: ${content}` : `Please summarize the following content: ${content}`,
            },
        ];
        return await this.chatCompletion({ messages });
    }
    async factCheck(args) {
        const { claim, searchRecencyFilter } = args;
        const messages = [
            {
                role: 'system',
                content: 'You are a fact-checking expert. Analyze the given claim and provide a thorough fact-check with evidence from reliable sources. Rate the claim as True, False, Partially True, or Insufficient Information. Include citations for all sources.',
            },
            {
                role: 'user',
                content: `Please fact-check this claim: "${claim}"`,
            },
        ];
        return await this.chatCompletion({
            messages,
            searchRecencyFilter,
            returnRelatedQuestions: true,
        });
    }
    async researchTopic(args) {
        const { topic, depth = 'intermediate', aspects, searchRecencyFilter } = args;
        const depthInstructions = {
            basic: 'Provide a basic overview suitable for beginners.',
            intermediate: 'Provide a comprehensive analysis with key details and examples.',
            detailed: 'Provide an in-depth analysis with extensive details, examples, and implications.',
        };
        const aspectsText = aspects ? `Focus on these specific aspects: ${aspects.join(', ')}` : '';
        const messages = [
            {
                role: 'system',
                content: `You are a research expert. ${depthInstructions[depth]} Use current, reliable sources and provide citations. ${aspectsText}`,
            },
            {
                role: 'user',
                content: `Please research and provide comprehensive information about: ${topic}`,
            },
        ];
        return await this.chatCompletion({
            messages,
            searchRecencyFilter,
            returnRelatedQuestions: true,
        });
    }
    async compareTopics(args) {
        const { topics, comparisonAspects, searchRecencyFilter } = args;
        const aspectsText = comparisonAspects ? `Focus the comparison on these aspects: ${comparisonAspects.join(', ')}` : '';
        const messages = [
            {
                role: 'system',
                content: `You are a comparison expert. Provide a detailed comparison of the given topics, highlighting similarities, differences, advantages, and disadvantages. Use current information and provide citations. ${aspectsText}`,
            },
            {
                role: 'user',
                content: `Please compare these topics: ${topics.join(' vs ')}`,
            },
        ];
        return await this.chatCompletion({
            messages,
            searchRecencyFilter,
            returnRelatedQuestions: true,
        });
    }
    async getLatestNews(args) {
        const { topic, timeframe = 'day', sources, maxResults } = args;
        const timeframeMap = {
            hour: 'hour',
            day: 'day',
            week: 'week',
        };
        const sourcesText = sources ? `Focus on news from these sources: ${sources.join(', ')}` : '';
        const limitText = maxResults ? `Limit to the ${maxResults} most important news items.` : '';
        const messages = [
            {
                role: 'system',
                content: `You are a news analyst. Provide the latest news updates on the given topic. Include headlines, key details, and source citations. ${sourcesText} ${limitText}`,
            },
            {
                role: 'user',
                content: `What are the latest news updates about: ${topic}`,
            },
        ];
        return await this.chatCompletion({
            messages,
            searchRecencyFilter: timeframeMap[timeframe],
            returnRelatedQuestions: true,
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Perplexity MCP server running on stdio');
    }
}
const server = new PerplexityMCPServer();
server.run().catch(console.error);
