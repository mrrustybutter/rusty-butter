#!/usr/bin/env node

import WebSocket from 'ws';

// Test direct websocket connection to VSCode Remote Control
async function testWebSocketConnection() {
  const host = process.env.VSCODE_HOST || '172.25.208.1';
  const port = process.env.VSCODE_PORT || '3710';
  const url = `ws://${host}:${port}`;
  
  console.log(`🔥 Testing WebSocket connection to ${url}...`);
  
  const ws = new WebSocket(url);
  
  ws.on('open', () => {
    console.log('✅ SUCCESS! Connected to VSCode Remote Control!');
    
    // Test sending a command
    const testCommand = {
      command: 'workbench.action.quickOpen'
    };
    
    console.log('📤 Sending test command:', testCommand);
    ws.send(JSON.stringify(testCommand));
    
    setTimeout(() => {
      console.log('🔚 Test complete - closing connection');
      ws.close();
    }, 2000);
  });
  
  ws.on('error', (error) => {
    console.log('❌ WebSocket connection failed:', error.message);
    process.exit(1);
  });
  
  ws.on('close', () => {
    console.log('📡 WebSocket connection closed');
    process.exit(0);
  });
  
  ws.on('message', (data) => {
    console.log('📥 Received from VSCode:', data.toString());
  });
}

testWebSocketConnection().catch(console.error);