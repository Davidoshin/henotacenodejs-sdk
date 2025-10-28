/**
 * Quick SDK Test - Basic functionality check
 */

const { HenotaceAI, InMemoryConnector } = require('./dist/index.js');

const API_KEY = process.env.HENOTACE_API_KEY || 'your_api_key_here';

async function quickTest() {
  console.log('🚀 Quick Henotace AI SDK Test\n');
  
  const sdk = new HenotaceAI({
    apiKey: API_KEY,
    baseUrl: 'https://api.djtconcept.ng',
    storage: new InMemoryConnector()
  });
  
  try {
    // 1. Test API status
    console.log('📡 Checking API status...');
    const status = await sdk.getStatus();
    console.log('✅ API is online:', status.data?.status);
    
    // 2. Test basic chat
    console.log('\n💬 Testing basic chat...');
    const response = await sdk.chatCompletion({
      history: [],
      input: 'What is 2 + 2?',
      subject: 'mathematics',
      topic: 'arithmetic'
    });
    console.log('✅ AI Response:', response.ai_response);
    
    // 3. Test personalization
    console.log('\n🎨 Testing personalization...');
    const personalizedResponse = await sdk.chatCompletion({
      history: [],
      input: 'Explain photosynthesis',
      subject: 'biology',
      topic: 'plant_biology',
      personality: 'encouraging',
      teaching_style: 'socratic',
      language: 'en'
    });
    console.log('✅ Personalized Response:', personalizedResponse.ai_response.substring(0, 200) + '...');
    
    // 4. Test Nigerian Pidgin
    console.log('\n🌍 Testing Nigerian Pidgin...');
    const pidginResponse = await sdk.chatCompletion({
      history: [],
      input: 'Wetin be gravity?',
      subject: 'physics',
      topic: 'mechanics',
      language: 'pidgin',
      personality: 'friendly'
    });
    console.log('✅ Pidgin Response:', pidginResponse.ai_response.substring(0, 200) + '...');
    
    console.log('\n✅ All tests passed! SDK is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();
