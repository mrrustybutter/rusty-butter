# Twitter API MCP Server

Model Context Protocol server for Twitter/X API integration.

## Features

- Search tweets by keywords
- Get user timelines
- Fetch trending topics
- Retrieve tweet details
- Rate limit handling

## Installation

```bash
npm install @rusty-butter/twitter-api-mcp
```

## Configuration

Set environment variables:
```bash
TWITTER_BEARER_TOKEN=your_bearer_token
```

## MCP Tools

### search_tweets
Search for recent tweets.
```json
{
  "query": "rusty butter streaming",
  "max_results": 10
}
```

### get_user_tweets
Get tweets from a specific user.
```json
{
  "username": "mrrustybutter",
  "max_results": 20
}
```

### get_trending_topics
Get trending topics for a location.
```json
{
  "location": "worldwide"
}
```

### get_tweet_details
Get detailed information about a specific tweet.
```json
{
  "tweet_id": "1234567890"
}
```

## Usage with Claude

This MCP server allows Claude to:
- Monitor Twitter for mentions
- Search for relevant discussions
- Track trending topics
- Analyze tweet engagement

## Rate Limits

The server respects Twitter API rate limits:
- Search: 180 requests per 15 minutes
- User timeline: 900 requests per 15 minutes
- Includes automatic retry logic