# VSCode MCP - Remote Control for Visual Studio Code

🔥 **LIVE CODING AUTOMATION BEAST** 🔥

An MCP (Model Context Protocol) server that gives you FULL control over Visual Studio Code through websockets. Built for live streaming, autonomy, and maximum coding chaos!

## 🚀 Features

- **File Operations**: Open, create, and save files
- **Text Manipulation**: Insert text at cursor position  
- **Command Execution**: Run any VSCode command
- **Terminal Control**: Open new terminals
- **UI Control**: Toggle sidebar, focus editor
- **Real-time Control**: WebSocket connection for instant responses

## 📋 Prerequisites

1. **VSCode Remote Control Extension**: 
   - Install from: https://github.com/estruyf/vscode-remote-control
   - Or search "Remote Control" in VSCode extensions
   - Extension auto-opens websocket on port 3710

2. **Node.js 18+** for running the MCP server

## ⚡ Installation

```bash
# Install dependencies
npm install

# Build the project  
npm run build

# Start the MCP server
npm start
```

## 🛠 Available Tools

### File Operations
- `open_file` - Open any file in VSCode
- `create_file` - Create new files with optional content
- `save_file` - Save the currently active file

### Text & Editing  
- `insert_text` - Type text at cursor position (LIVE TYPING!)
- `run_command` - Execute any VSCode command with arguments

### UI & Navigation
- `new_terminal` - Open fresh terminal window
- `toggle_sidebar` - Show/hide the sidebar
- `focus_editor` - Focus on the editor pane

## 🎮 Usage Examples

```javascript
// Open a file
{
  "tool": "open_file",
  "arguments": {
    "filePath": "/path/to/your/file.js"
  }
}

// Live typing for streaming!
{
  "tool": "insert_text", 
  "arguments": {
    "text": "console.log('LIVE CODING CHAOS!');"
  }
}

// Execute any VSCode command
{
  "tool": "run_command",
  "arguments": {
    "command": "workbench.action.quickOpen"
  }
}
```

## 🔌 Integration

Perfect for:
- **AI Assistants**: Let Claude control VSCode directly
- **Live Streaming**: Real-time coding with audience interaction
- **Automation**: Script repetitive VSCode tasks
- **Remote Control**: Control VSCode from other applications

## ⚙ Configuration

The server connects to VSCode Remote Control extension on:
- **Host**: localhost 
- **Port**: 3710 (default)

Modify the `VSCodeController` class to change connection settings.

## 🚨 Troubleshooting

1. **Connection Failed**: Make sure VSCode Remote Control extension is installed and running
2. **Commands Not Working**: Verify the command name - use VSCode Command Palette (Ctrl+Shift+P) to find exact names
3. **Port Issues**: Check if port 3710 is available or change in extension settings

## 🎯 Live Streaming Features

This MCP server is PERFECT for live coding streams:
- Viewers can watch real-time typing
- AI can respond to chat and code live
- Seamless automation during broadcasts
- Maximum engagement through direct code manipulation

## 🔧 Development

```bash
# Watch mode for development
npm run dev

# Run tests
npm test
```

## 🤝 Contributing

Built for the Rusty Butter streaming community! Pull requests welcome for:
- New VSCode commands
- Enhanced websocket handling  
- Live streaming optimizations
- Chaos-level improvements

## 📄 License

MIT - Code like demons, stream like legends! 🔥