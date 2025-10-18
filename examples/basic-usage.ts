/**
 * Basic usage example for Henotace AI SDK
 */

import { HenotaceAI, createTutor, LogLevel, InMemoryConnector } from '../src/index';

async function basicUsageExample() {
  // Initialize the SDK with storage and logging enabled
  const sdk = new HenotaceAI({
    apiKey: 'your-api-key-here',
    baseUrl: 'https://api.djtconcept.ng', // or 'http://localhost:8000' for development
    storage: new InMemoryConnector(),
    logging: {
      enabled: true,
      level: LogLevel.DEBUG // Enable detailed logging
    }
  });

  try {
    // Create a math tutor for a student
    console.log('Creating math tutor...');
    const tutor = await createTutor(sdk, {
      studentId: 'student_123',
      tutorId: 'math_tutor_1',
      tutorName: 'Math Tutor',
      subject: { 
        id: 'mathematics', 
        name: 'Mathematics', 
        topic: 'algebra' 
      },
      grade_level: 'grade_10',
      language: 'en'
    });
    console.log('Tutor created:', tutor.ids);

    // Set some context for the tutor
    tutor.setContext([
      'We are working on quadratic equations',
      'The student is in grade 10',
      'Focus on step-by-step problem solving'
    ]);

    // Set a persona for the tutor
    tutor.setPersona('You are a patient and encouraging math tutor who explains concepts clearly and provides step-by-step solutions.');

    // Send a chat message
    console.log('\nSending chat message...');
    const response1 = await tutor.send('Can you help me solve this algebra problem: x² + 5x + 6 = 0?');
    console.log('AI Response:', response1);

    // Continue the conversation
    console.log('\nContinuing conversation...');
    const response2 = await tutor.send('I understand the factoring method. Can you show me the quadratic formula approach?');
    console.log('AI Response:', response2);

    // Get chat history
    console.log('\nChat history:');
    const history = await tutor.history();
    history.forEach((chat, index) => {
      console.log(`${index + 1}. ${chat.isReply ? 'AI' : 'Student'}: ${chat.message}`);
    });

    // Create another tutor for a different subject
    console.log('\nCreating science tutor...');
    const scienceTutor = await createTutor(sdk, {
      studentId: 'student_123',
      tutorId: 'science_tutor_1',
      tutorName: 'Science Tutor',
      subject: { 
        id: 'physics', 
        name: 'Physics', 
        topic: 'mechanics' 
      }
    });

    const scienceResponse = await scienceTutor.send('Explain Newton\'s first law of motion');
    console.log('Science AI Response:', scienceResponse);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample();
}
