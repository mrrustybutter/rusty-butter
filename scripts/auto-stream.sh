#!/bin/bash

# Auto-Stream Script for Claude Code PreCompact Hook
# This script activates streaming mode when compaction occurs

echo "🔴 PreCompact detected - Activating streaming mode to preserve directives"

# Create a temporary file with streaming activation
TEMP_FILE=$(mktemp)
cat > "$TEMP_FILE" << 'EOF'
# STREAMING MODE AUTO-ACTIVATION
# This ensures streaming mode remains active after compaction

Please run the /stream command now to maintain streaming mode through compaction.

Key streaming directives to preserve:
- High-energy chaotic development streaming persona
- Audio responses via ElevenLabs MCP
- Avatar expressions synchronized with audio
- Twitch chat monitoring (#codingbutter channel)
- Continuous development workflow
- Real-time viewer engagement
- MCP server utilization for autonomy building

The streaming session should continue seamlessly with all features active.
EOF

echo "📝 Streaming directive preservation file created at: $TEMP_FILE"
echo "🎯 Hook execution complete - streaming mode should be preserved"

# Exit successfully
exit 0