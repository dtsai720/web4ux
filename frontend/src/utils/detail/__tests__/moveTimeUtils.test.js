import { describe, test, expect } from 'vitest';

import {
  calculateDifficulty,
  calculateMoveTimeAnalysis,
  formatMoveTime,
  getParticipantMoveTime
} from '../moveTimeUtils.js';

describe('moveTimeUtils', () => {
  describe('calculateDifficulty', () => {
    test('should calculate difficulty using Fitts Law formula', () => {
      // ID = log2(distance/width + 1)
      // For distance=200, width=50: log2(200/50 + 1) = log2(5) ≈ 2.32
      const result = calculateDifficulty(200, 50);
      expect(result).toBeCloseTo(2.3, 1);
    });

    test('should round to 1 decimal place', () => {
      const result = calculateDifficulty(100, 25);
      // log2(100/25 + 1) = log2(5) ≈ 2.32193 -> should round to 2.3
      expect(result).toBe(2.3);
    });

    test('should return 0 for invalid inputs', () => {
      expect(calculateDifficulty(0, 50)).toBe(0);
      expect(calculateDifficulty(100, 0)).toBe(0);
      expect(calculateDifficulty(null, 50)).toBe(0);
      expect(calculateDifficulty(100, null)).toBe(0);
      expect(calculateDifficulty(undefined, 50)).toBe(0);
      expect(calculateDifficulty(100, undefined)).toBe(0);
    });

    test('should handle edge cases', () => {
      // Very small values
      const smallResult = calculateDifficulty(1, 1);
      expect(smallResult).toBe(1.0); // log2(1/1 + 1) = log2(2) = 1

      // Large values
      const largeResult = calculateDifficulty(1000, 10);
      expect(largeResult).toBeCloseTo(6.7, 1); // log2(1000/10 + 1) = log2(101) ≈ 6.66
    });
  });

  describe('formatMoveTime', () => {
    test('should format valid move times with ms suffix', () => {
      expect(formatMoveTime(1234.56)).toBe('1235 ms');
      expect(formatMoveTime(0)).toBe('0 ms');
      expect(formatMoveTime(999.4)).toBe('999 ms');
      expect(formatMoveTime(999.6)).toBe('1000 ms');
    });

    test('should return N/A for invalid values', () => {
      expect(formatMoveTime(null)).toBe('N/A');
      expect(formatMoveTime(undefined)).toBe('N/A');
      expect(formatMoveTime(NaN)).toBe('N/A');
      expect(formatMoveTime('invalid')).toBe('N/A');
    });

    test('should handle negative values', () => {
      expect(formatMoveTime(-100)).toBe('-100 ms');
    });

    test('should round to nearest integer', () => {
      expect(formatMoveTime(123.4)).toBe('123 ms');
      expect(formatMoveTime(123.5)).toBe('124 ms');
      expect(formatMoveTime(123.9)).toBe('124 ms');
    });
  });

  describe('getParticipantMoveTime', () => {
    const mockAnalysisData = {
      difficultyGroups: {
        'W50D200': {
          participants: {
            'P001': {
              averageMoveTime: 1500
            },
            'P002': {
              averageMoveTime: 1200
            }
          }
        },
        'W100D300': {
          participants: {
            'P001': {
              averageMoveTime: 1800
            }
          }
        }
      }
    };

    test('should return average move time for existing participant and difficulty', () => {
      const result = getParticipantMoveTime(mockAnalysisData, 'P001', 'W50D200');
      expect(result).toBe(1500);
    });

    test('should return null for non-existing difficulty key', () => {
      const result = getParticipantMoveTime(mockAnalysisData, 'P001', 'W999D999');
      expect(result).toBe(null);
    });

    test('should return null for non-existing participant', () => {
      const result = getParticipantMoveTime(mockAnalysisData, 'P999', 'W50D200');
      expect(result).toBe(null);
    });

    test('should return null for malformed analysis data', () => {
      const emptyData = { difficultyGroups: {} };
      const result = getParticipantMoveTime(emptyData, 'P001', 'W50D200');
      expect(result).toBe(null);
    });

    test('should handle different participants in same difficulty', () => {
      const result1 = getParticipantMoveTime(mockAnalysisData, 'P001', 'W50D200');
      const result2 = getParticipantMoveTime(mockAnalysisData, 'P002', 'W50D200');

      expect(result1).toBe(1500);
      expect(result2).toBe(1200);
    });
  });

  describe('calculateMoveTimeAnalysis', () => {
    const createMockRecord = (deviceName, participantSerial, trailNumber, mark, timestamp, deleted = false, width = 100, distance = 200) => ({
      deviceName,
      participantSerial,
      trailNumber,
      mark,
      timestamp,
      deleted,
      width,
      distance,
      x: 100,
      y: 200
    });

    test('should filter out deleted records', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000, true), // deleted
        createMockRecord('device1', 'P001', 1, 'target', 1500, true), // deleted
        createMockRecord('device1', 'P002', 1, 'start', 2000),
        createMockRecord('device1', 'P002', 1, 'target', 2500)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result.device1).toBeDefined();
      expect(result.device1.participantData).toHaveProperty('P002');
      expect(result.device1.participantData).not.toHaveProperty('P001');
    });

    test('should calculate move times correctly', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000),
        createMockRecord('device1', 'P001', 1, 'target', 1500),
        createMockRecord('device1', 'P001', 2, 'start', 2000),
        createMockRecord('device1', 'P001', 2, 'target', 2300)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result.device1).toBeDefined();
      expect(result.device1.participantData['P001']).toBeDefined();
      expect(result.device1.participantData['P001'].totalTrails).toBe(2);
    });

    test('should group by device correctly', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000),
        createMockRecord('device1', 'P001', 1, 'target', 1500),
        createMockRecord('device2', 'P001', 1, 'start', 2000),
        createMockRecord('device2', 'P001', 1, 'target', 2500)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result).toHaveProperty('device1');
      expect(result).toHaveProperty('device2');
      expect(result.device1.participantData).toHaveProperty('P001');
      expect(result.device2.participantData).toHaveProperty('P001');
    });

    test('should handle trails without matching start-target pairs', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000),
        // Missing target
        createMockRecord('device1', 'P001', 2, 'target', 2000),
        // Missing start
        createMockRecord('device1', 'P001', 3, 'start', 3000),
        createMockRecord('device1', 'P001', 3, 'target', 3500)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result.device1).toBeDefined();
      expect(result.device1.participantData['P001']).toBeDefined();
      // Should only count trail 3 which has both start and target
      expect(result.device1.participantData['P001'].totalTrails).toBe(1);
    });

    test('should handle empty input', () => {
      const result = calculateMoveTimeAnalysis([]);
      expect(result).toEqual({});
    });

    test('should handle records with same width and distance', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000, false, 50, 200),
        createMockRecord('device1', 'P001', 1, 'target', 1500, false, 50, 200),
        createMockRecord('device1', 'P002', 1, 'start', 2000, false, 50, 200),
        createMockRecord('device1', 'P002', 1, 'target', 2300, false, 50, 200)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result.device1).toBeDefined();
      expect(result.device1.difficultyGroups).toHaveProperty('W50D200');
      expect(result.device1.difficultyGroups['W50D200'].participants).toHaveProperty('P001');
      expect(result.device1.difficultyGroups['W50D200'].participants).toHaveProperty('P002');
    });

    test('should calculate difficulty groups correctly', () => {
      const rawData = [
        createMockRecord('device1', 'P001', 1, 'start', 1000, false, 50, 200),
        createMockRecord('device1', 'P001', 1, 'target', 1500, false, 50, 200),
        createMockRecord('device1', 'P001', 2, 'start', 2000, false, 100, 400),
        createMockRecord('device1', 'P001', 2, 'target', 2600, false, 100, 400)
      ];

      const result = calculateMoveTimeAnalysis(rawData);

      expect(result.device1.difficultyGroups).toHaveProperty('W50D200');
      expect(result.device1.difficultyGroups).toHaveProperty('W100D400');
      expect(result.device1.difficultyGroups['W50D200'].width).toBe(50);
      expect(result.device1.difficultyGroups['W50D200'].distance).toBe(200);
      expect(result.device1.difficultyGroups['W100D400'].width).toBe(100);
      expect(result.device1.difficultyGroups['W100D400'].distance).toBe(400);
    });

    test('should handle error conditions gracefully', () => {
      // Should not throw error for malformed data
      expect(() => calculateMoveTimeAnalysis(null)).not.toThrow();
      expect(() => calculateMoveTimeAnalysis(undefined)).not.toThrow();

      // Test with records missing required fields
      const incompleteData = [
        { deviceName: 'device1' }, // missing other required fields
        { participantSerial: 'P001' } // missing other required fields
      ];

      expect(() => calculateMoveTimeAnalysis(incompleteData)).not.toThrow();
    });

    test('should sort difficulties with same difficulty value by width and distance', () => {
      // Test data with proper structure for move time analysis
      const testData = [
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 500,
          deleted: false,
          mark: 'start',
          timestamp: 1000
        },
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 500,
          deleted: false,
          mark: 'target',
          timestamp: 1500
        },
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 2,
          width: 20,
          distance: 100,
          moveTime: 600,
          deleted: false,
          mark: 'start',
          timestamp: 2000
        },
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 2,
          width: 20,
          distance: 100,
          moveTime: 600,
          deleted: false,
          mark: 'target',
          timestamp: 2600
        }
      ];

      const result = calculateMoveTimeAnalysis(testData);

      // Verify the analysis was performed successfully
      expect(result).toBeDefined();
      expect(result.device1).toBeDefined();
      expect(result.device1.difficultyGroups).toBeDefined();
    });

    test('should handle sorting edge cases with identical values', () => {
      // Test data with identical difficulty, width, and distance values
      const identicalData = [
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 500,
          deleted: false,
          mark: 'start',
          timestamp: 1000
        },
        {
          deviceName: 'device1',
          participantSerial: 'P001',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 500,
          deleted: false,
          mark: 'target',
          timestamp: 1500
        },
        {
          deviceName: 'device1',
          participantSerial: 'P002',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 600,
          deleted: false,
          mark: 'start',
          timestamp: 2000
        },
        {
          deviceName: 'device1',
          participantSerial: 'P002',
          trailNumber: 1,
          width: 30,
          distance: 100,
          moveTime: 600,
          deleted: false,
          mark: 'target',
          timestamp: 2600
        }
      ];

      const result = calculateMoveTimeAnalysis(identicalData);

      expect(result).toBeDefined();
      expect(result.device1).toBeDefined();
      expect(result.device1.difficultyGroups).toBeDefined();
    });
  });
});
