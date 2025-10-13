// Henotace AI Tutor - Simple UI Demo
// Main application JavaScript

// DOM Elements
let chatEl, form, input, sendBtn, settingsBtn, apiKeyInput, newChatBtn, startChatBtn;
let currentSessionId = null;
let sessions = [];
let isSettingsOpen = false;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  initializeElements();
  setupEventListeners();
  loadSettings();
  await loadSessionsFromServer();
  checkApiKey();
  
  // Show welcome screen if no active session
  if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
    showWelcomeScreen();
  } else {
    loadSession(currentSessionId);
  }
});

function initializeElements() {
  // Get DOM elements
  chatEl = document.getElementById('chat-messages');
  form = document.getElementById('chat-form');
  input = document.getElementById('message-input');
  sendBtn = document.getElementById('send-btn');
  settingsBtn = document.getElementById('settings-btn');
  apiKeyInput = document.getElementById('api-key');
  newChatBtn = document.getElementById('new-chat-btn');
  startChatBtn = document.getElementById('start-chat-btn');
  
  // Load sessions from server first, then fallback to localStorage
  await loadSessionsFromServer();
  
  // Load current session
  currentSessionId = localStorage.getItem('currentSessionId');
}

function setupEventListeners() {
  // Menu toggle
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', toggleSidebar);
  }
  
  // Sidebar overlay
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
  
  // Settings
  if (settingsBtn) {
    settingsBtn.addEventListener('click', toggleSettings);
  }
  
  const closeSettingsBtn = document.getElementById('close-settings');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', toggleSettings);
  }
  
  const saveSettingsBtn = document.getElementById('save-settings');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }
  
  // New chat
  if (newChatBtn) {
    newChatBtn.addEventListener('click', showTutorModal);
  }
  
  if (startChatBtn) {
    startChatBtn.addEventListener('click', showTutorModal);
  }
  
  // Tutor modal
  const tutorModal = document.getElementById('tutor-modal');
  const closeTutorModal = document.getElementById('close-tutor-modal');
  const cancelTutor = document.getElementById('cancel-tutor');
  const tutorForm = document.getElementById('tutor-form');
  
  if (closeTutorModal) {
    closeTutorModal.addEventListener('click', hideTutorModal);
  }
  
  if (cancelTutor) {
    cancelTutor.addEventListener('click', hideTutorModal);
  }
  
  if (tutorForm) {
    tutorForm.addEventListener('submit', handleTutorSubmit);
  }
  
  // Subject selection
  const subjectSelect = document.getElementById('tutor-subject');
  const customSubjectGroup = document.getElementById('custom-subject-group');
  
  if (subjectSelect) {
    subjectSelect.addEventListener('change', (e) => {
      if (customSubjectGroup) {
        customSubjectGroup.style.display = e.target.value === 'other' ? 'block' : 'none';
      }
    });
  }
  
  // API key toggle
  const toggleApiKeyBtn = document.getElementById('toggle-api-key');
  if (toggleApiKeyBtn) {
    toggleApiKeyBtn.addEventListener('click', toggleApiKeyVisibility);
  }
  
  // Chat form
  if (form) {
    form.addEventListener('submit', handleSubmit);
  }
  
  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  
  // Auto-resize textarea
  if (input) {
    input.addEventListener('input', autoResizeTextarea);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    });
  }
}

function showWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatMessages = document.getElementById('chat-messages');
  
  if (welcomeScreen) {
    welcomeScreen.style.display = 'flex';
  }
  if (chatMessages) {
    chatMessages.style.display = 'none';
  }
}

function hideWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const chatMessages = document.getElementById('chat-messages');
  
  if (welcomeScreen) {
    welcomeScreen.style.display = 'none';
  }
  if (chatMessages) {
    chatMessages.style.display = 'flex';
  }
}

function showTutorModal() {
  const modal = document.getElementById('tutor-modal');
  if (modal) {
    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
  }
}

function hideTutorModal() {
  const modal = document.getElementById('tutor-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }
}

function handleTutorSubmit(e) {
  e.preventDefault();
  
  const tutorName = document.getElementById('tutor-name').value.trim();
  const tutorSubject = document.getElementById('tutor-subject').value;
  const customSubject = document.getElementById('custom-subject').value.trim();
  const gradeLevel = document.getElementById('grade-level').value;
  const topic = document.getElementById('topic').value.trim();
  
  const subject = tutorSubject === 'other' ? customSubject : tutorSubject;
  
  if (!tutorName || !subject) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  createNewTutor({
    name: tutorName,
    subject: subject,
    gradeLevel: gradeLevel,
    topic: topic
  });
  
  hideTutorModal();
}

async function createNewTutor(tutorData) {
  try {
    // Create a new session
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': localStorage.getItem('henotace_api_key') || ''
      },
      body: JSON.stringify({
        subject: tutorData.subject,
        gradeLevel: tutorData.gradeLevel,
        language: 'en'
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create session');
    }
    
    const data = await response.json();
    currentSessionId = data.sessionId;
    localStorage.setItem('currentSessionId', currentSessionId);
    
    // Add to sessions list
    const sessionData = {
      id: data.sessionId,
      name: tutorData.name,
      subject: tutorData.subject,
      gradeLevel: tutorData.gradeLevel,
      topic: tutorData.topic,
      createdAt: new Date().toISOString(),
      lastMessage: 'New session started',
      unread: 0
    };
    
    sessions.unshift(sessionData);
    saveSessions();
    
    // Update UI
    renderSessionsList();
    hideWelcomeScreen();
    showToast('New tutor session created!', 'success');
    
    // Update header
    const currentTutorEl = document.getElementById('current-tutor');
    if (currentTutorEl) {
      currentTutorEl.textContent = tutorData.name;
    }
    
    // Auto-send welcome message
    setTimeout(() => {
      appendMessage(`Hello! I'm your ${tutorData.subject} tutor. How can I help you learn today?`, 'ai');
    }, 500);
    
    input.focus();
    
  } catch (error) {
    console.error('Error creating tutor:', error);
    showToast('Failed to create tutor session', 'error');
  }
}

async function handleSubmit(e) {
  e.preventDefault();
  
  const message = input.value.trim();
  if (!message) return;
  
  // Check if API key is set
  if (!checkApiKey()) {
    showToast('Please set your API key in settings', 'error');
    toggleSettings();
    return;
  }
  
  // If no session, create one first
  if (!currentSessionId) {
    showToast('Please create a tutor session first', 'error');
    showTutorModal();
    return;
  }
  
  // Disable input while sending
  input.disabled = true;
  sendBtn.disabled = true;
  
  // Add user message to chat
  appendMessage(message, 'user');
  input.value = '';
  autoResizeTextarea();
  
  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  appendMessage('...', 'ai', typingId);
  
  try {
    // Send message to server
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': localStorage.getItem('henotace_api_key') || ''
      },
      body: JSON.stringify({
        sessionId: currentSessionId,
        message: message
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message');
    }
    
    const data = await response.json();
    
    // Update typing indicator with actual response
    const typingEl = document.getElementById(typingId);
    if (typingEl) {
      typingEl.textContent = data.reply || 'No response from server';
      typingEl.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update last message in sessions list
    updateLastMessage(currentSessionId, data.reply || 'No response');
    
  } catch (error) {
    console.error('Error sending message:', error);
    const typingEl = document.getElementById(typingId);
    if (typingEl) {
      typingEl.textContent = 'Error: ' + (error.message || 'Failed to send message');
      typingEl.classList.add('error');
    }
    showToast('Error sending message', 'error');
  } finally {
    // Re-enable input
    input.disabled = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

function appendMessage(text, role, id = '') {
  const messageEl = document.createElement('div');
  messageEl.className = `message ${role}`;
  if (id) messageEl.id = id;
  
  const avatar = role === 'user' ? 'U' : 'AI';
  const sender = role === 'user' ? 'You' : 'AI Tutor';
  const messageId = id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  messageEl.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="message-sender">${sender}</span>
        <span class="message-time">${formatTime(new Date())}</span>
      </div>
      <div class="message-text">${formatMessageText(text)}</div>
    </div>
  `;
  
  chatEl.appendChild(messageEl);
  messageEl.scrollIntoView({ behavior: 'smooth' });
  
  return messageEl;
}

function formatMessageText(text) {
  // Clean up the text first
  let cleanedText = text
    // Clean up HTML artifacts first
    .replace(/<\/?td[^>]*>/g, '')
    .replace(/<\/?tr[^>]*>/g, '')
    .replace(/<\/?table[^>]*>/g, '')
    .replace(/<\/?thead[^>]*>/g, '')
    .replace(/<\/?tbody[^>]*>/g, '')
    .replace(/<\/?th[^>]*>/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/<br\s*\/?>/g, '\n')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s+/g, '\n')
    .trim();
  
  // Convert to proper HTML - process markdown first, then remove any remaining asterisks
  cleanedText = cleanedText
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
    .replace(/`(.*?)`/g, '<code>$1</code>')             // Code
    // Remove any remaining standalone asterisks
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Clean up any double spaces that might have been created
    .replace(/\s{2,}/g, ' ')
    .replace(/\n/g, '<br>')                            // Line breaks
    .replace(/([.!?])\s*([A-Z])/g, '$1<br><br>$2');    // Paragraph breaks
    
  return cleanedText;
}

// Message action functions
function copyMessage(messageId) {
  const messageEl = document.getElementById(messageId);
  if (!messageEl) return;
  
  const textEl = messageEl.querySelector('.message-text');
  if (!textEl) return;
  
  const text = textEl.textContent || textEl.innerText;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Message copied to clipboard!', 'success');
    }).catch(() => {
      fallbackCopyTextToClipboard(text);
    });
  } else {
    fallbackCopyTextToClipboard(text);
  }
}

function fallbackCopyTextToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
    showToast('Message copied to clipboard!', 'success');
  } catch (err) {
    showToast('Failed to copy message', 'error');
  }
  
  document.body.removeChild(textArea);
}

function shareMessage(messageId) {
  const messageEl = document.getElementById(messageId);
  if (!messageEl) return;
  
  const textEl = messageEl.querySelector('.message-text');
  if (!textEl) return;
  
  const text = textEl.textContent || textEl.innerText;
  
  if (navigator.share) {
    navigator.share({
      title: 'Henotace AI Tutor Response',
      text: text,
      url: window.location.href
    }).catch(() => {
      fallbackShare(text);
    });
  } else {
    fallbackShare(text);
  }
}

function fallbackShare(text) {
  const shareText = `Check out this AI tutor response:\n\n${text}\n\nShared from Henotace AI Tutor`;
  
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('Message text copied for sharing!', 'success');
    }).catch(() => {
      showToast('Failed to prepare message for sharing', 'error');
    });
  } else {
    showToast('Sharing not supported on this device', 'warning');
  }
}

async function regenerateMessage(messageId) {
  const messageEl = document.getElementById(messageId);
  if (!messageEl) return;
  
  // Find the user message that preceded this AI response
  const allMessages = Array.from(chatEl.children);
  const currentIndex = allMessages.indexOf(messageEl);
  
  if (currentIndex === -1 || currentIndex === 0) {
    showToast('Cannot regenerate: no previous user message found', 'error');
    return;
  }
  
  // Look for the user message
  let userMessage = null;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (allMessages[i].classList.contains('user')) {
      userMessage = allMessages[i];
      break;
    }
  }
  
  if (!userMessage) {
    showToast('Cannot regenerate: no previous user message found', 'error');
    return;
  }
  
  const userText = userMessage.querySelector('.message-text').textContent;
  
  // Show regenerating indicator
  const regenerateBtn = messageEl.querySelector('[onclick*="regenerateMessage"]');
  const originalText = regenerateBtn.innerHTML;
  regenerateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Regenerating...';
  regenerateBtn.disabled = true;
  
  try {
    // Send the same user message again
    const response = await fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': localStorage.getItem('henotace_api_key') || ''
      },
      body: JSON.stringify({
        sessionId: currentSessionId,
        message: userText
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to regenerate message');
    }
    
    const data = await response.json();
    
    // Update the message content
    const textEl = messageEl.querySelector('.message-text');
    textEl.innerHTML = formatMessageText(data.reply || 'No response from server');
    
    showToast('Message regenerated!', 'success');
    
  } catch (error) {
    console.error('Error regenerating message:', error);
    showToast('Failed to regenerate message', 'error');
  } finally {
    regenerateBtn.innerHTML = originalText;
    regenerateBtn.disabled = false;
  }
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar) {
    sidebar.classList.toggle('active');
    
    if (overlay) {
      overlay.classList.toggle('active');
    }
    
    // Prevent body scroll when sidebar is open on mobile
    if (window.innerWidth <= 1024) {
      document.body.classList.toggle('overflow-hidden');
    }
  }
}

// Close sidebar when clicking overlay
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (sidebar && overlay) {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }
}

function toggleSettings() {
  const settingsModal = document.getElementById('settings-modal');
  if (settingsModal) {
    settingsModal.classList.toggle('active');
    document.body.classList.toggle('overflow-hidden');
    
    // Load current settings when opening the modal
    if (settingsModal.classList.contains('active')) {
      loadSettings();
    }
  }
}

function saveSettings() {
  const settings = {
    apiKey: document.getElementById('api-key').value.trim(),
    theme: document.body.classList.contains('dark-theme') ? 'dark' : 'light'
  };
  
  if (!settings.apiKey) {
    showToast('Please enter an API key', 'error');
    return false;
  }
  
  localStorage.setItem('henotace_settings', JSON.stringify(settings));
  localStorage.setItem('henotace_api_key', settings.apiKey);
  showToast('Settings saved successfully', 'success');
  
  // Apply settings
  checkApiKey();
  
  // Close settings modal
  toggleSettings();
  return true;
}

function toggleApiKeyVisibility() {
  const apiKeyInput = document.getElementById('api-key');
  const toggleBtn = document.getElementById('toggle-api-key');
  
  if (apiKeyInput && toggleBtn) {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleBtn.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      apiKeyInput.type = 'password';
      toggleBtn.innerHTML = '<i class="fas fa-eye"></i>';
    }
  }
}

function loadSettings() {
  const savedSettings = JSON.parse(localStorage.getItem('henotace_settings') || '{}');
  
  // Apply saved settings or defaults
  if (apiKeyInput) {
    apiKeyInput.value = savedSettings.apiKey || '';
  }
  
  // Theme
  const theme = savedSettings.theme || 'light';
  applyTheme(theme);
}

function checkApiKey() {
  const settings = JSON.parse(localStorage.getItem('henotace_settings') || '{}');
  const hasApiKey = !!(settings && settings.apiKey);
  
  // Enable/disable chat input based on API key
  if (input) {
    input.disabled = !hasApiKey;
    if (sendBtn) {
      sendBtn.disabled = !hasApiKey;
    }
    
    if (!hasApiKey) {
      input.placeholder = 'Please set your API key in settings to start chatting';
    } else {
      input.placeholder = 'Type your message...';
    }
  }
  
  return hasApiKey;
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
  } else {
    document.body.classList.remove('dark-theme');
  }
}

function autoResizeTextarea() {
  if (input) {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
  }
}

function saveSessions() {
  localStorage.setItem('sessions', JSON.stringify(sessions));
}

async function loadSessionsFromServer() {
  try {
    const apiKey = localStorage.getItem('henotace_api_key');
    if (!apiKey) {
      console.log('No API key found, using localStorage sessions');
      sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
      return;
    }

    const response = await fetch('/api/sessions', {
      headers: {
        'X-API-Key': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.sessions) {
        sessions = data.sessions;
        // Save to localStorage as backup
        localStorage.setItem('sessions', JSON.stringify(sessions));
        console.log(`Loaded ${sessions.length} sessions from server`);
      }
    } else {
      console.log('Failed to load sessions from server, using localStorage');
      sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
    }
  } catch (error) {
    console.error('Error loading sessions from server:', error);
    sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  }
}

function loadSessions() {
  sessions = JSON.parse(localStorage.getItem('sessions') || '[]');
  renderSessionsList();
}

function renderSessionsList() {
  const sessionsList = document.getElementById('sessions-list');
  const noSessionsEl = document.querySelector('.no-sessions');
  
  if (!sessionsList) return;
  
  if (sessions.length === 0) {
    if (noSessionsEl) {
      noSessionsEl.style.display = 'block';
    }
    sessionsList.innerHTML = '';
    return;
  }
  
  if (noSessionsEl) {
    noSessionsEl.style.display = 'none';
  }
  
  sessionsList.innerHTML = sessions.map(session => `
    <div class="session-item ${session.id === currentSessionId ? 'active' : ''}" 
         data-session-id="${session.id}">
      <div class="session-icon">
        <i class="fas fa-comment-dots"></i>
      </div>
      <div class="session-details">
        <div class="session-title">${session.name || session.subject}</div>
        <div class="session-preview">${session.lastMessage || 'No messages yet'}</div>
        <div class="session-meta">
          <span class="session-time">${formatRelativeTime(session.createdAt)}</span>
          ${session.unread > 0 ? `<span class="unread-count">${session.unread}</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
  
  // Add click handlers to session items
  document.querySelectorAll('.session-item').forEach(item => {
    item.addEventListener('click', () => {
      const sessionId = item.dataset.sessionId;
      loadSession(sessionId);
    });
  });
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now - date;
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMins < 1) return 'Just now';
  if (diffInMins < 60) return `${diffInMins}m ago`;
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function updateLastMessage(sessionId, message) {
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.lastMessage = message.length > 50 ? message.substring(0, 50) + '...' : message;
    saveSessions();
    renderSessionsList();
  }
}

function loadSession(sessionId) {
  currentSessionId = sessionId;
  localStorage.setItem('currentSessionId', sessionId);
  
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    // Update header
    const currentTutorEl = document.getElementById('current-tutor');
    if (currentTutorEl) {
      currentTutorEl.textContent = session.name || session.subject;
    }
    
    // Hide welcome screen and show chat
    hideWelcomeScreen();
    
    // Clear current messages and load session messages
    if (chatEl) {
      chatEl.innerHTML = '';
    }
    
    // Load chat history for this session
    loadChatHistory(sessionId);
    
    // Update active session in sidebar
    renderSessionsList();
  }
}

async function loadChatHistory(sessionId) {
  try {
    const response = await fetch(`/api/chat/${sessionId}`, {
      headers: {
        'X-API-Key': localStorage.getItem('henotace_api_key') || ''
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.messages && data.messages.length > 0) {
        data.messages.forEach(msg => {
          appendMessage(msg.content, msg.role === 'user' ? 'user' : 'ai');
        });
      }
    }
  } catch (error) {
    console.error('Error loading chat history:', error);
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}
