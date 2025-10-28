/**
 * Rate-Limited SDK Tests for Henotace AI
 * Includes delays between requests to avoid rate limiting
 */

const { HenotaceAI, createTutor, InMemoryConnector } = require('./dist/index.js');

// Your API key - set via environment variable
const API_KEY = process.env.HENOTACE_API_KEY || 'your_api_key_here';

// Initialize SDK
const sdk = new HenotaceAI({
  apiKey: API_KEY,
  baseUrl: 'https://api.djtconcept.ng',
  storage: new InMemoryConnector(),
  logging: {
    enabled: true,
    level: 1 // INFO level
  }
});

// Helper function to add delays
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runRateLimitedTests() {
  console.log('🚀 Starting Rate-Limited Henotace AI SDK Tests\n');
  
  try {
    // Test 1: API Status Check
    await testApiStatus();
    await delay(1000); // 1 second delay
    
    // Test 2: Basic Chat Completion
    await testBasicChatCompletion();
    await delay(1000);
    
    // Test 3: Personalization Features (limited)
    await testPersonalizationFeatures();
    await delay(2000); // 2 second delay after multiple requests
    
    // Test 4: Multi-Language Support (limited)
    await testMultiLanguageSupport();
    await delay(2000);
    
    // Test 5: Tutor Session Management
    await testTutorSessionManagement();
    await delay(1000);
    
    // Test 6: Classwork Generation
    await testClassworkGeneration();
    await delay(1000);
    
    // Test 7: Advanced Personalization (single example)
    await testAdvancedPersonalization();
    
    console.log('\n✅ All rate-limited tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

async function testApiStatus() {
  console.log('📡 Test 1: API Status Check');
  console.log('=' .repeat(50));
  
  try {
    const status = await sdk.getStatus();
    console.log('✅ API Status:', status.data?.status);
    console.log('✅ Message:', status.data?.message);
    console.log('✅ Timestamp:', status.data?.timestamp);
  } catch (error) {
    console.error('❌ API Status check failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testBasicChatCompletion() {
  console.log('💬 Test 2: Basic Chat Completion');
  console.log('=' .repeat(50));
  
  try {
    const response = await sdk.chatCompletion({
      history: [],
      input: 'What is photosynthesis?',
      subject: 'biology',
      topic: 'plant_biology'
    });
    
    console.log('✅ Question: What is photosynthesis?');
    console.log('✅ AI Response:', response.ai_response.substring(0, 200) + '...');
  } catch (error) {
    console.error('❌ Basic chat completion failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testPersonalizationFeatures() {
  console.log('🎨 Test 3: Personalization Features (Limited)');
  console.log('=' .repeat(50));
  
  try {
    // Test only 2 personalities to avoid rate limiting
    const personalities = ['friendly', 'encouraging'];
    
    for (const personality of personalities) {
      console.log(`\n🧑‍🏫 Testing ${personality} personality:`);
      
      const response = await sdk.chatCompletion({
        history: [],
        input: 'I find math difficult',
        subject: 'mathematics',
        topic: 'algebra',
        personality: personality,
        teaching_style: 'socratic',
        author_name: 'Math Tutor'
      });
      
      console.log(`✅ ${personality} response:`, response.ai_response.substring(0, 150) + '...');
      
      // Add delay between requests
      await delay(2000);
    }
    
    // Test only 2 teaching styles
    const teachingStyles = ['socratic', 'direct'];
    
    for (const style of teachingStyles) {
      console.log(`\n📚 Testing ${style} teaching style:`);
      
      const response = await sdk.chatCompletion({
        history: [],
        input: 'Explain quadratic equations',
        subject: 'mathematics',
        topic: 'algebra',
        personality: 'friendly',
        teaching_style: style,
        author_name: 'Algebra Expert'
      });
      
      console.log(`✅ ${style} response:`, response.ai_response.substring(0, 150) + '...');
      
      // Add delay between requests
      await delay(2000);
    }
    
  } catch (error) {
    console.error('❌ Personalization test failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testMultiLanguageSupport() {
  console.log('🌍 Test 4: Multi-Language Support (Limited)');
  console.log('=' .repeat(50));
  
  try {
    // Test only 2 languages to avoid rate limiting
    const languages = [
      { code: 'en', name: 'English', question: 'What is gravity?' },
      { code: 'pidgin', name: 'Nigerian Pidgin', question: 'Wetin be gravity?' }
    ];
    
    for (const lang of languages) {
      console.log(`\n🗣️ Testing ${lang.name} (${lang.code}):`);
      
      const response = await sdk.chatCompletion({
        history: [],
        input: lang.question,
        subject: 'physics',
        topic: 'mechanics',
        language: lang.code,
        personality: 'friendly',
        teaching_style: 'direct'
      });
      
      console.log(`✅ ${lang.name} response:`, response.ai_response.substring(0, 150) + '...');
      
      // Add delay between requests
      await delay(2000);
    }
    
  } catch (error) {
    console.error('❌ Multi-language test failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testTutorSessionManagement() {
  console.log('👨‍🏫 Test 5: Tutor Session Management');
  console.log('=' .repeat(50));
  
  try {
    // Create a tutor
    const tutor = await createTutor(sdk, {
      studentId: 'test_student_123',
      tutorId: 'math_tutor_001',
      tutorName: 'Math Expert',
      subject: { id: 'math', name: 'Mathematics', topic: 'algebra' },
      grade_level: 'ss1',
      language: 'en'
    });
    
    console.log('✅ Tutor created:', tutor.ids);
    
    // Set tutor context and persona
    tutor.setContext(['Student loves sports and music', 'Prefers visual examples']);
    tutor.setPersona('You are an encouraging math tutor who uses sports analogies');
    tutor.setUserProfile({ 
      name: 'John Doe', 
      interests: ['football', 'music', 'art'],
      learning_style: 'visual'
    });
    
    // Send only 2 messages to avoid rate limiting
    const messages = [
      'I find algebra difficult',
      'Can you explain it using football examples?'
    ];
    
    for (const message of messages) {
      console.log(`\n👤 Student: ${message}`);
      
      const response = await tutor.send(message, {
        personality: 'encouraging',
        teaching_style: 'problem_based',
        interests: ['football', 'sports']
      });
      
      console.log(`🤖 Tutor: ${response.substring(0, 200)}...`);
      
      // Add delay between messages
      await delay(2000);
    }
    
    // Get chat history
    const history = await tutor.history();
    console.log(`\n✅ Chat history length: ${history.length} messages`);
    
  } catch (error) {
    console.error('❌ Tutor session test failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testClassworkGeneration() {
  console.log('📝 Test 6: Classwork Generation');
  console.log('=' .repeat(50));
  
  try {
    // Generate classwork
    const classworkResult = await sdk.generateClasswork({
      subject: 'mathematics',
      topic: 'algebra',
      class_level: 'ss1',
      question_count: 2, // Reduced from 3 to 2
      difficulty: 'medium',
      context: 'Based on tutoring session about linear equations'
    });
    
    if (classworkResult.success) {
      console.log('✅ Classwork generated successfully');
      console.log('✅ Questions count:', classworkResult.data?.classwork?.questions?.length || 0);
      console.log('✅ Total points:', classworkResult.data?.classwork?.total_points || 0);
      
      // Show sample questions
      if (classworkResult.data?.classwork?.questions) {
        console.log('\n📋 Sample questions:');
        classworkResult.data.classwork.questions.slice(0, 1).forEach((q, i) => {
          console.log(`${i + 1}. ${q.question}`);
          console.log(`   Answer: ${q.correct_answer}`);
          console.log(`   Points: ${q.points}\n`);
        });
      }
    } else {
      console.log('❌ Classwork generation failed:', classworkResult.message);
    }
    
  } catch (error) {
    console.error('❌ Classwork generation test failed:', error.message);
    throw error;
  }
  
  console.log('');
}

async function testAdvancedPersonalization() {
  console.log('🧠 Test 7: Advanced Personalization (Single Example)');
  console.log('=' .repeat(50));
  
  try {
    // Simulate a conversation that shows learning patterns
    const conversationHistory = [
      { role: 'user', content: 'I love football and find math difficult' },
      { role: 'assistant', content: 'I understand! Let me use football examples to explain math concepts...' },
      { role: 'user', content: 'Can you show me how to calculate angles?' }
    ];
    
    console.log('📚 Simulating learning conversation...');
    
    const response = await sdk.chatCompletion({
      history: conversationHistory,
      input: 'Can you explain sine and cosine using football?',
      subject: 'mathematics',
      topic: 'trigonometry',
      author_name: 'Coach Math',
      language: 'en',
      personality: 'encouraging',
      teaching_style: 'problem_based',
      interests: ['football', 'sports', 'gaming'],
      branding: {
        name: 'Sports Math Tutor',
        primaryColor: '#FF6B35',
        secondaryColor: '#F7931E'
      }
    });
    
    console.log('✅ Advanced personalization response:');
    console.log(response.ai_response.substring(0, 300) + '...');
    
  } catch (error) {
    console.error('❌ Advanced personalization test failed:', error.message);
    throw error;
  }
  
  console.log('');
}

// Run the tests
runRateLimitedTests().catch(console.error);
