#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

// Test the MCP server by sending JSON-RPC requests
async function testMCPServer() {
  console.log('🔥 TESTING VSCode MCP Server...');
  
  const server = spawn('node', ['dist/index.js'], {
    stdio: ['pipe', 'pipe', 'inherit']
  });

  const readline = createInterface({
    input: server.stdout
  });

  let messageId = 1;

  // Send initialize request
  const initRequest = {
    jsonrpc: '2.0',
    id: messageId++,
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: {
          listChanged: true
        }
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }
  };

  console.log('📡 Sending initialize request...');
  server.stdin.write(JSON.stringify(initRequest) + '\n');

  // Send tools/list request
  setTimeout(() => {
    const toolsRequest = {
      jsonrpc: '2.0',
      id: messageId++,
      method: 'tools/list',
      params: {}
    };

    console.log('🔧 Sending tools/list request...');
    server.stdin.write(JSON.stringify(toolsRequest) + '\n');
  }, 500);

  // Listen for responses
  readline.on('line', (line) => {
    try {
      const response = JSON.parse(line);
      console.log('📥 Received response:', JSON.stringify(response, null, 2));
      
      if (response.result && response.result.tools) {
        console.log('✅ SUCCESS! Found tools:', response.result.tools.map(t => t.name));
      }
    } catch (error) {
      console.log('📄 Raw output:', line);
    }
  });

  // Clean up after 3 seconds
  setTimeout(() => {
    console.log('🔚 Test complete');
    server.kill();
    process.exit(0);
  }, 3000);
}

testMCPServer().catch(console.error);