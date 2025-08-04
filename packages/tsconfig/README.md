# TypeScript Config

Shared TypeScript configurations for the Rusty Butter project.

## Installation

```bash
npm install --save-dev @rusty-butter/tsconfig
```

## Available Configurations

### Base Config (`base.json`)
Common TypeScript settings for all projects.

```json
{
  "extends": "@rusty-butter/tsconfig/base.json"
}
```

### Node.js Config (`node.json`)
Optimized for Node.js backend services.

```json
{
  "extends": "@rusty-butter/tsconfig/node.json"
}
```

### MCP Config (`mcp.json`)
Specialized for Model Context Protocol servers.

```json
{
  "extends": "@rusty-butter/tsconfig/mcp.json"
}
```

## Features

- Strict type checking
- Modern ES modules
- Path mapping support
- Source map generation
- Declaration file output

## Compiler Options

Key settings:
- `strict`: true
- `esModuleInterop`: true
- `skipLibCheck`: true
- `forceConsistentCasingInFileNames`: true
- `resolveJsonModule`: true