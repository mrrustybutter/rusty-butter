# Setting up Twitch Embedder Auto-start

## Option 1: Using systemd (Recommended for Linux)

1. **Install the service:**
   ```bash
   ./install-service.sh
   ```

2. **Or manually:**
   ```bash
   # Copy service file
   sudo cp twitch-embedder.service /etc/systemd/system/
   
   # Enable auto-start
   sudo systemctl enable twitch-embedder
   
   # Start now
   sudo systemctl start twitch-embedder
   ```

## Option 2: Using PM2 (Cross-platform)

1. **Install PM2:**
   ```bash
   npm install -g pm2
   ```

2. **Start the service:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

## Option 3: Using cron (Simple)

1. **Add to crontab:**
   ```bash
   crontab -e
   ```

2. **Add this line:**
   ```
   @reboot cd /home/codingbutter/GitHub/rusty-butter/packages/twitch-embedder && /usr/bin/node dist/index.js >> logs/output.log 2>&1
   ```

## Environment Variables

Make sure these are set in your system:
- `OPENAI_API_KEY`
- `TWITCH_OAUTH_TOKEN`

You can add them to:
- `/etc/environment` (system-wide)
- `~/.profile` or `~/.bashrc` (user-specific)
- The service file directly

## Verification

Check if the service is running:
```bash
# For systemd
sudo systemctl status twitch-embedder
sudo journalctl -u twitch-embedder -f

# For PM2
pm2 status
pm2 logs twitch-embedder
```