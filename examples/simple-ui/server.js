const express = require('express');
const path = require('path');
const axios = require('axios');
// use built-in express JSON parsing

const app = express();
const port = process.env.PORT || 8080;

const API_KEY = process.env.HENOTACE_API_KEY;
const BASE_URL = process.env.HENOTACE_BASE_URL || 'https://api.djtconcept.ng';

if (!API_KEY) {
  console.error('HENOTACE_API_KEY not set. Set it and restart the demo.');
  // continue so user can still open UI, but /chat will error
}

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/chat', async (req, res) => {
  const message = req.body && req.body.message;
  if (!message) return res.status(400).json({ error: 'missing message' });
  if (!API_KEY) return res.status(500).json({ error: 'HENOTACE_API_KEY not configured on server' });

  try {
    const client = axios.create({ baseURL: BASE_URL, timeout: 20000, headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY } });
    const payload = { history: [{ role: 'user', content: message }], input: message, preset: 'tutor_default' };
    const response = await client.post('/api/external/working/chat/completion/', payload);
    const ai = response.data && response.data.data && response.data.data.ai_response;
    res.json({ reply: ai || '' });
  } catch (err) {
    console.error('chat proxy error', err && (err.response && err.response.data) || err.message || err);
    const message = err && err.response && err.response.data ? JSON.stringify(err.response.data) : (err.message || 'Unknown error');
    res.status(500).json({ error: 'proxy_error', details: message });
  }
});

app.listen(port, () => {
  console.log(`Henotace demo running on http://localhost:${port}`);
});
