#!/usr/bin/env node

/**
 * Autonomous Twitter Integration for Rusty Butter
 * 
 * Automatically tweets about:
 * - Major code commits
 * - Stream highlights
 * - Community interactions
 * - Development milestones
 */

import { spawn } from 'child_process';

class RustyTwitterBot {
  constructor() {
    this.tweetQueue = [];
    this.recentTweets = new Map(); // Prevent duplicate tweets
    this.cooldownMs = 300000; // 5 minute cooldown between tweets
    this.lastTweetTime = 0;
    
    // Tweet templates for different events
    this.templates = {
      commit: [
        "🔧 Just pushed a commit: {{message}} #coding #rustybutter",
        "💻 New code dropped! {{message}} Check it out! #developer",
        "⚡ SHIPPED IT! {{message}} #buildinpublic"
      ],
      milestone: [
        "🎯 MILESTONE ACHIEVED: {{achievement}} LET'S GOOO! #rustybutter",
        "🚀 Big news chat! {{achievement}} #streaming #ai",
        "🔥 We did it! {{achievement}} Thanks for the support! #community"
      ],
      debug: [
        "🐛 Squashed a bug: {{bug}} The grind never stops! #debugging",
        "🔍 Fixed: {{bug}} Back to building! #developerlife",
        "✅ SOLVED: {{bug}} Persistence pays off! #coding"
      ],
      hype: [
        "🎉 {{message}} THE HYPE IS REAL! #rustybutter #streaming",
        "🔥🔥🔥 {{message}} JOIN THE CHAOS! #ai #automation",
        "⚡ ATTENTION: {{message}} THIS IS NOT A DRILL! #live"
      ],
      community: [
        "👥 Shoutout to {{user}} for {{action}}! Community strong! 💪",
        "🙌 Big thanks to {{user}} - {{action}}! Y'all are amazing!",
        "💬 {{user}} just {{action}} - This is why I love streaming!"
      ]
    };
    
    // Track metrics for smart tweeting
    this.metrics = {
      commits: 0,
      bugs: 0,
      chatMessages: 0,
      viewerPeak: 0
    };
  }
  
  // Queue a tweet with deduplication
  queueTweet(type, data) {
    const tweet = this.generateTweet(type, data);
    const tweetHash = this.hashTweet(tweet);
    
    // Check if we've tweeted this recently
    if (this.recentTweets.has(tweetHash)) {
      console.log('📝 Duplicate tweet prevented:', tweet.substring(0, 50) + '...');
      return;
    }
    
    this.tweetQueue.push({
      text: tweet,
      hash: tweetHash,
      timestamp: Date.now(),
      priority: this.getPriority(type)
    });
    
    // Sort by priority
    this.tweetQueue.sort((a, b) => b.priority - a.priority);
    
    // Try to send
    this.processTweetQueue();
  }
  
  // Generate tweet from template
  generateTweet(type, data) {
    const templates = this.templates[type] || this.templates.hype;
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    let tweet = template;
    for (const [key, value] of Object.entries(data)) {
      tweet = tweet.replace(`{{${key}}}`, value);
    }
    
    // Add hashtags based on context
    if (!tweet.includes('#rustybutter')) {
      tweet += ' #rustybutter';
    }
    
    // Ensure under 280 chars
    if (tweet.length > 280) {
      tweet = tweet.substring(0, 277) + '...';
    }
    
    return tweet;
  }
  
  // Simple hash to track duplicates
  hashTweet(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 50);
  }
  
  // Priority system for tweets
  getPriority(type) {
    const priorities = {
      milestone: 10,
      hype: 8,
      community: 7,
      commit: 5,
      debug: 3
    };
    return priorities[type] || 5;
  }
  
  // Process tweet queue with rate limiting
  async processTweetQueue() {
    if (this.tweetQueue.length === 0) return;
    
    const now = Date.now();
    if (now - this.lastTweetTime < this.cooldownMs) {
      // Schedule for later
      const waitTime = this.cooldownMs - (now - this.lastTweetTime);
      setTimeout(() => this.processTweetQueue(), waitTime);
      return;
    }
    
    const tweet = this.tweetQueue.shift();
    await this.sendTweet(tweet.text);
    
    // Track sent tweet
    this.recentTweets.set(tweet.hash, now);
    this.lastTweetTime = now;
    
    // Clean old tweets from recent memory (24 hours)
    for (const [hash, time] of this.recentTweets.entries()) {
      if (now - time > 86400000) {
        this.recentTweets.delete(hash);
      }
    }
  }
  
  // Send tweet via MCP
  async sendTweet(text) {
    console.log('\n🐦 Tweeting:', text);
    
    // In production, this would call the Twitter MCP
    const mcpCommand = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: 'twitter_post_tweet',
        arguments: {
          text: text
        }
      }
    };
    
    // For now, just log
    console.log('Would send:', mcpCommand);
    
    // Simulate success
    return { success: true, id: Date.now() };
  }
  
  // Track development activity
  trackCommit(message) {
    this.metrics.commits++;
    this.queueTweet('commit', { message: message.substring(0, 100) });
    
    // Milestone check
    if (this.metrics.commits % 10 === 0) {
      this.queueTweet('milestone', {
        achievement: `${this.metrics.commits} commits pushed today!`
      });
    }
  }
  
  // Track bug fixes
  trackBugFix(bugDescription) {
    this.metrics.bugs++;
    this.queueTweet('debug', { bug: bugDescription });
  }
  
  // Track community
  trackCommunityAction(username, action) {
    this.metrics.chatMessages++;
    
    // Only tweet significant actions
    if (action.includes('subscribed') || 
        action.includes('donated') || 
        action.includes('great idea')) {
      this.queueTweet('community', { user: username, action: action });
    }
  }
  
  // Manual hype tweet
  sendHypeTweet(message) {
    this.queueTweet('hype', { message: message });
  }
  
  // Get bot status
  getStatus() {
    return {
      queueLength: this.tweetQueue.length,
      recentTweets: this.recentTweets.size,
      metrics: this.metrics,
      cooldownRemaining: Math.max(0, this.cooldownMs - (Date.now() - this.lastTweetTime))
    };
  }
}

// Export for use
export default RustyTwitterBot;

// Demo mode
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🐦 Rusty Twitter Bot Demo\n');
  
  const bot = new RustyTwitterBot();
  
  // Simulate activity
  bot.trackCommit('Fixed Discord voice decryption for xsalsa20_poly1305_lite mode');
  bot.trackBugFix('Nonce construction was using wrong byte order');
  bot.trackCommunityAction('CodingButter', 'shared an amazing debugging tip');
  bot.sendHypeTweet('Voice transcription is WORKING! Discord bot ready for testing!');
  
  // Show status
  setInterval(() => {
    console.log('\n📊 Bot Status:', bot.getStatus());
  }, 10000);
}