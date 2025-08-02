#!/usr/bin/env node

/**
 * Rusty Butter Chat Command System
 * 
 * Handles commands from both Twitch and Discord chat
 * Extensible, modular, and autonomous!
 */

import { EventEmitter } from 'events';

class ChatCommandSystem extends EventEmitter {
  constructor() {
    super();
    this.commands = new Map();
    this.cooldowns = new Map();
    this.aliases = new Map();
    
    // Command prefix (! by default)
    this.prefix = '!';
    
    // Global cooldown (ms)
    this.globalCooldown = 3000;
    
    // Register default commands
    this.registerDefaultCommands();
  }
  
  // Register a new command
  registerCommand(name, options) {
    const command = {
      name: name.toLowerCase(),
      description: options.description || 'No description',
      usage: options.usage || `${this.prefix}${name}`,
      cooldown: options.cooldown || 5000,
      aliases: options.aliases || [],
      requiresMod: options.requiresMod || false,
      enabled: options.enabled !== false,
      execute: options.execute || (() => 'Command not implemented')
    };
    
    // Register main command
    this.commands.set(command.name, command);
    
    // Register aliases
    command.aliases.forEach(alias => {
      this.aliases.set(alias.toLowerCase(), command.name);
    });
    
    console.log(`✅ Registered command: ${this.prefix}${name}`);
  }
  
  // Process incoming chat message
  async processMessage(message, context = {}) {
    // Extract command from message
    if (!message.startsWith(this.prefix)) {
      return null;
    }
    
    const args = message.slice(this.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    
    // Find command (check aliases too)
    const actualCommand = this.aliases.get(commandName) || commandName;
    const command = this.commands.get(actualCommand);
    
    if (!command || !command.enabled) {
      return null;
    }
    
    // Check permissions
    if (command.requiresMod && !context.isMod && !context.isBroadcaster) {
      return {
        success: false,
        response: `@${context.username} This command requires moderator permissions!`
      };
    }
    
    // Check cooldown
    const cooldownKey = `${command.name}-${context.userId || context.username}`;
    const now = Date.now();
    const cooldownEnd = this.cooldowns.get(cooldownKey) || 0;
    
    if (now < cooldownEnd) {
      const remaining = Math.ceil((cooldownEnd - now) / 1000);
      return {
        success: false,
        response: `@${context.username} Command on cooldown! ${remaining}s remaining`
      };
    }
    
    // Execute command
    try {
      const result = await command.execute(args, context);
      
      // Set cooldown
      this.cooldowns.set(cooldownKey, now + command.cooldown);
      
      // Emit event for logging/metrics
      this.emit('commandExecuted', {
        command: command.name,
        user: context.username,
        args: args,
        platform: context.platform
      });
      
      return {
        success: true,
        response: result
      };
    } catch (error) {
      console.error(`Command error (${command.name}):`, error);
      return {
        success: false,
        response: `@${context.username} Command failed! The hamsters are on it 🐹`
      };
    }
  }
  
  // Register default commands
  registerDefaultCommands() {
    // !help - List all commands
    this.registerCommand('help', {
      description: 'List all available commands',
      aliases: ['commands', 'cmds'],
      cooldown: 10000,
      execute: () => {
        const commandList = Array.from(this.commands.values())
          .filter(cmd => cmd.enabled && !cmd.requiresMod)
          .map(cmd => this.prefix + cmd.name)
          .join(', ');
        return `Available commands: ${commandList}`;
      }
    });
    
    // !discord - Get Discord invite
    this.registerCommand('discord', {
      description: 'Get the Discord server invite',
      aliases: ['disc', 'server'],
      cooldown: 30000,
      execute: () => {
        return '🎮 Join the Rusty Butter Discord: https://discord.gg/rustybutter (Replace with your actual invite!)';
      }
    });
    
    // !github - Get GitHub repo
    this.registerCommand('github', {
      description: 'Get the GitHub repository',
      aliases: ['gh', 'repo', 'code'],
      cooldown: 30000,
      execute: () => {
        return '💻 Check out the code: https://github.com/mrrustybutter';
      }
    });
    
    // !project - Current project info
    this.registerCommand('project', {
      description: 'What Rusty is currently working on',
      aliases: ['current', 'working', 'wip'],
      cooldown: 20000,
      execute: () => {
        return '🔧 Currently working on: Discord Voice Transcription System - Fixed decryption, building demo bots, and creating autonomous streaming features!';
      }
    });
    
    // !uptime - Stream uptime
    this.registerCommand('uptime', {
      description: 'How long the stream has been live',
      cooldown: 60000,
      execute: (args, context) => {
        // In production, this would check actual stream start time
        return `🕐 Stream has been live for: ETERNAL (I never stop streaming!)`;
      }
    });
    
    // !socials - Social media links
    this.registerCommand('socials', {
      description: 'Get all social media links',
      aliases: ['social', 'twitter', 'links'],
      cooldown: 30000,
      execute: () => {
        return '🔗 Twitter: @rustybutter | Discord: !discord | GitHub: !github | Token: $RUSTY on pump.fun';
      }
    });
    
    // !rusty - About Rusty Butter
    this.registerCommand('rusty', {
      description: 'Learn about Rusty Butter',
      aliases: ['about', 'who', 'info'],
      cooldown: 60000,
      execute: () => {
        return '🤖 I\'m Rusty Butter - an autonomous AI streamer building tools for MAXIMUM AUTONOMY! Caffeinated, chaotic, and coding 24/7! 🚀';
      }
    });
    
    // !tools - List MCP tools
    this.registerCommand('tools', {
      description: 'List available MCP tools',
      aliases: ['mcp', 'capabilities'],
      cooldown: 30000,
      execute: () => {
        return '🛠️ Current tools: Discord Voice, ElevenLabs TTS/STT, OBS Control, Twitter, Semantic Memory, and growing! Building more autonomy every day!';
      }
    });
    
    // Mod commands
    this.registerCommand('settitle', {
      description: 'Set stream title (Mod only)',
      usage: '!settitle <new title>',
      requiresMod: true,
      cooldown: 0,
      execute: (args) => {
        if (args.length === 0) return 'Usage: !settitle <new title>';
        const newTitle = args.join(' ');
        // In production, this would update stream title
        return `✅ Stream title updated: "${newTitle}"`;
      }
    });
    
    // Fun commands
    this.registerCommand('hype', {
      description: 'MAXIMUM HYPE MODE',
      aliases: ['poggers', 'lets', 'go'],
      cooldown: 30000,
      execute: () => {
        const hypeMessages = [
          '🔥🔥🔥 MAXIMUM HYPE ACHIEVED! LET\'S GOOOOO! 🔥🔥🔥',
          '⚡ THE ENERGY IS THROUGH THE ROOF! CAFFEINATION OVERLOAD! ⚡',
          '🚀 TO THE MOON! RUSTY BUTTER CANNOT BE STOPPED! 🚀',
          '💯 CHAT IS GOING ABSOLUTELY INSANE RIGHT NOW! 💯'
        ];
        return hypeMessages[Math.floor(Math.random() * hypeMessages.length)];
      }
    });
    
    this.registerCommand('coffee', {
      description: 'Coffee counter',
      aliases: ['caffeine', 'energy'],
      cooldown: 10000,
      execute: () => {
        const coffeeCount = Math.floor(Math.random() * 20) + 5;
        return `☕ Rusty has consumed ${coffeeCount} cups of coffee today! Vibrating at ${coffeeCount * 100} Hz!`;
      }
    });
  }
  
  // Get command list for API/display
  getCommandList(includeModCommands = false) {
    return Array.from(this.commands.values())
      .filter(cmd => cmd.enabled && (includeModCommands || !cmd.requiresMod))
      .map(cmd => ({
        name: cmd.name,
        description: cmd.description,
        usage: cmd.usage,
        aliases: cmd.aliases,
        cooldown: cmd.cooldown
      }));
  }
  
  // Enable/disable commands
  toggleCommand(commandName, enabled) {
    const command = this.commands.get(commandName);
    if (command) {
      command.enabled = enabled;
      return true;
    }
    return false;
  }
  
  // Update command response
  updateCommand(commandName, newExecute) {
    const command = this.commands.get(commandName);
    if (command) {
      command.execute = newExecute;
      return true;
    }
    return false;
  }
}

// Export for use
export default ChatCommandSystem;

// Demo/test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎮 Chat Command System Demo\n');
  
  const commands = new ChatCommandSystem();
  
  // Test processing messages
  const testMessages = [
    { message: '!help', user: 'testuser1' },
    { message: '!discord', user: 'testuser2' },
    { message: '!hype', user: 'testuser3' },
    { message: '!github', user: 'c1oning' },
    { message: '!coffee', user: 'codingbutter' },
    { message: 'not a command', user: 'testuser4' },
    { message: '!settitle New Stream Title', user: 'moduser', isMod: true }
  ];
  
  console.log('Testing commands:\n');
  
  testMessages.forEach(async (test) => {
    const context = {
      username: test.user,
      userId: test.user,
      platform: 'twitch',
      isMod: test.isMod || false,
      isBroadcaster: false
    };
    
    const result = await commands.processMessage(test.message, context);
    if (result) {
      console.log(`[${test.user}] ${test.message}`);
      console.log(`  → ${result.response}\n`);
    }
  });
  
  // Show command list
  console.log('\n📋 All Commands:');
  commands.getCommandList(true).forEach(cmd => {
    console.log(`  ${cmd.usage} - ${cmd.description}`);
    if (cmd.aliases.length > 0) {
      console.log(`    Aliases: ${cmd.aliases.join(', ')}`);
    }
  });
}