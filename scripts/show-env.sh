#!/bin/bash
# Script to show all project environment variables

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_ROOT"

# Load environment variables
source "$SCRIPT_DIR/load-env.sh"

# Show relevant environment variables
echo "📋 Project Environment Variables:"
echo "=================================="
env | grep -E '(TWITCH|OPENAI|ELEVENLABS|OBS|AVATAR|SEMANTIC|PROJECT|CHAT)' | sort