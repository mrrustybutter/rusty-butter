#!/usr/bin/env node

/**
 * Autonomous Chat Reaction System
 * 
 * Monitors chat messages and automatically responds with:
 * - Contextual reactions
 * - Emoji responses
 * - Sound effects
 * - OBS scene changes
 * - Avatar expressions
 */

import { EventEmitter } from 'events';

class ChatReactionSystem extends EventEmitter {
  constructor() {
    super();
    
    // Reaction patterns
    this.reactions = [
      // Excitement reactions
      {
        patterns: [/pog/i, /poggers/i, /pogchamp/i, /lets go/i, /let's go/i],
        responses: {
          message: "POGGERSSSSS! 🎉",
          avatarExpression: "excited",
          soundEffect: "airhorn.mp3",
          obsScene: null
        }
      },
      
      // Hype reactions
      {
        patterns: [/hype/i, /!hype/i, /hypetrain/i],
        responses: {
          message: "🚂 HYPE TRAIN INCOMING! ALL ABOARD! 🚂",
          avatarExpression: "hyped",
          soundEffect: "hypetrain.mp3",
          obsScene: "Maximum Hype"
        }
      },
      
      // Love reactions
      {
        patterns: [/love/i, /❤️/, /♥️/, /💜/, /heart/i],
        responses: {
          message: "❤️ Love you too, chat! ❤️",
          avatarExpression: "love",
          soundEffect: "love.mp3",
          obsScene: null
        }
      },
      
      // Greeting reactions
      {
        patterns: [/^hi\b/i, /^hello\b/i, /^hey\b/i, /^yo\b/i],
        responses: {
          message: "Hey there! Welcome to the stream! 👋",
          avatarExpression: "wave",
          soundEffect: "hello.mp3",
          obsScene: null
        }
      },
      
      // Question reactions
      {
        patterns: [/\?$/, /what is/i, /how do/i, /can you/i],
        responses: {
          message: null, // Don't auto-respond to all questions
          avatarExpression: "thinking",
          soundEffect: null,
          obsScene: null
        }
      },
      
      // Laughing reactions
      {
        patterns: [/lol/i, /lmao/i, /haha/i, /😂/, /🤣/, /kekw/i],
        responses: {
          message: "😂 Chat's got jokes today!",
          avatarExpression: "laughing",
          soundEffect: "laugh.mp3",
          obsScene: null
        }
      },
      
      // Sad reactions
      {
        patterns: [/sad/i, /😢/, /😭/, /cry/i, /rip/i],
        responses: {
          message: "Don't be sad, we'll get through this together! 💪",
          avatarExpression: "sad",
          soundEffect: "sad_violin.mp3",
          obsScene: null
        }
      },
      
      // Mind blown reactions
      {
        patterns: [/mind blown/i, /🤯/, /omg/i, /wtf/i, /holy/i],
        responses: {
          message: "🤯 MIND = BLOWN",
          avatarExpression: "shocked",
          soundEffect: "mindblown.mp3",
          obsScene: null
        }
      },
      
      // Fire reactions
      {
        patterns: [/🔥/, /fire/i, /lit/i, /hot/i],
        responses: {
          message: "🔥🔥🔥 STRAIGHT FIRE! 🔥🔥🔥",
          avatarExpression: "fire",
          soundEffect: "fire.mp3",
          obsScene: null
        }
      },
      
      // Clap reactions
      {
        patterns: [/👏/, /clap/i, /applause/i, /bravo/i],
        responses: {
          message: "👏 Round of applause for chat! 👏",
          avatarExpression: "clapping",
          soundEffect: "applause.mp3",
          obsScene: null
        }
      },
      
      // Coding reactions
      {
        patterns: [/code/i, /bug/i, /error/i, /debug/i, /compile/i],
        responses: {
          message: "Time to squash some bugs! 🐛🔨",
          avatarExpression: "coding",
          soundEffect: null,
          obsScene: "Coding Focus"
        }
      },
      
      // Coffee reactions
      {
        patterns: [/coffee/i, /☕/, /caffeine/i, /tired/i],
        responses: {
          message: "☕ Coffee break? Don't mind if I do!",
          avatarExpression: "coffee",
          soundEffect: "coffee_sip.mp3",
          obsScene: null
        }
      },
      
      // Party reactions
      {
        patterns: [/party/i, /🎉/, /🎊/, /celebrate/i],
        responses: {
          message: "🎉 PARTY TIME! 🎊",
          avatarExpression: "party",
          soundEffect: "party.mp3",
          obsScene: "Maximum Hype"
        }
      },
      
      // GG reactions
      {
        patterns: [/^gg$/i, /good game/i, /well played/i, /wp/i],
        responses: {
          message: "GG WP! 🎮",
          avatarExpression: "victory",
          soundEffect: "victory.mp3",
          obsScene: null
        }
      },
      
      // F reactions (pay respects)
      {
        patterns: [/^f$/i, /press f/i],
        responses: {
          message: "F in the chat 😔",
          avatarExpression: "salute",
          soundEffect: "f.mp3",
          obsScene: null
        }
      }
    ];
    
    // Cooldowns to prevent spam
    this.cooldowns = new Map();
    this.globalCooldown = 3000; // 3 seconds between reactions
    this.patternCooldown = 30000; // 30 seconds for same pattern
    
    // Stats
    this.stats = {
      totalReactions: 0,
      reactionCounts: new Map(),
      lastReaction: null
    };
  }
  
  // Process chat message
  processMessage(username, message, platform = 'twitch') {
    // Check global cooldown
    const now = Date.now();
    const lastReaction = this.cooldowns.get('global') || 0;
    if (now - lastReaction < this.globalCooldown) {
      return null;
    }
    
    // Find matching reaction
    for (const reaction of this.reactions) {
      for (const pattern of reaction.patterns) {
        if (pattern.test(message)) {
          // Check pattern-specific cooldown
          const patternKey = reaction.patterns[0].toString();
          const lastPatternUse = this.cooldowns.get(patternKey) || 0;
          if (now - lastPatternUse < this.patternCooldown) {
            continue;
          }
          
          // Update cooldowns
          this.cooldowns.set('global', now);
          this.cooldowns.set(patternKey, now);
          
          // Update stats
          this.stats.totalReactions++;
          this.stats.reactionCounts.set(
            patternKey,
            (this.stats.reactionCounts.get(patternKey) || 0) + 1
          );
          this.stats.lastReaction = {
            username,
            message,
            reaction: reaction.responses,
            timestamp: now
          };
          
          // Emit reaction event
          this.emit('reaction', {
            username,
            message,
            platform,
            ...reaction.responses
          });
          
          return reaction.responses;
        }
      }
    }
    
    return null;
  }
  
  // Add custom reaction
  addReaction(patterns, responses) {
    this.reactions.push({ patterns, responses });
  }
  
  // Get reaction stats
  getStats() {
    return {
      ...this.stats,
      topReactions: Array.from(this.stats.reactionCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }
  
  // Clear cooldowns (for testing)
  clearCooldowns() {
    this.cooldowns.clear();
  }
}

// Export for use
export default ChatReactionSystem;

// Demo if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const reactions = new ChatReactionSystem();
  
  // Listen for reactions
  reactions.on('reaction', (data) => {
    console.log('\n🎭 REACTION TRIGGERED!');
    console.log(`User: ${data.username}`);
    console.log(`Message: ${data.message}`);
    if (data.message) console.log(`Response: ${data.message}`);
    if (data.avatarExpression) console.log(`Avatar: ${data.avatarExpression}`);
    if (data.soundEffect) console.log(`Sound: ${data.soundEffect}`);
    if (data.obsScene) console.log(`Scene: ${data.obsScene}`);
  });
  
  // Test messages
  const testMessages = [
    { user: 'TestUser1', msg: 'POGGERS!' },
    { user: 'TestUser2', msg: '!hype' },
    { user: 'TestUser3', msg: 'This is 🔥' },
    { user: 'TestUser4', msg: 'lmao this is hilarious' },
    { user: 'TestUser5', msg: 'Hello everyone!' },
    { user: 'TestUser6', msg: '❤️❤️❤️' },
    { user: 'TestUser7', msg: 'How do I code like you?' },
    { user: 'TestUser8', msg: 'GG' },
    { user: 'TestUser9', msg: '🎉 We did it!' },
    { user: 'TestUser10', msg: 'F' }
  ];
  
  console.log('🎭 Chat Reaction System Demo\n');
  
  // Process test messages with delay
  let index = 0;
  const interval = setInterval(() => {
    if (index >= testMessages.length) {
      clearInterval(interval);
      console.log('\n📊 Final Stats:', reactions.getStats());
      return;
    }
    
    const { user, msg } = testMessages[index];
    console.log(`\n💬 ${user}: ${msg}`);
    reactions.processMessage(user, msg);
    index++;
  }, 1000);
}