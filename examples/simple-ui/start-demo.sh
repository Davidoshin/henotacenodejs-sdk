#!/bin/bash

# Henotace AI SDK Demo Launcher
# This script helps users quickly start the demo with their API key

echo "🎓 Henotace AI SDK Demo Launcher"
echo "================================"
echo ""

# Check if API key is provided
if [ -z "$1" ]; then
    echo "❌ Please provide your API key as an argument"
    echo ""
    echo "Usage: $0 <your_api_key>"
    echo ""
    echo "Example: $0 sk-1234567890abcdef"
    echo ""
    echo "🔑 Get your API key from: https://djtconcept.ng/dashboard"
    exit 1
fi

API_KEY="$1"

echo "🔑 Using API key: ${API_KEY:0:10}..."
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
    echo ""
fi

# Check if port 8080 is available
if lsof -Pi :8080 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8080 is already in use"
    echo "   Please stop the existing server or use a different port"
    echo ""
    echo "   To stop existing server:"
    echo "   pkill -f 'node server.js'"
    echo ""
    exit 1
fi

echo "🚀 Starting Henotace AI Demo Server..."
echo "   Server will be available at: http://localhost:8080"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the server
HENOTACE_API_KEY="$API_KEY" npm start
