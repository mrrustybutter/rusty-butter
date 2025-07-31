/**
 * Calculator Tool for AI Agents
 * Performs basic mathematical operations
 */

const math = require('mathjs');

module.exports = {
  name: 'calculator',
  description: 'Performs mathematical calculations',
  
  async execute(args) {
    try {
      const { expression } = args;
      
      if (!expression) {
        throw new Error('No expression provided');
      }

      console.log(`🧮 Calculating: ${expression}`);
      
      // Use mathjs for safe evaluation
      const result = math.evaluate(expression);
      
      return {
        success: true,
        result,
        expression,
        formatted: `${expression} = ${result}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        expression: args.expression
      };
    }
  },

  // Schema for LLM to understand how to use this tool
  schema: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate (e.g., "2 + 2", "sqrt(16)", "sin(pi/2)")'
      }
    },
    required: ['expression']
  }
};