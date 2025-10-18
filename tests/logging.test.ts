/**
 * Tests for logging functionality
 */

import { HenotaceAI, LogLevel, Logger, ConsoleLogger, NoOpLogger, createLogger, InMemoryConnector } from '../src/index';

describe('Logging', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock console methods to capture log output
    consoleSpy = jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    jest.restoreAllMocks();
  });

  describe('ConsoleLogger', () => {
    it('should log messages at appropriate levels', () => {
      const logger = new ConsoleLogger(LogLevel.DEBUG);
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).toHaveBeenCalledWith(expect.stringContaining('Debug message'));
      expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Info message'));
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Warning message'));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Error message'));
    });

    it('should respect log level filtering', () => {
      const logger = new ConsoleLogger(LogLevel.WARN);
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();
    });

    it('should format messages with timestamps', () => {
      const logger = new ConsoleLogger(LogLevel.INFO);
      
      logger.info('Test message');

      const call = (console.info as jest.Mock).mock.calls[0][0];
      expect(call).toMatch(/\[Henotace SDK\] \d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z \[INFO\] Test message/);
    });
  });

  describe('NoOpLogger', () => {
    it('should not log anything', () => {
      // Clear any previous calls from other tests
      jest.clearAllMocks();
      
      const logger = new NoOpLogger();
      
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('createLogger factory', () => {
    it('should create ConsoleLogger when enabled', () => {
      const logger = createLogger(LogLevel.INFO, true);
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it('should create NoOpLogger when disabled', () => {
      const logger = createLogger(LogLevel.INFO, false);
      expect(logger).toBeInstanceOf(NoOpLogger);
    });

    it('should create NoOpLogger when level is NONE', () => {
      const logger = createLogger(LogLevel.NONE, true);
      expect(logger).toBeInstanceOf(NoOpLogger);
    });
  });

  describe('SDK Integration', () => {
    it('should use custom logger when provided', () => {
      const customLogger: Logger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      };

      const sdk = new HenotaceAI({
        apiKey: 'test-key',
        storage: new InMemoryConnector(),
        logging: {
          enabled: true,
          logger: customLogger
        }
      });

      expect(sdk.getLogger()).toBe(customLogger);
    });

    it('should use default logger with specified level', () => {
      const sdk = new HenotaceAI({
        apiKey: 'test-key',
        storage: new InMemoryConnector(),
        logging: {
          enabled: true,
          level: LogLevel.DEBUG
        }
      });

      const logger = sdk.getLogger();
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });

    it('should disable logging when enabled is false', () => {
      const sdk = new HenotaceAI({
        apiKey: 'test-key',
        storage: new InMemoryConnector(),
        logging: {
          enabled: false
        }
      });

      const logger = sdk.getLogger();
      expect(logger).toBeInstanceOf(NoOpLogger);
    });

    it('should enable logging by default', () => {
      const sdk = new HenotaceAI({
        apiKey: 'test-key',
        storage: new InMemoryConnector()
      });

      const logger = sdk.getLogger();
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe('Log Level Enum', () => {
    it('should have correct numeric values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.NONE).toBe(4);
    });
  });
});
