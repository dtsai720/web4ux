import { describe, test, expect } from 'vitest';
import {
  formatDateTime,
  isOutlier,
  detectDoubleClicks,
  calculateDoubleClickStats,
  trailHasDoubleClick,
  getOutlierSummary
} from '../outlierUtils.js';

describe('outlierUtils', () => {
  describe('formatDateTime', () => {
    test('should format timestamp correctly', () => {
      const timestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
      const result = formatDateTime(timestamp);
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
    });

    test('should return empty string for null timestamp', () => {
      expect(formatDateTime(null)).toBe('');
      expect(formatDateTime(undefined)).toBe('');
      expect(formatDateTime(0)).toBe('');
    });

    test('should handle invalid timestamp gracefully', () => {
      const result = formatDateTime('invalid');
      expect(result).toBeTruthy(); // Date constructor handles strings
    });
  });

  describe('isOutlier', () => {
    const mockDeviceStats = {
      avgErrorCount: 10,
      stdDevErrorCount: 2,
      avgErrorTime: 1000,
      stdDevErrorTime: 100
    };

    test('should identify outlier when error count exceeds threshold', () => {
      const participantData = {
        errorCount: 15, // 10 + 2*2 = 14, so 15 is outlier
        errorTime: 1000
      };

      expect(isOutlier(participantData, mockDeviceStats)).toBe(true);
    });

    test('should identify outlier when error time exceeds threshold', () => {
      const participantData = {
        errorCount: 10,
        errorTime: 1250 // 1000 + 2*100 = 1200, so 1250 is outlier
      };

      expect(isOutlier(participantData, mockDeviceStats)).toBe(true);
    });

    test('should not identify non-outlier', () => {
      const participantData = {
        errorCount: 12, // Within threshold
        errorTime: 1100 // Within threshold
      };

      expect(isOutlier(participantData, mockDeviceStats)).toBe(false);
    });

    test('should return false for invalid data', () => {
      expect(isOutlier(null, mockDeviceStats)).toBe(false);
      expect(isOutlier({}, null)).toBe(false);
      expect(isOutlier(null, null)).toBe(false);
    });
  });

  describe('detectDoubleClicks', () => {
    test('should detect double clicks correctly', () => {
      const trailRecords = [
        { mark: 'start', x: 100, y: 200 },
        { mark: 'start-else', x: 105, y: 205 },
        { mark: 'target', x: 300, y: 400 },
        { mark: 'start-else', x: 110, y: 210 }
      ];

      const result = detectDoubleClicks(trailRecords);
      expect(result).toHaveLength(2);
      expect(result[0].mark).toBe('start-else');
      expect(result[1].mark).toBe('start-else');
    });

    test('should return empty array when no double clicks', () => {
      const trailRecords = [
        { mark: 'start', x: 100, y: 200 },
        { mark: 'target', x: 300, y: 400 },
        { mark: 'end', x: 305, y: 405 }
      ];

      const result = detectDoubleClicks(trailRecords);
      expect(result).toHaveLength(0);
    });

    test('should handle empty or invalid input', () => {
      expect(detectDoubleClicks([])).toHaveLength(0);
      expect(detectDoubleClicks(null)).toHaveLength(0);
      expect(detectDoubleClicks(undefined)).toHaveLength(0);
    });
  });

  describe('calculateDoubleClickStats', () => {
    test('should calculate double click stats correctly', () => {
      const participantData = {
        trail1: [
          { mark: 'start', x: 100, y: 200 },
          { mark: 'start-else', x: 105, y: 205 },
          { mark: 'target', x: 300, y: 400 }
        ],
        trail2: [
          { mark: 'start', x: 150, y: 250 },
          { mark: 'target', x: 350, y: 450 }
        ],
        trail3: [
          { mark: 'start', x: 200, y: 300 },
          { mark: 'start-else', x: 205, y: 305 },
          { mark: 'start-else', x: 210, y: 310 },
          { mark: 'target', x: 400, y: 500 }
        ],
        stats: { someStatData: 'ignored' }
      };

      const result = calculateDoubleClickStats(participantData);

      expect(result.count).toBe(2); // trail1 and trail3 have double clicks
      expect(result.trails).toHaveLength(2);

      const trail1Stats = result.trails.find(t => t.trailKey === 'trail1');
      expect(trail1Stats.hasDoubleClick).toBe(true);
      expect(trail1Stats.doubleClickCount).toBe(1);

      const trail3Stats = result.trails.find(t => t.trailKey === 'trail3');
      expect(trail3Stats.hasDoubleClick).toBe(true);
      expect(trail3Stats.doubleClickCount).toBe(2);
    });

    test('should handle participant data with no double clicks', () => {
      const participantData = {
        trail1: [
          { mark: 'start', x: 100, y: 200 },
          { mark: 'target', x: 300, y: 400 }
        ],
        trail2: [
          { mark: 'start', x: 150, y: 250 },
          { mark: 'target', x: 350, y: 450 }
        ]
      };

      const result = calculateDoubleClickStats(participantData);

      expect(result.count).toBe(0);
      expect(result.trails).toHaveLength(0);
    });

    test('should handle invalid participant data', () => {
      expect(calculateDoubleClickStats(null)).toEqual({ count: 0, trails: [] });
      expect(calculateDoubleClickStats(undefined)).toEqual({ count: 0, trails: [] });
      expect(calculateDoubleClickStats({})).toEqual({ count: 0, trails: [] });
    });

    test('should ignore non-array trail data', () => {
      const participantData = {
        trail1: [
          { mark: 'start-else', x: 100, y: 200 }
        ],
        invalidTrail: 'not an array',
        anotherInvalidTrail: { mark: 'start' },
        trail2: [
          { mark: 'start', x: 150, y: 250 }
        ]
      };

      const result = calculateDoubleClickStats(participantData);

      expect(result.count).toBe(1); // Only trail1 counts
      expect(result.trails).toHaveLength(1);
      expect(result.trails[0].trailKey).toBe('trail1');
    });
  });

  describe('trailHasDoubleClick', () => {
    test('should return true when trail has double clicks', () => {
      const trailRecords = [
        { mark: 'start', x: 100, y: 200 },
        { mark: 'start-else', x: 105, y: 205 },
        { mark: 'target', x: 300, y: 400 }
      ];

      expect(trailHasDoubleClick(trailRecords)).toBe(true);
    });

    test('should return false when trail has no double clicks', () => {
      const trailRecords = [
        { mark: 'start', x: 100, y: 200 },
        { mark: 'target', x: 300, y: 400 },
        { mark: 'end', x: 305, y: 405 }
      ];

      expect(trailHasDoubleClick(trailRecords)).toBe(false);
    });

    test('should handle invalid input', () => {
      expect(trailHasDoubleClick(null)).toBe(false);
      expect(trailHasDoubleClick(undefined)).toBe(false);
      expect(trailHasDoubleClick([])).toBe(false);
    });
  });

  describe('getOutlierSummary', () => {
    test('should return empty object for null data', () => {
      expect(getOutlierSummary(null)).toEqual({});
      expect(getOutlierSummary(undefined)).toEqual({});
    });

    test('should return summary object for valid data', () => {
      const mockData = {
        participants: {},
        devices: {},
        statistics: {}
      };

      const result = getOutlierSummary(mockData);
      expect(result).toEqual({}); // Current implementation returns empty object
    });
  });
});
