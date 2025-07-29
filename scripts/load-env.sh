#!/bin/bash
# Script to load environment variables from .env file and export them to the shell
# Usage: source scripts/load-env.sh

# Find the project root by looking for .env file
if [ -f ".env" ]; then
    PROJECT_ROOT="$(pwd)"
elif [ -f "../.env" ]; then
    PROJECT_ROOT="$(cd .. && pwd)"
else 
    # Fallback: assume script is in scripts/ subdirectory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
fi

ENV_FILE="$PROJECT_ROOT/.env"

if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from $ENV_FILE"
    
    # Read .env file, ignore comments and empty lines, export variables
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Export the variable
        if [[ "$line" =~ ^[[:space:]]*([a-zA-Z_][a-zA-Z0-9_]*)=(.*)$ ]]; then
            var_name="${line%%=*}"
            var_value="${line#*=}"
            # Remove surrounding quotes if present
            var_value=$(echo "$var_value" | sed 's/^["'\'']\(.*\)["'\'']$/\1/')
            export "$var_name"="$var_value"
            echo "  Exported: $var_name"
        fi
    done < "$ENV_FILE"
    
    echo "Environment variables loaded successfully!"
else
    echo "Warning: .env file not found at $ENV_FILE"
fi