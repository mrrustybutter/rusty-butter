#!/usr/bin/env node
import 'dotenv/config';
import { SemanticMemoryClient } from '@semantic-memory/client';
import * as tmi from 'tmi.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration from environment variables
const TWITCH_USERNAME = process.env.TWITCH_USERNAME || 'rustybutterbot';
const TWITCH_OAUTH_TOKEN = process.env.TWITCH_OAUTH_TOKEN;
const TWITCH_CHANNEL = process.env.TWITCH_CHANNEL || 'codingbutter';
const CHECK_INTERVAL = parseInt(process.env.CHAT_EMBEDDER_INTERVAL || '30000');

interface LastProcessedState {
  twitch: string;
  pumpfun: string;
}

interface ChatMessage {
  timestamp: string;
  username: string;
  message: string;
  channel: string;
}

class TwitchChatEmbedder {
  private twitchClient?: tmi.Client;
  private semanticMemory: SemanticMemoryClient;
  private lastProcessed: LastProcessedState;
  private stateFile: string;
  private messageBuffer: ChatMessage[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.stateFile = path.join(__dirname, '../last_processed.json');
    this.lastProcessed = {
      twitch: new Date().toISOString(),
      pumpfun: new Date().toISOString(),
    };

    // Initialize semantic memory client with shared database path
    const dbPath =
      process.env.SEMANTIC_MEMORY_DB_PATH || path.join(process.cwd(), 'semantic_memory_db');
    this.semanticMemory = new SemanticMemoryClient({
      dbPath,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    console.log(`[TwitchEmbedder] Using semantic memory database at: ${dbPath}`);
  }

  async loadState(): Promise<void> {
    try {
      const data = await fs.readFile(this.stateFile, 'utf-8');
      this.lastProcessed = JSON.parse(data);
      console.log('[TwitchEmbedder] Loaded last processed state');
    } catch {
      console.log('[TwitchEmbedder] No previous state found, starting fresh');
    }
  }

  async saveState(): Promise<void> {
    await fs.mkdir(path.dirname(this.stateFile), { recursive: true });
    await fs.writeFile(this.stateFile, JSON.stringify(this.lastProcessed, null, 2));
  }

  async connectToTwitch(): Promise<void> {
    console.log('[TwitchEmbedder] Connecting to Twitch IRC...');

    this.twitchClient = new tmi.Client({
      options: { debug: false },
      identity: {
        username: TWITCH_USERNAME,
        password: TWITCH_OAUTH_TOKEN,
      },
      channels: [TWITCH_CHANNEL],
    });

    // Set up message handler
    this.twitchClient.on('message', (channel, tags, message, self) => {
      if (self) return; // Ignore messages from the bot itself

      const chatMessage: ChatMessage = {
        timestamp: new Date().toISOString(),
        username: tags.username || 'anonymous',
        message,
        channel: channel.replace('#', ''),
      };

      this.messageBuffer.push(chatMessage);
      console.log(`[TwitchEmbedder] Buffered message from ${chatMessage.username}`);
    });

    await this.twitchClient.connect();
    console.log(`[TwitchEmbedder] Connected to Twitch channel: ${TWITCH_CHANNEL}`);
  }

  async processMessageBuffer(): Promise<void> {
    if (this.isProcessing || this.messageBuffer.length === 0) return;

    this.isProcessing = true;
    const messagesToProcess = [...this.messageBuffer];
    this.messageBuffer = [];

    try {
      console.log(`[TwitchEmbedder] Processing ${messagesToProcess.length} buffered messages...`);

      // Filter out messages we've already processed
      const newMessages = messagesToProcess.filter(
        (msg) => new Date(msg.timestamp) > new Date(this.lastProcessed.twitch)
      );

      if (newMessages.length > 0) {
        console.log(`[TwitchEmbedder] Found ${newMessages.length} new messages to embed`);

        // Batch embed for efficiency
        const items = newMessages.map((msg) => ({
          type: 'chat' as const,
          content: `${msg.username}: ${msg.message}`,
          metadata: {
            platform: 'twitch',
            channel: msg.channel,
            username: msg.username,
            timestamp: msg.timestamp,
          },
        }));

        // Process in batches of 10 to avoid overwhelming the API
        const batchSize = 10;
        for (let i = 0; i < items.length; i += batchSize) {
          const batch = items.slice(i, i + batchSize);

          // Embed batch
          await this.semanticMemory.embedBatch(batch);

          console.log(
            `[TwitchEmbedder] Embedded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`
          );
        }

        // Update last processed timestamp
        this.lastProcessed.twitch = newMessages[newMessages.length - 1].timestamp;
        await this.saveState();

        console.log(`[TwitchEmbedder] Successfully embedded ${newMessages.length} messages`);
      }
    } catch (error) {
      console.error('[TwitchEmbedder] Error processing messages:', error);
      // Put failed messages back in buffer
      this.messageBuffer = [...messagesToProcess, ...this.messageBuffer];
    } finally {
      this.isProcessing = false;
    }
  }

  async start(): Promise<void> {
    await this.loadState();
    await this.semanticMemory.initialize();
    await this.connectToTwitch();

    console.log(
      `[TwitchEmbedder] Starting continuous embedding service (interval: ${CHECK_INTERVAL}ms)`
    );

    // Process buffer periodically
    setInterval(() => {
      this.processMessageBuffer();
    }, CHECK_INTERVAL);

    // Also process immediately when we get a batch of messages
    setInterval(() => {
      if (this.messageBuffer.length >= 5) {
        this.processMessageBuffer();
      }
    }, 5000); // Check every 5 seconds for batches

    // Handle shutdown
    process.on('SIGINT', async () => {
      console.log('[TwitchEmbedder] Shutting down...');

      // Process any remaining messages
      await this.processMessageBuffer();
      await this.saveState();

      if (this.twitchClient) {
        await this.twitchClient.disconnect();
      }

      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('[TwitchEmbedder] Shutting down...');

      // Process any remaining messages
      await this.processMessageBuffer();
      await this.saveState();

      if (this.twitchClient) {
        await this.twitchClient.disconnect();
      }

      process.exit(0);
    });
  }
}

// Check for required environment variables
if (!TWITCH_OAUTH_TOKEN) {
  console.error('[TwitchEmbedder] ERROR: TWITCH_OAUTH_TOKEN environment variable is required!');
  console.error('[TwitchEmbedder] Please set it in your .zshrc or .env file');
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('[TwitchEmbedder] ERROR: OPENAI_API_KEY environment variable is required!');
  console.error('[TwitchEmbedder] Please set it in your .zshrc or .env file');
  process.exit(1);
}

// Start the service
const embedder = new TwitchChatEmbedder();
embedder.start().catch(console.error);
