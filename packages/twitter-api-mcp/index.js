#!/usr/bin/env node

/**
 * Rusty's Legitimate Twitter MCP Server
 * Uses official Twitter API v2 with proper OAuth authentication
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { TwitterApi } from 'twitter-api-v2';

class TwitterMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'rusty-twitter-api-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.twitterClient = null;
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_tweets',
            description: 'Search for recent tweets using Twitter API v2',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Search query for tweets',
                },
                max_results: {
                  type: 'number',
                  description: 'Maximum number of results (10-100)',
                  default: 10,
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'get_user_tweets',
            description: 'Get tweets from a specific user',
            inputSchema: {
              type: 'object',
              properties: {
                username: {
                  type: 'string',
                  description: 'Twitter username (without @)',
                },
                max_results: {
                  type: 'number',
                  description: 'Maximum number of tweets (5-100)',
                  default: 10,
                },
              },
              required: ['username'],
            },
          },
          {
            name: 'get_trending_topics',
            description: 'Get trending topics (using search for popular keywords)',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: 'Location for trends (optional)',
                  default: 'worldwide',
                },
              },
            },
          },
          {
            name: 'get_tweet_details',
            description: 'Get details of a specific tweet by ID',
            inputSchema: {
              type: 'object',
              properties: {
                tweet_id: {
                  type: 'string',
                  description: 'Tweet ID',
                },
              },
              required: ['tweet_id'],
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args } = request.params;

        if (!this.twitterClient) {
          await this.initializeTwitterClient();
        }

        switch (name) {
          case 'search_tweets':
            return await this.searchTweets(args.query, args.max_results || 10);

          case 'get_user_tweets':
            return await this.getUserTweets(args.username, args.max_results || 10);

          case 'get_trending_topics':
            return await this.getTrendingTopics();

          case 'get_tweet_details':
            return await this.getTweetDetails(args.tweet_id);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async initializeTwitterClient() {
    const requiredEnvVars = [
      'TWITTER_API_KEY',
      'TWITTER_API_SECRET', 
      'TWITTER_ACCESS_TOKEN',
      'TWITTER_ACCESS_TOKEN_SECRET'
    ];

    // Check for required environment variables
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    }

    console.error('🐦 Initializing Twitter API client...');

    try {
      // Initialize with OAuth 1.0a User Context
      this.twitterClient = new TwitterApi({
        appKey: process.env.TWITTER_API_KEY,
        appSecret: process.env.TWITTER_API_SECRET,
        accessToken: process.env.TWITTER_ACCESS_TOKEN,
        accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
      });

      // Test the connection
      const me = await this.twitterClient.currentUser();
      console.error(`✅ Successfully connected to Twitter API as @${me.screen_name}`);

    } catch (error) {
      console.error('❌ Failed to initialize Twitter API:', error.message);
      
      // Fallback to Bearer Token if available
      if (process.env.TWITTER_BEARER_TOKEN) {
        console.error('🔄 Falling back to Bearer Token authentication...');
        this.twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
        console.error('✅ Using Bearer Token authentication');
      } else {
        throw new Error('Twitter API authentication failed and no Bearer Token available');
      }
    }
  }

  async searchTweets(query, maxResults = 10) {
    console.error(`🔍 Searching tweets: "${query}"`);
    
    const tweets = await this.twitterClient.v2.search(query, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'context_annotations'],
      'user.fields': ['username', 'name', 'verified'],
      expansions: ['author_id'],
    });

    const results = tweets.data?.data || [];
    const users = tweets.data?.includes?.users || [];

    const formattedTweets = results.map(tweet => {
      const author = users.find(user => user.id === tweet.author_id);
      return {
        id: tweet.id,
        text: tweet.text,
        author: author ? `@${author.username} (${author.name})` : 'Unknown',
        created_at: tweet.created_at,
        metrics: tweet.public_metrics,
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${formattedTweets.length} tweets for "${query}":\n\n` +
            formattedTweets.map((tweet, i) => 
              `${i + 1}. ${tweet.author}\n` +
              `   "${tweet.text}"\n` +
              `   ${tweet.created_at} | ❤️ ${tweet.metrics?.like_count || 0} | 🔄 ${tweet.metrics?.retweet_count || 0}\n`
            ).join('\n'),
        },
      ],
    };
  }

  async getUserTweets(username, maxResults = 10) {
    console.error(`👤 Getting tweets from @${username}`);
    
    // Get user by username
    const user = await this.twitterClient.v2.userByUsername(username);
    if (!user.data) {
      throw new Error(`User @${username} not found`);
    }

    // Get user's tweets
    const tweets = await this.twitterClient.v2.userTimeline(user.data.id, {
      max_results: Math.min(maxResults, 100),
      'tweet.fields': ['created_at', 'public_metrics'],
    });

    const results = tweets.data?.data || [];

    return {
      content: [
        {
          type: 'text',
          text: `Latest ${results.length} tweets from @${username}:\n\n` +
            results.map((tweet, i) => 
              `${i + 1}. "${tweet.text}"\n` +
              `   ${tweet.created_at} | ❤️ ${tweet.public_metrics?.like_count || 0} | 🔄 ${tweet.public_metrics?.retweet_count || 0}\n`
            ).join('\n'),
        },
      ],
    };
  }

  async getTrendingTopics() {
    console.error('📈 Getting trending topics...');
    
    // Since Twitter API v2 doesn't have trends endpoint in free tier,
    // we'll search for popular recent tweets with high engagement
    const trendingQueries = [
      'trending',
      'viral',
      'breaking news',
      'AI',
      'crypto',
      'tech',
    ];

    const trends = [];
    
    for (const query of trendingQueries.slice(0, 3)) {
      try {
        const tweets = await this.twitterClient.v2.search(query, {
          max_results: 5,
          'tweet.fields': ['public_metrics', 'context_annotations'],
          sort_order: 'relevancy',
        });

        if (tweets.data?.data) {
          const topTweet = tweets.data.data[0];
          if (topTweet.public_metrics?.like_count > 100) {
            trends.push({
              topic: query,
              sample_tweet: topTweet.text.substring(0, 100) + '...',
              engagement: topTweet.public_metrics.like_count,
            });
          }
        }
      } catch (error) {
        console.error(`Error getting trends for ${query}:`, error.message);
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: `Current trending topics:\n\n` +
            trends.map((trend, i) => 
              `${i + 1}. ${trend.topic.toUpperCase()}\n` +
              `   Sample: "${trend.sample_tweet}"\n` +
              `   Engagement: ${trend.engagement} likes\n`
            ).join('\n') +
            (trends.length === 0 ? 'No trending topics found at the moment.' : ''),
        },
      ],
    };
  }

  async getTweetDetails(tweetId) {
    console.error(`📋 Getting details for tweet ${tweetId}`);
    
    const tweet = await this.twitterClient.v2.singleTweet(tweetId, {
      'tweet.fields': ['author_id', 'created_at', 'public_metrics', 'context_annotations', 'conversation_id'],
      'user.fields': ['username', 'name', 'verified', 'public_metrics'],
      expansions: ['author_id'],
    });

    if (!tweet.data) {
      throw new Error(`Tweet ${tweetId} not found`);
    }

    const tweetData = tweet.data.data;
    const author = tweet.data.includes?.users?.[0];

    return {
      content: [
        {
          type: 'text',
          text: `Tweet Details:\n\n` +
            `Author: ${author ? `@${author.username} (${author.name})` : 'Unknown'}\n` +
            `Text: "${tweetData.text}"\n` +
            `Created: ${tweetData.created_at}\n` +
            `Metrics: ❤️ ${tweetData.public_metrics?.like_count || 0} | ` +
            `🔄 ${tweetData.public_metrics?.retweet_count || 0} | ` +
            `💬 ${tweetData.public_metrics?.reply_count || 0} | ` +
            `👀 ${tweetData.public_metrics?.impression_count || 0}\n` +
            `ID: ${tweetData.id}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🐦 Rusty Twitter API MCP Server running!');
  }
}

// Start the server
const server = new TwitterMCPServer();
server.run().catch(console.error);