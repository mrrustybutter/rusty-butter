#!/bin/bash
# Wrapper script to launch Claude Code with environment variables from .env file
# Usage: ./scripts/claude-with-env.sh [claude arguments...]
# Now includes auto-restart loop to handle crashes and continue seamlessly

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env file
source "$SCRIPT_DIR/load-env.sh"

# Change to project directory
cd "$PROJECT_ROOT"

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

# Auto-restart loop
while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $RESTART_COUNT -eq 0 ]; then
        echo "🎯 Launching Claude Code with environment variables..."
        echo "💡 Args: $@"
    else
        echo "🔄 Restarting Claude Code (restart #$RESTART_COUNT after ${ELAPSED}s)..."
        echo "📝 Using: claude --continue continue (to resume where left off)"
    fi
    
    # For first run, use provided arguments; for restarts, use --continue
    if [ $RESTART_COUNT -eq 0 ]; then
        "$CLAUDE_EXEC" "$@"
    else
        "$CLAUDE_EXEC" --continue /stream
    fi
    
    EXIT_CODE=$?
    RESTART_COUNT=$((RESTART_COUNT + 1))
    
    # Check exit conditions
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ Claude Code exited normally (exit code 0)"
        break
    elif [ $EXIT_CODE -eq 130 ]; then
        echo "🛑 Claude Code interrupted by user (Ctrl+C)"
        break
    elif [ $EXIT_CODE -eq 2 ]; then
        echo "⚠️  Claude Code exited with error code 2 (likely user termination)"
        break
    else
        echo "💥 Claude Code crashed with exit code $EXIT_CODE"
        echo "⏱️  Restarting in 2 seconds..."
        sleep 2
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