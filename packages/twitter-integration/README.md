# Twitter Integration

Automated Twitter/X posting system for stream notifications and updates.

## Features

- Automatic stream online/offline tweets
- Scheduled promotional posts
- Clip sharing integration
- Engagement tracking

## Installation

```bash
npm install @rusty-butter/twitter-integration
```

## Configuration

Required environment variables:
```bash
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_TOKEN_SECRET=your_token_secret
```

## Usage

```javascript
const { AutoTweeter } = require('./auto-tweeter');

const tweeter = new AutoTweeter({
  streamUrl: 'https://twitch.tv/mrrustybutter',
  hashtagSet: ['RustyButter', 'LiveNow', 'TwitchStreamer']
});

// Auto-tweet when going live
tweeter.onStreamStart(() => {
  tweeter.tweetLive({
    message: "🔴 WE'RE LIVE! Join the chaos!",
    includeLink: true
  });
});
```

## Tweet Templates

- **Going Live**: Customizable live notification
- **Stream Ended**: Thank you message with stats
- **Clip Share**: Auto-post popular clips
- **Schedule Posts**: Pre-written promotional content

## Features

- Rate limit compliance
- Media upload support
- Thread creation
- Reply monitoring
- Analytics tracking