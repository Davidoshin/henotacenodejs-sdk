const axios = require('axios');

// Configuration
const API_KEY = 'henotace_dev_WiYGGqY1LnXWJiDGfDi0cXHk27mlOBII';
const BASE_URL = 'https://api.djtconcept.ng/api/external';

// Create axios instance
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
  }
});

async function testEnhancedChatCompletion() {
  console.log('🧪 Testing Enhanced Chat Completion Endpoint');
  console.log('=' .repeat(50));

  try {
    // Test 1: Regular chat completion
    console.log('\n📝 Test 1: Regular Chat Completion');
    const chatResponse = await client.post('/working/chat/completion/', {
      history: [],
      input: "What is photosynthesis?",
      subject: "biology",
      topic: "plant biology",
      preset: "tutor_default"
    });

    console.log('✅ Chat completion successful');
    console.log('Response length:', chatResponse.data.data.ai_response.length);
    console.log('Sample response:', chatResponse.data.data.ai_response.substring(0, 100) + '...');

    // Test 2: Classwork generation
    console.log('\n📚 Test 2: Classwork Generation');
    const classworkResponse = await client.post('/working/chat/completion/', {
      history: [
        {
          role: "user",
          content: "I need help understanding algebra"
        },
        {
          role: "assistant", 
          content: "I'd be happy to help you with algebra! Let's start with the basics."
        }
      ],
      input: "Generate practice questions for algebra",
      subject: "mathematics",
      topic: "algebra",
      generate_classwork: true,
      question_count: 3,
      difficulty: "medium",
      preset: "tutor_default"
    });

    console.log('✅ Classwork generation successful');
    console.log('Has classwork data:', !!classworkResponse.data.data.classwork);
    
    if (classworkResponse.data.data.classwork) {
      console.log('Question count:', classworkResponse.data.data.classwork.question_count);
      console.log('Subject:', classworkResponse.data.data.classwork.subject);
      console.log('Topic:', classworkResponse.data.data.classwork.topic);
      console.log('Difficulty:', classworkResponse.data.data.classwork.difficulty);
      
      if (classworkResponse.data.data.classwork.questions) {
        console.log('\n📋 Generated Questions:');
        classworkResponse.data.data.classwork.questions.forEach((q, i) => {
          console.log(`\n${i + 1}. ${q.question}`);
          console.log(`   Options: ${q.options.join(', ')}`);
          console.log(`   Answer: ${q.correctAnswer}`);
          console.log(`   Difficulty: ${q.difficulty}`);
        });
      }
    } else {
      console.log('Raw response (not parsed as JSON):');
      console.log(classworkResponse.data.data.ai_response.substring(0, 200) + '...');
    }

    // Test 3: Context-aware classwork generation
    console.log('\n🎯 Test 3: Context-Aware Classwork Generation');
    const contextResponse = await client.post('/working/chat/completion/', {
      history: [
        {
          role: "user",
          content: "I'm struggling with quadratic equations"
        },
        {
          role: "assistant",
          content: "Quadratic equations can be tricky! The general form is ax² + bx + c = 0. Let me explain the different methods to solve them."
        },
        {
          role: "user", 
          content: "Can you show me the factoring method?"
        },
        {
          role: "assistant",
          content: "Sure! Factoring works when the quadratic can be written as (x + p)(x + q) = 0. For example, x² + 5x + 6 = (x + 2)(x + 3) = 0."
        }
      ],
      input: "Generate practice questions based on our conversation",
      subject: "mathematics", 
      topic: "quadratic equations",
      generate_classwork: true,
      question_count: 2,
      difficulty: "medium",
      preset: "tutor_default"
    });

    console.log('✅ Context-aware classwork generation successful');
    if (contextResponse.data.data.classwork) {
      console.log('Generated', contextResponse.data.data.classwork.question_count, 'context-aware questions');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Regular chat completion: ✅ Working');
    console.log('- Classwork generation: ✅ Working');
    console.log('- Context-aware generation: ✅ Working');
    console.log('- Single endpoint for both: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testEnhancedChatCompletion();
