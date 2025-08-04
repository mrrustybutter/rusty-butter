# Stream Automation

Automated streaming tools for OBS scene management and integration hub.

## Features

- **OBS Scene Manager**: Automatic scene switching based on events
- **Integration Hub**: Connect multiple streaming services
- **Event-driven automation**: React to chat, alerts, and more
- **Schedule support**: Time-based scene changes

## Components

### OBS Scene Manager (`obs-scene-manager.js`)
- WebSocket connection to OBS
- Scene transition automation
- Source visibility control
- Audio mixer management

### Integration Hub (`integration-hub.js`)
- Centralized event processing
- Service coordination
- State synchronization
- Plugin architecture

## Installation

```bash
npm install @rusty-butter/stream-automation
```

## Usage

```javascript
const { OBSSceneManager } = require('./obs-scene-manager');
const { IntegrationHub } = require('./integration-hub');

// Initialize OBS connection
const obsManager = new OBSSceneManager({
  address: 'localhost:4444',
  password: 'your-obs-password'
});

// Set up integration hub
const hub = new IntegrationHub({
  services: ['twitch', 'discord', 'obs'],
  obsManager
});

hub.start();
```

## Scene Automation Rules

```javascript
// Example: Switch to "BRB" scene when AFK
hub.addRule({
  trigger: 'user.afk',
  action: 'scene.switch',
  target: 'BRB Scene',
  delay: 300000 // 5 minutes
});

// Example: Show alert on new follower
hub.addRule({
  trigger: 'twitch.follower',
  action: 'source.show',
  target: 'Follower Alert',
  duration: 5000
});
```

## Configuration

- OBS WebSocket settings in environment variables
- Scene mappings in `scenes.json`
- Automation rules in `rules.json`

## Requirements

- OBS Studio with obs-websocket plugin
- Node.js 16+
- Active streaming services