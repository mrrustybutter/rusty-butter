#!/bin/bash

# Start ABIDE dev server in detached mode
cd /home/codingbutter/GitHub/rusty-butter/packages/ABIDE

# Kill any existing processes on the ports
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3030 | xargs kill -9 2>/dev/null || true

# Start the dev server in background
nohup npm run dev > /tmp/abide-dev.log 2>&1 &
echo $! > /tmp/abide-dev.pid

echo "ABIDE dev server started in detached mode"
echo "PID: $(cat /tmp/abide-dev.pid)"
echo "Logs: /tmp/abide-dev.log"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:3030"