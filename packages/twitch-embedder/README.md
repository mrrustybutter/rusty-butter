# Twitch Embedder

Automatic Twitch clip and VOD embedding system for social media.

## Features

- Monitor Twitch for new clips
- Auto-generate embed codes
- Cross-platform sharing
- Clip metadata extraction
- View count tracking

## Installation

```bash
npm install @rusty-butter/twitch-embedder
```

## Usage

```javascript
const { TwitchEmbedder } = require('@rusty-butter/twitch-embedder');

const embedder = new TwitchEmbedder({
  channelName: 'mrrustybutter',
  checkInterval: 60000 // Check every minute
});

embedder.on('newClip', (clip) => {
  console.log('New clip:', clip.title);
  const embedCode = embedder.generateEmbed(clip);
  // Share to social media
});

embedder.start();
```

## Configuration

- `channelName`: Twitch channel to monitor
- `checkInterval`: How often to check for new content
- `minViewCount`: Minimum views for auto-sharing
- `platforms`: Target platforms for embedding

## Embed Types

- **Clips**: Short highlights
- **VODs**: Full stream recordings  
- **Live**: Current stream embed

## Storage

Tracks processed content in `last_processed.json` to avoid duplicates.