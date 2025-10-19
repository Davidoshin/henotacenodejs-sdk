/**
 * Test script for classwork generation integration
 */

const axios = require('axios');

async function testClassworkGeneration() {
    console.log('🧪 Testing Classwork Generation Integration\n');
    
    const apiKey = 'henotace_dev_WiYGGqY1LnXWJiDGfDi0cXHk27mlOBII';
    const baseUrl = 'https://api.djtconcept.ng';
    
    try {
        // Test 1: Check API status
        console.log('📡 Test 1: Checking API status...');
        try {
            const statusResponse = await axios.get(`${baseUrl}/api/external/working/status/`, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            console.log('✅ API Status:', statusResponse.data);
        } catch (error) {
            console.log('❌ API Status failed:', error.response?.data || error.message);
        }
        
        // Test 2: Test generate tutor prompt endpoint (alternative to content generation)
        console.log('\n📝 Test 2: Testing generate tutor prompt endpoint...');
        try {
            const promptResponse = await axios.post(`${baseUrl}/api/generate-tutor-prompt/`, {
                subject: 'mathematics',
                topic: 'algebra',
                chat_history: [],
                prompt_type: 'classwork'
            }, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('✅ Generate Tutor Prompt Response:', JSON.stringify(promptResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Generate Tutor Prompt failed:', error.response?.data || error.message);
        }
        
        // Test 3: Test save classwork endpoint
        console.log('\n💾 Test 3: Testing save classwork endpoint...');
        try {
            const saveResponse = await axios.post(`${baseUrl}/api/external/ai-tutor/save-classwork-questions/`, {
                student_id: 'test_student_123',
                subject: 'mathematics',
                topic: 'algebra',
                class_level: 'ss1',
                questions: [
                    {
                        id: 1,
                        question: 'What is 2 + 2?',
                        correct_answer: '4',
                        points: 5
                    },
                    {
                        id: 2,
                        question: 'What is 3 * 3?',
                        correct_answer: '9',
                        points: 5
                    }
                ],
                total_points: 10,
                context: 'Test classwork save',
                chat_history: []
            }, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('✅ Save Classwork Response:', JSON.stringify(saveResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Save Classwork failed:', error.response?.data || error.message);
        }
        
        // Test 4: Test chat completion endpoint (for comparison)
        console.log('\n💬 Test 4: Testing chat completion endpoint...');
        try {
            const chatResponse = await axios.post(`${baseUrl}/api/external/working/chat/completion/`, {
                history: [],
                input: 'Hello, can you help me with math?',
                subject: 'mathematics',
                topic: 'algebra',
                preset: 'tutor_default'
            }, {
                headers: {
                    'X-API-Key': apiKey,
                    'Content-Type': 'application/json'
                },
                timeout: 30000
            });
            console.log('✅ Chat Completion Response:', JSON.stringify(chatResponse.data, null, 2));
        } catch (error) {
            console.log('❌ Chat Completion failed:', error.response?.data || error.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testClassworkGeneration();
