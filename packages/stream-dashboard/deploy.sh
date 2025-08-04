#!/bin/bash

echo "🚀 Rusty Butter Dashboard Deployment Script"
echo "=========================================="
echo ""
echo "Select deployment platform:"
echo "1) Railway (Recommended)"
echo "2) Fly.io"
echo "3) Docker (Local)"
echo "4) Build Docker Image Only"
echo ""

read -p "Enter your choice (1-4): " choice

case $choice in
  1)
    echo "Deploying to Railway..."
    if ! command -v railway &> /dev/null; then
      echo "Railway CLI not found. Installing..."
      npm install -g @railway/cli
    fi
    railway login
    railway init
    railway up
    echo "✅ Deployment complete! Run 'railway open' to view your app"
    ;;
    
  2)
    echo "Deploying to Fly.io..."
    if ! command -v fly &> /dev/null; then
      echo "Fly CLI not found. Please install from https://fly.io/install"
      exit 1
    fi
    
    # Create fly.toml if it doesn't exist
    if [ ! -f fly.toml ]; then
      cat > fly.toml << EOF
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
EOF
    fi
    
    fly deploy
    echo "✅ Deployment complete!"
    ;;
    
  3)
    echo "Running locally with Docker..."
    docker build -t stream-dashboard .
    docker run -d -p 8090:8090 --restart unless-stopped --name stream-dashboard stream-dashboard
    echo "✅ Dashboard running at http://localhost:8090"
    ;;
    
  4)
    echo "Building Docker image..."
    docker build -t stream-dashboard .
    echo "✅ Docker image built successfully!"
    echo "Run with: docker run -p 8090:8090 stream-dashboard"
    ;;
    
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac