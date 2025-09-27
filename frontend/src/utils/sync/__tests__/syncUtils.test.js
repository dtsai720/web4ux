import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock the wailsjs functions since they're not available in test environment
vi.mock('../../../wailsjs/go/pkg/App', () => ({
  LoginAndSync: vi.fn(),
  StartSync: vi.fn(),
  CancelSync: vi.fn(),
  GetSyncStatus: vi.fn()
}));

vi.mock('../common', () => ({
  handleError: vi.fn()
}));

import {
  getInitialSyncProgress,
  formatSyncData,
  handleLogin
} from '../syncUtils.js';

describe('syncUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getInitialSyncProgress', () => {
    test('should return initial sync progress state', () => {
      const result = getInitialSyncProgress();

      expect(result).toEqual({
        currentProject: '',
        currentIndex: 0,
        progress: 0,
        totalProjects: 0,
        isCompleted: false,
        isCancelled: false
      });
    });

    test('should return a new object each time', () => {
      const result1 = getInitialSyncProgress();
      const result2 = getInitialSyncProgress();

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    test('should have correct data types', () => {
      const result = getInitialSyncProgress();

      expect(typeof result.currentProject).toBe('string');
      expect(typeof result.currentIndex).toBe('number');
      expect(typeof result.progress).toBe('number');
      expect(typeof result.totalProjects).toBe('number');
      expect(typeof result.isCompleted).toBe('boolean');
      expect(typeof result.isCancelled).toBe('boolean');
    });
  });

  describe('formatSyncData', () => {
    test('should format sync data with total records', () => {
      const totalRecords = 100;
      const result = formatSyncData(totalRecords);

      expect(result.totalRecords).toBe(totalRecords);
      expect(result.lastSync).toBeDefined();
      expect(typeof result.lastSync).toBe('string');
    });

    test('should set lastSync as ISO string', () => {
      const result = formatSyncData(50);
      const date = new Date(result.lastSync);

      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).not.toBeNaN();
    });

    test('should handle zero records', () => {
      const result = formatSyncData(0);

      expect(result.totalRecords).toBe(0);
      expect(result.lastSync).toBeDefined();
    });

    test('should handle negative records', () => {
      const result = formatSyncData(-5);

      expect(result.totalRecords).toBe(-5);
      expect(result.lastSync).toBeDefined();
    });
  });

  describe('handleLogin - validation only', () => {
    test('should return error for missing email', async () => {
      const result = await handleLogin('', 'password');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should return error for missing password', async () => {
      const result = await handleLogin('test@example.com', '');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should return error for both missing credentials', async () => {
      const result = await handleLogin('', '');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should return error for null email', async () => {
      const result = await handleLogin(null, 'password');

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });

    test('should return error for undefined password', async () => {
      const result = await handleLogin('test@example.com', undefined);

      expect(result).toEqual({
        success: false,
        message: 'Email and password are required'
      });
    });
  });
});
