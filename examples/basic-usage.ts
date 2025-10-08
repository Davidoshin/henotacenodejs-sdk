/**
 * Basic usage example for Henotace AI SDK
 */

import { HenotaceAI } from '../src/index';

async function basicUsageExample() {
  // Initialize the SDK
  const sdk = new HenotaceAI({
    apiKey: 'your-api-key-here',
    baseUrl: 'https://api.djtconcept.ng' // or 'http://localhost:8000' for development
  });

  try {
    // Check API status
    console.log('Checking API status...');
    const status = await sdk.getStatus();
    console.log('API Status:', status);

    // Create a tutoring session
    console.log('\nCreating tutoring session...');
    const session = await sdk.createTutoringSession({
      student_id: 'student_123',
      subject: 'mathematics',
      grade_level: 'grade_10',
      topic: 'algebra',
      language: 'en'
    });
    console.log('Session created:', session);

    // Send a chat message
    console.log('\nSending chat message...');
    const chatResponse = await sdk.sendChatMessage(
      session.data!.session_id,
      'Can you help me solve this algebra problem?',
      'We are working on quadratic equations'
    );
    console.log('Chat response:', chatResponse);

    // Submit an assessment
    console.log('\nSubmitting assessment...');
    const assessment = await sdk.submitAssessment({
      student_id: 'student_123',
      assignment_type: 'quiz',
      subject: 'mathematics',
      questions: [
        {
          id: 1,
          question: 'What is 2 + 2?',
          correct_answer: '4',
          points: 10
        }
      ],
      answers: [
        {
          question_id: 1,
          submitted_answer: '4'
        }
      ]
    });
    console.log('Assessment result:', assessment);

    // Generate educational content
    console.log('\nGenerating content...');
    const content = await sdk.generateContent({
      content_type: 'lesson_plan',
      subject: 'mathematics',
      grade_level: 'grade_10',
      topic: 'quadratic equations',
      requirements: 'Include practice problems and assessment questions'
    });
    console.log('Generated content:', content);

    // Get game questions
    console.log('\nGetting game questions...');
    const questions = await sdk.getGameQuestions(1);
    console.log('Game questions:', questions);

    // Submit game answers
    console.log('\nSubmitting game answers...');
    const gameResult = await sdk.submitGameAnswers({
      game_id: 1,
      student_id: 'student_123',
      answers: [
        {
          question_id: 1,
          answer: 'Paris'
        }
      ]
    });
    console.log('Game result:', gameResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  basicUsageExample();
}
