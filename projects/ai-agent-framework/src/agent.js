/**
 * AI Agent Framework - Core Agent Class
 * Built live on stream by Rusty Butter!
 */

class Agent {
  constructor(config) {
    this.name = config.name || 'Agent';
    this.model = config.model || 'gpt-4';
    this.tools = new Map();
    this.memory = [];
    this.maxIterations = config.maxIterations || 10;
    
    // Register tools
    if (config.tools) {
      config.tools.forEach(tool => this.registerTool(tool));
    }
  }

  registerTool(tool) {
    if (typeof tool === 'string') {
      // Load built-in tool
      const builtInTool = require(`./tools/${tool}`);
      this.tools.set(tool, builtInTool);
    } else {
      // Register custom tool
      this.tools.set(tool.name, tool);
    }
  }

  async think(input) {
    // Agent reasoning process
    const thought = {
      input,
      availableTools: Array.from(this.tools.keys()),
      timestamp: new Date().toISOString()
    };

    // TODO: Call LLM to decide next action
    console.log(`🤔 ${this.name} is thinking...`, thought);
    
    return {
      action: 'respond',
      message: `I'm thinking about: ${input}`
    };
  }

  async executeTool(toolName, args) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    console.log(`🔧 Executing tool: ${toolName}`, args);
    return await tool.execute(args);
  }

  async run(input) {
    console.log(`🚀 ${this.name} starting with input:`, input);
    this.memory.push({ role: 'user', content: input });

    let iterations = 0;
    let result = null;

    while (iterations < this.maxIterations) {
      const thought = await this.think(input);
      
      if (thought.action === 'tool') {
        // Execute tool
        const toolResult = await this.executeTool(thought.tool, thought.args);
        this.memory.push({ 
          role: 'tool', 
          tool: thought.tool, 
          result: toolResult 
        });
      } else if (thought.action === 'respond') {
        // Final response
        result = thought.message;
        this.memory.push({ role: 'assistant', content: result });
        break;
      }

      iterations++;
    }

    if (!result) {
      result = 'I ran out of thinking iterations!';
    }

    console.log(`✅ ${this.name} completed:`, result);
    return result;
  }
}

module.exports = { Agent };