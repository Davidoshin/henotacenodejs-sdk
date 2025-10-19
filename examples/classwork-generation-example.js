/**
 * Henotace AI SDK - Classwork Generation Example
 * =============================================
 * 
 * This example demonstrates how to use the enhanced Henotace AI SDK
 * to generate context-aware classwork from chat conversations.
 */

const { createClient } = require('../backend/sdks/javascript/henotace-sdk');

async function classworkGenerationExample() {
    console.log('🚀 Henotace AI SDK - Classwork Generation Example\n');
    
    // Initialize the SDK
    const apiKey = 'henotace_dev_WiYGGqY1LnXWJiDGfDi0cXHk27mlOBII'; // Replace with your API key
    const client = createClient(apiKey, 'https://api.djtconcept.ng/api/external');
    
    try {
        // Check API status
        console.log('📡 Checking API status...');
        const status = await client.getStatus();
        console.log(`✅ API Status: ${status.data.status}`);
        console.log(`📊 Remaining calls: ${await client.getRemainingCalls()}\n`);
        
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
        
        const classworkRequest = {
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
        const result = await client.generateAndSaveClasswork(classworkRequest);
        
        if (result.success) {
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
        
        // Example 2: Generate classwork without chat history
        console.log('📝 Example 2: Generate classwork without chat history');
        const simpleRequest = {
            student_id: 'student_456',
            subject: 'physics',
            topic: 'mechanics',
            class_level: 'ss1',
            question_count: 3,
            difficulty: 'easy',
            context: 'Basic mechanics problems for beginners'
        };
        
        console.log('🔄 Generating simple classwork...');
        const simpleResult = await client.generateAndSaveClasswork(simpleRequest);
        
        if (simpleResult.success) {
            console.log('✅ Simple classwork generated successfully!');
            console.log(`📝 Questions: ${simpleResult.data.classwork.questions.length}`);
            console.log(`📊 Total points: ${simpleResult.data.classwork.total_points}`);
        } else {
            console.log('❌ Simple classwork generation failed:', simpleResult.message);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Example 3: Generate classwork only (without saving)
        console.log('📝 Example 3: Generate classwork only (without saving)');
        const generateOnlyRequest = {
            subject: 'chemistry',
            topic: 'organic_chemistry',
            class_level: 'ss3',
            question_count: 4,
            difficulty: 'hard',
            context: 'Advanced organic chemistry problems'
        };
        
        console.log('🔄 Generating classwork (no save)...');
        const generateOnlyResult = await client.generateClasswork(generateOnlyRequest);
        
        if (generateOnlyResult.success) {
            console.log('✅ Classwork generated successfully!');
            console.log(`📝 Questions: ${generateOnlyResult.data.classwork.questions.length}`);
            console.log(`📊 Total points: ${generateOnlyResult.data.classwork.total_points}`);
            console.log('ℹ️  Note: This classwork was not saved to the database');
        } else {
            console.log('❌ Classwork generation failed:', generateOnlyResult.message);
        }
        
    } catch (error) {
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

module.exports = { classworkGenerationExample };
