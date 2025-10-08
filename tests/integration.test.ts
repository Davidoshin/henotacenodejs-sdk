/**
 * Integration Tests for Henotace AI SDK
 * These tests require a running API server
 */

import HenotaceAI, { createTutor } from '../src/index';

const RUN_INTEGRATION = process.env.RUN_INTEGRATION === '1' || true;

(RUN_INTEGRATION ? describe : describe.skip)('HenotaceAI Integration Tests', () => {
  let sdk: HenotaceAI;
  const testApiKey = process.env.HENOTACE_API_KEY || 'henotace_dev_yeug103ygwmNcg8Iw6RZPjWlu1ziMsR1';
  const testBaseUrl = process.env.HENOTACE_BASE_URL || 'http://localhost:8000/';

  beforeAll(() => {
    sdk = new HenotaceAI({
      apiKey: testApiKey,
      baseUrl: testBaseUrl
    });
  });

  describe('API Status Integration', () => {
    test('should connect to API server', async () => {
      try {
        const result = await sdk.getStatus();
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      } catch (error) {
        console.error('Integration test failed:', error);
        throw error; // Let the test fail instead of skipping
      }
    }, 10000);
  });

  describe('Chat Completion Integration', () => {
    test('should chat with tutor using chat completion API', async () => {
      try {
        const tutor = await createTutor(sdk, {
          studentId: 'integration_test_student',
          tutorId: 'math_tutor',
          tutorName: 'Math Tutor',
          subject: { id: 'math', name: 'mathematics', topic: 'algebra' },
          grade_level: 'grade_10',
          language: 'en'
        });
        tutor.setPersona('Friendly and encouraging');
        tutor.setContext(['Key formula: a^2 + b^2 = c^2']);
        const ai = await tutor.send('Hello, can you help me with algebra?');
        expect(typeof ai).toBe('string');
        expect(ai.length).toBeGreaterThan(0);
      } catch (error) {
        console.error('Integration test failed:', error);
        throw error; // Let the test fail instead of skipping
      }
    }, 15000);
  });
});
