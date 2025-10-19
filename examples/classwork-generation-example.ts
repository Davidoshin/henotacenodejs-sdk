/**
 * Henotace AI SDK - Classwork Generation Example (TypeScript)
 * ==========================================================
 * 
 * This example demonstrates how to use the enhanced Henotace AI SDK
 * to generate context-aware classwork from chat conversations.
 */

import { HenotaceAI, createTutor, ClassworkGenerationRequest, ClassworkData } from '../src/index';

async function classworkGenerationExample(): Promise<void> {
    console.log('🚀 Henotace AI SDK - Classwork Generation Example (TypeScript)\n');
    
    // Initialize the SDK
    const apiKey = 'henotace_dev_WiYGGqY1LnXWJiDGfDi0cXHk27mlOBII'; // Replace with your API key
    const sdk = new HenotaceAI({
        apiKey,
        baseUrl: 'https://api.djtconcept.ng',
        timeout: 30000,
        retries: 3,
        logging: {
            level: 1, // INFO level
            enabled: true
        }
    });
    
    try {
        // Check API status
        console.log('📡 Checking API status...');
        const status = await sdk.getStatus();
        console.log(`✅ API Status: ${status.data?.status}`);
        console.log(`📊 Remaining calls: ${await sdk.getRemainingCalls()}\n`);
        
        // Example 1: Generate classwork with chat history
        console.log('📝 Example 1: Generate classwork with chat history');
        const chatHistory = [
            {
                session_id: 'session_123',
                user_message: 'Can you help me understand quadratic equations?',
                ai_response: 'Sure! A quadratic equation is a polynomial equation of degree 2. The general form is ax² + bx + c = 0.',
                timestamp: new Date().toISOString()
            },
            {
                session_id: 'session_123',
                user_message: 'How do I solve x² + 5x + 6 = 0?',
                ai_response: 'Great question! We can solve this by factoring. x² + 5x + 6 = (x + 2)(x + 3) = 0, so x = -2 or x = -3.',
                timestamp: new Date().toISOString()
            }
        ];
        
        const classworkRequest: ClassworkGenerationRequest & { student_id: string } = {
            student_id: 'student_123',
            subject: 'mathematics',
            topic: 'quadratic_equations',
            class_level: 'ss2',
            question_count: 5,
            difficulty: 'medium',
            context: 'Based on tutoring session about quadratic equations and factoring',
            chat_history: chatHistory
        };
        
        console.log('🔄 Generating classwork...');
        const result = await sdk.generateAndSaveClasswork(classworkRequest);
        
        if (result.success && result.data) {
            console.log('✅ Classwork generated and saved successfully!');
            console.log(`📝 Questions generated: ${result.data.classwork.questions.length}`);
            console.log(`📊 Total points: ${result.data.classwork.total_points}`);
            console.log(`🆔 Session ID: ${result.data.session_id}`);
            
            // Display the generated questions
            console.log('\n📋 Generated Questions:');
            result.data.classwork.questions.forEach((question, index) => {
                console.log(`\n${index + 1}. ${question.question}`);
                console.log(`   Answer: ${question.correct_answer} (${question.points} points)`);
            });
        } else {
            console.log('❌ Classwork generation failed:', result.message);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Example 2: Create a tutor and generate classwork from chat
        console.log('📝 Example 2: Generate classwork from tutor chat');
        
        const tutor = await createTutor(sdk, {
            studentId: 'student_456',
            tutorId: 'physics_tutor',
            tutorName: 'Physics Tutor'
        });
        
        // Have a conversation with the tutor
        console.log('💬 Having a conversation with the tutor...');
        await tutor.send('I need help with Newton\'s laws of motion');
        await tutor.send('Can you explain the first law?');
        await tutor.send('What about the second law and F = ma?');
        
        // Generate classwork based on the conversation
        console.log('🔄 Generating classwork from chat history...');
        const tutorClassworkResult = await tutor.generateClassworkFromChat({
            subject: 'physics',
            topic: 'newtons_laws',
            class_level: 'ss1',
            question_count: 4,
            difficulty: 'medium'
        });
        
        if (tutorClassworkResult.success && tutorClassworkResult.data) {
            console.log('✅ Tutor classwork generated successfully!');
            console.log(`📝 Questions: ${tutorClassworkResult.data.classwork.questions.length}`);
            console.log(`📊 Total points: ${tutorClassworkResult.data.classwork.total_points}`);
        } else {
            console.log('❌ Tutor classwork generation failed:', tutorClassworkResult.message);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Example 3: Batch classwork generation
        console.log('📝 Example 3: Batch classwork generation');
        
        const subjects = [
            { subject: 'mathematics', topic: 'algebra', class_level: 'ss1' as const },
            { subject: 'physics', topic: 'mechanics', class_level: 'ss2' as const },
            { subject: 'chemistry', topic: 'organic_chemistry', class_level: 'ss3' as const }
        ];
        
        console.log('🔄 Generating multiple classworks...');
        const batchResults = await Promise.all(
            subjects.map(async ({ subject, topic, class_level }) => {
                const request: ClassworkGenerationRequest & { student_id: string } = {
                    student_id: 'student_789',
                    subject,
                    topic,
                    class_level,
                    question_count: 3,
                    difficulty: 'medium'
                };
                
                const result = await sdk.generateAndSaveClasswork(request);
                return { subject, topic, result };
            })
        );
        
        console.log('\n📊 Batch Results:');
        batchResults.forEach(({ subject, topic, result }) => {
            if (result.success) {
                console.log(`✅ ${subject} (${topic}): ${result.data?.classwork.questions.length} questions generated`);
            } else {
                console.log(`❌ ${subject} (${topic}): ${result.message}`);
            }
        });
        
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`Status Code: ${error.statusCode}`);
        }
        if (error.responseData) {
            console.error('Response Data:', error.responseData);
        }
    }
}

// Run the example
if (require.main === module) {
    classworkGenerationExample();
}

export { classworkGenerationExample };
