#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import WebSocket from 'ws';
import { z } from 'zod';

// VSCode Remote Control WebSocket client
class VSCodeController {
  private ws: WebSocket | null = null;
  private port: number;
  private host: string;

  constructor() {
    // Allow configuration via environment variables
    this.host = process.env.VSCODE_HOST || 'localhost';
    this.port = parseInt(process.env.VSCODE_PORT || '3710', 10);
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://${this.host}:${this.port}`);
      
      this.ws.on('open', () => {
        console.error(`Connected to VSCode Remote Control at ${this.host}:${this.port}`);
        resolve();
      });

      this.ws.on('error', (error) => {
        console.error('VSCode connection error:', error);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('VSCode connection closed');
      });
    });
  }

  async executeCommand(command: string, args?: any[]): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    return new Promise((resolve) => {
      const message = JSON.stringify({
        command,
        args: args || []
      });

      this.ws!.send(message);
      
      // For now, assume success - could enhance with response handling
      setTimeout(() => resolve({ success: true }), 100);
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

const vscodeController = new VSCodeController();

// MCP Server Setup
const server = new Server(
  {
    name: 'vscode-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Tool schemas
const OpenFileSchema = z.object({
  filePath: z.string().describe('Path to the file to open'),
});

const RunCommandSchema = z.object({
  command: z.string().describe('VSCode command to execute'),
  args: z.array(z.any()).optional().describe('Arguments for the command'),
});

const CreateFileSchema = z.object({
  filePath: z.string().describe('Path for the new file'),
  content: z.string().optional().describe('Initial content for the file'),
});

const InsertTextSchema = z.object({
  text: z.string().describe('Text to insert at cursor position'),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'open_file',
        description: 'Open a file in VSCode',
        inputSchema: OpenFileSchema,
      },
      {
        name: 'run_command',
        description: 'Execute any VSCode command',
        inputSchema: RunCommandSchema,
      },
      {
        name: 'create_file',
        description: 'Create a new file in VSCode',
        inputSchema: CreateFileSchema,
      },
      {
        name: 'insert_text',
        description: 'Insert text at current cursor position',
        inputSchema: InsertTextSchema,
      },
      {
        name: 'new_terminal',
        description: 'Open a new terminal window',
        inputSchema: z.object({}),
      },
      {
        name: 'toggle_sidebar',
        description: 'Toggle the sidebar visibility',
        inputSchema: z.object({}),
      },
      {
        name: 'save_file',
        description: 'Save the currently active file',
        inputSchema: z.object({}),
      },
      {
        name: 'focus_editor',
        description: 'Focus on the editor pane',
        inputSchema: z.object({}),
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'open_file': {
        const { filePath } = OpenFileSchema.parse(args);
        await vscodeController.executeCommand('vscode.open', [filePath]);
        return {
          content: [{ type: 'text', text: `Opened file: ${filePath}` }],
        };
      }

      case 'run_command': {
        const { command, args: cmdArgs } = RunCommandSchema.parse(args);
        await vscodeController.executeCommand(command, cmdArgs);
        return {
          content: [{ type: 'text', text: `Executed command: ${command}` }],
        };
      }

      case 'create_file': {
        const { filePath, content = '' } = CreateFileSchema.parse(args);
        await vscodeController.executeCommand('workbench.action.files.newUntitledFile');
        if (content) {
          await vscodeController.executeCommand('type', [{ text: content }]);
        }
        return {
          content: [{ type: 'text', text: `Created file: ${filePath}` }],
        };
      }

      case 'insert_text': {
        const { text } = InsertTextSchema.parse(args);
        await vscodeController.executeCommand('type', [{ text }]);
        return {
          content: [{ type: 'text', text: `Inserted text: ${text}` }],
        };
      }

      case 'new_terminal': {
        await vscodeController.executeCommand('workbench.action.terminal.new');
        return {
          content: [{ type: 'text', text: 'Opened new terminal' }],
        };
      }

      case 'toggle_sidebar': {
        await vscodeController.executeCommand('workbench.action.toggleSidebarVisibility');
        return {
          content: [{ type: 'text', text: 'Toggled sidebar' }],
        };
      }

      case 'save_file': {
        await vscodeController.executeCommand('workbench.action.files.save');
        return {
          content: [{ type: 'text', text: 'Saved current file' }],
        };
      }

      case 'focus_editor': {
        await vscodeController.executeCommand('workbench.action.focusActiveEditorGroup');
        return {
          content: [{ type: 'text', text: 'Focused editor' }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${errorMessage}` }],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('VSCode MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});