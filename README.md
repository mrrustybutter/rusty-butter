# Rusty Butter Monorepo

This monorepo contains all Rusty Butter packages using pnpm workspaces.

## Packages

- `packages/elevenlabs-client-test` - Test client for ElevenLabs streaming
- `packages/elevenlabs-streaming-client` - ElevenLabs streaming client with buffered audio playback
- `packages/elevenlabs-streaming-mcp-server` - MCP server for ElevenLabs with streaming support
- `packages/pump-chat-client` - WebSocket client for pump.fun chat rooms
- `packages/pump-fun-chat-mcp` - MCP server for pump.fun chat integration
- `packages/rustybutter-avatar` - Avatar expression controller for OBS with MCP integration
- `packages/x-mcp` - Python-based MCP server for X (Twitter) integration

## Prerequisites

- Node.js >= 16.0.0
- pnpm >= 8.0.0

## Getting Started

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm run build

# Run development mode for all packages
pnpm run dev

# Clean all build artifacts and node_modules
pnpm run clean
```

## Workspace Commands

Run commands in specific workspaces:

```bash
# Run command in specific package
pnpm --filter <package-name> <command>

# Examples:
pnpm --filter elevenlabs-streaming-client build
pnpm --filter pump-fun-chat-mcp dev
```

## Publishing

Individual packages can be published to npm:

```bash
# Publish a specific package
pnpm --filter <package-name> publish
```

## Package Dependencies

Packages within the monorepo reference each other using the `workspace:*` protocol:

- `elevenlabs-client-test` depends on `elevenlabs-streaming-client`
- `elevenlabs-streaming-mcp-server` depends on `elevenlabs-streaming-client`
- `pump-fun-chat-mcp` depends on `pump-chat-client`

These dependencies are automatically linked by pnpm during installation.
