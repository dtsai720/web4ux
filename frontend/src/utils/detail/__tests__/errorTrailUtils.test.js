import { describe, test, expect, vi } from 'vitest';

// Mock the dependency
vi.mock('../moveTimeUtils', () => ({
  calculateDifficulty: vi.fn()
}));

import {
  detectErrorTrails,
  getUniqueDifficulties,
  getUniqueDevices
} from '../errorTrailUtils.js';
import { calculateDifficulty } from '../moveTimeUtils';

describe('errorTrailUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calculateDifficulty.mockReturnValue(5.5);
  });

  describe('detectErrorTrails', () => {
    const createMockRecord = (deviceName, participantSerial, trailNumber, mark, timestamp, deleted = false, deviceOrder = 'A', width = 100, distance = 200) => ({
      deviceName,
      participantSerial,
      trailNumber,
      mark,
      timestamp,
      deleted,
      deviceOrder,
      width,
      distance,
      x: 100,
      y: 200
    });

    test('should detect error trails with intermediate actions', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'else', 1100),
        createMockRecord('device1', 'p1', 1, 'target', 1200)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(1);
      expect(result.errorTrails).toHaveLength(1);
      expect(result.errorTrails[0]).toMatchObject({
        deviceName: 'device1',
        participantSerial: 'p1',
        trailNumber: 1,
        difficulty: 5.5
      });
      expect(calculateDifficulty).toHaveBeenCalledWith(200, 100);
    });

    test('should not detect error for direct start-target sequence', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'target', 1100)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(0);
      expect(result.errorTrails).toHaveLength(0);
    });

    test('should filter out deleted records', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000, true), // deleted
        createMockRecord('device1', 'p1', 1, 'else', 1100, true),  // deleted
        createMockRecord('device1', 'p1', 1, 'target', 1200, true) // deleted
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(0);
      expect(result.errorTrails).toHaveLength(0);
    });

    test('should handle multiple trails from different devices', () => {
      const rawData = [
        // Device 1 - error trail
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'else', 1100),
        createMockRecord('device1', 'p1', 1, 'target', 1200),
        // Device 2 - normal trail
        createMockRecord('device2', 'p1', 1, 'start', 2000),
        createMockRecord('device2', 'p1', 1, 'target', 2100)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(1);
      expect(result.byDevice).toHaveProperty('device1');
      expect(result.byDevice).not.toHaveProperty('device2');
      expect(result.byDevice.device1).toHaveLength(1);
    });

    test('should group error trails by difficulty correctly', () => {
      calculateDifficulty.mockReturnValue(3.5);

      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000, false, 'A', 50, 100),
        createMockRecord('device1', 'p1', 1, 'else', 1100, false, 'A', 50, 100),
        createMockRecord('device1', 'p1', 1, 'target', 1200, false, 'A', 50, 100)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(1);
      expect(result.byDifficulty).toHaveProperty('3.5 (50/100)');
      expect(result.byDifficulty['3.5 (50/100)']).toHaveLength(1);
      expect(calculateDifficulty).toHaveBeenCalledWith(100, 50);
    });

    test('should sort trail records by timestamp', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'target', 1200),
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'else', 1100)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(1);
      const records = result.errorTrails[0].records;
      expect(records[0].action).toBe('start');
      expect(records[1].action).toBe('else');
      expect(records[2].action).toBe('target');
    });

    test('should handle multiple start-target sequences in same trail', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'target', 1100),
        createMockRecord('device1', 'p1', 1, 'start', 1200),
        createMockRecord('device1', 'p1', 1, 'else', 1300),
        createMockRecord('device1', 'p1', 1, 'target', 1400)
      ];

      const result = detectErrorTrails(rawData);

      expect(result.totalErrorTrails).toBe(1); // Should detect error from second sequence
    });

    test('should handle empty input gracefully', () => {
      const result = detectErrorTrails([]);

      expect(result.totalErrorTrails).toBe(0);
      expect(result.errorTrails).toHaveLength(0);
      expect(result.byDevice).toEqual({});
      expect(result.byDifficulty).toEqual({});
    });

    test('should throw error when calculateDifficulty fails', () => {
      calculateDifficulty.mockImplementation(() => {
        throw new Error('Calculation failed');
      });

      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'else', 1100),
        createMockRecord('device1', 'p1', 1, 'target', 1200)
      ];

      expect(() => detectErrorTrails(rawData)).toThrow('Error detecting error trails: Calculation failed');
    });

    test('should include correct record structure in error trails', () => {
      const rawData = [
        createMockRecord('device1', 'p1', 1, 'start', 1000),
        createMockRecord('device1', 'p1', 1, 'else', 1100),
        createMockRecord('device1', 'p1', 1, 'target', 1200)
      ];

      const result = detectErrorTrails(rawData);

      const errorTrail = result.errorTrails[0];
      expect(errorTrail.records).toHaveLength(3);
      expect(errorTrail.records[0]).toMatchObject({
        mark: 'start',
        action: 'start',
        x: 100,
        y: 200,
        timestamp: 1000
      });
      expect(errorTrail.records[1]).toMatchObject({
        mark: 'else',
        action: 'else'
      });
      expect(errorTrail.records[2]).toMatchObject({
        mark: 'target',
        action: 'target'
      });
    });
  });

  describe('getUniqueDifficulties', () => {
    test('should return sorted unique difficulties', () => {
      const errorTrails = [
        { difficulty: 5.5 },
        { difficulty: 3.2 },
        { difficulty: 5.5 }, // duplicate
        { difficulty: 1.0 }
      ];

      const result = getUniqueDifficulties(errorTrails);

      expect(result).toEqual([1.0, 3.2, 5.5]);
    });

    test('should handle empty array', () => {
      const result = getUniqueDifficulties([]);

      expect(result).toEqual([]);
    });

    test('should handle single difficulty', () => {
      const errorTrails = [{ difficulty: 2.5 }];

      const result = getUniqueDifficulties(errorTrails);

      expect(result).toEqual([2.5]);
    });
  });

  describe('getUniqueDevices', () => {
    test('should return devices sorted by deviceOrder', () => {
      const errorTrails = [
        { deviceName: 'Device-C', deviceOrder: 'C' },
        { deviceName: 'Device-A', deviceOrder: 'A' },
        { deviceName: 'Device-B', deviceOrder: 'B' },
        { deviceName: 'Device-A', deviceOrder: 'A' } // duplicate
      ];

      const result = getUniqueDevices(errorTrails);

      expect(result).toEqual(['Device-A', 'Device-B', 'Device-C']);
    });

    test('should handle empty array', () => {
      const result = getUniqueDevices([]);

      expect(result).toEqual([]);
    });

    test('should handle missing deviceOrder', () => {
      const errorTrails = [
        { deviceName: 'Device-B' }, // no deviceOrder
        { deviceName: 'Device-A', deviceOrder: 'A' }
      ];

      const result = getUniqueDevices(errorTrails);

      expect(result).toEqual(['Device-B', 'Device-A']); // Without deviceOrder, falls back to alphabetical
    });

    test('should use first occurrence deviceOrder for duplicate devices', () => {
      const errorTrails = [
        { deviceName: 'Device-A', deviceOrder: 'A' },
        { deviceName: 'Device-A', deviceOrder: 'Z' } // different order, should be ignored
      ];

      const result = getUniqueDevices(errorTrails);

      expect(result).toEqual(['Device-A']);
    });
  });
});
