/**
 * Code Executor Tool for AI Agents
 * Safely executes JavaScript code snippets
 */

const vm = require('vm');

module.exports = {
  name: 'code-executor',
  description: 'Execute JavaScript code safely in a sandboxed environment',
  
  async execute(args) {
    try {
      const { code, timeout = 5000 } = args;
      
      if (!code) {
        throw new Error('No code provided to execute');
      }

      console.log(`💻 Executing code (${code.length} chars)...`);
      
      // Create a sandboxed context
      const sandbox = {
        console: {
          log: (...args) => console.log('  [sandbox]:', ...args)
        },
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean
      };

      // Execute the code
      const script = new vm.Script(code);
      const context = vm.createContext(sandbox);
      
      let result;
      try {
        result = script.runInContext(context, { timeout });
      } catch (execError) {
        throw new Error(`Execution error: ${execError.message}`);
      }
      
      return {
        success: true,
        result,
        executionTime: new Date().toISOString(),
        code: code.substring(0, 100) + (code.length > 100 ? '...' : '')
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: args.code?.substring(0, 100)
      };
    }
  },

  schema: {
    type: 'object',
    properties: {
      code: {
        type: 'string',
        description: 'JavaScript code to execute'
      },
      timeout: {
        type: 'number',
        description: 'Maximum execution time in milliseconds (default: 5000)'
      }
    },
    required: ['code']
  }
};