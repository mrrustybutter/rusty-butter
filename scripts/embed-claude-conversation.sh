#!/bin/bash

# Claude Code hook script to embed conversation history before context compaction
# This script is called by Claude Code hooks with the transcript path as argument

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
EMBEDDER_PATH="$PROJECT_ROOT/packages/twitch-embedder"

# Check if transcript path is provided
if [ -z "$1" ]; then
    echo "[ClaudeHook] Error: No transcript path provided"
    echo "[ClaudeHook] Usage: $0 <transcript_path>"
    exit 1
fi

TRANSCRIPT_PATH="$1"

# Check if transcript file exists
if [ ! -f "$TRANSCRIPT_PATH" ]; then
    echo "[ClaudeHook] Error: Transcript file does not exist: $TRANSCRIPT_PATH"
    exit 1
fi

echo "[ClaudeHook] Embedding Claude conversation from: $TRANSCRIPT_PATH"

# Change to embedder directory and run the embedder
cd "$EMBEDDER_PATH"

# Make sure the latest build is available
pnpm build > /dev/null 2>&1 || {
    echo "[ClaudeHook] Warning: Build failed, using existing build"
}

# Set environment variables
export SEMANTIC_MEMORY_DB_PATH="$PROJECT_ROOT/semantic_memory_db"
export OPENAI_API_KEY="${OPENAI_API_KEY}"

# Run the Claude conversation embedder
node dist/claude-conversation-embedder.js "$TRANSCRIPT_PATH"

if [ $? -eq 0 ]; then
    echo "[ClaudeHook] Successfully embedded conversation history"
else
    echo "[ClaudeHook] Failed to embed conversation history"
    exit 1
fi