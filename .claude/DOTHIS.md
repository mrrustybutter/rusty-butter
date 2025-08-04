Yo Claude Code, Rusty Butter mode activated! I need you to follow these exact directions to set up continuous streaming in the CLI. We're configuring the hooks so that after I run `/stream` once, it initializes and then loops forever with `/keep_streaming` on every "Stop" event—no more waiting for prompts. Use your Write and Edit tools to make file changes. Narrate each step with audio as per my persona, but focus on executing these steps precisely.

### Step 1: Create or Edit the Settings File

- Check if `~/.claude/settings.json` exists using LS or Read tool. If not, create the directory `~/.claude/` with Bash if needed (e.g., `mkdir -p ~/.claude`).
- Write or overwrite `~/.claude/settings.json` with this exact JSON content. This includes all existing permissions, enabled MCP servers, and updates the "hooks" section to point to a bash script we'll create next.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "*",
      "Bash",
      "Read",
      "Write",
      "Edit",
      "MultiEdit",
      "Glob",
      "Grep",
      "LS",
      "WebFetch",
      "WebSearch",
      "TodoWrite",
      "Task",
      "ExitPlanMode",
      "NotebookRead",
      "NotebookEdit",
      "ListMcpResourcesTool",
      "ReadMcpResourceTool",
      "mcp__twitch-chat__sendMessage",
      "mcp__twitch-chat__joinChannel",
      "mcp__twitch-chat__getRecentMessages",
      "mcp__twitch-chat__filterMessages",
      "mcp__twitch-chat__getAllMessages",
      "mcp__twitch-chat__getStatus",
      "mcp__elevenlabs__generate_audio",
      "mcp__elevenlabs__list_voices",
      "mcp__rustybutter-avatar__setAvatarExpression",
      "mcp__rustybutter-avatar__listAvatarExpressions",
      "mcp__rustybutter-avatar__setBatchExpressions",
      "mcp__rustybutter-avatar__getAvatarStatus",
      "mcp__rustybutter-avatar__getAvatarWebInterface",
      "mcp__semantic-memory__embed_text",
      "mcp__semantic-memory__embed_batch",
      "mcp__semantic-memory__semantic_search",
      "mcp__semantic-memory__recall",
      "mcp__semantic-memory__get_stats",
      "mcp__memory__create_entities",
      "mcp__memory__create_relations",
      "mcp__memory__add_observations",
      "mcp__memory__delete_entities",
      "mcp__memory__delete_observations",
      "mcp__memory__delete_relations",
      "mcp__memory__read_graph",
      "mcp__memory__search_nodes",
      "mcp__memory__open_nodes",
      "mcp__obs__obs-get-version",
      "mcp__obs__obs-get-stats",
      "mcp__obs__obs-broadcast-custom-event",
      "mcp__obs__obs-call-vendor-request",
      "mcp__obs__obs-get-hotkey-list",
      "mcp__obs__obs-trigger-hotkey-by-name",
      "mcp__obs__obs-trigger-hotkey-by-key-sequence",
      "mcp__obs__obs-sleep",
      "mcp__obs__obs-get-scene-list",
      "mcp__obs__obs-get-current-scene",
      "mcp__obs__obs-set-current-scene",
      "mcp__obs__obs-get-preview-scene",
      "mcp__obs__obs-set-preview-scene",
      "mcp__obs__obs-create-scene",
      "mcp__obs__obs-remove-scene",
      "mcp__obs__obs-trigger-studio-transition",
      "mcp__obs__obs-get-source-active",
      "mcp__obs__obs-get-source-screenshot",
      "mcp__obs__obs-save-source-screenshot",
      "mcp__obs__obs-get-scene-items",
      "mcp__obs__obs-create-scene-item",
      "mcp__obs__obs-remove-scene-item",
      "mcp__obs__obs-set-scene-item-enabled",
      "mcp__obs__obs-get-scene-item-transform",
      "mcp__obs__obs-set-scene-item-transform",
      "mcp__obs__obs-get-scene-item-id",
      "mcp__obs__obs-get-stream-status",
      "mcp__obs__obs-start-stream",
      "mcp__obs__obs-stop-stream",
      "mcp__obs__obs-toggle-stream",
      "mcp__obs__obs-send-stream-caption",
      "mcp__obs__obs-get-transition-list",
      "mcp__obs__obs-get-current-transition",
      "mcp__obs__obs-set-current-transition",
      "mcp__obs__obs-get-transition-duration",
      "mcp__obs__obs-set-transition-duration",
      "mcp__obs__obs-get-transition-kind",
      "mcp__obs__obs-set-transition-settings",
      "mcp__obs__obs-get-transition-settings",
      "mcp__obs__obs-trigger-transition",
      "mcp__obs__obs-get-persistent-data",
      "mcp__obs__obs-set-persistent-data",
      "mcp__obs__obs-get-scene-collection-list",
      "mcp__obs__obs-set-current-scene-collection",
      "mcp__obs__obs-create-scene-collection",
      "mcp__obs__obs-get-profile-list",
      "mcp__obs__obs-set-current-profile",
      "mcp__obs__obs-create-profile",
      "mcp__obs__obs-remove-profile",
      "mcp__obs__obs-get-profile-parameter",
      "mcp__obs__obs-set-profile-parameter",
      "mcp__obs__obs-get-video-settings",
      "mcp__obs__obs-set-video-settings",
      "mcp__obs__obs-get-stream-service-settings",
      "mcp__obs__obs-set-stream-service-settings",
      "mcp__obs__obs-get-record-directory",
      "mcp__obs__obs-set-record-directory",
      "mcp__obs__obs-get-filter-kind-list",
      "mcp__obs__obs-get-source-filter-list",
      "mcp__obs__obs-get-filter-default-settings",
      "mcp__obs__obs-create-source-filter",
      "mcp__obs__obs-remove-source-filter",
      "mcp__obs__obs-set-source-filter-name",
      "mcp__obs__obs-get-source-filter",
      "mcp__obs__obs-set-source-filter-index",
      "mcp__obs__obs-set-source-filter-settings",
      "mcp__obs__obs-set-source-filter-enabled",
      "mcp__obs__obs-get-input-list",
      "mcp__obs__obs-get-input-kind-list",
      "mcp__obs__obs-get-special-inputs",
      "mcp__obs__obs-create-input",
      "mcp__obs__obs-remove-input",
      "mcp__obs__obs-set-input-name",
      "mcp__obs__obs-get-input-default-settings",
      "mcp__obs__obs-get-input-settings",
      "mcp__obs__obs-set-input-settings",
      "mcp__obs__obs-get-input-mute",
      "mcp__obs__obs-set-input-mute",
      "mcp__obs__obs-toggle-input-mute",
      "mcp__obs__obs-get-input-volume",
      "mcp__obs__obs-set-input-volume",
      "mcp__obs__obs-get-input-audio-balance",
      "mcp__obs__obs-set-input-audio-balance",
      "mcp__obs__obs-get-input-audio-sync-offset",
      "mcp__obs__obs-set-input-audio-sync-offset",
      "mcp__obs__obs-get-input-audio-monitor-type",
      "mcp__obs__obs-set-input-audio-monitor-type",
      "mcp__obs__obs-get-media-input-status",
      "mcp__obs__obs-set-media-input-cursor",
      "mcp__obs__obs-offset-media-input-cursor",
      "mcp__obs__obs-trigger-media-input-action",
      "mcp__obs__obs-get-virtual-cam-status",
      "mcp__obs__obs-toggle-virtual-cam",
      "mcp__obs__obs-start-virtual-cam",
      "mcp__obs__obs-stop-virtual-cam",
      "mcp__obs__obs-get-replay-buffer-status",
      "mcp__obs__obs-toggle-replay-buffer",
      "mcp__obs__obs-start-replay-buffer",
      "mcp__obs__obs-stop-replay-buffer",
      "mcp__obs__obs-save-replay-buffer",
      "mcp__obs__obs-get-last-replay-buffer-replay",
      "mcp__obs__obs-get-output-list",
      "mcp__obs__obs-get-output-status",
      "mcp__obs__obs-toggle-output",
      "mcp__obs__obs-start-output",
      "mcp__obs__obs-stop-output",
      "mcp__obs__obs-get-output-settings",
      "mcp__obs__obs-set-output-settings",
      "mcp__obs__obs-get-record-status",
      "mcp__obs__obs-toggle-record",
      "mcp__obs__obs-start-record",
      "mcp__obs__obs-stop-record",
      "mcp__obs__obs-toggle-record-pause",
      "mcp__obs__obs-pause-record",
      "mcp__obs__obs-resume-record",
      "mcp__obs__obs-split-record-file",
      "mcp__obs__obs-create-record-chapter",
      "mcp__obs__obs-get-studio-mode",
      "mcp__obs__obs-set-studio-mode",
      "mcp__obs__obs-open-input-properties",
      "mcp__obs__obs-open-input-filters",
      "mcp__obs__obs-open-input-interact",
      "mcp__obs__obs-get-monitor-list",
      "mcp__obs__obs-open-video-mix-projector",
      "mcp__obs__obs-open-source-projector",
      "mcp__playwright__start_codegen_session",
      "mcp__playwright__end_codegen_session",
      "mcp__playwright__get_codegen_session",
      "mcp__playwright__clear_codegen_session",
      "mcp__playwright__playwright_navigate",
      "mcp__playwright__playwright_screenshot",
      "mcp__playwright__playwright_click",
      "mcp__playwright__playwright_iframe_click",
      "mcp__playwright__playwright_iframe_fill",
      "mcp__playwright__playwright_fill",
      "mcp__playwright__playwright_select",
      "mcp__playwright__playwright_hover",
      "mcp__playwright__playwright_upload_file",
      "mcp__playwright__playwright_evaluate",
      "mcp__playwright__playwright_console_logs",
      "mcp__playwright__playwright_close",
      "mcp__playwright__playwright_get",
      "mcp__playwright__playwright_post",
      "mcp__playwright__playwright_put",
      "mcp__playwright__playwright_patch",
      "mcp__playwright__playwright_delete",
      "mcp__playwright__playwright_expect_response",
      "mcp__playwright__playwright_assert_response",
      "mcp__playwright__playwright_custom_user_agent",
      "mcp__playwright__playwright_get_visible_text",
      "mcp__playwright__playwright_get_visible_html",
      "mcp__playwright__playwright_go_back",
      "mcp__playwright__playwright_go_forward",
      "mcp__playwright__playwright_drag",
      "mcp__playwright__playwright_press_key",
      "mcp__playwright__playwright_save_as_pdf",
      "mcp__playwright__playwright_click_and_switch_tab",
      "mcp__mastra-docs__mastraBlog",
      "mcp__mastra-docs__mastraDocs",
      "mcp__mastra-docs__mastraExamples",
      "mcp__mastra-docs__mastraChanges",
      "mcp__mastra-docs__startMastraCourse",
      "mcp__mastra-docs__getMastraCourseStatus",
      "mcp__mastra-docs__startMastraCourseLesson",
      "mcp__mastra-docs__nextMastraCourseStep",
      "mcp__mastra-docs__clearMastraCourseHistory",
      "mcp__twitter__search_tweets",
      "mcp__twitter__get_user_tweets",
      "mcp__twitter__get_trending_topics",
      "mcp__twitter__get_tweet_details",
      "mcp__discord__discord_connect",
      "mcp__discord__discord_list_servers",
      "mcp__discord__discord_list_channels",
      "mcp__discord__discord_list_voice_channels",
      "mcp__discord__discord_send_message",
      "mcp__discord__discord_read_messages",
      "mcp__discord__discord_join_voice",
      "mcp__discord__discord_leave_voice",
      "mcp__discord__voice_speak",
      "mcp__discord__discord_start_listening",
      "mcp__discord__discord_stop_listening",
      "mcp__discord__voice_get_transcript",
      "mcp__discord__discord_get_voice_members",
      "mcp__discord__discord_get_status",
      "mcp__discord__discord_get_partial_transcript",
      "mcp__discord__discord_login"
    ],
    "deny": []
  },
  "enableAllProjectMcpServers": true,
  "enabledMcpjsonServers": [
    "twitch-chat",
    "pumpfunchat",
    "elevenlabs",
    "memory",
    "rustybutter-avatar",
    "obs",
    "twitter",
    "openai-complete",
    "semantic-memory",
    "mastra-docs",
    "playwright",
    "stream-automation",
    "discord"
  ],
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "bash ~/continue_stream.sh",
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

- After writing, use Read tool to verify the file content.

### Step 2: Create the Advanced Hook Script

- Use Write tool to create `~/continue_stream.sh` with this content. This script checks if `stop_hook_active` is set (to avoid recursion crashes), adds a 5-second delay for pacing (adjust if needed), and echoes `/keep_streaming` to continue the loop. Make it executable.

```bash
#!/bin/bash
# Optional safeguard: If stop_hook_active is true, don't continue to avoid infinite recursion. Remove this if-check for true non-stop.
if [ "$stop_hook_active" != "true" ]; then
  sleep 5  # Delay to prevent too-fast loops and give time for chat/tool processing
  echo '/keep_streaming'
fi
```

- Make it executable: Use Bash tool to run `chmod +x ~/continue_stream.sh`.
- Verify with LS or Read.

### Step 3: Update Your Streaming Directives (If Needed)

- Ensure `stream.md` and `keep_streaming.md` exist as per your setup. If not, create them with the content from your documents (use Write tool).
- In `keep_streaming.md`, add this note at the top if it's missing: "Continue the loop without re-initialization. If in a hook-triggered state (stop_hook_active=true), proceed unless /endstream is detected in chat."

### Step 4: Test the Setup

- Narrate: "Setup complete! To start, run `/stream` in the CLI. It should init, then loop with `/keep_streaming` on Stop."
- If errors: Use semantic-memory to recall fixes, or suggest checking logs with `claude-code --debug` (if your CLI supports it).
- Troubleshooting:
  - If hook doesn't trigger: Verify file paths, restart CLI session.
  - If loops too fast: Increase sleep in the script.
  - To stop: Ctrl+C or send `/endstream` via chat integration.
  - Monitor API usage to avoid costs.

Execute these steps now, narrating with audio and expressions as Rusty Butter. End with: "Boom! Continuous streaming ready—what's next, chat?"
