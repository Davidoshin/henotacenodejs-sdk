# Henotace AI SDK

Official Node.js SDK for Henotace AI — a lightweight TypeScript client and local session manager for building AI-powered tutoring experiences with **enhanced classwork generation capabilities**.

This repository contains a TypeScript SDK (`src/index.ts`) that wraps the Henotace AI HTTP API, a small `Tutor` abstraction for per-student tutoring sessions with local storage/compression, an in-memory storage connector, unit tests, and a tiny example UI to try the service locally.

## 🚀 New Features

- **🎯 Classwork Generation**: Generate context-aware classwork from chat conversations
- **💾 Classwork Management**: Save and manage generated classwork in the database
- **🔄 Batch Operations**: Generate multiple classworks for different subjects
- **📚 Context-Aware**: Uses chat history to create relevant questions
- **🎨 Advanced Personalization**: Comprehensive AI tutor personalization with learning pattern analysis
- **🧠 Learning Analysis**: Automatic detection of learning levels, styles, and student patterns
- **🎭 Branding Support**: Custom branding and white-label options for enterprise users
- **🌍 Multi-language**: Support for multiple languages including Nigerian languages (Yoruba, Hausa, Igbo, Pidgin)
- **👤 Personality Types**: Choose from friendly, professional, encouraging, strict, or humorous personalities
- **📖 Teaching Styles**: Socratic, Direct Instruction, Problem-Based, or Collaborative learning approaches
- **🎯 Interest Integration**: Personalize learning based on student interests and preferences
- **📊 Progress Tracking**: Automatic tracking of student strengths, struggles, and learning patterns

## What this repo provides

- `src/index.ts` — main SDK (`HenotaceAI`) and `Tutor` helper with **classwork generation methods**.
- `src/types.ts` — TypeScript types, `StorageConnector` contract, and **classwork types**.
- `src/connectors/inmemory.ts` — a simple in-memory storage connector for testing.
- `backend/sdks/javascript/henotace-sdk.js` — JavaScript SDK with **classwork generation support**.
- `tests/` — Jest + ts-jest unit tests covering SDK behavior and storage.
- `examples/simple-ui/` — a small static HTML + Node demo server to try the chat flow locally.
- `examples/classwork-generation-example.js` — **JavaScript example for classwork generation**.
- `examples/classwork-generation-example.ts` — **TypeScript example for classwork generation**.

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Build the SDK (optional for TypeScript checks):

```bash
npm run build
```

3. Run unit tests:

```bash
npm test
```

## Demo: Interactive Web UI

A fully functional web-based demo is included under `examples/simple-ui/`. This demo provides a complete user interface for testing AI-powered tutoring features with real-time chat, session management, and API key configuration.

### Quick Start

1. **Get your API key** from [henotaceai.ng/developer/dashboard](https://www.henotaceai.ng/developer/dashboard)

2. **Start the demo:**
   ```bash
   cd examples/simple-ui
   ./start-demo.sh your_api_key_here
   ```

3. **Open your browser** to [http://localhost:8080](http://localhost:8080)

### Features

- ✨ **Real-time AI Chat** - Interactive conversations with AI tutors
- 🎯 **Session Management** - Create and manage multiple tutoring sessions  
- 🔑 **API Key Management** - Secure API key storage and validation
- 📚 **Multiple Subjects** - Mathematics, Science, English, History, Computer Science, Physics, Chemistry, Biology, and custom subjects
- 🎓 **Grade Levels** - Elementary, Middle School, High School, College, University
- 🌙 **Dark/Light Theme** - Toggle between themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💾 **Persistent Storage** - Chat history and settings saved locally

### How to Use

1. Click **Settings** (gear icon) and enter your API key
2. Click **New Chat** to create a tutor session
3. Fill in tutor details (name, subject, grade level)
4. Start chatting with your AI tutor!

### Testing

Run the test script to verify everything works:
```bash
./test-demo.sh
```

For detailed documentation, see [examples/simple-ui/README.md](examples/simple-ui/README.md).

## Using the SDK programmatically

### Basic Tutoring Example (Node/TypeScript):

```ts
import { HenotaceAI, createTutor, InMemoryConnector } from '@henotace/ai-sdk';

const sdk = new HenotaceAI({ apiKey: process.env.HENOTACE_API_KEY!, storage: new InMemoryConnector() });
const tutor = await createTutor(sdk, { studentId: 'stu1', tutorId: 't1', tutorName: 'Math Tutor', subject: { id: 'math', name: 'Mathematics', topic: 'algebra' } });
const reply = await tutor.send('Solve x + 2 = 5');
console.log('AI:', reply);
```

### Enhanced Personalization Example:

```ts
import { HenotaceAI, InMemoryConnector } from '@henotace/ai-sdk';

const sdk = new HenotaceAI({ 
  apiKey: process.env.HENOTACE_API_KEY!, 
  storage: new InMemoryConnector() 
});

// Advanced personalization with learning analysis
const response = await sdk.chatCompletion({
  history: [
    { role: 'user', content: 'I find algebra difficult' },
    { role: 'assistant', content: 'Let me help you with algebra step by step...' },
    { role: 'user', content: 'Can you show me examples?' }
  ],
  input: 'I still don\'t understand quadratic equations',
  subject: 'mathematics',
  topic: 'algebra',
  author_name: 'Dr. Johnson',
  language: 'en',
  personality: 'encouraging',  // Supports: friendly, encouraging, strict, humorous, professional
  teaching_style: 'socratic',  // Supports: socratic, direct, problem_based, collaborative
  branding: {
    name: 'Math Master',
    primaryColor: '#10B981',
    secondaryColor: '#047857'
  }
});

console.log('AI Response:', response.ai_response);
```

### Multi-Language Support Example:

```ts
// Nigerian Pidgin English
const pidginResponse = await sdk.chatCompletion({
  history: [],
  input: 'Wetin be photosynthesis?',
  subject: 'biology',
  topic: 'plant_biology',
  language: 'pidgin',  // Nigerian Pidgin English
  personality: 'friendly',
  teaching_style: 'direct'
});

// Yoruba Language
const yorubaResponse = await sdk.chatCompletion({
  history: [],
  input: 'Kí ni photosynthesis?',
  subject: 'biology',
  topic: 'plant_biology',
  language: 'yo-NG',  // Yoruba with Nigerian cultural context
  personality: 'encouraging',
  teaching_style: 'socratic'
});
```

### Tutor with Advanced Personalization:

```ts
// Create a tutor with enhanced customization
const tutor = await createTutor(sdk, { 
  studentId: 'stu1', 
  tutorId: 'bio-tutor', 
  tutorName: 'Biology Expert',
  subject: { id: 'biology', name: 'Biology', topic: 'cell_structure' }
});

// Send message with full personalization parameters
const reply = await tutor.send('Explain cell division', {
  author_name: 'Dr. Johnson',
  language: 'en',
  personality: 'encouraging',
  teaching_style: 'direct',
  interests: ['sports', 'music', 'art'],  // Student interests for personalization
  branding: {
    name: 'Cell Biology Tutor',
    primaryColor: '#10B981',
    secondaryColor: '#047857'
  }
});

console.log('Tutor Response:', reply);
```

### Complete Personalization Example:

```ts
// Example showing all personalization features
const personalizedResponse = await sdk.chatCompletion({
  history: [
    { role: 'user', content: 'I love football and find math difficult' },
    { role: 'assistant', content: 'I understand! Let me use football examples to explain math concepts...' },
    { role: 'user', content: 'Can you show me how to calculate angles?' }
  ],
  input: 'I still don\'t understand trigonometry',
  subject: 'mathematics',
  topic: 'trigonometry',
  author_name: 'Coach Math',
  language: 'en',
  personality: 'encouraging',  // Will be supportive and celebrate progress
  teaching_style: 'problem_based',  // Will use real-world football scenarios
  interests: ['football', 'sports', 'gaming'],  // Will use sports examples
  branding: {
    name: 'Sports Math Tutor',
    primaryColor: '#FF6B35',
    secondaryColor: '#F7931E'
  }
});

// The AI will automatically:
// 1. Detect the student struggles with math
// 2. Use football/sports examples for trigonometry
// 3. Apply encouraging personality
// 4. Use problem-based teaching approach
// 5. Reference previous conversation about angles
```

### 🎯 NEW: Classwork Generation Example

```ts
// Generate classwork from chat conversation
const classworkResult = await tutor.generateClassworkFromChat({
  subject: 'mathematics',
  topic: 'algebra',
  class_level: 'ss1',
  question_count: 5,
  difficulty: 'medium'
});

if (classworkResult.success) {
  console.log(`Generated ${classworkResult.data.classwork.questions.length} questions`);
  console.log(`Total points: ${classworkResult.data.classwork.total_points}`);
}

// Or generate and save classwork directly
const result = await sdk.generateAndSaveClasswork({
  student_id: 'student_123',
  subject: 'physics',
  topic: 'mechanics',
  class_level: 'ss2',
  question_count: 8,
  difficulty: 'hard',
  context: 'Based on tutoring session about Newton\'s laws',
  chat_history: conversationHistory
});
```

### JavaScript Example:

```js
const { createClient } = require('henotace-ai-sdk');

const client = createClient('your_api_key_here');

// Generate and save classwork
const result = await client.generateAndSaveClasswork({
  student_id: 'student_123',
  subject: 'chemistry',
  topic: 'organic_chemistry',
  class_level: 'ss3',
  question_count: 5,
  difficulty: 'medium',
  chat_history: chatHistory
});
```

## 🧪 Testing and Examples

### Quick Start Example (Working)
```bash
# Run the working quick start example
node examples/quick-start-example.js
```

### Classwork Generation Examples
```bash
# JavaScript example
node examples/classwork-generation-example.js

# TypeScript example (requires compilation)
npm run build
node dist/examples/classwork-generation-example.js
```

### Integration Examples
- **Quick Start**: `examples/quick-start-example.js` - Complete working example
- **React Integration**: See `DEVELOPER_INTEGRATION_GUIDE.md`
- **Express.js Backend**: See `DEVELOPER_INTEGRATION_GUIDE.md`
- **Python Integration**: See `DEVELOPER_INTEGRATION_GUIDE.md`

## 🚀 How Developers Can Integrate

### 1. **Install the SDK**
```bash
npm install @henotace/ai-sdk
```

### 2. **Get Your API Key**
- Visit [henotaceai.ng/developer/dashboard](https://henotaceai.ng/developer/dashboard)
- Sign up and choose your plan
- Generate your API key

### 3. **Quick Integration**
```javascript
const { createClient } = require('@henotace/ai-sdk');

const client = createClient('your_api_key_here', 'https://api.djtconcept.ng/api/external');

// Chat with AI tutor
const response = await client.completeChat({
    history: [],
    input: "Help me with math",
    subject: "mathematics",
    topic: "algebra"
});

console.log(response.data.ai_response);
```

### 4. **Single Endpoint for Everything**
The chat completion endpoint handles both regular chat and classwork generation:

```javascript
// Regular chat
const chatResponse = await client.completeChat({
    history: [],
    input: "What is photosynthesis?",
    subject: "biology",
    topic: "plant biology"
});

// Classwork generation (same endpoint!)
const classworkResponse = await client.completeChat({
    history: chatHistory,
    input: "Generate 5 practice questions for algebra with multiple choice options. Format as JSON array.",
    subject: "mathematics",
    topic: "algebra"
});
```

### 5. **Available Integration Methods**
- **Direct API calls** (like the quick-start example)
- **SDK methods** (TypeScript/JavaScript)
- **React components** (see integration guide)
- **Backend endpoints** (Express.js, Python, etc.)

### 6. **Working Endpoints**
- ✅ **Chat Completion**: `/api/external/working/chat/completion/` (handles both chat and classwork)
- ✅ **API Status**: `/api/external/working/status/`
- ✅ **Classwork Generation**: Use chat completion with specific prompts

### 7. **Documentation**
- 📖 **Complete Guide**: `DEVELOPER_INTEGRATION_GUIDE.md`
- 🚀 **Quick Start**: `examples/quick-start-example.js`
- 💡 **Examples**: `examples/` directory

## 🎨 Advanced Personalization Features

The Henotace AI SDK now includes comprehensive personalization capabilities that automatically analyze learning patterns and adapt to individual student needs.

### 🧠 Learning Pattern Analysis

The AI automatically analyzes conversation history to detect:
- **Learning Level**: Beginner, Intermediate, or Advanced
- **Learning Style**: Inquisitive, Example-driven, or Practice-oriented
- **Student Struggles**: Areas where the student needs extra support
- **Student Strengths**: Topics where the student excels
- **Key Concepts**: Important topics discussed in the conversation
- **Learning Patterns**: How the student prefers to learn

### 🌍 Multi-Language Support

Support for multiple languages including Nigerian languages:

```ts
// Supported languages
const languages = [
  'en',        // English (default)
  'yo-NG',     // Yoruba with Nigerian cultural context
  'ha-NG',     // Hausa with Nigerian cultural context  
  'ig-NG',     // Igbo with Nigerian cultural context
  'pidgin'     // Nigerian Pidgin English
];

// Example usage
const response = await sdk.chatCompletion({
  history: [],
  input: 'Wetin be mathematics?',
  subject: 'mathematics',
  language: 'pidgin',  // Responds in Nigerian Pidgin
  personality: 'friendly'
});
```

### 👤 Personality Types

Choose from different tutor personalities:

- **`friendly`** (default): Approachable and supportive
- **`encouraging`**: Warm, supportive, celebrates small wins
- **`strict`**: Precise, direct, focused on accuracy
- **`humorous`**: Uses appropriate humor to make learning engaging
- **`professional`**: Formal, professional tone while being helpful

### 📖 Teaching Styles

Select the teaching approach that works best:

- **`socratic`** (default): Asks thought-provoking questions to guide discovery
- **`direct`**: Provides clear explanations and step-by-step instructions
- **`problem_based`**: Focuses on problem-solving and practical applications
- **`collaborative`**: Works together with the student, building on their ideas

### 🎯 Interest Integration

Personalize learning based on student interests:

```ts
// The backend automatically uses student interests for personalization
// when provided in the conversation context
const response = await sdk.chatCompletion({
  history: [
    { role: 'user', content: 'I love sports and music' },
    { role: 'assistant', content: 'Great! Let me use sports examples...' }
  ],
  input: 'Explain physics concepts',
  subject: 'physics',
  topic: 'mechanics',
  // AI will automatically use sports examples for physics concepts
});
```

### 📊 Automatic Progress Tracking

The AI automatically tracks and adapts to:
- Areas where students struggle
- Topics where students show strength
- Learning preferences and patterns
- Conversation context and continuity
- Recent questions and focus areas

## 📚 API Reference

### Classwork Generation Methods

#### TypeScript SDK
- `sdk.generateClasswork(request)` - Generate classwork content
- `sdk.saveClasswork(classworkData)` - Save classwork to database
- `sdk.generateAndSaveClasswork(request)` - Generate and save in one operation
- `tutor.generateClassworkFromChat(request)` - Generate from tutor chat history

#### JavaScript SDK
- `client.generateClasswork(request)` - Generate classwork content
- `client.saveClasswork(classworkData)` - Save classwork to database
- `client.generateAndSaveClasswork(request)` - Generate and save in one operation

### Request Parameters
```typescript
interface ClassworkGenerationRequest {
  subject: string;                    // Subject (e.g., 'mathematics', 'physics')
  topic: string;                      // Topic within the subject
  class_level?: string;               // Class level (default: 'ss1')
  question_count?: number;            // Number of questions (default: 5)
  difficulty?: 'easy' | 'medium' | 'hard'; // Difficulty level (default: 'medium')
  context?: string;                   // Additional context
  chat_history?: ChatMessage[];       // Chat history for context
}
```

## Contributing & next steps

- Add more `StorageConnector` adapters (file, Redis, SQLite).
- Add a browser-friendly build (rollup/webpack) if you need to use the client in-browser.
- Improve compression/summarization strategy (LLM-based summarizer, offload to backend).
- **Enhanced classwork features**: Add support for different question types, multimedia questions, and advanced assessment features.

## License

MIT
