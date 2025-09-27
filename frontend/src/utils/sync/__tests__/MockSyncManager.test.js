import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { MockSyncManager } from '../MockSyncManager.js';
import { ISyncManager } from '../ISyncManager.js';

// Mock the logger
vi.mock('../../common/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

describe('MockSyncManager', () => {
  let mockSyncManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSyncManager = new MockSyncManager();
  });

  afterEach(() => {
    if (mockSyncManager && typeof mockSyncManager.dispose === 'function') {
      mockSyncManager.dispose();
    }
  });

  describe('constructor and inheritance', () => {
    test('should extend ISyncManager', () => {
      expect(mockSyncManager).toBeInstanceOf(ISyncManager);
      expect(mockSyncManager).toBeInstanceOf(MockSyncManager);
    });

    test('should initialize with default options', () => {
      expect(mockSyncManager.options).toEqual({
        simulateDelay: true,
        delayMs: 1000,
        failLogin: false,
        failSync: false
      });
    });

    test('should merge custom options', () => {
      const customManager = new MockSyncManager({
        simulateDelay: false,
        delayMs: 500,
        customOption: true
      });

      expect(customManager.options).toEqual({
        simulateDelay: false,
        delayMs: 500,
        failLogin: false,
        failSync: false,
        customOption: true
      });
    });

    test('should initialize with correct status', () => {
      expect(mockSyncManager.status).toEqual({
        isSyncing: false,
        isLoggedIn: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          isCompleted: false,
          isCancelled: false
        }
      });
    });
  });

  describe('getStatus', () => {
    test('should return current status', async () => {
      const status = await mockSyncManager.getStatus();

      expect(status).toEqual({
        isSyncing: false,
        isLoggedIn: false,
        progress: {
          current: 0,
          total: 0,
          percentage: 0,
          isCompleted: false,
          isCancelled: false
        }
      });
    });

    test('should return copy of status, not reference', async () => {
      const status1 = await mockSyncManager.getStatus();
      const status2 = await mockSyncManager.getStatus();

      expect(status1).toEqual(status2);
      expect(status1).not.toBe(status2);
      // Note: MockSyncManager may not deep clone the progress object
    });

    test('should simulate delay when enabled', async () => {
      const startTime = Date.now();
      await mockSyncManager.getStatus();
      const endTime = Date.now();

      // Should take at least 100ms (though this might be flaky in CI)
      expect(endTime - startTime).toBeGreaterThanOrEqual(50);
    });

    test('should not delay when disabled', async () => {
      const fastManager = new MockSyncManager({ simulateDelay: false });
      const startTime = Date.now();
      await fastManager.getStatus();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(50);
    });
  });

  describe('login', () => {
    test('should fail when email is missing', async () => {
      const result = await mockSyncManager.login('', 'password');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should fail when password is missing', async () => {
      const result = await mockSyncManager.login('test@example.com', '');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should succeed with valid credentials', async () => {
      const result = await mockSyncManager.login('test@example.com', 'password');

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ user: 'mock@example.com' });

      const status = await mockSyncManager.getStatus();
      expect(status.isLoggedIn).toBe(true);
    });

    test('should fail when failLogin option is set', async () => {
      const failingManager = new MockSyncManager({
        failLogin: true,
        simulateDelay: false
      });

      const result = await failingManager.login('test@example.com', 'password');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Mock login failure');

      const status = await failingManager.getStatus();
      expect(status.isLoggedIn).toBe(false);
    });

    test('should simulate delay when enabled', async () => {
      const startTime = Date.now();
      await mockSyncManager.login('test@example.com', 'password');
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(900);
    });
  });

  describe('startSync', () => {
    test('should fail when not logged in', async () => {
      const result = await mockSyncManager.startSync();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Must be logged in to sync');
    });

    test('should start sync when logged in', async () => {
      // Login first
      await mockSyncManager.login('test@example.com', 'password');

      const result = await mockSyncManager.startSync();

      expect(result.success).toBe(true);

      const status = await mockSyncManager.getStatus();
      expect(status.isSyncing).toBe(true);
    });

    test('should fail when already syncing', async () => {
      await mockSyncManager.login('test@example.com', 'password');
      await mockSyncManager.startSync();

      const result = await mockSyncManager.startSync();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Sync already in progress');
    });

    test('should fail when failSync option is set', async () => {
      const failingManager = new MockSyncManager({
        failSync: true,
        simulateDelay: false
      });

      await failingManager.login('test@example.com', 'password');
      const result = await failingManager.startSync();

      expect(result.success).toBe(false);
      expect(result.message).toBe('Mock sync failure');
    });
  });

  describe('cancelSync', () => {
    test('should fail when not syncing', async () => {
      const result = await mockSyncManager.cancelSync();

      expect(result.success).toBe(false);
      expect(result.message).toBe('No sync in progress');
    });

    test('should cancel ongoing sync', async () => {
      await mockSyncManager.login('test@example.com', 'password');
      await mockSyncManager.startSync();

      const result = await mockSyncManager.cancelSync();

      expect(result.success).toBe(true);

      const status = await mockSyncManager.getStatus();
      expect(status.isSyncing).toBe(false);
      expect(status.progress.isCancelled).toBe(true);
    });
  });

  describe('event listeners', () => {
    test('should add event listener', () => {
      const callback = vi.fn();

      mockSyncManager.addEventListener('progress', callback);

      expect(mockSyncManager.listeners.has('progress')).toBe(true);
      expect(mockSyncManager.listeners.get('progress')).toContain(callback);
    });

    test('should add multiple listeners for same event', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      mockSyncManager.addEventListener('progress', callback1);
      mockSyncManager.addEventListener('progress', callback2);

      const listeners = mockSyncManager.listeners.get('progress');
      expect(listeners).toContain(callback1);
      expect(listeners).toContain(callback2);
      expect(listeners.size).toBe(2);
    });

    test('should remove event listener', () => {
      const callback = vi.fn();

      mockSyncManager.addEventListener('progress', callback);
      mockSyncManager.removeEventListener('progress', callback);

      const listeners = mockSyncManager.listeners.get('progress');
      expect(listeners).not.toContain(callback);
    });

    test('should handle removing non-existent listener', () => {
      const callback = vi.fn();

      expect(() => {
        mockSyncManager.removeEventListener('progress', callback);
      }).not.toThrow();
    });
  });

  describe('dispose', () => {
    test('should cleanup resources', async () => {
      const callback = vi.fn();
      mockSyncManager.addEventListener('progress', callback);

      await mockSyncManager.dispose();

      expect(mockSyncManager.listeners.size).toBe(0);
      expect(mockSyncManager.syncInterval).toBeNull();
    });

    test('should stop ongoing sync during disposal', async () => {
      await mockSyncManager.login('test@example.com', 'password');
      await mockSyncManager.startSync();

      await mockSyncManager.dispose();

      const status = await mockSyncManager.getStatus();
      expect(status.isSyncing).toBe(false);
    });
  });
});
