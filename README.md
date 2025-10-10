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

## Demo: simple UI (local)

A minimal demo is included under `examples/simple-ui/`. It serves a small chat page and proxies chat requests to the Henotace unified chat endpoint. The demo uses the `axios` dependency to forward chat messages to the API—it's a lightweight demo helper and not a production server.

Environment variables required:

- `HENOTACE_API_KEY` — your API key (required).
- `HENOTACE_BASE_URL` — optional; defaults to `https://api.djtconcept.ng`.

Start the demo server and open the browser:

```bash
HENOTACE_API_KEY=your_api_key_here npm run demo
# then open http://localhost:8080 in your browser
```

Notes:

- The demo server serves the static UI and exposes a single POST `/chat` endpoint.
- The UI is intentionally minimal so you can inspect and adapt it for your own applications.

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
