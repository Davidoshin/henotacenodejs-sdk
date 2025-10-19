/**
 * 🚀 Henotace AI SDK - Quick Start Example
 * 
 * This example shows how to integrate the Henotace AI SDK into your project
 * with working endpoints and proper error handling.
 */

const axios = require('axios');

class HenotaceClient {
    constructor(apiKey, baseUrl = 'https://api.djtconcept.ng/api/external') {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
        this.headers = {
            'X-API-Key': apiKey,
            'Content-Type': 'application/json'
        };
    }

    async checkStatus() {
        try {
            const response = await axios.get(`${this.baseUrl}/working/status/`, {
                headers: this.headers,
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            throw new Error(`Status check failed: ${error.response?.data?.error || error.message}`);
        }
    }

    async completeChat(history = [], input, subject = 'general', topic = 'general') {
        try {
            const response = await axios.post(`${this.baseUrl}/working/chat/completion/`, {
                history: history,
                input: input,
                subject: subject,
                topic: topic,
                preset: 'tutor_default'
            }, {
                headers: this.headers,
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            throw new Error(`Chat failed: ${error.response?.data?.error || error.message}`);
        }
    }

    async generateClasswork(subject, topic, classLevel, questionCount = 5) {
        try {
            const prompt = `Generate ${questionCount} ${subject} questions for ${classLevel} students on ${topic}. 
            Format each question clearly and provide the correct answer. Make sure the questions are appropriate for the class level.`;
            
            const response = await this.completeChat([], prompt, subject, topic);
            
            // Parse the response to extract questions
            const questions = this.parseQuestions(response.data.ai_response, questionCount);
            
            return {
                success: true,
                subject: subject,
                topic: topic,
                class_level: classLevel,
                questions: questions,
                total_points: questions.length * 10,
                raw_response: response.data.ai_response
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    parseQuestions(response, expectedCount) {
        const lines = response.split('\n');
        const questions = [];
        let currentQuestion = null;
        
        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            
            // Look for question patterns
            if (trimmedLine.match(/^\d+\./) || trimmedLine.includes('?')) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    id: questions.length + 1,
                    question: trimmedLine,
                    correct_answer: '',
                    points: 10
                };
            } else if (currentQuestion && trimmedLine.toLowerCase().includes('answer')) {
                // Extract answer from lines containing "answer"
                currentQuestion.correct_answer = trimmedLine;
            }
        });
        
        // Add the last question if it exists
        if (currentQuestion) {
            questions.push(currentQuestion);
        }
        
        // If we didn't find enough questions, create simple ones from the response
        if (questions.length < expectedCount) {
            const additionalQuestions = this.createSimpleQuestions(response, expectedCount - questions.length);
            questions.push(...additionalQuestions);
        }
        
        return questions.slice(0, expectedCount);
    }

    createSimpleQuestions(response, count) {
        const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const questions = [];
        
        for (let i = 0; i < Math.min(count, sentences.length); i++) {
            questions.push({
                id: questions.length + 1,
                question: sentences[i].trim() + '?',
                correct_answer: 'Answer to be provided by teacher',
                points: 10
            });
        }
        
        return questions;
    }
}

// Example usage
async function quickStartExample() {
    console.log('🚀 Henotace AI SDK - Quick Start Example\n');
    
    // Initialize the client with your API key
    const client = new HenotaceClient('henotace_dev_WiYGGqY1LnXWJiDGfDi0cXHk27mlOBII');
    
    try {
        // 1. Check API status
        console.log('📡 Checking API status...');
        const status = await client.checkStatus();
        console.log('✅ API Status:', status.data.status);
        console.log('📊 Remaining calls:', status.data.api_calls_remaining);
        console.log('👤 Client:', status.data.client);
        console.log('💼 Plan:', status.data.plan);
        
        // 2. Basic chat example
        console.log('\n💬 Basic Chat Example:');
        const chatResponse = await client.completeChat(
            [], 
            "Can you help me solve 2x + 5 = 13?", 
            "mathematics", 
            "algebra"
        );
        console.log('🤖 AI Response:', chatResponse.data.ai_response);
        
        // 3. Classwork generation example
        console.log('\n📝 Classwork Generation Example:');
        const classworkResult = await client.generateClasswork(
            'mathematics',
            'quadratic_equations',
            'ss2',
            3
        );
        
        if (classworkResult.success) {
            console.log('✅ Classwork generated successfully!');
            console.log(`📚 Subject: ${classworkResult.subject}`);
            console.log(`🎯 Topic: ${classworkResult.topic}`);
            console.log(`📊 Class Level: ${classworkResult.class_level}`);
            console.log(`❓ Questions Generated: ${classworkResult.questions.length}`);
            console.log(`🏆 Total Points: ${classworkResult.total_points}`);
            
            console.log('\n📋 Generated Questions:');
            classworkResult.questions.forEach((q, index) => {
                console.log(`\n${index + 1}. ${q.question}`);
                if (q.correct_answer) {
                    console.log(`   Answer: ${q.correct_answer}`);
                }
                console.log(`   Points: ${q.points}`);
            });
        } else {
            console.log('❌ Classwork generation failed:', classworkResult.error);
        }
        
        // 4. Conversational example
        console.log('\n🔄 Conversational Example:');
        let conversationHistory = [];
        
        // First message
        const firstResponse = await client.completeChat(
            conversationHistory,
            "I'm learning about quadratic equations. Can you explain what they are?",
            "mathematics",
            "quadratic_equations"
        );
        console.log('👤 User: I\'m learning about quadratic equations. Can you explain what they are?');
        console.log('🤖 AI:', firstResponse.data.ai_response);
        
        // Add to conversation history
        conversationHistory.push(
            { role: 'user', content: "I'm learning about quadratic equations. Can you explain what they are?" },
            { role: 'assistant', content: firstResponse.data.ai_response }
        );
        
        // Follow-up message
        const followUpResponse = await client.completeChat(
            conversationHistory,
            "Can you give me an example of solving one?",
            "mathematics",
            "quadratic_equations"
        );
        console.log('\n👤 User: Can you give me an example of solving one?');
        console.log('🤖 AI:', followUpResponse.data.ai_response);
        
        console.log('\n🎉 Quick start example completed successfully!');
        
    } catch (error) {
        console.error('❌ Example failed:', error.message);
    }
}

// Run the example
if (require.main === module) {
    quickStartExample();
}

module.exports = { HenotaceClient };
