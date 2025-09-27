import { describe, test, expect } from 'vitest';

import {
  getInitialSyncProgress,
  formatSyncData
} from '../syncUtils.js';

describe('syncUtils - Enhanced Coverage', () => {
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

    test('should have correct initial values', () => {
      const result = getInitialSyncProgress();

      expect(result.currentProject).toBe('');
      expect(result.currentIndex).toBe(0);
      expect(result.progress).toBe(0);
      expect(result.totalProjects).toBe(0);
      expect(result.isCompleted).toBe(false);
      expect(result.isCancelled).toBe(false);
    });

    test('should not modify returned object when called multiple times', () => {
      const result1 = getInitialSyncProgress();
      result1.currentProject = 'modified';

      const result2 = getInitialSyncProgress();
      expect(result2.currentProject).toBe('');
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
      expect(result.lastSync).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
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

    test('should handle large numbers', () => {
      const largeNumber = 999999999;
      const result = formatSyncData(largeNumber);

      expect(result.totalRecords).toBe(largeNumber);
      expect(result.lastSync).toBeDefined();
    });

    test('should create different timestamps when called multiple times', async () => {
      const result1 = formatSyncData(100);
      await new Promise(resolve => setTimeout(resolve, 2));
      const result2 = formatSyncData(100);

      expect(result1.totalRecords).toBe(result2.totalRecords);
      expect(result1.lastSync).not.toBe(result2.lastSync);
    });

    test('should handle floating point numbers', () => {
      const result = formatSyncData(123.45);

      expect(result.totalRecords).toBe(123.45);
      expect(typeof result.lastSync).toBe('string');
    });

    test('should handle undefined input', () => {
      const result = formatSyncData(undefined);

      expect(result.totalRecords).toBeUndefined();
      expect(result.lastSync).toBeDefined();
    });

    test('should handle null input', () => {
      const result = formatSyncData(null);

      expect(result.totalRecords).toBeNull();
      expect(result.lastSync).toBeDefined();
    });

    test('should handle string input', () => {
      const result = formatSyncData('123');

      expect(result.totalRecords).toBe('123');
      expect(result.lastSync).toBeDefined();
    });

    test('should create valid ISO timestamp close to current time', () => {
      const beforeTime = new Date().getTime();
      const result = formatSyncData(100);
      const afterTime = new Date().getTime();

      const resultTime = new Date(result.lastSync).getTime();

      expect(resultTime).toBeGreaterThanOrEqual(beforeTime);
      expect(resultTime).toBeLessThanOrEqual(afterTime);
    });

    test('should always include required properties', () => {
      const result = formatSyncData(42);

      expect(Object.keys(result)).toEqual(['totalRecords', 'lastSync']);
      expect(Object.keys(result)).toHaveLength(2);
    });
  });
});
