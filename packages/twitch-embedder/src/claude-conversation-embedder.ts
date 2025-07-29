#!/usr/bin/env node
import 'dotenv/config';
import { SemanticMemoryClient } from '@semantic-memory/client';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

interface ClaudeTranscript {
  messages: ClaudeMessage[];
  session_id?: string;
  created_at?: string;
  [key: string]: any;
}

export class ClaudeConversationEmbedder {
  private semanticMemory: SemanticMemoryClient;

  constructor() {
    // Use the same database path as other services
    const dbPath = process.env.SEMANTIC_MEMORY_DB_PATH || path.join(process.cwd(), 'semantic_memory_db');
    this.semanticMemory = new SemanticMemoryClient({
      dbPath: dbPath,
      openAIApiKey: process.env.OPENAI_API_KEY
    });
    console.log(`[ClaudeEmbedder] Using semantic memory database at: ${dbPath}`);
  }

  async embedTranscript(transcriptPath: string): Promise<void> {
    try {
      console.log(`[ClaudeEmbedder] Processing transcript: ${transcriptPath}`);
      
      // Read the transcript file
      const transcriptContent = await fs.readFile(transcriptPath, 'utf-8');
      const transcript: ClaudeTranscript = JSON.parse(transcriptContent);
      
      if (!transcript.messages || !Array.isArray(transcript.messages)) {
        console.log('[ClaudeEmbedder] No messages found in transcript');
        return;
      }

      console.log(`[ClaudeEmbedder] Found ${transcript.messages.length} messages to embed`);

      // Prepare messages for embedding
      const items = transcript.messages.map((message, index) => {
        const timestamp = message.timestamp || new Date().toISOString();
        
        // Truncate very long messages to avoid embedding issues
        const content = message.content.length > 8000 
          ? message.content.substring(0, 8000) + '...[truncated]'
          : message.content;

        return {
          type: 'code' as const, // Use 'code' type for Claude conversations
          content: `${message.role}: ${content}`,
          metadata: {
            platform: 'claude-code',
            role: message.role,
            message_index: index,
            session_id: transcript.session_id || 'unknown',
            timestamp: timestamp,
            transcript_path: transcriptPath,
            ...message.metadata
          }
        };
      });

      // Embed in batches to avoid API limits
      const batchSize = 5; // Smaller batches for longer content
      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        
        try {
          await this.semanticMemory.embedBatch(batch);
          console.log(`[ClaudeEmbedder] Embedded batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(items.length/batchSize)}`);
          
          // Small delay between batches to be respectful to the API
          if (i + batchSize < items.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        } catch (error) {
          console.error(`[ClaudeEmbedder] Failed to embed batch ${Math.floor(i/batchSize) + 1}:`, error);
        }
      }

      console.log(`[ClaudeEmbedder] Successfully processed transcript with ${transcript.messages.length} messages`);

    } catch (error) {
      console.error(`[ClaudeEmbedder] Error processing transcript ${transcriptPath}:`, error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    await this.semanticMemory.initialize();
  }
}

// CLI interface for hook usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const transcriptPath = process.argv[2];
  
  if (!transcriptPath) {
    console.error('[ClaudeEmbedder] Usage: node claude-conversation-embedder.js <transcript_path>');
    process.exit(1);
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[ClaudeEmbedder] ERROR: OPENAI_API_KEY environment variable is required!');
    process.exit(1);
  }

  const embedder = new ClaudeConversationEmbedder();
  
  embedder.initialize()
    .then(() => embedder.embedTranscript(transcriptPath))
    .then(() => {
      console.log('[ClaudeEmbedder] Embedding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[ClaudeEmbedder] Embedding failed:', error);
      process.exit(1);
    });
}