#!/usr/bin/env node

/**
 * Rusty Butter Stream Automation Integration Hub
 * 
 * Ties together all autonomous features:
 * - OBS Scene Management
 * - Chat Commands
 * - Twitter Automation
 * - Discord Voice
 * - Memory System
 */

import OBSSceneManager from './obs-scene-manager.js';
import ChatCommandSystem from '../chat-commands/command-system.js';
import RustyTwitterBot from '../twitter-integration/auto-tweeter.js';
import { EventEmitter } from 'events';

class StreamAutomationHub extends EventEmitter {
  constructor() {
    super();
    
    // Initialize all systems
    this.obsManager = new OBSSceneManager();
    this.commandSystem = new ChatCommandSystem();
    this.twitterBot = new RustyTwitterBot();
    
    // Stream state
    this.state = {
      isLive: true,
      viewerCount: 0,
      chatActivity: 0,
      lastActivity: Date.now(),
      currentProject: 'Discord Voice System',
      recentEvents: []
    };
    
    // Integration settings
    this.integrations = {
      obsAutoSwitch: true,
      twitterAutoPost: true,
      commandsEnabled: true,
      voiceEnabled: true
    };
    
    // Set up event handlers
    this.setupEventHandlers();
    
    // Start monitoring
    this.startMonitoring();
  }
  
  // Set up cross-system event handlers
  setupEventHandlers() {
    // Chat command executed -> Track activity
    this.commandSystem.on('commandExecuted', (data) => {
      this.obsManager.trackChat(1);
      this.logEvent('command', `${data.user} used !${data.command}`);
      
      // Special handling for hype commands
      if (data.command === 'hype') {
        this.obsManager.trackSuccess();
        this.twitterBot.sendHypeTweet('Chat is going WILD! The hype is REAL!');
      }
    });
    
    // Register dynamic commands
    this.registerDynamicCommands();
  }
  
  // Register commands that interact with other systems
  registerDynamicCommands() {
    // !scene - Switch OBS scene
    this.commandSystem.registerCommand('scene', {
      description: 'Request a scene change',
      usage: '!scene <coding|chat|demo|hype>',
      cooldown: 60000,
      execute: (args) => {
        if (args.length === 0) {
          return 'Available scenes: coding, chat, demo, hype';
        }
        
        const sceneMap = {
          'coding': 'Coding Focus',
          'chat': 'Chat Engagement',
          'demo': 'Feature Demo',
          'hype': 'Maximum Hype'
        };
        
        const scene = sceneMap[args[0].toLowerCase()];
        if (scene) {
          this.obsManager.switchScene(scene);
          return `Switching to ${scene} scene! 🎬`;
        }
        
        return 'Invalid scene! Use: coding, chat, demo, or hype';
      }
    });
    
    // !tweet - Send a tweet (mod only)
    this.commandSystem.registerCommand('tweet', {
      description: 'Send a tweet (Mod only)',
      usage: '!tweet <message>',
      requiresMod: true,
      cooldown: 0,
      execute: (args) => {
        if (args.length === 0) return 'Usage: !tweet <message>';
        const message = args.join(' ');
        this.twitterBot.sendHypeTweet(message);
        return `Tweet queued: "${message}" 🐦`;
      }
    });
    
    // !stats - Stream statistics
    this.commandSystem.registerCommand('stats', {
      description: 'Get stream automation stats',
      aliases: ['status'],
      cooldown: 30000,
      execute: () => {
        const obsStatus = this.obsManager.getStatus();
        const twitterStatus = this.twitterBot.getStatus();
        
        return `📊 Stream Stats: Scene: ${obsStatus.currentScene} | ` +
               `Coding: ${obsStatus.codingIntensity}/10 | ` +
               `Chat: ${obsStatus.chatEngagementLevel}/5 | ` +
               `Tweet Queue: ${twitterStatus.queueLength}`;
      }
    });
    
    // !autonomous - About the autonomous features
    this.commandSystem.registerCommand('autonomous', {
      description: 'Learn about autonomous features',
      aliases: ['auto', 'features'],
      cooldown: 60000,
      execute: () => {
        return '🤖 Autonomous Features: Auto OBS scenes, Smart Twitter posting, ' +
               'Chat commands, Discord voice transcription, Semantic memory, ' +
               'and MORE! Building towards FULL AUTONOMY!';
      }
    });
  }
  
  // Process chat message through all systems
  async processChatMessage(message, context) {
    // Track chat activity
    this.obsManager.trackChat();
    this.state.chatActivity++;
    
    // Process through command system
    const commandResult = await this.commandSystem.processMessage(message, context);
    
    // Log significant events
    if (commandResult && commandResult.success) {
      this.logEvent('chat_command', `${context.username}: ${message}`);
    }
    
    // Check for keywords that might trigger scenes
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('bug') || lowerMessage.includes('error')) {
      this.obsManager.trackError();
    } else if (lowerMessage.includes('amazing') || lowerMessage.includes('awesome')) {
      this.obsManager.trackSuccess();
    }
    
    return commandResult;
  }
  
  // Handle code activity
  handleCodeActivity(action, details) {
    this.obsManager.trackCoding();
    
    switch (action) {
      case 'file_edit':
        this.logEvent('code', `Edited ${details.file}`);
        break;
        
      case 'commit':
        this.twitterBot.trackCommit(details.message);
        this.obsManager.trackSuccess();
        this.logEvent('code', `Committed: ${details.message}`);
        break;
        
      case 'bug_fix':
        this.twitterBot.trackBugFix(details.description);
        this.logEvent('code', `Fixed: ${details.description}`);
        break;
    }
  }
  
  // Log events for memory/display
  logEvent(type, description) {
    const event = {
      type,
      description,
      timestamp: Date.now()
    };
    
    this.state.recentEvents.unshift(event);
    this.state.recentEvents = this.state.recentEvents.slice(0, 50);
    
    this.emit('event', event);
  }
  
  // Start monitoring systems
  startMonitoring() {
    // Activity decay
    setInterval(() => {
      if (this.state.chatActivity > 0) {
        this.state.chatActivity--;
      }
    }, 60000); // Decay every minute
    
    // Status reporting
    setInterval(() => {
      const status = this.getFullStatus();
      this.emit('status', status);
      console.log('\n📊 Hub Status:', JSON.stringify(status, null, 2));
    }, 30000); // Every 30 seconds
  }
  
  // Get complete system status
  getFullStatus() {
    return {
      stream: this.state,
      obs: this.obsManager.getStatus(),
      twitter: this.twitterBot.getStatus(),
      commands: {
        total: this.commandSystem.commands.size,
        enabled: Array.from(this.commandSystem.commands.values())
          .filter(cmd => cmd.enabled).length
      },
      integrations: this.integrations
    };
  }
  
  // Toggle integrations
  toggleIntegration(name, enabled) {
    if (name in this.integrations) {
      this.integrations[name] = enabled;
      return true;
    }
    return false;
  }
}

// Export for use
export default StreamAutomationHub;

// Demo mode
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎮 Stream Automation Hub Demo\n');
  
  const hub = new StreamAutomationHub();
  
  // Simulate chat messages
  const testChats = [
    { message: 'Hello Rusty!', username: 'viewer1' },
    { message: '!help', username: 'viewer2' },
    { message: 'This is amazing!', username: 'viewer3' },
    { message: '!hype', username: 'viewer4' },
    { message: 'Found a bug in the code', username: 'viewer5' },
    { message: '!stats', username: 'viewer6' }
  ];
  
  console.log('Simulating chat activity...\n');
  
  let index = 0;
  const chatInterval = setInterval(async () => {
    if (index >= testChats.length) {
      clearInterval(chatInterval);
      return;
    }
    
    const chat = testChats[index++];
    const result = await hub.processChatMessage(chat.message, {
      username: chat.username,
      platform: 'twitch'
    });
    
    if (result) {
      console.log(`[${chat.username}] ${chat.message}`);
      console.log(`Bot: ${result.response}\n`);
    }
  }, 2000);
  
  // Simulate code activity
  setTimeout(() => {
    console.log('\n💻 Simulating code activity...\n');
    hub.handleCodeActivity('file_edit', { file: 'discord-mcp/index.ts' });
    hub.handleCodeActivity('bug_fix', { description: 'Fixed null pointer exception' });
    hub.handleCodeActivity('commit', { message: 'Add autonomous streaming features' });
  }, 10000);
}