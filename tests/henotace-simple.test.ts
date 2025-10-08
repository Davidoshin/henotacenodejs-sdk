/**
 * Simplified TDD Tests for Henotace AI SDK
 */

import HenotaceAI from '../src/index';

// Mock axios completely
jest.mock('axios', () => {
  const mockAxiosInstance = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    defaults: { baseURL: 'https://api.test.com' }
  };

  return {
    create: jest.fn(() => mockAxiosInstance),
    default: mockAxiosInstance
  };
});

describe('HenotaceAI SDK - Simplified Tests', () => {
  let sdk: HenotaceAI;
  const mockApiKey = 'test-api-key-123';

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new HenotaceAI({
      apiKey: mockApiKey,
      baseUrl: 'https://api.test.com'
    });
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with provided configuration', () => {
      const config = {
        apiKey: 'test-key',
        baseUrl: 'https://custom.api.com',
        timeout: 5000,
        retries: 2
      };
      
      const customSdk = new HenotaceAI(config);
      const sdkConfig = customSdk.getConfig();
      
      expect(sdkConfig.apiKey).toBe('test-key');
      expect(sdkConfig.baseUrl).toBe('https://custom.api.com');
      expect(sdkConfig.timeout).toBe(5000);
      expect(sdkConfig.retries).toBe(2);
    });

    test('should use default configuration when not provided', () => {
      const sdk = new HenotaceAI({ apiKey: 'test-key' });
      const config = sdk.getConfig();
      
      expect(config.baseUrl).toBe('https://api.djtconcept.ng');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
    });

    test('should set custom base URL', () => {
      const newUrl = 'https://new.api.com';
      sdk.setBaseUrl(newUrl);
      
      // We can't directly test the internal client, but we can test the config
      expect(sdk.getConfig().baseUrl).toBe(newUrl); // Should be the new URL
    });
  });

  describe('Configuration Methods', () => {
    test('should return current configuration', () => {
      const config = sdk.getConfig();
      
      expect(config.apiKey).toBe(mockApiKey);
      expect(config.baseUrl).toBe('https://api.test.com');
      expect(config.timeout).toBe(30000);
      expect(config.retries).toBe(3);
    });
  });

  describe('Error Handling', () => {
    test('should handle missing API key gracefully', () => {
      expect(() => {
        new HenotaceAI({ apiKey: '' });
      }).not.toThrow();
    });

    test('should handle invalid configuration gracefully', () => {
      expect(() => {
        new HenotaceAI({ apiKey: 'test', baseUrl: 'invalid-url' });
      }).not.toThrow();
    });
  });
});
