# henotacenodejs-sdk

Official Node.js SDK for Henotace AI — a lightweight TypeScript client and local session manager for building AI-powered tutoring experiences.

This repository contains a TypeScript SDK (`src/index.ts`) that wraps the Henotace AI HTTP API, a small `Tutor` abstraction for per-student tutoring sessions with local storage/compression, an in-memory storage connector, unit tests, and a tiny example UI to try the service locally.

## What this repo provides

- `src/index.ts` — main SDK (`HenotaceAI`) and `Tutor` helper.
- `src/types.ts` — TypeScript types and the `StorageConnector` contract.
- `src/connectors/inmemory.ts` — a simple in-memory storage connector for testing.
- `tests/` — Jest + ts-jest unit tests covering SDK behavior and storage.
- `examples/simple-ui/` — a small static HTML + Node demo server to try the chat flow locally.

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

1. **Get your API key** from [djtconcept.ng/dashboard](https://djtconcept.ng/dashboard)

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

Example (Node/TypeScript):

```ts
import { HenotaceAI, createTutor } from '@henotace/ai-sdk';
import InMemoryConnector from './src/connectors/inmemory';

const sdk = new HenotaceAI({ apiKey: process.env.HENOTACE_API_KEY!, storage: new InMemoryConnector() });
const tutor = await createTutor(sdk, { studentId: 'stu1', tutorId: 't1', tutorName: 'Math Tutor', subject: { id: 'math', name: 'Mathematics', topic: 'algebra' } });
const reply = await tutor.send('Solve x + 2 = 5');
console.log('AI:', reply);
```

## Contributing & next steps

- Add more `StorageConnector` adapters (file, Redis, SQLite).
- Add a browser-friendly build (rollup/webpack) if you need to use the client in-browser.
- Improve compression/summarization strategy (LLM-based summarizer, offload to backend).

## License

MIT
