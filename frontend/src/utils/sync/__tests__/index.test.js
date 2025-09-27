import { describe, test, expect } from 'vitest';
import * as syncUtilsExports from '../index.js';

describe('sync utils index', () => {
  test('should export all functions from syncUtils', () => {
    const expectedSyncUtilExports = [
      'checkSyncStatus',
      'handleLogin',
      'handleStartSync',
      'handleCancelSync',
      'getInitialSyncProgress',
      'formatSyncData'
    ];

    expectedSyncUtilExports.forEach(exportName => {
      expect(syncUtilsExports).toHaveProperty(exportName);
      expect(typeof syncUtilsExports[exportName]).toBe('function');
    });
  });

  test('should export SyncManager class', () => {
    expect(syncUtilsExports).toHaveProperty('SyncManager');
    expect(typeof syncUtilsExports.SyncManager).toBe('function');
  });

  test('should export ISyncManager and createSyncManager', () => {
    expect(syncUtilsExports).toHaveProperty('ISyncManager');
    expect(syncUtilsExports).toHaveProperty('createSyncManager');
    expect(typeof syncUtilsExports.ISyncManager).toBe('function');
    expect(typeof syncUtilsExports.createSyncManager).toBe('function');
  });

  test('should export MockSyncManager class', () => {
    expect(syncUtilsExports).toHaveProperty('MockSyncManager');
    expect(typeof syncUtilsExports.MockSyncManager).toBe('function');
  });

  test('should have all expected exports', () => {
    const expectedExports = [
      // From syncUtils
      'checkSyncStatus',
      'handleLogin',
      'handleStartSync',
      'handleCancelSync',
      'getInitialSyncProgress',
      'formatSyncData',
      // From managers
      'SyncManager',
      'ISyncManager',
      'createSyncManager',
      'MockSyncManager'
    ];

    expectedExports.forEach(exportName => {
      expect(syncUtilsExports).toHaveProperty(exportName);
    });

    // Check that we don't have unexpected exports
    const actualExports = Object.keys(syncUtilsExports);
    expect(actualExports.sort()).toEqual(expectedExports.sort());
  });

  test('should export constructable classes', () => {
    const { ISyncManager, MockSyncManager } = syncUtilsExports;

    expect(() => new ISyncManager()).not.toThrow();
    expect(() => new MockSyncManager()).not.toThrow();
  });

  test('should export working factory function', async () => {
    const { createSyncManager } = syncUtilsExports;

    // Test that factory function works
    expect(typeof createSyncManager).toBe('function');

    // Test that it returns a promise
    const mockManagerPromise = createSyncManager('mock');
    expect(mockManagerPromise).toBeInstanceOf(Promise);

    const mockManager = await mockManagerPromise;
    expect(mockManager).toBeTruthy();
    expect(typeof mockManager.getStatus).toBe('function');
  });
});
