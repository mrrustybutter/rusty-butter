/**
 * File Writer Tool for AI Agents
 * Writes content to files
 */

const fs = require('fs').promises;
const path = require('path');

module.exports = {
  name: 'file-writer',
  description: 'Write content to a file',
  
  async execute(args) {
    try {
      const { filePath, content } = args;
      
      if (!filePath || !content) {
        throw new Error('Both filePath and content are required');
      }

      console.log(`📝 Writing to file: ${filePath}`);
      
      // Ensure directory exists
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // Write the file
      await fs.writeFile(filePath, content, 'utf8');
      
      return {
        success: true,
        filePath,
        bytesWritten: Buffer.byteLength(content, 'utf8'),
        message: `Successfully wrote to ${filePath}`
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        filePath: args.filePath
      };
    }
  },

  schema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path where the file should be written'
      },
      content: {
        type: 'string',
        description: 'Content to write to the file'
      }
    },
    required: ['filePath', 'content']
  }
};