#!/bin/bash

# Stop ABIDE dev server

# Check if PID file exists
if [ -f /tmp/abide-dev.pid ]; then
    PID=$(cat /tmp/abide-dev.pid)
    if ps -p $PID > /dev/null 2>&1; then
        # Kill the main process and all children
        pkill -P $PID
        kill $PID
        echo "ABIDE dev server stopped (PID: $PID)"
    else
        echo "Process not found (PID: $PID)"
    fi
    rm -f /tmp/abide-dev.pid
else
    echo "PID file not found"
fi

# Also kill any processes on the dev ports as backup
lsof -ti:5173 | xargs kill -9 2>/dev/null || true
lsof -ti:3030 | xargs kill -9 2>/dev/null || true

echo "Cleaned up any remaining processes on ports 5173 and 3030"