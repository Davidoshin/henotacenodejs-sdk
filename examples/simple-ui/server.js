const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 8080;

// Persistent storage for sessions
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
let sessions = new Map();

// Load sessions from file on startup
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const sessionsData = JSON.parse(data);
      sessions = new Map(Object.entries(sessionsData));
      console.log(`Loaded ${sessions.size} sessions from storage`);
    } else {
      console.log('No existing sessions file found, starting fresh');
    }
  } catch (error) {
    console.error('Error loading sessions:', error);
    sessions = new Map();
  }
}

// Save sessions to file
function saveSessions() {
  try {
    const sessionsData = Object.fromEntries(sessions);
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsData, null, 2));
    console.log(`Saved ${sessions.size} sessions to storage`);
  } catch (error) {
    console.error('Error saving sessions:', error);
  }
}

// Load sessions on startup
loadSessions();

const HENOTACE_API_URL = 'https://api.djtconcept.ng';

// Middleware to validate API key
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  if (!apiKey) {
    return res.status(401).json({ error: 'API key is required' });
  }
  req.apiKey = apiKey;
  next();
};

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
}));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(express.json());

// Parse JSON bodies
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname)));

// Initialize a new tutoring session
app.post('/api/session', validateApiKey, async (req, res) => {
  try {
    const { subject, gradeLevel, language = 'en' } = req.body;
    const sessionId = `session_${Date.now()}`;
    
    const sessionData = {
      sessionId,
      subject,
      gradeLevel,
      language,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sessions.set(sessionId, sessionData);
    saveSessions(); // Save to persistent storage
    
    res.json({ 
      success: true, 
      sessionId,
      message: 'Tutoring session created successfully',
      session: sessionData
    });
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ error: 'Failed to create session', details: error.message });
  }
});

// Get all sessions
app.get('/api/sessions', validateApiKey, (req, res) => {
  try {
    const sessionsList = Array.from(sessions.values()).map(session => ({
      id: session.sessionId,
      name: `${session.subject} Tutor`,
      subject: session.subject,
      gradeLevel: session.gradeLevel,
      topic: session.topic || '',
      createdAt: session.createdAt,
      lastMessage: session.messages && session.messages.length > 0 
        ? session.messages[session.messages.length - 1].content.substring(0, 50) + '...'
        : 'New session started',
      unread: 0
    }));
    
    res.json({
      success: true,
      sessions: sessionsList
    });
  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ error: 'Failed to get sessions', details: error.message });
  }
});

// Get session details
app.get('/api/session/:sessionId', validateApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      success: true,
      session
    });
  } catch (error) {
    console.error('Error getting session:', error);
    res.status(500).json({ error: 'Failed to get session', details: error.message });
  }
});

// Get chat history for a session
app.get('/api/chat/:sessionId', validateApiKey, (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = sessions.get(sessionId);
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      success: true,
      messages: session.messages || []
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ error: 'Failed to get chat history', details: error.message });
  }
});

// Send a message in a session
app.post('/chat', validateApiKey, async (req, res) => {
  try {
    const { sessionId, message, subject, gradeLevel } = req.body;
    
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }
    
    let session = sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Add user message to session
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    session.messages = session.messages || [];
    session.messages.push(userMessage);
    
    // Call the Henotace API
    const response = await axios.post(
      `${HENOTACE_API_URL}/api/external/working/chat/completion/`,
      {
        input: message,
        history: session.messages,
        preset: 'tutor_default'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': req.apiKey
        },
        timeout: 30000
      }
    );
    
    // Extract AI response from the API
    const aiResponse = response.data?.data?.ai_response || 
                      response.data?.response || 
                      'I apologize, but I seem to be having trouble responding at the moment.';
    
    // Add assistant response to session
    const assistantMessage = {
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    session.messages.push(assistantMessage);
    session.updatedAt = new Date().toISOString();
    sessions.set(sessionId, session);
    saveSessions(); // Save to persistent storage
    
    res.json({
      success: true,
      reply: aiResponse,
      sessionId
    });
    
  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      
      return res.status(error.response.status || 500).json({
        error: 'api_error',
        message: error.response.data?.message || 'Error from Henotace API',
        details: error.response.data
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request made but no response received:', error.request);
      return res.status(504).json({
        error: 'no_response',
        message: 'No response received from the API server'
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up the request:', error.message);
      return res.status(500).json({
        error: 'request_error',
        message: error.message || 'Error setting up the request'
      });
    }
  }
});

app.listen(port, () => {
  console.log(`Henotace demo running on http://localhost:${port}`);
});
