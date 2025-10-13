#!/bin/bash

# Henotace AI SDK Demo Test Script
# This script demonstrates the functionality of the simple UI demo

echo "🚀 Henotace AI SDK Demo Test"
echo "=============================="
echo ""

# Check if server is running
echo "📡 Checking if demo server is running..."
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Demo server is running on http://localhost:8080"
else
    echo "❌ Demo server is not running. Please start it with:"
    echo "   cd examples/simple-ui && HENOTACE_API_KEY=your_key node server.js"
    exit 1
fi

echo ""
echo "🧪 Testing API endpoints..."

# Test session creation
echo "📝 Testing session creation..."
SESSION_RESPONSE=$(curl -s -X POST http://localhost:8080/api/session \
    -H "Content-Type: application/json" \
    -H "X-API-Key: test_key" \
    -d '{"subject": "mathematics", "gradeLevel": "high_school", "language": "en"}')

if echo "$SESSION_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Session creation endpoint working"
    SESSION_ID=$(echo "$SESSION_RESPONSE" | grep -o '"sessionId":"[^"]*"' | cut -d'"' -f4)
    echo "   Session ID: $SESSION_ID"
else
    echo "❌ Session creation failed"
    echo "$SESSION_RESPONSE"
fi

# Test chat endpoint (will fail with test key, but should return proper error)
echo ""
echo "💬 Testing chat endpoint..."
CHAT_RESPONSE=$(curl -s -X POST http://localhost:8080/chat \
    -H "Content-Type: application/json" \
    -H "X-API-Key: test_key" \
    -d '{"sessionId": "'$SESSION_ID'", "message": "Hello, can you help me with algebra?"}')

if echo "$CHAT_RESPONSE" | grep -q "api_error"; then
    echo "✅ Chat endpoint working (correctly rejecting invalid API key)"
else
    echo "❌ Chat endpoint not working as expected"
    echo "Response: $CHAT_RESPONSE"
fi

echo ""
echo "🎯 Demo Instructions:"
echo "===================="
echo "1. Open your browser and go to: http://localhost:8080"
echo "2. Click the 'Settings' button (gear icon) in the sidebar"
echo "3. Enter your Henotace API key in the settings modal"
echo "4. Click 'Save Settings'"
echo "5. Click 'New Chat' to create a tutor session"
echo "6. Fill in the tutor details (name, subject, grade level)"
echo "7. Click 'Create Tutor' to start chatting!"
echo ""
echo "📚 Available subjects: Mathematics, Science, English, History, Computer Science, Physics, Chemistry, Biology, or Other"
echo "🎓 Grade levels: Elementary, Middle School, High School, College, University"
echo ""
echo "✨ The demo includes:"
echo "   • Real-time chat with AI tutor"
echo "   • Session management"
echo "   • API key validation"
echo "   • Responsive design"
echo "   • Dark/light theme toggle"
echo "   • Message history"
echo ""
echo "🔑 Get your API key from: https://djtconcept.ng/dashboard"
echo ""
echo "Happy learning! 🎓"
