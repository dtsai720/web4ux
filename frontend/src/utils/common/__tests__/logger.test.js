import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

describe('logger', () => {
  let originalNodeEnv;
  let consoleSpy;
  let logger;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    consoleSpy = {
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      debug: vi.spyOn(console, 'debug').mockImplementation(() => {})
    };
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('in development environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      logger = loggerModule.logger;
    });

    test('logger.error should call console.error', () => {
      logger.error('Test error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('Test error message');
    });

    test('logger.warn should call console.warn', () => {
      logger.warn('Test warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('Test warning message');
    });

    test('logger.info should call console.info', () => {
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalledWith('Test info message');
    });

    test('logger.debug should call console.debug', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).toHaveBeenCalledWith('Test debug message');
    });

    test('logger methods should handle additional arguments', () => {
      const errorObj = new Error('Test error');
      const extraData = { key: 'value' };

      logger.error('Error with data', errorObj, extraData);
      expect(consoleSpy.error).toHaveBeenCalledWith('Error with data', errorObj, extraData);

      logger.warn('Warning with data', extraData);
      expect(consoleSpy.warn).toHaveBeenCalledWith('Warning with data', extraData);

      logger.info('Info with data', extraData);
      expect(consoleSpy.info).toHaveBeenCalledWith('Info with data', extraData);

      logger.debug('Debug with data', extraData);
      expect(consoleSpy.debug).toHaveBeenCalledWith('Debug with data', extraData);
    });

    test('logger methods should handle no arguments', () => {
      logger.error();
      logger.warn();
      logger.info();
      logger.debug();

      expect(consoleSpy.error).toHaveBeenCalledWith(undefined);
      expect(consoleSpy.warn).toHaveBeenCalledWith(undefined);
      expect(consoleSpy.info).toHaveBeenCalledWith(undefined);
      expect(consoleSpy.debug).toHaveBeenCalledWith(undefined);
    });
  });

  describe('in production environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      logger = loggerModule.logger;
    });

    test('logger.error should not call console.error', () => {
      logger.error('Test error message');
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });

    test('logger.warn should not call console.warn', () => {
      logger.warn('Test warning message');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
    });

    test('logger.info should not call console.info', () => {
      logger.info('Test info message');
      expect(consoleSpy.info).not.toHaveBeenCalled();
    });

    test('logger.debug should not call console.debug', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });

    test('logger methods should not log anything in production', () => {
      logger.error('Error');
      logger.warn('Warning');
      logger.info('Info');
      logger.debug('Debug');

      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('in test environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'test';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      logger = loggerModule.logger;
    });

    test('logger methods should not call console methods', () => {
      logger.error('Test error');
      logger.warn('Test warning');
      logger.info('Test info');
      logger.debug('Test debug');

      expect(consoleSpy.error).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });
});

describe('handleError', () => {
  let originalNodeEnv;
  let consoleSpy;
  let handleError;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    vi.restoreAllMocks();
    vi.resetModules();
  });

  describe('in development environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      handleError = loggerModule.handleError;
    });

    test('should log error and return error object with error details', () => {
      const error = new Error('Test error');
      const fallbackMessage = 'Something went wrong';

      const result = handleError(error, fallbackMessage);

      expect(consoleSpy).toHaveBeenCalledWith(fallbackMessage, error);
      expect(result).toEqual({
        message: fallbackMessage,
        error: error
      });
    });

    test('should use default fallback message when not provided', () => {
      const error = new Error('Test error');

      const result = handleError(error);

      expect(consoleSpy).toHaveBeenCalledWith('An error occurred', error);
      expect(result).toEqual({
        message: 'An error occurred',
        error: error
      });
    });

    test('should handle null error', () => {
      const result = handleError(null, 'Custom message');

      expect(consoleSpy).toHaveBeenCalledWith('Custom message', null);
      expect(result).toEqual({
        message: 'Custom message',
        error: null
      });
    });

    test('should handle undefined error', () => {
      const result = handleError(undefined, 'Custom message');

      expect(consoleSpy).toHaveBeenCalledWith('Custom message', undefined);
      expect(result).toEqual({
        message: 'Custom message',
        error: undefined
      });
    });
  });

  describe('in production environment', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'production';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      handleError = loggerModule.handleError;
    });

    test('should not log error but return error object without error details', () => {
      const error = new Error('Test error');
      const fallbackMessage = 'Something went wrong';

      const result = handleError(error, fallbackMessage);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: fallbackMessage,
        error: null
      });
    });

    test('should use default fallback message in production', () => {
      const error = new Error('Test error');

      const result = handleError(error);

      expect(consoleSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'An error occurred',
        error: null
      });
    });

    test('should handle errors without exposing them in production', () => {
      const sensitiveError = new Error('Database connection failed with credentials');

      const result = handleError(sensitiveError, 'Service unavailable');

      expect(result.error).toBeNull();
      expect(result.message).toBe('Service unavailable');
    });
  });

  describe('return value structure', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      handleError = loggerModule.handleError;
    });

    test('should always return object with message and error properties', () => {
      const result = handleError(new Error('test'), 'test message');

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('error');
      expect(typeof result.message).toBe('string');
    });

    test('should be consistent across environments', async () => {
      const error = new Error('Test');
      const message = 'Test message';

      process.env.NODE_ENV = 'development';
      vi.resetModules();
      let loggerModule = await import('../logger.js');
      const devResult = loggerModule.handleError(error, message);

      process.env.NODE_ENV = 'production';
      vi.resetModules();
      loggerModule = await import('../logger.js');
      const prodResult = loggerModule.handleError(error, message);

      expect(devResult.message).toBe(prodResult.message);
      expect(typeof devResult).toBe(typeof prodResult);
    });
  });

  describe('edge cases', () => {
    beforeEach(async () => {
      process.env.NODE_ENV = 'development';
      vi.resetModules();
      const loggerModule = await import('../logger.js');
      handleError = loggerModule.handleError;
    });

    test('should handle empty string fallback message', () => {
      const result = handleError(new Error('test'), '');

      expect(result.message).toBe('');
    });

    test('should handle non-Error objects as error parameter', () => {
      const errorObj = { type: 'custom', code: 500 };

      const result = handleError(errorObj, 'Custom error');

      expect(result.error).toBe(errorObj);
      expect(result.message).toBe('Custom error');
    });
  });
});
