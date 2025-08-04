# Chat Commands

Interactive chat command system for Twitch and Discord integration.

## Features

- Custom command registration
- Permission-based command execution
- Cooldown management
- Command aliases
- Dynamic response templates

## Installation

```bash
npm install @rusty-butter/chat-commands
```

## Usage

```javascript
const { CommandSystem } = require('@rusty-butter/chat-commands');

const commands = new CommandSystem({
  prefix: '!',
  cooldownTime: 5000
});

// Register a command
commands.register('hello', {
  description: 'Greet the user',
  handler: (user, args) => `Hello ${user}!`,
  permissions: ['viewer']
});
```

## Commands

- `!help` - List all available commands
- `!uptime` - Show stream uptime
- `!socials` - Display social media links
- `!discord` - Get Discord invite link
- Custom commands can be added dynamically

## Configuration

Commands are configured through `command-system.js` with support for:
- Command prefixes
- Permission levels
- Response templates
- Cooldown settings