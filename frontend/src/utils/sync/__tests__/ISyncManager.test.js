import { describe, test, expect, vi, beforeEach } from 'vitest';
import { ISyncManager, createSyncManager } from '../ISyncManager.js';

describe('ISyncManager', () => {
  describe('ISyncManager Interface', () => {
    let syncManager;

    beforeEach(() => {
      syncManager = new ISyncManager();
    });

    test('should be instantiable', () => {
      expect(syncManager).toBeInstanceOf(ISyncManager);
    });

    test('should throw error for getStatus method', async () => {
      await expect(syncManager.getStatus()).rejects.toThrow(
        'ISyncManager.getStatus() must be implemented by subclass'
      );
    });

    test('should throw error for login method', async () => {
      await expect(syncManager.login('email', 'password')).rejects.toThrow(
        'ISyncManager.login() must be implemented by subclass'
      );
    });

    test('should throw error for startSync method', async () => {
      await expect(syncManager.startSync()).rejects.toThrow(
        'ISyncManager.startSync() must be implemented by subclass'
      );
    });

    test('should throw error for cancelSync method', async () => {
      await expect(syncManager.cancelSync()).rejects.toThrow(
        'ISyncManager.cancelSync() must be implemented by subclass'
      );
    });

    test('should throw error for addEventListener method', () => {
      expect(() => syncManager.addEventListener('test', () => {})).toThrow(
        'ISyncManager.addEventListener() must be implemented by subclass'
      );
    });

    test('should throw error for removeEventListener method', () => {
      expect(() => syncManager.removeEventListener('test', () => {})).toThrow(
        'ISyncManager.removeEventListener() must be implemented by subclass'
      );
    });

    test('should throw error for dispose method', async () => {
      await expect(syncManager.dispose()).rejects.toThrow(
        'ISyncManager.dispose() must be implemented by subclass'
      );
    });
  });

  describe('createSyncManager factory', () => {
    test('should create default sync manager', async () => {
      // Mock the dynamic import
      vi.doMock('../SyncManager.js', () => ({
        SyncManager: class MockSyncManager {
          constructor(options) {
            this.options = options;
            this.type = 'SyncManager';
          }
        }
      }));

      const syncManager = await createSyncManager('default', { test: true });
      expect(syncManager.type).toBe('SyncManager');
      expect(syncManager.options).toEqual({ test: true });
    });

    test('should create mock sync manager', async () => {
      // Mock the dynamic import
      vi.doMock('../MockSyncManager.js', () => ({
        MockSyncManager: class MockSyncManager {
          constructor(options) {
            this.options = options;
            this.type = 'MockSyncManager';
          }
        }
      }));

      const syncManager = await createSyncManager('mock', { test: true });
      expect(syncManager.type).toBe('MockSyncManager');
      expect(syncManager.options).toEqual({ test: true });
    });

    test('should use default implementation when no type specified', async () => {
      vi.doMock('../SyncManager.js', () => ({
        SyncManager: class MockSyncManager {
          constructor(options) {
            this.type = 'SyncManager';
            this.options = options;
          }
        }
      }));

      const syncManager = await createSyncManager();
      expect(syncManager.type).toBe('SyncManager');
    });

    test('should pass empty options when none provided', async () => {
      vi.doMock('../SyncManager.js', () => ({
        SyncManager: class MockSyncManager {
          constructor(options) {
            this.type = 'SyncManager';
            this.options = options;
          }
        }
      }));

      const syncManager = await createSyncManager('default');
      expect(syncManager.options).toEqual({});
    });

    test('should throw error for unknown implementation', () => {
      expect(() => createSyncManager('unknown')).toThrow(
        'Unknown sync manager implementation: unknown'
      );
    });

    test('should throw error for invalid implementation type', () => {
      expect(() => createSyncManager('invalid_type')).toThrow(
        'Unknown sync manager implementation: invalid_type'
      );
    });
  });

  describe('ISyncManager as interface contract', () => {
    test('should have all required method signatures', () => {
      const methods = [
        'getStatus',
        'login',
        'startSync',
        'cancelSync',
        'addEventListener',
        'removeEventListener',
        'dispose'
      ];

      methods.forEach(method => {
        expect(ISyncManager.prototype).toHaveProperty(method);
        expect(typeof ISyncManager.prototype[method]).toBe('function');
      });
    });

    test('should accept correct parameters for login method', async () => {
      const syncManager = new ISyncManager();

      // Should not throw for parameter validation, only for implementation
      await expect(syncManager.login('test@example.com', 'password')).rejects.toThrow(
        'ISyncManager.login() must be implemented by subclass'
      );
    });

    test('should accept correct parameters for event methods', () => {
      const syncManager = new ISyncManager();
      const callback = () => {};

      expect(() => syncManager.addEventListener('progress', callback)).toThrow(
        'ISyncManager.addEventListener() must be implemented by subclass'
      );

      expect(() => syncManager.removeEventListener('progress', callback)).toThrow(
        'ISyncManager.removeEventListener() must be implemented by subclass'
      );
    });
  });
});
