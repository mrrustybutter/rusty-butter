# Chat Reactions

Real-time chat reaction system with sound effects and visual feedback.

## Features

- Twitch chat integration
- Sound effect triggers
- Visual overlays for OBS
- Customizable reaction mappings
- Volume control and mixing

## Installation

```bash
npm install @rusty-butter/chat-reactions
```

## Usage

```javascript
const { ReactionSystem } = require('./reaction-system');
const { SoundManager } = require('./sound-manager');

const reactions = new ReactionSystem({
  soundManager: new SoundManager(),
  twitchChannel: 'mrrustybutter'
});

// Start listening for reactions
reactions.start();
```

## Reaction Types

- **Emote Reactions**: Trigger sounds based on Twitch emotes
- **Keyword Reactions**: React to specific words or phrases
- **Bit Reactions**: Special effects for bit donations
- **Sub Reactions**: Celebrate new subscribers

## Configuration

Edit `reaction-system.js` to customize:
- Reaction triggers
- Sound file mappings
- Volume levels
- Cooldown periods

## OBS Integration

1. Add browser source
2. Point to reaction overlay URL
3. Set dimensions to match your stream
4. Enable transparency