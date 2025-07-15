#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import OpenAI from 'openai';
import { getRequiredEnv } from '../utils/env.js';
import { OpenAIMessage, OpenAICompletion, OpenAIImageGeneration } from '../types/index.js';

class OpenAIMCPServer {
  private openai!: OpenAI;
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'openai-mcp-server',
        version: '1.0.0',
        description: 'MCP server for OpenAI integration on iPhone'
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupOpenAIAuth();
    this.setupHandlers();
  }

  private setupOpenAIAuth() {
    try {
      const apiKey = getRequiredEnv('OPENAI_API_KEY');
      this.openai = new OpenAI({ apiKey });
    } catch (error) {
      console.error('OpenAI authentication setup failed:', error);
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
          case 'chat_completion':
            return await this.chatCompletion(args as any);
          case 'generate_image':
            return await this.generateImage(args as any);
          case 'edit_image':
            return await this.editImage(args as any);
          case 'create_image_variation':
            return await this.createImageVariation(args as any);
          case 'transcribe_audio':
            return await this.transcribeAudio(args as any);
          case 'translate_audio':
            return await this.translateAudio(args as any);
          case 'text_to_speech':
            return await this.textToSpeech(args as any);
          case 'create_embedding':
            return await this.createEmbedding(args as any);
          case 'moderate_content':
            return await this.moderateContent(args as any);
          case 'analyze_image':
            return await this.analyzeImage(args as any);
          case 'get_models':
            return await this.getModels();
          case 'get_model':
            return await this.getModel(args as any);
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
        name: 'chat_completion',
        description: 'Generate chat completion using OpenAI models',
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
              description: 'Model to use (default: gpt-4o)', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            },
            temperature: {
              type: 'number',
              description: 'Temperature for response generation (0.0-2.0)',
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum number of tokens to generate',
            },
            topP: {
              type: 'number',
              description: 'Top-p sampling parameter (0.0-1.0)',
            },
            frequencyPenalty: {
              type: 'number',
              description: 'Frequency penalty (-2.0 to 2.0)',
            },
            presencePenalty: {
              type: 'number',
              description: 'Presence penalty (-2.0 to 2.0)',
            },
            stop: {
              type: 'array',
              items: { type: 'string' },
              description: 'Stop sequences',
            },
            stream: {
              type: 'boolean',
              description: 'Whether to stream the response',
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'generate_image',
        description: 'Generate images using DALL-E',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Image generation prompt',
            },
            model: {
              type: 'string',
              enum: ['dall-e-2', 'dall-e-3'],
              description: 'DALL-E model to use (default: dall-e-3)',
            },
            n: {
              type: 'number',
              description: 'Number of images to generate (1-10 for DALL-E 2, 1 for DALL-E 3)',
            },
            size: {
              type: 'string',
              enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
              description: 'Image size',
            },
            quality: {
              type: 'string',
              enum: ['standard', 'hd'],
              description: 'Image quality (DALL-E 3 only)',
            },
            style: {
              type: 'string',
              enum: ['vivid', 'natural'],
              description: 'Image style (DALL-E 3 only)',
            },
            responseFormat: {
              type: 'string',
              enum: ['url', 'b64_json'],
              description: 'Response format (default: url)',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'edit_image',
        description: 'Edit images using DALL-E',
        inputSchema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Base64 encoded image to edit',
            },
            mask: {
              type: 'string',
              description: 'Base64 encoded mask image (optional)',
            },
            prompt: {
              type: 'string',
              description: 'Edit instruction prompt',
            },
            n: {
              type: 'number',
              description: 'Number of images to generate (1-10)',
            },
            size: {
              type: 'string',
              enum: ['256x256', '512x512', '1024x1024'],
              description: 'Image size',
            },
            responseFormat: {
              type: 'string',
              enum: ['url', 'b64_json'],
              description: 'Response format (default: url)',
            },
          },
          required: ['image', 'prompt'],
        },
      },
      {
        name: 'create_image_variation',
        description: 'Create variations of an image',
        inputSchema: {
          type: 'object',
          properties: {
            image: {
              type: 'string',
              description: 'Base64 encoded image to create variations of',
            },
            n: {
              type: 'number',
              description: 'Number of variations to generate (1-10)',
            },
            size: {
              type: 'string',
              enum: ['256x256', '512x512', '1024x1024'],
              description: 'Image size',
            },
            responseFormat: {
              type: 'string',
              enum: ['url', 'b64_json'],
              description: 'Response format (default: url)',
            },
          },
          required: ['image'],
        },
      },
      {
        name: 'transcribe_audio',
        description: 'Transcribe audio to text using Whisper',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'Base64 encoded audio file',
            },
            model: {
              type: 'string',
              enum: ['whisper-1'],
              description: 'Whisper model to use (default: whisper-1)',
            },
            language: {
              type: 'string',
              description: 'Language code (ISO-639-1)',
            },
            prompt: {
              type: 'string',
              description: 'Optional prompt to guide the transcription',
            },
            responseFormat: {
              type: 'string',
              enum: ['json', 'text', 'srt', 'verbose_json', 'vtt'],
              description: 'Response format (default: json)',
            },
            temperature: {
              type: 'number',
              description: 'Temperature for transcription (0.0-1.0)',
            },
          },
          required: ['file'],
        },
      },
      {
        name: 'translate_audio',
        description: 'Translate audio to English using Whisper',
        inputSchema: {
          type: 'object',
          properties: {
            file: {
              type: 'string',
              description: 'Base64 encoded audio file',
            },
            model: {
              type: 'string',
              enum: ['whisper-1'],
              description: 'Whisper model to use (default: whisper-1)',
            },
            prompt: {
              type: 'string',
              description: 'Optional prompt to guide the translation',
            },
            responseFormat: {
              type: 'string',
              enum: ['json', 'text', 'srt', 'verbose_json', 'vtt'],
              description: 'Response format (default: json)',
            },
            temperature: {
              type: 'number',
              description: 'Temperature for translation (0.0-1.0)',
            },
          },
          required: ['file'],
        },
      },
      {
        name: 'text_to_speech',
        description: 'Convert text to speech using TTS',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'string',
              description: 'Text to convert to speech',
            },
            model: {
              type: 'string',
              enum: ['tts-1', 'tts-1-hd'],
              description: 'TTS model to use (default: tts-1)',
            },
            voice: {
              type: 'string',
              enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
              description: 'Voice to use (default: alloy)',
            },
            responseFormat: {
              type: 'string',
              enum: ['mp3', 'opus', 'aac', 'flac'],
              description: 'Audio format (default: mp3)',
            },
            speed: {
              type: 'number',
              description: 'Speech speed (0.25-4.0, default: 1.0)',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'create_embedding',
        description: 'Create embeddings for text',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'array',
              items: { type: 'string' },
              description: 'Text(s) to create embeddings for',
            },
            model: {
              type: 'string',
              enum: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'],
              description: 'Embedding model to use (default: text-embedding-3-small)',
            },
            dimensions: {
              type: 'number',
              description: 'Number of dimensions for the embeddings',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'moderate_content',
        description: 'Moderate content using OpenAI moderation',
        inputSchema: {
          type: 'object',
          properties: {
            input: {
              type: 'array',
              items: { type: 'string' },
              description: 'Text(s) to moderate',
            },
            model: {
              type: 'string',
              enum: ['text-moderation-latest', 'text-moderation-stable'],
              description: 'Moderation model to use (default: text-moderation-latest)',
            },
          },
          required: ['input'],
        },
      },
      {
        name: 'analyze_image',
        description: 'Analyze images using GPT-4 Vision',
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
                    enum: ['user', 'assistant'],
                  },
                  content: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: {
                          type: 'string',
                          enum: ['text', 'image_url'],
                        },
                        text: { type: 'string' },
                        image_url: {
                          type: 'object',
                          properties: {
                            url: { type: 'string' },
                            detail: {
                              type: 'string',
                              enum: ['auto', 'low', 'high'],
                            },
                          },
                        },
                      },
                    },
                  },
                },
                required: ['role', 'content'],
              },
              description: 'Messages with text and images',
            },
            model: {
              type: 'string',
              description: 'Model to use (default: gpt-4o)', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            },
            maxTokens: {
              type: 'number',
              description: 'Maximum number of tokens to generate',
            },
            temperature: {
              type: 'number',
              description: 'Temperature for response generation (0.0-2.0)',
            },
          },
          required: ['messages'],
        },
      },
      {
        name: 'get_models',
        description: 'Get list of available OpenAI models',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_model',
        description: 'Get details of a specific model',
        inputSchema: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              description: 'Model ID',
            },
          },
          required: ['model'],
        },
      },
    ];
  }

  private async chatCompletion(args: {
    messages: OpenAIMessage[];
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
    stream?: boolean;
  }): Promise<any> {
    const {
      messages,
      model = 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      temperature,
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      stop,
      stream = false,
    } = args;

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stop,
      stream,
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

  private async generateImage(args: {
    prompt: string;
    model?: string;
    n?: number;
    size?: string;
    quality?: string;
    style?: string;
    responseFormat?: string;
  }): Promise<any> {
    const {
      prompt,
      model = 'dall-e-3',
      n = 1,
      size = '1024x1024',
      quality = 'standard',
      style = 'vivid',
      responseFormat = 'url',
    } = args;

    const response = await this.openai.images.generate({
      model,
      prompt,
      n,
      size: size as any,
      quality: quality as any,
      style: style as any,
      response_format: responseFormat as any,
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

  private async editImage(args: {
    image: string;
    mask?: string;
    prompt: string;
    n?: number;
    size?: string;
    responseFormat?: string;
  }): Promise<any> {
    const {
      image,
      mask,
      prompt,
      n = 1,
      size = '1024x1024',
      responseFormat = 'url',
    } = args;

    const imageBuffer = Buffer.from(image, 'base64');
    const maskBuffer = mask ? Buffer.from(mask, 'base64') : undefined;

    const response = await this.openai.images.edit({
      image: new File([imageBuffer], 'image.png', { type: 'image/png' }),
      mask: maskBuffer ? new File([maskBuffer], 'mask.png', { type: 'image/png' }) : undefined,
      prompt,
      n,
      size: size as any,
      response_format: responseFormat as any,
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

  private async createImageVariation(args: {
    image: string;
    n?: number;
    size?: string;
    responseFormat?: string;
  }): Promise<any> {
    const {
      image,
      n = 1,
      size = '1024x1024',
      responseFormat = 'url',
    } = args;

    const imageBuffer = Buffer.from(image, 'base64');

    const response = await this.openai.images.createVariation({
      image: new File([imageBuffer], 'image.png', { type: 'image/png' }),
      n,
      size: size as any,
      response_format: responseFormat as any,
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

  private async transcribeAudio(args: {
    file: string;
    model?: string;
    language?: string;
    prompt?: string;
    responseFormat?: string;
    temperature?: number;
  }): Promise<any> {
    const {
      file,
      model = 'whisper-1',
      language,
      prompt,
      responseFormat = 'json',
      temperature,
    } = args;

    const fileBuffer = Buffer.from(file, 'base64');

    const response = await this.openai.audio.transcriptions.create({
      file: new File([fileBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
      model,
      language,
      prompt,
      response_format: responseFormat as any,
      temperature,
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

  private async translateAudio(args: {
    file: string;
    model?: string;
    prompt?: string;
    responseFormat?: string;
    temperature?: number;
  }): Promise<any> {
    const {
      file,
      model = 'whisper-1',
      prompt,
      responseFormat = 'json',
      temperature,
    } = args;

    const fileBuffer = Buffer.from(file, 'base64');

    const response = await this.openai.audio.translations.create({
      file: new File([fileBuffer], 'audio.mp3', { type: 'audio/mpeg' }),
      model,
      prompt,
      response_format: responseFormat as any,
      temperature,
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

  private async textToSpeech(args: {
    input: string;
    model?: string;
    voice?: string;
    responseFormat?: string;
    speed?: number;
  }): Promise<any> {
    const {
      input,
      model = 'tts-1',
      voice = 'alloy',
      responseFormat = 'mp3',
      speed = 1.0,
    } = args;

    const response = await this.openai.audio.speech.create({
      model,
      voice: voice as any,
      input,
      response_format: responseFormat as any,
      speed,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    const base64Audio = buffer.toString('base64');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            format: responseFormat,
            base64: base64Audio,
          }, null, 2),
        },
      ],
    };
  }

  private async createEmbedding(args: {
    input: string[];
    model?: string;
    dimensions?: number;
  }): Promise<any> {
    const {
      input,
      model = 'text-embedding-3-small',
      dimensions,
    } = args;

    const response = await this.openai.embeddings.create({
      model,
      input,
      dimensions,
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

  private async moderateContent(args: {
    input: string[];
    model?: string;
  }): Promise<any> {
    const {
      input,
      model = 'text-moderation-latest',
    } = args;

    const response = await this.openai.moderations.create({
      input,
      model,
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

  private async analyzeImage(args: {
    messages: any[];
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<any> {
    const {
      messages,
      model = 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      maxTokens,
      temperature,
    } = args;

    const response = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: maxTokens,
      temperature,
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

  private async getModels(): Promise<any> {
    const response = await this.openai.models.list();

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(response, null, 2),
        },
      ],
    };
  }

  private async getModel(args: { model: string }): Promise<any> {
    const { model } = args;

    const response = await this.openai.models.retrieve(model);

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
    console.error('OpenAI MCP server running on stdio');
  }
}

const server = new OpenAIMCPServer();
server.run().catch(console.error);

