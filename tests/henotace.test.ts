/**
 * TDD Tests for Henotace AI SDK
 * Test-Driven Development approach
 */

import HenotaceAI, { Tutor, createTutor } from '../src/index';
import { SessionChat } from '../src/types';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock base URL
const mockBaseUrl = 'https://api.test.com';

// Create a mock axios instance
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
  defaults: { baseURL: mockBaseUrl }
};

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance as any);

describe('HenotaceAI SDK', () => {
  let sdk: HenotaceAI;
  const mockApiKey = 'test-api-key-123';
  const mockBaseUrl = 'https://api.test.com';

  beforeEach(() => {
    jest.clearAllMocks();
    sdk = new HenotaceAI({
      apiKey: mockApiKey,
      baseUrl: 'https://api.henotace.com'
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

  describe('API Status', () => {
    test('should get API status successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          data: {
            status: 'operational',
            message: 'API is running smoothly',
            timestamp: '2025-09-25T16:00:00Z'
          },
          timestamp: '2025-09-25T16:00:00Z'
        }
      };

      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await sdk.getStatus();
      
      expect(result.success).toBe(true);
      expect(result.data?.status).toBe('operational');
      expect(result.data?.message).toBe('API is running smoothly');
    });

    test('should handle API status error', async () => {
      const mockError = new Error('Network Error');
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(sdk.getStatus()).rejects.toThrow('Network Error');
    });
  });

  describe('Chat Completion (unit via axios mock)', () => {
    test('should call unified chat completion endpoint and return ai text', async () => {
      const mockResponse = { data: { success: true, data: { ai_response: 'Hello!' }, timestamp: 't' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse as any);
      // @ts-ignore private method via any
      const result = await (sdk as any).completeChat({ history: [{ role: 'user', content: 'Hi' }], input: 'Hi', preset: 'tutor_default' });
      expect(result.ai_response).toBe('Hello!');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/external/working/chat/completion/', { history: [{ role: 'user', content: 'Hi' }], input: 'Hi', preset: 'tutor_default' });
    });
  });

  describe('Tutor class behavior (with mocked storage)', () => {
    test('should inject context/persona/user/meta and append chats', async () => {
      const store: { chats: SessionChat[] } = { chats: [] };
      const storage = {
        listStudents: jest.fn().mockResolvedValue([]),
        upsertStudent: jest.fn().mockResolvedValue(undefined),
        deleteStudent: jest.fn().mockResolvedValue(undefined),
        listTutors: jest.fn().mockResolvedValue([{ id: 't1', name: 't1', subject: { id: 's', name: 's', topic: '' }, chats: [] }]),
        upsertTutor: jest.fn().mockResolvedValue(undefined),
        deleteTutor: jest.fn().mockResolvedValue(undefined),
        listChats: jest.fn().mockResolvedValue(store.chats),
        appendChat: jest.fn().mockImplementation((_a,_b,c) => { store.chats.push(c); return Promise.resolve(); }),
        replaceChats: jest.fn().mockResolvedValue(undefined),
        getAll: jest.fn(),
        setAll: jest.fn()
      } as any;

      // recreate SDK with storage
      sdk = new HenotaceAI({ apiKey: 'k', baseUrl: mockBaseUrl, storage, defaultPersona: 'Dev', defaultUserProfile: { plan: 'pro' }, defaultMetadata: { app: 'test' } as any });
      // Stub network
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true, data: { ai_response: 'OK' }, timestamp: 't' } } as any);
      const tutor = await createTutor(sdk, { studentId: 'u1', tutorId: 't1', tutorName: 't1', subject: { id: 's', name: 's', topic: '' } });
      tutor.setPersona('Helper');
      tutor.setContext(['A', 'B']);
      const ai = await tutor.send('Q', { context: 'C' });
      expect(ai).toBe('OK');
      expect(storage.appendChat).toHaveBeenCalled();
      // last two entries should be user then AI
      expect(store.chats.slice(-2)[0].isReply).toBe(false);
      expect(store.chats.slice(-1)[0].isReply).toBe(true);
    });

    test('should perform compression and write summary to metadata', async () => {
      const store: { chats: SessionChat[] } = { chats: [] };
      const storage = {
        listStudents: jest.fn().mockResolvedValue([]),
        upsertStudent: jest.fn().mockResolvedValue(undefined),
        deleteStudent: jest.fn().mockResolvedValue(undefined),
        listTutors: jest.fn().mockResolvedValue([{ id: 't1', name: 't1', subject: { id: 's', name: 's', topic: '' }, chats: [], metadata: {} }]),
        upsertTutor: jest.fn().mockResolvedValue(undefined),
        deleteTutor: jest.fn().mockResolvedValue(undefined),
        listChats: jest.fn().mockImplementation(() => Promise.resolve(store.chats)),
        appendChat: jest.fn().mockImplementation((_a,_b,c) => { store.chats.push(c); return Promise.resolve(); }),
        replaceChats: jest.fn().mockImplementation((_a,_b,chats) => { store.chats = chats; return Promise.resolve(); }),
        getAll: jest.fn(),
        setAll: jest.fn()
      } as any;

      sdk = new HenotaceAI({ apiKey: 'k', baseUrl: mockBaseUrl, storage });
      mockAxiosInstance.post.mockResolvedValue({ data: { success: true, data: { ai_response: 'OK' }, timestamp: 't' } } as any);
      const tutor = await createTutor(sdk, { studentId: 'u1', tutorId: 't1', tutorName: 't1', subject: { id: 's', name: 's', topic: '' } });
      // Tight compression to force summarization quickly
      tutor.setCompression({ maxTurns: 2, checkpointEvery: 3, maxSummaryChars: 200 });
      // Push several turns then explicitly trigger compression
      for (let i = 0; i < 7; i++) {
        await tutor.send(`Q${i}`);
      }
      // Force compression and then check
      // @ts-ignore access private via any for test
      await (tutor as any).compressHistory();
      expect((await tutor.history()).length).toBeLessThanOrEqual(2);
      // Ensure metadata summary was attempted
      expect(storage.upsertTutor).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle 401 unauthorized error', async () => {
      const error = {
        response: {
          status: 401,
          data: { error: 'Invalid API key' }
        }
      };

      mockAxiosInstance.get.mockRejectedValue(error as any);
      await expect(sdk.getStatus()).rejects.toThrow('Invalid API key. Please check your credentials.');
    });

    test('should handle 429 rate limit error', async () => {
      const error: any = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
          headers: { 'retry-after': '1' }
        },
        config: { _retryCount: 0 }
      };

      mockAxiosInstance.get.mockRejectedValue(error);
      await expect(sdk.getStatus()).rejects.toThrow('Rate limit exceeded. Please try again later.');
    });

    test('should handle 500 server error with retry', async () => {
      const error: any = {
        response: {
          status: 500,
          data: { error: 'Internal server error' }
        },
        config: { _retryCount: 0 }
      };

      // Mock multiple failures to test retry logic
      mockAxiosInstance.get
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error);

      await expect(sdk.getStatus()).rejects.toThrow();
    });

    test('should handle network error', async () => {
      const error = new Error('Network Error');

      mockAxiosInstance.get.mockRejectedValue(error as any);

      await expect(sdk.getStatus()).rejects.toThrow('Network Error: Network Error');
    });
  });
});
