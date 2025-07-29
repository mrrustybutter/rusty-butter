import { OpenAI } from 'openai';
import * as fs from 'fs/promises';
import { EventEmitter } from 'events';
import type {
  ChatCompletionMessageParam,
  ChatCompletionContentPartImage,
  ChatCompletionContentPartText,
} from 'openai/resources/chat/completions';

export interface OpenAICompleteClientConfig {
  apiKey: string;
  defaultModel?: string;
  defaultImageModel?: string;
  defaultVisionModel?: string;
}

export interface ChatCompletionOptions {
  model?: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  n?: number;
  style?: 'vivid' | 'natural';
}

export interface ImageEditOptions {
  image: string; // File path or base64
  prompt: string;
  mask?: string; // Optional mask file path or base64
  model?: string;
  size?: '1024x1024' | '512x512' | '256x256';
  n?: number;
}

export interface VisionAnalysisOptions {
  imagePath: string; // File path or URL
  prompt: string;
  model?: string;
  maxTokens?: number;
  detail?: 'low' | 'high' | 'auto';
}

export class OpenAICompleteClient extends EventEmitter {
  private client: OpenAI;
  private defaultModel: string;
  private defaultImageModel: string;
  private defaultVisionModel: string;

  constructor(config: OpenAICompleteClientConfig) {
    super();
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.defaultModel = config.defaultModel || 'gpt-4o';
    this.defaultImageModel = config.defaultImageModel || 'dall-e-3';
    this.defaultVisionModel = config.defaultVisionModel || 'gpt-4o';
  }

  // Chat Completion with optional vision support
  async chat(
    options: ChatCompletionOptions
  ): Promise<string | AsyncGenerator<string, void, unknown>> {
    const model = options.model || this.defaultModel;

    if (options.stream) {
      return this.streamChat(options);
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }

  // Stream chat responses
  private async *streamChat(options: ChatCompletionOptions): AsyncGenerator<string, void, unknown> {
    const model = options.model || this.defaultModel;

    const stream = await this.client.chat.completions.create({
      model,
      messages: options.messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  // Generate images using DALL-E
  async generateImage(
    options: ImageGenerationOptions
  ): Promise<Array<{ url?: string; b64_json?: string }>> {
    const model = options.model || this.defaultImageModel;

    const response = await this.client.images.generate({
      model,
      prompt: options.prompt,
      size: options.size,
      quality: options.quality,
      n: options.n || 1,
      style: options.style,
      response_format: 'url', // Can be changed to 'b64_json' if needed
    });

    return response.data || [];
  }

  // Edit images using DALL-E 2
  async editImage(options: ImageEditOptions): Promise<Array<{ url?: string; b64_json?: string }>> {
    // Convert file paths to File objects if needed
    const imageFile = await this.prepareImageFile(options.image);
    const maskFile = options.mask ? await this.prepareImageFile(options.mask) : undefined;

    const response = await this.client.images.edit({
      model: 'dall-e-2', // Only DALL-E 2 supports image editing
      image: imageFile,
      prompt: options.prompt,
      mask: maskFile,
      size: options.size,
      n: options.n || 1,
      response_format: 'url',
    });

    return response.data || [];
  }

  // Analyze images using GPT-4 Vision
  async analyzeImage(options: VisionAnalysisOptions): Promise<string> {
    const model = options.model || this.defaultVisionModel;

    // Prepare image URL (either direct URL or base64 data URL)
    const imageUrl = await this.prepareImageUrl(options.imagePath);

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: options.prompt } as ChatCompletionContentPartText,
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
                detail: options.detail || 'auto',
              },
            } as ChatCompletionContentPartImage,
          ],
        },
      ],
      max_tokens: options.maxTokens || 1000,
    });

    return response.choices[0]?.message?.content || '';
  }

  // Create image variations
  async createImageVariation(
    imagePath: string,
    options?: { n?: number; size?: string }
  ): Promise<Array<{ url?: string; b64_json?: string }>> {
    const imageFile = await this.prepareImageFile(imagePath);

    const response = await this.client.images.createVariation({
      model: 'dall-e-2', // Only DALL-E 2 supports variations
      image: imageFile,
      n: options?.n || 1,
      size: (options?.size || '1024x1024') as '1024x1024' | '512x512' | '256x256',
      response_format: 'url',
    });

    return response.data || [];
  }

  // Helper: Prepare image file for upload
  private async prepareImageFile(imagePath: string): Promise<File> {
    if (imagePath.startsWith('data:') || imagePath.includes('base64')) {
      // Handle base64 input
      const base64Data = imagePath.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      return new File([buffer], 'image.png', { type: 'image/png' });
    } else {
      // Handle file path
      const buffer = await fs.readFile(imagePath);
      const filename = imagePath.split('/').pop() || 'image.png';
      return new File([buffer], filename, { type: 'image/png' });
    }
  }

  // Helper: Prepare image URL for vision API
  private async prepareImageUrl(imagePath: string): Promise<string> {
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      // Already a URL
      return imagePath;
    } else if (imagePath.startsWith('data:') || imagePath.includes('base64')) {
      // Already a data URL
      return imagePath;
    } else {
      // Convert file to base64 data URL
      const buffer = await fs.readFile(imagePath);
      const base64 = buffer.toString('base64');
      const mimeType = this.getMimeType(imagePath);
      return `data:${mimeType};base64,${base64}`;
    }
  }

  // Helper: Get MIME type from file extension
  private getMimeType(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      webp: 'image/webp',
    };
    return mimeTypes[ext || ''] || 'image/png';
  }

  // Combined function: Chat with image context
  async chatWithImage(
    prompt: string,
    imagePath: string,
    options?: { model?: string; maxTokens?: number }
  ): Promise<string> {
    const imageUrl = await this.prepareImageUrl(imagePath);

    return this.chat({
      model: options?.model || this.defaultVisionModel,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt } as ChatCompletionContentPartText,
            { type: 'image_url', image_url: { url: imageUrl } } as ChatCompletionContentPartImage,
          ],
        },
      ],
      maxTokens: options?.maxTokens,
    }) as Promise<string>;
  }

  // Generate image and describe it
  async generateAndDescribe(prompt: string): Promise<{ imageUrl: string; description: string }> {
    // Generate image
    const images = await this.generateImage({ prompt });
    const imageUrl = images[0]?.url;

    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    // Analyze the generated image
    const description = await this.analyzeImage({
      imagePath: imageUrl,
      prompt: 'Describe this image in detail. What do you see?',
    });

    return { imageUrl, description };
  }
}
