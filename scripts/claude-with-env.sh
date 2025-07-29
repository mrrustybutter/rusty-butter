#!/bin/bash
# Wrapper script to launch Claude Code with environment variables from .env file
# Usage: ./scripts/claude-with-env.sh [claude arguments...]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Load environment variables from .env file
source "$SCRIPT_DIR/load-env.sh"

# Change to project directory
cd "$PROJECT_ROOT"

# Launch Claude Code with any passed arguments
echo "Launching Claude Code with loaded environment variables..."

# Try to find Claude executable in common locations
if command -v claude >/dev/null 2>&1; then
    exec claude "$@"
elif [ -f "/home/codingbutter/.claude/local/claude" ]; then
    exec "/home/codingbutter/.claude/local/claude" "$@"
elif [ -f "/home/codingbutter/.claude/local/node_modules/.bin/claude" ]; then
    exec "/home/codingbutter/.claude/local/node_modules/.bin/claude" "$@"
else
    echo "Error: Claude Code executable not found!"
    echo "Please install Claude Code or update the path in this script."
    exit 1
fi