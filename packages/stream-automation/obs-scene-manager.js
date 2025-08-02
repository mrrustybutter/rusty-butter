#!/usr/bin/env node

/**
 * OBS Scene Manager for Autonomous Streaming
 * 
 * Automatically switches OBS scenes based on activity:
 * - Coding Scene: When editing files
 * - Chat Scene: When engaging with chat
 * - Demo Scene: When demonstrating features
 * - Hype Scene: For big moments!
 */

import { spawn } from 'child_process';

class OBSSceneManager {
  constructor() {
    this.currentScene = 'Main';
    this.activityTimer = null;
    this.chatEngagementLevel = 0;
    this.codingIntensity = 0;
    
    // Scene definitions
    this.scenes = {
      MAIN: 'Main Scene',
      CODING: 'Coding Focus',
      CHAT: 'Chat Engagement', 
      DEMO: 'Feature Demo',
      HYPE: 'Maximum Hype',
      ERROR: 'Debug Mode'
    };
    
    // Activity thresholds
    this.thresholds = {
      chatHigh: 5,      // Switch to chat scene
      codingHigh: 10,   // Switch to coding scene
      hypeTrigger: 15,  // Trigger hype scene
      cooldown: 30000   // 30 second cooldown between switches
    };
    
    this.lastSwitch = 0;
  }
  
  // Track coding activity (file edits)
  trackCoding() {
    this.codingIntensity++;
    this.evaluateScene();
  }
  
  // Track chat engagement
  trackChat(messageCount = 1) {
    this.chatEngagementLevel += messageCount;
    this.evaluateScene();
  }
  
  // Track errors/debugging
  trackError() {
    // Immediate switch to error scene
    this.switchScene(this.scenes.ERROR);
  }
  
  // Track successful moments
  trackSuccess() {
    if (this.codingIntensity > 5 || this.chatEngagementLevel > 3) {
      this.switchScene(this.scenes.HYPE);
    }
  }
  
  // Evaluate and switch scenes based on activity
  evaluateScene() {
    const now = Date.now();
    if (now - this.lastSwitch < this.thresholds.cooldown) {
      return; // Too soon to switch
    }
    
    // Determine best scene
    let targetScene = this.scenes.MAIN;
    
    if (this.chatEngagementLevel >= this.thresholds.chatHigh) {
      targetScene = this.scenes.CHAT;
    } else if (this.codingIntensity >= this.thresholds.codingHigh) {
      targetScene = this.scenes.CODING;
    } else if (this.chatEngagementLevel + this.codingIntensity >= this.thresholds.hypeTrigger) {
      targetScene = this.scenes.HYPE;
    }
    
    if (targetScene !== this.currentScene) {
      this.switchScene(targetScene);
    }
    
    // Decay activity levels
    this.startDecay();
  }
  
  // Switch OBS scene
  async switchScene(sceneName) {
    console.log(`🎬 Switching to: ${sceneName}`);
    
    // Call MCP server to switch scene
    const mcpCommand = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'obs_set_current_scene',
        arguments: {
          sceneName: sceneName
        }
      }
    };
    
    // In production, send to MCP server
    // For now, just log
    console.log('MCP Command:', mcpCommand);
    
    this.currentScene = sceneName;
    this.lastSwitch = Date.now();
    
    // Reset activity after hype
    if (sceneName === this.scenes.HYPE) {
      setTimeout(() => {
        this.codingIntensity = 0;
        this.chatEngagementLevel = 0;
      }, 5000);
    }
  }
  
  // Gradually reduce activity levels
  startDecay() {
    if (this.activityTimer) {
      clearInterval(this.activityTimer);
    }
    
    this.activityTimer = setInterval(() => {
      if (this.codingIntensity > 0) this.codingIntensity--;
      if (this.chatEngagementLevel > 0) this.chatEngagementLevel--;
      
      // Stop decay when both are zero
      if (this.codingIntensity === 0 && this.chatEngagementLevel === 0) {
        clearInterval(this.activityTimer);
        // Return to main scene
        if (this.currentScene !== this.scenes.MAIN) {
          this.switchScene(this.scenes.MAIN);
        }
      }
    }, 5000); // Decay every 5 seconds
  }
  
  // Get current status
  getStatus() {
    return {
      currentScene: this.currentScene,
      codingIntensity: this.codingIntensity,
      chatEngagementLevel: this.chatEngagementLevel,
      timeSinceLastSwitch: Date.now() - this.lastSwitch
    };
  }
}

// Export for use in other modules
export default OBSSceneManager;

// Demo/test mode
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🎮 OBS Scene Manager Demo\n');
  
  const manager = new OBSSceneManager();
  
  // Simulate activity
  console.log('Simulating stream activity...\n');
  
  // Coding burst
  setTimeout(() => {
    console.log('📝 Coding activity detected!');
    for (let i = 0; i < 12; i++) {
      manager.trackCoding();
    }
  }, 1000);
  
  // Chat burst
  setTimeout(() => {
    console.log('💬 Chat explosion!');
    manager.trackChat(8);
  }, 5000);
  
  // Success moment
  setTimeout(() => {
    console.log('🎉 Success achieved!');
    manager.trackSuccess();
  }, 10000);
  
  // Status updates
  setInterval(() => {
    const status = manager.getStatus();
    console.log('\n📊 Status:', status);
  }, 3000);
}