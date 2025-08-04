#!/usr/bin/env node

/**
 * Real-time WebSocket Server for Stream Dashboard
 * 
 * Broadcasts live updates to all connected dashboards:
 * - Chat messages
 * - OBS scene changes
 * - Development activity
 * - System metrics
 */

import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DashboardServer extends EventEmitter {
  constructor(port = process.env.PORT || 8090) {
    super();
    this.port = port;
    this.clients = new Set();
    
    // Metrics state
    this.metrics = {
      stream: {
        status: 'LIVE',
        uptime: Date.now(),
        viewerCount: 0,
        mode: 'AUTONOMOUS'
      },
      obs: {
        currentScene: 'Coding Focus',
        codingIntensity: 5,
        chatActivity: 3
      },
      discord: {
        voiceConnected: true,
        transcriptionEnabled: true,
        decryptSuccess: 100,
        usersInVoice: 2
      },
      commands: {
        available: 15,
        usedToday: 0,
        recentCommands: []
      },
      twitter: {
        queueLength: 0,
        cooldown: 0,
        tweetsToday: 0
      },
      memory: {
        totalMemories: 1337,
        categories: 4,
        lastEmbed: Date.now()
      },
      development: {
        filesEdited: 0,
        commitsToday: 0,
        bugsFixed: 0,
        featuresAdded: 0
      },
      system: {
        cpuUsage: 42,
        memoryUsage: 2.1,
        caffeineLevel: 'CRITICAL',
        autonomyLevel: 87
      },
      chat: {
        messages: []
      }
    };
    
    // Start server
    this.startServer();
    
    // Start metric simulation
    this.startMetricSimulation();
  }
  
  startServer() {
    // Create HTTP server for serving dashboard
    const server = http.createServer((req, res) => {
      if (req.url === '/' || req.url === '/dashboard') {
        // Serve the dashboard HTML
        const dashboardPath = path.join(__dirname, 'dashboard.html');
        fs.readFile(dashboardPath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Dashboard not found');
            return;
          }
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        });
      } else if (req.url === '/ws-dashboard.html') {
        // Serve WebSocket-enabled dashboard
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(this.generateWebSocketDashboard());
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });
    
    // Create WebSocket server
    this.wss = new WebSocketServer({ server });
    
    this.wss.on('connection', (ws) => {
      console.log('🔌 New dashboard connected!');
      this.clients.add(ws);
      
      // Send initial state
      ws.send(JSON.stringify({
        type: 'init',
        data: this.metrics
      }));
      
      // Handle messages from client
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleClientMessage(ws, data);
        } catch (e) {
          console.error('Invalid message from client:', e);
        }
      });
      
      // Handle disconnect
      ws.on('close', () => {
        console.log('🔌 Dashboard disconnected');
        this.clients.delete(ws);
      });
    });
    
    server.listen(this.port, () => {
      console.log(`
╔════════════════════════════════════════════╗
║   🚀 Dashboard Server Running! 🚀          ║
║                                            ║
║   HTTP: http://localhost:${this.port}           ║
║   WebSocket: ws://localhost:${this.port}        ║
║                                            ║
║   Open http://localhost:${this.port}/ws-dashboard.html
╚════════════════════════════════════════════╝
      `);
    });
  }
  
  // Handle messages from dashboard clients
  handleClientMessage(ws, data) {
    switch (data.type) {
      case 'command':
        // Dashboard triggered a command
        this.emit('dashboardCommand', data.command);
        break;
      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;
    }
  }
  
  // Broadcast update to all connected dashboards
  broadcast(type, data) {
    const message = JSON.stringify({ type, data });
    this.clients.forEach(client => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });
  }
  
  // Update specific metrics
  updateMetric(category, key, value) {
    if (this.metrics[category]) {
      this.metrics[category][key] = value;
      this.broadcast('update', {
        category,
        key,
        value
      });
    }
  }
  
  // Add chat message
  addChatMessage(username, message, platform = 'twitch') {
    const chatMessage = {
      username,
      message,
      platform,
      timestamp: Date.now()
    };
    
    this.metrics.chat.messages.push(chatMessage);
    if (this.metrics.chat.messages.length > 50) {
      this.metrics.chat.messages.shift();
    }
    
    this.broadcast('chat', chatMessage);
  }
  
  // Track command usage
  trackCommand(command, user) {
    this.metrics.commands.usedToday++;
    this.metrics.commands.recentCommands.push({
      command,
      user,
      timestamp: Date.now()
    });
    
    if (this.metrics.commands.recentCommands.length > 10) {
      this.metrics.commands.recentCommands.shift();
    }
    
    this.broadcast('command', { command, user });
  }
  
  // Update OBS scene
  updateScene(sceneName) {
    this.metrics.obs.currentScene = sceneName;
    this.broadcast('scene', sceneName);
  }
  
  // Track development activity
  trackDevelopment(action) {
    switch (action.type) {
      case 'edit':
        this.metrics.development.filesEdited++;
        break;
      case 'commit':
        this.metrics.development.commitsToday++;
        break;
      case 'bug':
        this.metrics.development.bugsFixed++;
        break;
      case 'feature':
        this.metrics.development.featuresAdded++;
        break;
    }
    this.broadcast('development', action);
  }
  
  // Simulate metric updates for demo
  startMetricSimulation() {
    // Update random metrics
    setInterval(() => {
      // System metrics
      this.metrics.system.cpuUsage = Math.floor(Math.random() * 30) + 30;
      this.metrics.system.memoryUsage = (Math.random() * 2 + 1).toFixed(1);
      
      // OBS metrics
      this.metrics.obs.codingIntensity = Math.max(0, Math.min(10, 
        this.metrics.obs.codingIntensity + Math.floor(Math.random() * 3) - 1));
      this.metrics.obs.chatActivity = Math.max(0, Math.min(10, 
        this.metrics.obs.chatActivity + Math.floor(Math.random() * 3) - 1));
      
      // Twitter cooldown
      if (this.metrics.twitter.cooldown > 0) {
        this.metrics.twitter.cooldown--;
      }
      
      this.broadcast('metrics', this.metrics);
    }, 2000);
    
    // Simulate chat messages
    const sampleChats = [
      { user: 'StreamViewer', msg: 'This dashboard is SICK!' },
      { user: 'CodeEnthusiast', msg: 'The autonomy level is rising!' },
      { user: 'TechFan', msg: '!hype' },
      { user: 'NewViewer', msg: 'Just discovered this stream!' },
      { user: 'AILover', msg: 'The future is autonomous!' }
    ];
    
    setInterval(() => {
      const chat = sampleChats[Math.floor(Math.random() * sampleChats.length)];
      this.addChatMessage(chat.user, chat.msg);
    }, 5000);
  }
  
  // Generate WebSocket-enabled dashboard HTML
  generateWebSocketDashboard() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Rusty Butter Live Dashboard</title>
    <style>
        body { 
            background: #0a0a0a; 
            color: #00ff00; 
            font-family: monospace; 
            padding: 20px;
        }
        .metric {
            background: #1a1a1a;
            border: 1px solid #00ff00;
            padding: 10px;
            margin: 5px;
            display: inline-block;
        }
        .chat-message {
            padding: 5px;
            margin: 2px 0;
            background: rgba(0,255,0,0.1);
        }
        h1 { 
            text-align: center; 
            text-shadow: 0 0 20px #00ff00;
        }
    </style>
</head>
<body>
    <h1>🔴 LIVE DASHBOARD - WEBSOCKET CONNECTED 🔴</h1>
    <div id="metrics"></div>
    <div id="chat" style="max-height: 300px; overflow-y: auto;"></div>
    
    <script>
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const port = window.location.port || '${this.port}';
        const ws = new WebSocket(protocol + '//' + host + ':' + port);
        let metrics = {};
        
        ws.onopen = () => {
            console.log('Connected to dashboard server!');
        };
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            switch(data.type) {
                case 'init':
                    metrics = data.data;
                    updateDisplay();
                    break;
                case 'update':
                    if (metrics[data.data.category]) {
                        metrics[data.data.category][data.data.key] = data.data.value;
                        updateDisplay();
                    }
                    break;
                case 'chat':
                    addChatMessage(data.data);
                    break;
                case 'metrics':
                    metrics = data.data;
                    updateDisplay();
                    break;
            }
        };
        
        function updateDisplay() {
            const metricsDiv = document.getElementById('metrics');
            metricsDiv.innerHTML = Object.entries(metrics).map(([category, data]) => {
                if (category === 'chat') return '';
                return '<div class="metric"><h3>' + category.toUpperCase() + '</h3>' +
                    Object.entries(data).map(([key, value]) => 
                        key + ': ' + value
                    ).join('<br>') + '</div>';
            }).join('');
        }
        
        function addChatMessage(msg) {
            const chatDiv = document.getElementById('chat');
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.textContent = msg.username + ': ' + msg.message;
            chatDiv.appendChild(msgEl);
            chatDiv.scrollTop = chatDiv.scrollHeight;
        }
        
        // Keep connection alive
        setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000);
    </script>
</body>
</html>`;
  }
}

// Export for use
export default DashboardServer;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new DashboardServer();
  
  // Example integration with other systems
  server.on('dashboardCommand', (command) => {
    console.log('Dashboard command received:', command);
  });
  
  // Simulate some activity
  setTimeout(() => {
    server.trackCommand('!hype', 'DemoUser');
    server.updateScene('Maximum Hype');
    server.trackDevelopment({ type: 'feature', description: 'Added WebSocket server' });
  }, 5000);
}