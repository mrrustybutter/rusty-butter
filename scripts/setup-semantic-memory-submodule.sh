#!/bin/bash
# Script to convert semantic-memory package to a git submodule

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
SEMANTIC_MEMORY_DIR="$PROJECT_ROOT/packages/semantic-memory"
TEMP_REPO_DIR="/home/codingbutter/GitHub/semantic-memory"

echo "🔄 Converting semantic-memory to git submodule..."

# Step 1: Create standalone repository
echo "📁 Creating standalone semantic-memory repository..."
if [ -d "$TEMP_REPO_DIR" ]; then
    rm -rf "$TEMP_REPO_DIR"
fi

mkdir -p "$TEMP_REPO_DIR"
cp -r "$SEMANTIC_MEMORY_DIR"/* "$TEMP_REPO_DIR/"

# Initialize git repo
cd "$TEMP_REPO_DIR"
git init
git add .
git commit -m "Initial commit: Semantic memory system with Mastra integration

- Vector-based semantic memory with LibSQL backend
- Client library for embedding and search operations  
- MCP server for Claude Code integration
- Support for chat history, conversations, and context preservation"

echo "✅ Created standalone repository at: $TEMP_REPO_DIR"

# Step 2: Remove from monorepo and add as submodule
echo "🗑️  Removing semantic-memory from monorepo..."
cd "$PROJECT_ROOT"
rm -rf "$SEMANTIC_MEMORY_DIR"

echo "🔗 Adding semantic-memory as git submodule..."
git submodule add "$TEMP_REPO_DIR" packages/semantic-memory

echo "📝 Updating .gitmodules..."
# Make sure the submodule is properly configured
git submodule update --init --recursive

echo "✅ Semantic-memory successfully converted to submodule!"
echo ""
echo "📋 Next steps:"
echo "1. Update package.json workspace dependencies if needed"
echo "2. Test that semantic-memory still works correctly"
echo "3. Commit the submodule changes to the main repo"
echo ""
echo "🔗 Submodule location: packages/semantic-memory -> $TEMP_REPO_DIR"