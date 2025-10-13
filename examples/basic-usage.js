#!/usr/bin/env node

/**
 * Henotace AI SDK - Programmatic Usage Example
 * 
 * This script demonstrates how to use the Henotace AI SDK programmatically
 * to create tutors and have conversations with AI.
 * 
 * Usage: node examples/basic-usage.js <your_api_key>
 */

const { HenotaceAI, createTutor } = require('../dist/index.js');
const InMemoryConnector = require('../dist/connectors/inmemory.js');

async function main() {
  // Get API key from command line arguments
  const apiKey = process.argv[2];
  
  if (!apiKey) {
    console.error('❌ Please provide your API key as an argument');
    console.error('');
    console.error('Usage: node examples/basic-usage.js <your_api_key>');
    console.error('');
    console.error('Example: node examples/basic-usage.js sk-1234567890abcdef');
    console.error('');
    console.error('🔑 Get your API key from: https://djtconcept.ng/dashboard');
    process.exit(1);
  }

  console.log('🎓 Henotace AI SDK - Programmatic Usage Example');
  console.log('===============================================');
  console.log('');

  try {
    // Initialize the SDK
    console.log('🔧 Initializing Henotace AI SDK...');
    const sdk = new HenotaceAI({
      apiKey: apiKey,
      storage: new InMemoryConnector()
    });

    // Check API status
    console.log('📡 Checking API status...');
    const status = await sdk.getStatusOk();
    if (!status) {
      console.error('❌ API is not available. Please check your API key and network connection.');
      process.exit(1);
    }
    console.log('✅ API is available');

    // Create a tutor
    console.log('👨‍🏫 Creating a math tutor...');
    const tutor = await createTutor(sdk, {
      studentId: 'demo_student',
      tutorId: 'math_tutor',
      tutorName: 'Math Tutor',
      subject: {
        id: 'mathematics',
        name: 'Mathematics',
        topic: 'algebra'
      },
      grade_level: 'high_school',
      language: 'en'
    });

    console.log('✅ Tutor created successfully');
    console.log('');

    // Have a conversation
    console.log('💬 Starting conversation with the AI tutor...');
    console.log('');

    const questions = [
      'Hello! Can you help me understand quadratic equations?',
      'What is the quadratic formula?',
      'Can you show me an example of solving x² + 5x + 6 = 0?',
      'Thank you for the explanation!'
    ];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      console.log(`👤 Student: ${question}`);
      
      try {
        const response = await tutor.send(question);
        console.log(`🤖 AI Tutor: ${response}`);
        console.log('');
      } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        console.log('');
      }
    }

    // Show chat history
    console.log('📚 Chat History:');
    console.log('================');
    const history = await tutor.history();
    history.forEach((chat, index) => {
      const sender = chat.isReply ? '🤖 AI Tutor' : '👤 Student';
      console.log(`${index + 1}. ${sender}: ${chat.message}`);
    });

    console.log('');
    console.log('✅ Demo completed successfully!');
    console.log('');
    console.log('🎯 Next steps:');
    console.log('   • Try the interactive web demo: cd examples/simple-ui && ./start-demo.sh your_api_key');
    console.log('   • Explore the SDK documentation in the README');
    console.log('   • Build your own AI tutoring application!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the example
main().catch(console.error);
