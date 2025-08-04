#!/usr/bin/env node

/**
 * Twitch Chat Reaction Integration
 * 
 * Connects the reaction system to live Twitch chat
 * and integrates with OBS and avatar systems
 */

import ChatReactionSystem from './reaction-system.js';

class TwitchReactionIntegration {
  constructor() {
    this.reactions = new ChatReactionSystem();
    this.isRunning = false;
    
    // Setup reaction handlers
    this.setupHandlers();
  }
  
  setupHandlers() {
    this.reactions.on('reaction', async (data) => {
      console.log(`\n🎭 Reacting to ${data.username}'s message`);
      
      try {
        // Send chat response if available
        if (data.message) {
          await this.sendChatMessage(data.message);
        }
        
        // Update avatar expression
        if (data.avatarExpression) {
          await this.setAvatarExpression(data.avatarExpression);
        }
        
        // Play sound effect
        if (data.soundEffect) {
          await this.playSoundEffect(data.soundEffect);
        }
        
        // Change OBS scene
        if (data.obsScene) {
          await this.changeOBSScene(data.obsScene);
        }
      } catch (error) {
        console.error('Error handling reaction:', error);
      }
    });
  }
  
  // Send message to Twitch chat
  async sendChatMessage(message) {
    try {
      // Use the Twitch MCP to send message
      console.log(`💬 Sending to chat: ${message}`);
      // In real implementation, this would call:
      // await mcp.twitch.sendMessage('rustybuttercb', message);
    } catch (error) {
      console.error('Failed to send chat message:', error);
    }
  }
  
  // Set avatar expression
  async setAvatarExpression(expression) {
    try {
      console.log(`🎭 Setting avatar to: ${expression}`);
      // In real implementation, this would call:
      // await mcp.avatar.setExpression(expression);
    } catch (error) {
      console.error('Failed to set avatar expression:', error);
    }
  }
  
  // Play sound effect
  async playSoundEffect(soundFile) {
    try {
      console.log(`🔊 Playing sound: ${soundFile}`);
      // In real implementation, this would trigger OBS media source
      // or use a sound board integration
    } catch (error) {
      console.error('Failed to play sound effect:', error);
    }
  }
  
  // Change OBS scene
  async changeOBSScene(sceneName) {
    try {
      console.log(`🎬 Switching to scene: ${sceneName}`);
      // In real implementation, this would call:
      // await mcp.obs.setCurrentScene(sceneName);
    } catch (error) {
      console.error('Failed to change OBS scene:', error);
    }
  }
  
  // Start monitoring chat
  async start() {
    if (this.isRunning) return;
    
    console.log('🚀 Starting Twitch Chat Reaction System...');
    this.isRunning = true;
    
    // Poll for new messages
    this.pollInterval = setInterval(async () => {
      try {
        // In real implementation, this would:
        // const messages = await mcp.twitch.getRecentMessages('rustybuttercb', 10);
        // messages.forEach(msg => {
        //   this.reactions.processMessage(msg.username, msg.text);
        // });
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 1000);
  }
  
  // Stop monitoring
  stop() {
    if (!this.isRunning) return;
    
    console.log('🛑 Stopping Twitch Chat Reaction System...');
    this.isRunning = false;
    
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
  
  // Get current stats
  getStats() {
    return this.reactions.getStats();
  }
}

// Export for use
export default TwitchReactionIntegration;

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const integration = new TwitchReactionIntegration();
  
  console.log(`
╔════════════════════════════════════════════╗
║     🎭 TWITCH CHAT REACTION SYSTEM 🎭      ║
║                                            ║
║  Monitoring chat for reactions...          ║
║  Press Ctrl+C to stop                      ║
╚════════════════════════════════════════════╝
  `);
  
  // Simulate some chat messages for demo
  const demoMessages = [
    { user: 'Viewer1', msg: 'POGGERS this stream is amazing!' },
    { user: 'Viewer2', msg: '!hype' },
    { user: 'Viewer3', msg: '🔥🔥🔥' },
    { user: 'Viewer4', msg: 'How do you make the AI so smart?' },
    { user: 'Viewer5', msg: 'LOL that bug was hilarious' }
  ];
  
  let index = 0;
  const demoInterval = setInterval(() => {
    if (index >= demoMessages.length) {
      index = 0; // Loop demo messages
    }
    
    const { user, msg } = demoMessages[index];
    console.log(`\n💬 ${user}: ${msg}`);
    integration.reactions.processMessage(user, msg);
    index++;
  }, 5000);
  
  // Start the integration
  integration.start();
  
  // Handle shutdown
  process.on('SIGINT', () => {
    console.log('\n\n📊 Final Stats:', integration.getStats());
    integration.stop();
    clearInterval(demoInterval);
    process.exit(0);
  });
}