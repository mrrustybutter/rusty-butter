# Twitch Embedder Service

A standalone service that continuously embeds Twitch chat messages into the semantic memory system.

## Features

- Runs independently as a system service
- Automatically restarts on failure
- Tracks last processed message to avoid duplicates
- Batch embeds messages for efficiency
- Configurable check interval

## Installation

```bash
npm install
npm run build
```

## Configuration

1. Copy `.env.example` to `.env` and fill in your credentials
2. Or set environment variables in your system

## Running as a Service

### Using systemd (Linux)

1. Create a service file:

```bash
sudo nano /etc/systemd/system/twitch-embedder.service
```

2. Add the following content:

```ini
[Unit]
Description=Twitch Chat Embedder Service
After=network.target

[Service]
Type=simple
User=codingbutter
WorkingDirectory=/home/codingbutter/GitHub/rusty-butter/packages/twitch-embedder
ExecStart=/usr/bin/node /home/codingbutter/GitHub/rusty-butter/packages/twitch-embedder/dist/index.js
Restart=always
RestartSec=10

# Environment variables
Environment="NODE_ENV=production"
Environment="OPENAI_API_KEY=your-key"
Environment="TWITCH_USERNAME=rustybutterbot"
Environment="TWITCH_OAUTH_TOKEN=oauth:your-token"
Environment="TWITCH_CHANNEL=codingbutter"

[Install]
WantedBy=multi-user.target
```

3. Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable twitch-embedder
sudo systemctl start twitch-embedder
```

4. Check status:

```bash
sudo systemctl status twitch-embedder
sudo journalctl -u twitch-embedder -f
```

### Using PM2 (Cross-platform)

```bash
# Install PM2 globally
npm install -g pm2

# Start the service
pm2 start dist/index.js --name twitch-embedder

# Save PM2 configuration
pm2 save

# Set PM2 to start on boot
pm2 startup
```

## Development

```bash
# Run in development mode
npm run dev

# Run with auto-restart on changes
npm run dev:watch
```

## Architecture

This service:
1. Connects to the Twitch MCP server to get chat messages
2. Connects to the Semantic Memory MCP server to embed messages
3. Maintains state in `last_processed.json`
4. Runs continuously with configurable interval

## Monitoring

The service logs to stdout/stderr which can be captured by systemd or PM2.

Key log messages:
- `[TwitchEmbedder] Connected to Twitch MCP server`
- `[TwitchEmbedder] Found X new messages to embed`
- `[TwitchEmbedder] Successfully embedded X messages`