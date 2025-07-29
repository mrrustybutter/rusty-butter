#!/bin/bash

# Installation script for Twitch Embedder Service

echo "Installing Twitch Embedder Service..."

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo "Please run as normal user, not root"
   exit 1
fi

# Build the project
echo "Building the project..."
npm install
npm run build

# Check which service manager to use
if command -v systemctl &> /dev/null; then
    echo "Using systemd..."
    
    # Copy service file
    sudo cp twitch-embedder.service /etc/systemd/system/
    
    # Update service file with current user and paths
    sudo sed -i "s/User=codingbutter/User=$USER/g" /etc/systemd/system/twitch-embedder.service
    sudo sed -i "s|/home/codingbutter|$HOME|g" /etc/systemd/system/twitch-embedder.service
    
    # Reload systemd
    sudo systemctl daemon-reload
    
    # Enable and start service
    sudo systemctl enable twitch-embedder
    sudo systemctl start twitch-embedder
    
    echo "Service installed and started!"
    echo "Check status with: sudo systemctl status twitch-embedder"
    echo "View logs with: sudo journalctl -u twitch-embedder -f"
    
elif command -v pm2 &> /dev/null; then
    echo "Using PM2..."
    
    # Start with PM2
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration
    pm2 save
    
    # Set up startup script
    pm2 startup
    
    echo "Service installed with PM2!"
    echo "Check status with: pm2 status"
    echo "View logs with: pm2 logs twitch-embedder"
    
else
    echo "No supported service manager found (systemd or PM2)"
    echo "Install PM2 with: npm install -g pm2"
    exit 1
fi

echo "Installation complete!"