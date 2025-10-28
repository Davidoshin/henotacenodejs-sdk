# 🧪 Henotace AI SDK Testing Guide

This guide provides comprehensive testing examples for the Henotace AI SDK with your API key.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- Your API key from [henotaceai.ng/developer/dashboard](https://henotaceai.ng/developer/dashboard)

### Setup
```bash
# Install dependencies
npm install

# Build the SDK
npm run build

# Set your API key
export HENOTACE_API_KEY="your_api_key_here"
# Or create a .env file with: HENOTACE_API_KEY=your_api_key_here

# Run tests
npm run test:quick         # Quick basic test
npm run test:rate-limited  # Rate-limited comprehensive test
npm run test:ts           # TypeScript test (requires ts-node)
```

## 📋 Available Tests

### 1. Quick Test (`quick-test.js`)
**Purpose**: Basic functionality verification
**Duration**: ~30 seconds
**Features tested**:
- API status check
- Basic chat completion
- Personalization (personality, teaching style)
- Multi-language support (Nigerian Pidgin)

```bash
npm run test:quick
```

### 2. Comprehensive Test (`test-sdk-practical.js`)
**Purpose**: Full feature demonstration
**Duration**: ~2-3 minutes
**Features tested**:
- API status check
- Basic chat completion
- All personality types (friendly, encouraging, strict, humorous, professional)
- All teaching styles (socratic, direct, problem_based, collaborative)
- Multi-language support (English, Pidgin, Yoruba)
- Tutor session management
- Classwork generation
- Advanced personalization with learning analysis

```bash
npm run test:full
```

### 3. TypeScript Test (`test-sdk-practical.ts`)
**Purpose**: TypeScript-specific testing
**Duration**: ~2-3 minutes
**Requirements**: `ts-node` installed globally
```bash
npm install -g ts-node
npm run test:ts
```

## 🎯 Test Results Interpretation

### ✅ Success Indicators
- API status shows "operational"
- AI responses are generated successfully
- Personalization parameters are applied correctly
- Multi-language responses are in the correct language
- Tutor sessions maintain context across messages

### ❌ Common Issues
- **Network errors**: Check internet connection
- **API key errors**: Verify your API key is correct
- **Build errors**: Run `npm run build` first
- **TypeScript errors**: Install ts-node globally

## 🔧 Customizing Tests

### Modify API Key
Edit any test file and change:
```javascript
const API_KEY = 'your_new_api_key_here';
```

### Add Custom Tests
Create a new test file:
```javascript
const { HenotaceAI, InMemoryConnector } = require('./dist/index.js');

const sdk = new HenotaceAI({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.djtconcept.ng',
  storage: new InMemoryConnector()
});

async function myCustomTest() {
  // Your test code here
  const response = await sdk.chatCompletion({
    history: [],
    input: 'Your test question',
    subject: 'mathematics',
    topic: 'algebra'
  });
  
  console.log('Response:', response.ai_response);
}

myCustomTest();
```

## 📊 Expected Test Output

### Quick Test Output
```
🚀 Quick Henotace AI SDK Test

📡 Checking API status...
✅ API is online: operational

💬 Testing basic chat...
✅ AI Response: Hello! 2 + 2 equals 4...

🎨 Testing personalization...
✅ Personalized Response: Photosynthesis is how plants...

🌍 Testing Nigerian Pidgin...
✅ Pidgin Response: Ahoy! So you dey ask wetin be gravity...

✅ All tests passed! SDK is working correctly.
```

### Comprehensive Test Output
```
🚀 Starting Henotace AI SDK Practical Tests

📡 Test 1: API Status Check
==================================================
✅ API Status: operational
✅ Message: API is running smoothly
✅ Timestamp: 2025-09-25T18:50:00Z

💬 Test 2: Basic Chat Completion
==================================================
✅ Question: What is photosynthesis?
✅ AI Response: Photosynthesis is the process...

🎨 Test 3: Personalization Features
==================================================
🧑‍🏫 Testing friendly personality:
✅ friendly response: I understand that math can be challenging...

🧑‍🏫 Testing encouraging personality:
✅ encouraging response: Don't worry! Math can be tricky at first...

📚 Testing socratic teaching style:
✅ socratic response: Let me ask you this: what do you think...

🌍 Test 4: Multi-Language Support
==================================================
🗣️ Testing English (en):
✅ English response: Gravity is the force that attracts...

🗣️ Testing Nigerian Pidgin (pidgin):
✅ Nigerian Pidgin response: Ahoy! So you dey ask wetin be gravity...

👨‍🏫 Test 5: Tutor Session Management
==================================================
✅ Tutor created: { studentId: 'test_student_123', tutorId: 'math_tutor_001' }
👤 Student: I find algebra difficult
🤖 Tutor: I understand that algebra can be challenging...

📝 Test 6: Classwork Generation
==================================================
✅ Classwork generated successfully
✅ Questions count: 3
✅ Total points: 15

🧠 Test 7: Advanced Personalization with Learning Analysis
==================================================
📚 Simulating learning conversation...
✅ Advanced personalization response: Great question about sine and cosine...

✅ All tests completed successfully!
```

## 🐛 Troubleshooting

### Build Issues
```bash
# Clean and rebuild
rm -rf dist/
npm run build
```

### Network Issues
- Check your internet connection
- Verify the API endpoint is accessible
- Check if there are any firewall restrictions

### API Key Issues
- Verify your API key is correct
- Check if your API key has the necessary permissions
- Ensure your account is active

### TypeScript Issues
```bash
# Install ts-node globally
npm install -g ts-node

# Or use npx
npx ts-node test-sdk-practical.ts
```

## 📈 Performance Notes

- **API Response Time**: Typically 2-5 seconds per request
- **Rate Limits**: Check your API plan for rate limits
- **Concurrent Requests**: The SDK handles retries automatically
- **Memory Usage**: Minimal memory footprint with in-memory storage

## 🔄 Continuous Testing

For development, you can run tests in watch mode:
```bash
# Watch for file changes and re-run tests
npm run test:watch
```

## 📚 Next Steps

After successful testing:
1. Integrate the SDK into your application
2. Customize personalization parameters for your use case
3. Implement proper error handling
4. Add logging and monitoring
5. Consider using persistent storage for production

## 🆘 Support

If you encounter issues:
1. Check the test output for specific error messages
2. Verify your API key and network connection
3. Review the SDK documentation
4. Contact support at api.henotace.ng
