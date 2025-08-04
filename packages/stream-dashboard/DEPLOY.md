# Stream Dashboard Deployment Guide

## Quick Deploy Options

### 1. Railway (Recommended)
1. Install Railway CLI: `npm install -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy: `railway up`
5. Get URL: `railway open`

### 2. Fly.io
1. Install flyctl: `curl -L https://fly.io/install.sh | sh`
2. Create fly.toml:
```toml
app = "rusty-butter-dashboard"
primary_region = "ord"

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8090
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]
```
3. Deploy: `fly deploy`

### 3. Render
1. Connect GitHub repo
2. Use Dockerfile deployment
3. Set environment variable PORT if needed

### 4. Digital Ocean App Platform
1. Connect GitHub repo
2. Choose Dockerfile deployment
3. Configure port to 8090

### 5. Self-Hosted VPS
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Build and run
docker build -t stream-dashboard .
docker run -d -p 80:8090 --restart unless-stopped stream-dashboard
```

## Environment Variables
- `PORT` - Server port (default: 8090)

## WebSocket Configuration
The dashboard automatically detects the correct WebSocket protocol (ws/wss) based on the deployment environment.

## Testing Deployment
Visit `http://your-domain/ws-dashboard.html` to see the live dashboard with WebSocket updates.