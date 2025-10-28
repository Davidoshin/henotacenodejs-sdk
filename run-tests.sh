#!/bin/bash

echo "🚀 Henotace AI SDK Test Runner"
echo "=============================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if the SDK is built
if [ ! -d "dist" ]; then
    echo "📦 Building SDK first..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please check your setup."
        exit 1
    fi
fi

echo ""
echo "Choose a test to run:"
echo "1. Quick Test (basic functionality)"
echo "2. Comprehensive Test (all features)"
echo "3. TypeScript Test (if you have ts-node)"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo "🏃 Running Quick Test..."
        node quick-test.js
        ;;
    2)
        echo "🧪 Running Comprehensive Test..."
        node test-sdk-practical.js
        ;;
    3)
        if command -v ts-node &> /dev/null; then
            echo "📘 Running TypeScript Test..."
            ts-node test-sdk-practical.ts
        else
            echo "❌ ts-node is not installed. Install it with: npm install -g ts-node"
            echo "🏃 Falling back to JavaScript test..."
            node test-sdk-practical.js
        fi
        ;;
    *)
        echo "❌ Invalid choice. Running quick test..."
        node quick-test.js
        ;;
esac

echo ""
echo "✅ Test completed!"
