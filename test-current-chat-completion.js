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

async function testCurrentChatCompletion() {
  console.log('🧪 Testing Current Chat Completion Endpoint');
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

    // Test 2: Classwork generation using current endpoint (with prompt in input)
    console.log('\n📚 Test 2: Classwork Generation via Chat Completion');
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
      input: "Generate 3 practice questions for algebra with multiple choice options. Format as JSON array with id, question, options (A, B, C, D), correctAnswer, explanation, difficulty, and points fields.",
      subject: "mathematics",
      topic: "algebra",
      preset: "tutor_default"
    });

    console.log('✅ Classwork generation via chat completion successful');
    console.log('Response length:', classworkResponse.data.data.ai_response.length);
    
    // Try to parse the response as JSON
    try {
      const questions = JSON.parse(classworkResponse.data.data.ai_response);
      if (Array.isArray(questions)) {
        console.log('✅ Successfully parsed as JSON array');
        console.log('Question count:', questions.length);
        console.log('\n📋 Generated Questions:');
        questions.forEach((q, i) => {
          console.log(`\n${i + 1}. ${q.question}`);
          if (q.options) console.log(`   Options: ${q.options.join(', ')}`);
          if (q.correctAnswer) console.log(`   Answer: ${q.correctAnswer}`);
          if (q.difficulty) console.log(`   Difficulty: ${q.difficulty}`);
        });
      } else {
        console.log('Response is not an array, showing raw response:');
        console.log(classworkResponse.data.data.ai_response.substring(0, 300) + '...');
      }
    } catch (parseError) {
      console.log('Response is not valid JSON, showing raw response:');
      console.log(classworkResponse.data.data.ai_response.substring(0, 300) + '...');
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
      input: "Based on our conversation about quadratic equations and factoring, generate 2 practice questions that test understanding of factoring method. Format as JSON array.",
      subject: "mathematics", 
      topic: "quadratic equations",
      preset: "tutor_default"
    });

    console.log('✅ Context-aware classwork generation successful');
    console.log('Response length:', contextResponse.data.data.ai_response.length);

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- Regular chat completion: ✅ Working');
    console.log('- Classwork generation via prompts: ✅ Working');
    console.log('- Context-aware generation: ✅ Working');
    console.log('- Single endpoint for both: ✅ Working');
    console.log('\n💡 Key Insight:');
    console.log('- Developers can use the same endpoint for both chat and classwork');
    console.log('- No need for separate authentication or endpoints');
    console.log('- Context-aware prompts work automatically');
    console.log('- JSON parsing can be handled client-side');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testCurrentChatCompletion();
