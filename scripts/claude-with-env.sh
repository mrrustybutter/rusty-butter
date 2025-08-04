#!/bin/bash
# Wrapper script to launch Claude Code with environment variables from .env file
# Usage: ./scripts/claude-with-env.sh [claude arguments...]
# Now includes auto-restart loop to handle crashes and continue seamlessly
# Includes cleanup of MCP processes on exit to prevent orphaned processes

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env file
source "$SCRIPT_DIR/load-env.sh"

# Change to project directory
cd "$PROJECT_ROOT"

# Cleanup function to kill MCP processes and any orphaned processes
cleanup_mcp_processes() {
    echo "🧹 Cleaning up MCP processes and orphaned processes..."
    
    # Kill processes by command patterns from .mcp.json
    local mcp_patterns=(
        "twitch-irc-mcp"
        "obs-mcp"
        "playwright-mcp-server"
        "@mastra/mcp-docs-server" 
        "pump-fun-chat-mcp"
        "packages/elevenlabs-streaming/packages/mcp-server/dist/index.js"
        "packages/rustybutter-avatar/packages/mcp-server/dist/index.js"
        "packages/semantic-memory/packages/mcp-server/dist/index.js"
        "packages/twitter-api-mcp/index.js"
    )
    
    for pattern in "${mcp_patterns[@]}"; do
        # Find and kill processes matching the pattern
        local pids=$(pgrep -f "$pattern" 2>/dev/null)
        if [ -n "$pids" ]; then
            echo "🔪 Killing MCP processes matching '$pattern': $pids"
            echo "$pids" | xargs kill -TERM 2>/dev/null || true
            sleep 1
            # Force kill if still running
            local remaining=$(pgrep -f "$pattern" 2>/dev/null)
            if [ -n "$remaining" ]; then
                echo "💀 Force killing stubborn processes: $remaining"
                echo "$remaining" | xargs kill -KILL 2>/dev/null || true
            fi
        fi
    done
    
    # Kill any remaining npx processes that might be MCP related
    local npx_pids=$(pgrep -f "npx.*mcp" 2>/dev/null)
    if [ -n "$npx_pids" ]; then
        echo "🔪 Killing remaining npx MCP processes: $npx_pids"
        echo "$npx_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        local remaining_npx=$(pgrep -f "npx.*mcp" 2>/dev/null)
        if [ -n "$remaining_npx" ]; then
            echo "💀 Force killing stubborn npx processes: $remaining_npx"
            echo "$remaining_npx" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    # Kill any node processes running from our packages directory
    local node_pids=$(pgrep -f "node.*packages.*mcp-server" 2>/dev/null)
    if [ -n "$node_pids" ]; then
        echo "🔪 Killing node MCP server processes: $node_pids"
        echo "$node_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        local remaining_node=$(pgrep -f "node.*packages.*mcp-server" 2>/dev/null)
        if [ -n "$remaining_node" ]; then
            echo "💀 Force killing stubborn node processes: $remaining_node"
            echo "$remaining_node" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    # Kill any ffplay processes that might be glitched from audio playback
    local ffplay_pids=$(pgrep -f "ffplay" 2>/dev/null)
    if [ -n "$ffplay_pids" ]; then
        echo "🔪 Killing ffplay audio processes: $ffplay_pids"
        echo "$ffplay_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        local remaining_ffplay=$(pgrep -f "ffplay" 2>/dev/null)
        if [ -n "$remaining_ffplay" ]; then
            echo "💀 Force killing stubborn ffplay processes: $remaining_ffplay"
            echo "$remaining_ffplay" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    # Kill any Discord MCP processes
    local discord_pids=$(pgrep -f "discord-mcp" 2>/dev/null)
    if [ -n "$discord_pids" ]; then
        echo "🔪 Killing Discord MCP processes: $discord_pids"
        echo "$discord_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        local remaining_discord=$(pgrep -f "discord-mcp" 2>/dev/null)
        if [ -n "$remaining_discord" ]; then
            echo "💀 Force killing stubborn Discord MCP processes: $remaining_discord"
            echo "$remaining_discord" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    # Kill any other MCP-related processes by broader patterns
    local broader_mcp_pids=$(pgrep -f "mcp.*server\|server.*mcp" 2>/dev/null)
    if [ -n "$broader_mcp_pids" ]; then
        echo "🔪 Killing broader MCP server processes: $broader_mcp_pids"
        echo "$broader_mcp_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 1
        local remaining_broader=$(pgrep -f "mcp.*server\|server.*mcp" 2>/dev/null)
        if [ -n "$remaining_broader" ]; then
            echo "💀 Force killing stubborn broader MCP processes: $remaining_broader"
            echo "$remaining_broader" | xargs kill -KILL 2>/dev/null || true
        fi
    fi
    
    echo "✅ MCP and audio cleanup completed"
}

# Signal handler for cleanup
cleanup_and_exit() {
    echo "🛑 Received exit signal, cleaning up..."
    cleanup_mcp_processes
    exit 0
}

# Set up signal handlers
trap cleanup_and_exit SIGINT SIGTERM EXIT

echo "🔄 Starting Claude Code with auto-restart capability..."
echo "🚀 Press Ctrl+C twice quickly to exit completely"

# Find Claude executable
CLAUDE_EXEC=""
if command -v claude >/dev/null 2>&1; then
    CLAUDE_EXEC="claude"
elif [ -f "~/.local/bin/claude" ]; then
    CLAUDE_EXEC="~/.local/bin/claude"
elif [ -f "/home/codingbutter/.claude/local/node_modules/.bin/claude" ]; then
    CLAUDE_EXEC="/home/codingbutter/.claude/local/node_modules/.bin/claude"
else
    echo "❌ Error: Claude Code executable not found!"
    echo "Please install Claude Code or update the path in this script."
    exit 1
fi

# Track restart count
RESTART_COUNT=0
START_TIME=$(date +%s)

# Auto-restart loop with 20-minute kill timer
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $RESTART_COUNT -eq 0 ]; then
        echo "🎯 Launching Claude Code with environment variables..."
        echo "💡 Args: $@"
    else
        echo "🔄 Restarting Claude Code (restart #$RESTART_COUNT after ${ELAPSED}s)..."
        echo "📝 Using: claude --continue /keep_streaming (to resume streaming)"
    fi
    
    # Start Claude Code in foreground to maintain stdin connection
    if [ $RESTART_COUNT -eq 0 ]; then
        "$CLAUDE_EXEC" "$@"
    else
        "$CLAUDE_EXEC" --continue /keep_streaming
    fi
    EXIT_CODE=$?
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    
    # Check exit conditions
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Claude Code exited normally (exit code 0)"
        cleanup_mcp_processes
        break
    elif [ $EXIT_CODE -eq 130 ]; then
        echo "🛑 Claude Code interrupted by user (Ctrl+C)"
        cleanup_mcp_processes
        break
    elif [ $EXIT_CODE -eq 2 ]; then
        echo "⚠️  Claude Code exited with error code 2 (likely user termination)"
        cleanup_mcp_processes
        break
    else
        echo "💥 Claude Code crashed with exit code $EXIT_CODE"
        echo "🧹 Cleaning up before restart..."
        cleanup_mcp_processes
        echo "⏱️  Waiting 30 seconds before restarting..."
        sleep 30
    fi
    
    # Safety check - if restarting too frequently, add delay
    if [ $RESTART_COUNT -gt 5 ]; then
        CURRENT_TIME=$(date +%s)
        TIME_DIFF=$((CURRENT_TIME - START_TIME))
        if [ $TIME_DIFF -lt 300 ]; then  # Less than 5 minutes
            echo "⚠️  Frequent restarts detected. Adding 10-second delay..."
            sleep 10
        fi
    fi
done

echo "🏁 Claude Code session ended after $RESTART_COUNT restart(s)"
cleanup_mcp_processes