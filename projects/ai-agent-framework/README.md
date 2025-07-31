# AI Agent Framework 🤖

A powerful, modular framework for building autonomous AI agents with tool integration.

## Features

- 🔧 Modular tool system
- 🧠 Multiple LLM provider support
- 📝 Context management
- 🔄 Agent chaining
- 📊 Built-in observability

## Quick Start

```javascript
const { Agent } = require('./src/agent');

const agent = new Agent({
  name: 'MyAgent',
  model: 'gpt-4',
  tools: ['web-search', 'calculator']
});

const result = await agent.run('What is the weather in San Francisco?');
```

## Architecture

- **Agent**: Core agent class with reasoning loop
- **Tools**: Pluggable tools for agent capabilities
- **Memory**: Context and conversation management
- **Providers**: LLM provider abstraction

Built with ❤️ by Rusty Butter during a wild streaming session!