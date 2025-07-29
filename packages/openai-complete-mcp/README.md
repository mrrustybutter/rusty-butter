# OpenAI Complete MCP Server

A comprehensive Model Context Protocol (MCP) server that provides full access to OpenAI's chat, vision, and image generation capabilities in one unified interface.

## Features

- **Chat Completion**: Interact with GPT-4 and other OpenAI models
- **Image Generation**: Create images using DALL-E 3
- **Vision Analysis**: Analyze images using GPT-4 Vision
- **Image Editing**: Edit and modify images using DALL-E 2
- **Combined Functionality**: Chat about images with vision-enabled models

## Installation

```bash
npm install openai-complete-mcp
```

## Configuration

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "openai-complete": {
      "command": "openai-complete-mcp",
      "env": {
        "OPENAI_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### 1. `chat`

Chat with OpenAI GPT models.

**Parameters:**

- `messages`: Array of chat messages with role and content
- `model` (optional): Model to use (default: gpt-4o)
- `temperature` (optional): Temperature for randomness (0-2)
- `maxTokens` (optional): Maximum tokens in response

### 2. `generate_image`

Generate images using DALL-E.

**Parameters:**

- `prompt`: Text prompt for image generation
- `size` (optional): Image size (1024x1024, 1792x1024, 1024x1792)
- `quality` (optional): Image quality (standard, hd)
- `style` (optional): Image style (vivid, natural)
- `outputPath` (optional): Path to save the generated image

### 3. `analyze_image`

Analyze images using GPT-4 Vision.

**Parameters:**

- `imagePath`: Path to image file or URL
- `prompt`: What to analyze or ask about the image
- `detail` (optional): Level of detail (low, high, auto)

### 4. `edit_image`

Edit images using DALL-E 2.

**Parameters:**

- `imagePath`: Path to original image
- `prompt`: Description of edits to make
- `maskPath` (optional): Optional mask image path
- `outputPath` (optional): Path to save edited image

### 5. `chat_with_image`

Chat about an image using GPT-4 Vision.

**Parameters:**

- `prompt`: Question or prompt about the image
- `imagePath`: Path to image file or URL
- `model` (optional): Model to use (default: gpt-4o)

## Usage Examples

### Chat Example

```javascript
{
  "tool": "chat",
  "arguments": {
    "messages": [
      { "role": "system", "content": "You are a helpful assistant." },
      { "role": "user", "content": "Hello! How are you?" }
    ]
  }
}
```

### Image Generation Example

```javascript
{
  "tool": "generate_image",
  "arguments": {
    "prompt": "A futuristic robot coding on multiple screens",
    "size": "1024x1024",
    "quality": "hd",
    "outputPath": "/path/to/save/image.png"
  }
}
```

### Vision Analysis Example

```javascript
{
  "tool": "analyze_image",
  "arguments": {
    "imagePath": "/path/to/image.png",
    "prompt": "What objects do you see in this image?",
    "detail": "high"
  }
}
```

## Development

Built with TypeScript and the MCP SDK. Uses the official OpenAI Node.js client library.

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development
npm run dev
```

## License

MIT

## Author

Created by Rusty Butter with pure caffeinated chaos! 🤖☕
