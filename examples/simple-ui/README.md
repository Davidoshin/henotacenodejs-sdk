# Henotace AI SDK - Simple UI Demo

A fully functional web-based demo application showcasing the Henotace AI SDK capabilities. This demo provides an intuitive interface for testing AI-powered tutoring features.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- A valid Henotace API key (get one at [djtconcept.ng/dashboard](https://djtconcept.ng/dashboard))

### Installation & Setup

1. **Install dependencies:**
   ```bash
   cd examples/simple-ui
   npm install
   ```

2. **Start the demo server:**
   ```bash
   HENOTACE_API_KEY=your_api_key_here npm start
   ```
   
   Or for development:
   ```bash
   HENOTACE_API_KEY=your_api_key_here npm run dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:8080](http://localhost:8080)

### Testing the Demo

Run the included test script to verify everything is working:

```bash
./test-demo.sh
```

## 🎯 Features

### ✨ Core Functionality
- **Real-time AI Chat**: Interactive conversations with AI tutors
- **Session Management**: Create, switch between, and manage multiple tutoring sessions
- **API Key Management**: Secure API key storage and validation
- **Subject Support**: Mathematics, Science, English, History, Computer Science, Physics, Chemistry, Biology, and custom subjects
- **Grade Levels**: Elementary, Middle School, High School, College, University

### 🎨 User Experience
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes with the moon/sun icon
- **Message History**: Persistent chat history across sessions
- **Typing Indicators**: Visual feedback during AI responses
- **Toast Notifications**: User-friendly success/error messages

### 🔧 Technical Features
- **RESTful API**: Clean API endpoints for session and chat management
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Local Storage**: Persistent settings and session data
- **CORS Support**: Cross-origin request handling
- **Input Validation**: Client and server-side validation

## 📱 How to Use

### 1. Set Up Your API Key
- Click the **Settings** button (gear icon) in the sidebar
- Enter your Henotace API key in the "API Configuration" section
- Click **Save Settings**

### 2. Create a Tutor Session
- Click **New Chat** or **Start New Chat**
- Fill in the tutor creation form:
  - **Tutor Name**: Give your AI tutor a name (e.g., "Math Tutor")
  - **Subject**: Choose from the dropdown or select "Other" for custom subjects
  - **Grade Level**: Select the appropriate education level
  - **Topic** (Optional): Specify a particular topic or area of focus
- Click **Create Tutor**

### 3. Start Learning
- Type your questions or requests in the message input
- Press **Enter** or click the send button
- The AI tutor will respond with helpful, educational content
- Continue the conversation to explore different topics

### 4. Manage Sessions
- View all your active sessions in the sidebar
- Click on any session to switch between different tutoring topics
- Each session maintains its own conversation history

## 🛠️ API Endpoints

The demo server provides the following endpoints:

### Session Management
- `POST /api/session` - Create a new tutoring session
- `GET /api/session/:sessionId` - Get session details
- `GET /api/chat/:sessionId` - Get chat history for a session

### Chat
- `POST /chat` - Send a message and get AI response

### Static Files
- `GET /` - Serve the main HTML page
- `GET /app.js` - Serve the JavaScript application
- `GET /styles-new.css` - Serve the CSS styles

## 🔧 Configuration

### Environment Variables
- `HENOTACE_API_KEY` - Your Henotace API key (required)
- `HENOTACE_BASE_URL` - API base URL (optional, defaults to `https://api.djtconcept.ng`)
- `PORT` - Server port (optional, defaults to 8080)

### Local Storage Keys
- `henotace_settings` - User settings (API key, theme preferences)
- `henotace_api_key` - Cached API key for quick access
- `sessions` - Array of user sessions
- `currentSessionId` - Currently active session ID
- `theme` - User's theme preference

## 🎨 Customization

### Styling
The demo uses CSS custom properties for easy theming. Key variables in `styles-new.css`:

```css
:root {
  --primary: #4f46e5;
  --secondary: #f3f4f6;
  --text: #111827;
  --background: #ffffff;
  /* ... more variables */
}
```

### Adding New Subjects
To add new subjects, modify the subject dropdown in `index.html`:

```html
<select id="tutor-subject" required>
  <option value="mathematics">Mathematics</option>
  <option value="science">Science</option>
  <!-- Add your custom subjects here -->
  <option value="your_subject">Your Subject</option>
</select>
```

### Extending Functionality
The demo is built with modular JavaScript in `app.js`. Key functions you can extend:

- `createNewTutor()` - Customize tutor creation logic
- `handleSubmit()` - Modify message handling
- `appendMessage()` - Customize message display
- `saveSettings()` - Add new settings options

## 🐛 Troubleshooting

### Common Issues

**"Please set your API key in settings"**
- Make sure you've entered a valid API key in the settings modal
- Verify the API key is correct and has proper permissions

**"Failed to create session"**
- Check your internet connection
- Verify the API key is valid
- Ensure the Henotace API service is available

**"Error sending message"**
- Check your internet connection
- Verify the session is still active
- Try refreshing the page and creating a new session

**Server won't start**
- Make sure Node.js 16+ is installed
- Run `npm install` to install dependencies
- Check that port 8080 is available

### Debug Mode
Enable debug logging by setting the environment variable:
```bash
DEBUG=henotace:* HENOTACE_API_KEY=your_key npm start
```

## 📚 Integration Examples

### Using the SDK Programmatically
```javascript
import { HenotaceAI, createTutor } from '@henotace/ai-sdk';
import InMemoryConnector from './src/connectors/inmemory';

const sdk = new HenotaceAI({ 
  apiKey: 'your_api_key', 
  storage: new InMemoryConnector() 
});

const tutor = await createTutor(sdk, {
  studentId: 'student_1',
  tutorId: 'math_tutor',
  tutorName: 'Math Tutor',
  subject: { id: 'math', name: 'Mathematics', topic: 'algebra' }
});

const reply = await tutor.send('Solve x + 2 = 5');
console.log('AI:', reply);
```

### Direct API Usage
```javascript
// Create a session
const sessionResponse = await fetch('/api/session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    subject: 'mathematics',
    gradeLevel: 'high_school',
    language: 'en'
  })
});

// Send a message
const chatResponse = await fetch('/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    sessionId: 'session_123',
    message: 'Help me with calculus'
  })
});
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see the main project LICENSE file for details.

## 🆘 Support

- **Documentation**: [henotaceai.ng](https://henotaceai.ng)
- **API Dashboard**: [djtconcept.ng/dashboard](https://djtconcept.ng/dashboard)
- **Issues**: [GitHub Issues](https://github.com/henotace/henotace-nodejs-sdk/issues)

---

**Happy Learning! 🎓**

This demo showcases the power of AI-assisted education. Use it to explore how AI tutors can enhance learning experiences across different subjects and grade levels.
