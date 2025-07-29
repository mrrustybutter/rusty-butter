#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { OpenAICompleteClient } from './index.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Configuration from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ChatParams {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface GenerateImageParams {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  outputPath?: string;
}

interface AnalyzeImageParams {
  imagePath: string;
  prompt: string;
  detail?: 'low' | 'high' | 'auto';
}

interface EditImageParams {
  imagePath: string;
  prompt: string;
  maskPath?: string;
  outputPath?: string;
}

interface ChatWithImageParams {
  prompt: string;
  imagePath: string;
  model?: string;
}

interface CreateVariationParams {
  imagePath: string;
  n?: number;
  size?: '1024x1024' | '512x512' | '256x256';
  outputPath?: string;
}

class OpenAICompleteMCPServer {
  private server: Server;
  private client: OpenAICompleteClient;

  constructor() {
    if (!OPENAI_API_KEY) {
      console.error('ERROR: OPENAI_API_KEY environment variable not set!');
      console.error('Please set it in your environment or MCP configuration.');
      process.exit(1);
    }

    // Initialize the OpenAI client
    this.client = new OpenAICompleteClient({
      apiKey: OPENAI_API_KEY,
    });

    this.server = new Server(
      {
        name: 'openai-complete-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'chat',
          description: 'Chat with OpenAI GPT models',
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
                description: 'Array of chat messages',
              },
              model: {
                type: 'string',
                description: 'Model to use (default: gpt-4o)',
              },
              temperature: {
                type: 'number',
                description: 'Temperature for randomness (0-2)',
              },
              maxTokens: {
                type: 'number',
                description: 'Maximum tokens in response',
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
                description: 'Text prompt for image generation',
              },
              size: {
                type: 'string',
                enum: ['1024x1024', '1792x1024', '1024x1792'],
                description: 'Image size (default: 1024x1024)',
              },
              quality: {
                type: 'string',
                enum: ['standard', 'hd'],
                description: 'Image quality (default: standard)',
              },
              style: {
                type: 'string',
                enum: ['vivid', 'natural'],
                description: 'Image style (default: vivid)',
              },
              outputPath: {
                type: 'string',
                description: 'Optional path to save the image',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'analyze_image',
          description: 'Analyze images using GPT-4 Vision',
          inputSchema: {
            type: 'object',
            properties: {
              imagePath: {
                type: 'string',
                description: 'Path to image file or URL',
              },
              prompt: {
                type: 'string',
                description: 'What to analyze or ask about the image',
              },
              detail: {
                type: 'string',
                enum: ['low', 'high', 'auto'],
                description: 'Level of detail (default: auto)',
              },
            },
            required: ['imagePath', 'prompt'],
          },
        },
        {
          name: 'edit_image',
          description: 'Edit images using DALL-E 2',
          inputSchema: {
            type: 'object',
            properties: {
              imagePath: {
                type: 'string',
                description: 'Path to original image',
              },
              prompt: {
                type: 'string',
                description: 'Description of edits to make',
              },
              maskPath: {
                type: 'string',
                description: 'Optional mask image path',
              },
              outputPath: {
                type: 'string',
                description: 'Optional path to save edited image',
              },
            },
            required: ['imagePath', 'prompt'],
          },
        },
        {
          name: 'chat_with_image',
          description: 'Chat about an image using GPT-4 Vision',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'Question or prompt about the image',
              },
              imagePath: {
                type: 'string',
                description: 'Path to image file or URL',
              },
              model: {
                type: 'string',
                description: 'Model to use (default: gpt-4o)',
              },
            },
            required: ['prompt', 'imagePath'],
          },
        },
        {
          name: 'create_variations',
          description: 'Create variations of an existing image using DALL-E 2',
          inputSchema: {
            type: 'object',
            properties: {
              imagePath: {
                type: 'string',
                description: 'Path to the image file to create variations of',
              },
              n: {
                type: 'number',
                description: 'Number of variations to generate (1-10, default: 1)',
              },
              size: {
                type: 'string',
                enum: ['1024x1024', '512x512', '256x256'],
                description: 'Size of the variations (default: 1024x1024)',
              },
              outputPath: {
                type: 'string',
                description: 'Optional path to save the first variation',
              },
            },
            required: ['imagePath'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      switch (request.params.name) {
        case 'chat':
          return await this.handleChat(request.params.arguments as unknown as ChatParams);
        case 'generate_image':
          return await this.handleGenerateImage(
            request.params.arguments as unknown as GenerateImageParams
          );
        case 'analyze_image':
          return await this.handleAnalyzeImage(
            request.params.arguments as unknown as AnalyzeImageParams
          );
        case 'edit_image':
          return await this.handleEditImage(request.params.arguments as unknown as EditImageParams);
        case 'chat_with_image':
          return await this.handleChatWithImage(
            request.params.arguments as unknown as ChatWithImageParams
          );
        case 'create_variations':
          return await this.handleCreateVariations(
            request.params.arguments as unknown as CreateVariationParams
          );
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  private async handleChat(params: ChatParams) {
    try {
      console.error(`[OpenAI MCP] Chatting with model: ${params.model || 'gpt-4o'}`);

      const response = (await this.client.chat({
        messages: params.messages,
        model: params.model,
        temperature: params.temperature,
        maxTokens: params.maxTokens,
      })) as string;

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error in chat:', error);
      throw new Error(`Chat failed: ${error}`);
    }
  }

  private async handleGenerateImage(params: GenerateImageParams) {
    try {
      console.error(`[OpenAI MCP] Generating image: "${params.prompt.substring(0, 50)}..."`);

      const images = await this.client.generateImage({
        prompt: params.prompt,
        size: params.size,
        quality: params.quality,
        style: params.style,
      });

      const imageUrl = images[0]?.url;

      if (!imageUrl) {
        throw new Error('No image URL returned');
      }

      // Save image if output path is provided
      if (params.outputPath && imageUrl) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());

          // Ensure directory exists
          const dir = path.dirname(params.outputPath);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(params.outputPath, buffer);
          console.error(`[OpenAI MCP] Image saved to: ${params.outputPath}`);

          return {
            content: [
              {
                type: 'text',
                text: `Image generated and saved to: ${params.outputPath}\nURL: ${imageUrl}`,
              },
            ],
          };
        } catch (saveError) {
          console.error('[OpenAI MCP] Error saving image:', saveError);
          // Still return the URL even if save failed
          return {
            content: [
              {
                type: 'text',
                text: `Image generated! URL: ${imageUrl}\nWarning: Failed to save locally: ${saveError}`,
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Image generated! URL: ${imageUrl}`,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error generating image:', error);
      throw new Error(`Image generation failed: ${error}`);
    }
  }

  private async handleAnalyzeImage(params: AnalyzeImageParams) {
    try {
      console.error(`[OpenAI MCP] Analyzing image: ${params.imagePath}`);

      const analysis = await this.client.analyzeImage({
        imagePath: params.imagePath,
        prompt: params.prompt,
        detail: params.detail,
      });

      return {
        content: [
          {
            type: 'text',
            text: analysis,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error analyzing image:', error);
      throw new Error(`Image analysis failed: ${error}`);
    }
  }

  private async handleEditImage(params: EditImageParams) {
    try {
      console.error(`[OpenAI MCP] Editing image: ${params.imagePath}`);

      const editedImages = await this.client.editImage({
        image: params.imagePath,
        prompt: params.prompt,
        mask: params.maskPath,
      });

      const imageUrl = editedImages[0]?.url;

      if (!imageUrl) {
        throw new Error('No edited image URL returned');
      }

      // Save edited image if output path is provided
      if (params.outputPath && imageUrl) {
        try {
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to download edited image: ${response.statusText}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());

          // Ensure directory exists
          const dir = path.dirname(params.outputPath);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(params.outputPath, buffer);
          console.error(`[OpenAI MCP] Edited image saved to: ${params.outputPath}`);

          return {
            content: [
              {
                type: 'text',
                text: `Image edited and saved to: ${params.outputPath}\nURL: ${imageUrl}`,
              },
            ],
          };
        } catch (saveError) {
          console.error('[OpenAI MCP] Error saving edited image:', saveError);
          // Still return the URL even if save failed
          return {
            content: [
              {
                type: 'text',
                text: `Image edited! URL: ${imageUrl}\nWarning: Failed to save locally: ${saveError}`,
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Image edited! URL: ${imageUrl}`,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error editing image:', error);
      throw new Error(`Image editing failed: ${error}`);
    }
  }

  private async handleChatWithImage(params: ChatWithImageParams) {
    try {
      console.error(`[OpenAI MCP] Chatting about image: ${params.imagePath}`);

      const response = await this.client.chatWithImage(params.prompt, params.imagePath, {
        model: params.model,
      });

      return {
        content: [
          {
            type: 'text',
            text: response,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error in chat with image:', error);
      throw new Error(`Chat with image failed: ${error}`);
    }
  }

  private async handleCreateVariations(params: CreateVariationParams) {
    try {
      console.error(`[OpenAI MCP] Creating variations of image: ${params.imagePath}`);

      const variations = await this.client.createImageVariation(params.imagePath, {
        n: params.n,
        size: params.size,
      });

      const imageUrls = variations.map((v) => v.url).filter(Boolean);

      if (imageUrls.length === 0) {
        throw new Error('No image variations returned');
      }

      // Save first variation if output path is provided
      if (params.outputPath && imageUrls[0]) {
        try {
          const response = await fetch(imageUrls[0]);
          if (!response.ok) {
            throw new Error(`Failed to download variation: ${response.statusText}`);
          }

          const buffer = Buffer.from(await response.arrayBuffer());

          // Ensure directory exists
          const dir = path.dirname(params.outputPath);
          await fs.mkdir(dir, { recursive: true });

          await fs.writeFile(params.outputPath, buffer);
          console.error(`[OpenAI MCP] Variation saved to: ${params.outputPath}`);

          return {
            content: [
              {
                type: 'text',
                text: `Created ${imageUrls.length} variation(s). First saved to: ${params.outputPath}\nURLs: ${imageUrls.join(', ')}`,
              },
            ],
          };
        } catch (saveError) {
          console.error('[OpenAI MCP] Error saving variation:', saveError);
          // Still return the URLs even if save failed
          return {
            content: [
              {
                type: 'text',
                text: `Created ${imageUrls.length} variation(s)!\nURLs: ${imageUrls.join(', ')}\nWarning: Failed to save locally: ${saveError}`,
              },
            ],
          };
        }
      }

      return {
        content: [
          {
            type: 'text',
            text: `Created ${imageUrls.length} variation(s)!\nURLs: ${imageUrls.join(', ')}`,
          },
        ],
      };
    } catch (error) {
      console.error('[OpenAI MCP] Error creating variations:', error);
      throw new Error(`Image variation failed: ${error}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('[OpenAI MCP] Complete Server v1.0.0 running...');
    console.error(
      '[OpenAI MCP] Capabilities: Chat, Image Generation, Vision Analysis, Image Editing'
    );
  }
}

const server = new OpenAICompleteMCPServer();
server.run().catch(console.error);
