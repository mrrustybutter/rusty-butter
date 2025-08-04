# Stream Dashboard

Real-time streaming dashboard with WebSocket server for live stats and controls.

## Features

- **Live Statistics**: Viewer count, chat activity, system stats
- **Stream Controls**: Start/stop stream, scene switching
- **Chat Integration**: Combined chat from multiple platforms
- **OBS Browser Source**: Overlay-ready dashboard
- **WebSocket Server**: Real-time data updates

## Installation

```bash
npm install
npm start
```

## Deployment

### Local Development
```bash
npm run dev
```

### Production Deployment

#### Vercel
```bash
npm run deploy:vercel
```

#### Railway
```bash
npm run deploy:railway
```

#### Docker
```bash
docker build -t stream-dashboard .
docker run -p 3000:3000 stream-dashboard
```

## Components

### Dashboard (`dashboard.html`)
- Main control interface
- Real-time statistics
- Stream management controls

### OBS Browser Source (`obs-browser-source.html`)
- Transparent overlay for stream
- Live stats display
- Alert notifications

### WebSocket Server (`websocket-server.js`)
- Real-time data broadcasting
- Multi-client support
- Event handling

## Configuration

Environment variables:
- `PORT`: Server port (default: 3000)
- `TWITCH_CHANNEL`: Your Twitch channel name
- `DISCORD_WEBHOOK`: Discord notification webhook
- `OBS_WEBSOCKET`: OBS WebSocket address

## OBS Setup

1. Add Browser Source
2. URL: `http://localhost:3000/obs-browser-source.html`
3. Width: 1920, Height: 1080
4. Enable "Shutdown source when not visible"
5. Enable "Refresh browser when scene becomes active"

## API Endpoints

- `GET /` - Main dashboard
- `GET /obs-browser-source.html` - OBS overlay
- `WS /ws` - WebSocket connection for real-time updates

## WebSocket Events

- `stats.update` - Stream statistics update
- `chat.message` - New chat message
- `alert.show` - Display alert
- `scene.change` - OBS scene changed