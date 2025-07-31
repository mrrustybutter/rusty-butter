# Rusty Butter Monorepo

A comprehensive development ecosystem built around Claude Code with semantic memory, live streaming integration, and AI-powered tools.

## 🎯 Core Features

- **🧠 Semantic Memory System** - Perfect recall for conversations and chat history using vector embeddings
- **📺 Live Streaming Integration** - Twitch chat embedding, OBS control, avatar expressions
- **🎵 AI Audio Generation** - ElevenLabs streaming with real-time voice synthesis
- **🤖 Claude Code Enhancement** - Context preservation, automatic conversation embedding
- **🔧 MCP Server Ecosystem** - Multiple Model Context Protocol servers for various integrations

## 📦 Packages

### AI & Memory Systems

- `packages/semantic-memory` - Vector-based semantic memory with Mastra integration
  - `packages/client` - Semantic memory client library
  - `packages/mcp-server` - MCP server for semantic search and recall
- `packages/openai-complete-mcp` - OpenAI integration for Claude Code
- `packages/twitch-embedder` - Real-time Twitch chat embedding service

### Streaming & Content

- `packages/elevenlabs-streaming` - ElevenLabs audio streaming
  - `packages/client` - WebSocket client with buffered playback
  - `packages/mcp-server` - MCP server with streaming support
- `packages/rustybutter-avatar` - Avatar expression controller for OBS
- `packages/pump-chat` - Pump.fun chat integration
  - `packages/client` - WebSocket client for chat rooms
  - `packages/mcp-server` - MCP server for pump.fun

### Development Tools

- `packages/ABIDE` - Automated Browser IDE
  - `packages/app` - Frontend application  
  - `packages/server` - WebSocket server
  - `packages/mcp-server` - MCP integration

### Configuration

- `packages/eslint-config` - Shared ESLint configuration
- `packages/prettier-config` - Shared Prettier configuration
- `packages/tsconfig` - Shared TypeScript configuration

## Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- OpenAI API key
- ElevenLabs API key (optional)

## Quick Start

### 1. Installation

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm run build
```

### 2. Environment Configuration

Configure your API keys in the `.env` file:

```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your API keys:
OPENAI_API_KEY=your-actual-openai-key
ELEVENLABS_API_KEY=your-actual-elevenlabs-key

# All other variables are pre-configured with sensible defaults
```

### 3. Launch Claude Code

```bash
# Launch Claude Code with all environment variables loaded
pnpm claude

# OR manually source environment and run claude
source scripts/load-env.sh
claude
```

This automatically:
- ✅ Loads all environment variables from `.env`
- ✅ Starts Claude Code with full MCP server configuration
- ✅ Enables semantic memory, Twitch integration, avatar control, and more

## Workspace Commands

Run commands in specific workspaces:

```bash
# Run command in specific package
pnpm --filter <package-name> <command>

# Examples:
pnpm --filter @elevenlabs-streaming/client build
pnpm --filter @pump-chat/mcp-server dev
pnpm --filter @abide/app dev
```

## Publishing

Individual packages can be published to npm:

```bash
# Publish a specific package
pnpm --filter <package-name> publish
```

## Package Dependencies

Packages within the monorepo reference each other using the `workspace:*` protocol:

- Within `elevenlabs-streaming`:
  - `@elevenlabs-streaming/mcp-server` depends on `@elevenlabs-streaming/client`
- Within `pump-chat`:
  - `@pump-chat/mcp-server` depends on `@pump-chat/client`

These dependencies are automatically linked by pnpm during installation.

## 🔧 Environment Variable Management

All MCP servers use environment variables for configuration. The project supports centralized `.env` file management.

### Available Variables

```bash
# Twitch Configuration
TWITCH_USERNAME=rustybutterbot
TWITCH_OAUTH_TOKEN=oauth:your-twitch-token
TWITCH_CHANNEL=codingbutter

# OpenAI Configuration  
OPENAI_API_KEY=your-openai-api-key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your-elevenlabs-api-key
ELEVENLABS_VOICE_ID=Au8OOcCmvsCaQpmULvvQ
ELEVENLABS_MODEL_ID=eleven_flash_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_64
ELEVENLABS_STABILITY=0.5
ELEVENLABS_SIMILARITY_BOOST=0.75
ELEVENLABS_STYLE=0.1

# Avatar & Streaming
AVATAR_SERVER_HOST=localhost
AVATAR_SERVER_PORT=3000
OBS_WEBSOCKET_URL=ws://172.25.208.1:4455

# Paths & Configuration
PROJECT_ROOT=/home/codingbutter/GitHub/rusty-butter
SEMANTIC_MEMORY_DB_PATH=${PROJECT_ROOT}/semantic_memory_db
CHAT_EMBEDDER_INTERVAL=30000
```

### Commands

- `pnpm claude` - Launch Claude Code with environment loaded
- `pnpm claude:show-env` - Display all project environment variables

## 🧠 Semantic Memory System

The project includes a powerful semantic memory system that provides "perfect recall" for conversations and chat history:

### Features

- **Vector Embeddings**: Uses OpenAI's text-embedding-3-small for semantic similarity
- **Mastra Integration**: Built on Mastra's LibSQL vector database for performance
- **Real-time Embedding**: Twitch chat messages are automatically embedded as they arrive
- **Context Preservation**: Claude Code conversations are preserved before context compaction
- **Semantic Search**: Search by meaning, not just keywords

### Usage

```bash
# Search semantic memory
mcp__semantic-memory__semantic_search "query about embeddings"

# Recall with context
mcp__semantic-memory__recall "chat-history" "cookie talking about mastra"

# Get memory statistics
mcp__semantic-memory__get_stats
```

## 🎬 Streaming Integration

### Twitch Chat Embedding

Real-time service that embeds Twitch chat messages into semantic memory:

```bash
# Check service status
systemctl --user status twitch-embedder

# View logs
journalctl --user -u twitch-embedder -f
```

### Avatar Control

Control OBS avatar expressions via MCP:

```bash
# Set avatar expression
mcp__rustybutter-avatar__setAvatarExpression "excited"

# List available expressions  
mcp__rustybutter-avatar__listAvatarExpressions
```

## 🔐 Security

- Never commit real API keys to version control
- Use `.env.example` as a template with placeholder values
- Real API keys stay in your local `.env` file
- Environment variables are only loaded when using `pnpm claude`
