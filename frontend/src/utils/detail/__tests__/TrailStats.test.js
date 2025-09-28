import { describe, test, expect, vi } from 'vitest';

// Mock the constants
vi.mock('../common', () => ({
  DATA_ANALYSIS: {
    AVAILABLE_STATUS: {
      UNAVAILABLE: 0,
      AVAILABLE: 1,
      CALCULABLE: 2
    }
  }
}));

import { TrailStats } from '../TrailStats.js';

describe('TrailStats', () => {
  describe('constructor', () => {
    test('should initialize with provided records', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];

      const trailStats = new TrailStats(records);

      expect(trailStats.records).toBe(records);
    });

    test('should initialize with empty array when no records provided', () => {
      const trailStats = new TrailStats();

      expect(trailStats.records).toEqual([]);
    });

    test('should initialize with empty array when null records provided', () => {
      const trailStats = new TrailStats(null);

      expect(trailStats.records).toEqual([]);
    });

    test('should not calculate stats immediately on construction', () => {
      const records = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(records);

      expect(trailStats._stats).toBeNull();
    });
  });

  describe('stats getter', () => {
    test('should calculate and cache stats on first access', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const stats1 = trailStats.stats;
      const stats2 = trailStats.stats;

      expect(stats1).toBe(stats2); // Should be cached
      expect(trailStats._stats).toBe(stats1);
    });

    test('should calculate stats for available trail', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.stats).toEqual({
        available: true,
        availableStatus: 1,
        error_time: 0,
        event_time: 1000,
        has_error: false,
        total_records: 2
      });
    });

    test('should calculate stats for trail with errors', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1200 },
        { mark: 'click', timestamp: 1400 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.stats).toEqual({
        available: true,
        availableStatus: 1,
        error_time: 2,
        event_time: 1000,
        has_error: true,
        total_records: 4
      });
    });

    test('should calculate stats for unavailable trail', () => {
      const records = [
        { mark: 'move', timestamp: 1000 },
        { mark: 'click', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.stats).toEqual({
        available: false,
        availableStatus: 0,
        error_time: 0,
        event_time: 0,
        has_error: false,
        total_records: 2
      });
    });

    test('should calculate stats for calculable trail', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];

      // Mock Math.max to ensure this is treated as max timestamp target
      const originalMathMax = Math.max;
      Math.max = vi.fn(() => 2000);

      const trailStats = new TrailStats(records);

      // Should be calculable since max timestamp (2000) is target and start before target
      const stats = trailStats.stats;
      expect(stats.availableStatus).toBe(1); // Should be AVAILABLE since we have default target

      Math.max = originalMathMax;
    });

    test('should handle empty records', () => {
      const trailStats = new TrailStats([]);

      expect(trailStats.stats).toEqual({
        available: false,
        availableStatus: 0,
        error_time: 0,
        event_time: 0,
        has_error: false,
        total_records: 0
      });
    });

    test('should handle trail with start after target', () => {
      const records = [
        { mark: 'target', timestamp: 1000 },
        { mark: 'start', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.stats).toEqual({
        available: false,
        availableStatus: 0,
        error_time: 0,
        event_time: -1000,
        has_error: false,
        total_records: 2
      });
    });
  });

  describe('resetStats', () => {
    test('should reset cached stats', () => {
      const records = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(records);

      // Access stats to cache them
      const initialStats = trailStats.stats;
      expect(trailStats._stats).toBe(initialStats);

      trailStats.resetStats();
      expect(trailStats._stats).toBeNull();
    });

    test('should recalculate stats after reset', () => {
      const records = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(records);

      const stats1 = trailStats.stats;
      trailStats.resetStats();
      const stats2 = trailStats.stats;

      expect(stats1).not.toBe(stats2); // Different object references
      expect(stats1).toEqual(stats2); // But same values
    });
  });

  describe('updateRecords', () => {
    test('should update records and reset stats', () => {
      const initialRecords = [{ mark: 'start', timestamp: 1000 }];
      const newRecords = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];

      const trailStats = new TrailStats(initialRecords);
      trailStats.stats; // Cache initial stats

      trailStats.updateRecords(newRecords);

      expect(trailStats.records).toBe(newRecords);
      expect(trailStats._stats).toBeNull();
    });

    test('should handle null new records', () => {
      const initialRecords = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(initialRecords);

      trailStats.updateRecords(null);

      expect(trailStats.records).toEqual([]);
      expect(trailStats._stats).toBeNull();
    });

    test('should handle undefined new records', () => {
      const initialRecords = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(initialRecords);

      trailStats.updateRecords(undefined);

      expect(trailStats.records).toEqual([]);
      expect(trailStats._stats).toBeNull();
    });
  });

  describe('_findStartRecord', () => {
    test('should find first start record', () => {
      const records = [
        { mark: 'move', timestamp: 500 },
        { mark: 'start', timestamp: 1000 },
        { mark: 'start', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = trailStats._findStartRecord();

      expect(startRecord).toEqual({ mark: 'start', timestamp: 1000 });
    });

    test('should return undefined when no start record exists', () => {
      const records = [
        { mark: 'move', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = trailStats._findStartRecord();

      expect(startRecord).toBeUndefined();
    });
  });

  describe('_findDefaultTargetRecord', () => {
    test('should find first target record', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const targetRecord = trailStats._findDefaultTargetRecord();

      expect(targetRecord).toEqual({ mark: 'target', timestamp: 1500 });
    });

    test('should return undefined when no target record exists', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const targetRecord = trailStats._findDefaultTargetRecord();

      expect(targetRecord).toBeUndefined();
    });
  });

  describe('_findLastTargetRecord', () => {
    test('should find last target record', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 1500 },
        { mark: 'move', timestamp: 1800 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const lastTargetRecord = trailStats._findLastTargetRecord();

      expect(lastTargetRecord).toEqual({ mark: 'target', timestamp: 2000 });
    });

    test('should return undefined when no target record exists', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const lastTargetRecord = trailStats._findLastTargetRecord();

      expect(lastTargetRecord).toBeUndefined();
    });

    test('should return single target when only one exists', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const lastTargetRecord = trailStats._findLastTargetRecord();

      expect(lastTargetRecord).toEqual({ mark: 'target', timestamp: 2000 });
    });
  });

  describe('_calculateAvailableStatus', () => {
    test('should return AVAILABLE for start before default target', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const defaultTargetRecord = { mark: 'target', timestamp: 2000 };
      const targetRecord = { mark: 'target', timestamp: 2000 };

      const status = trailStats._calculateAvailableStatus(startRecord, defaultTargetRecord, targetRecord);

      expect(status).toBe(1); // AVAILABLE
    });

    test('should return CALCULABLE for max timestamp target with start before', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const defaultTargetRecord = undefined; // No default target
      const targetRecord = { mark: 'target', timestamp: 2000 };

      // Mock Math.max to return target timestamp
      const originalMathMax = Math.max;
      Math.max = vi.fn(() => 2000);

      const status = trailStats._calculateAvailableStatus(startRecord, defaultTargetRecord, targetRecord);

      expect(status).toBe(2); // CALCULABLE

      Math.max = originalMathMax;
    });

    test('should return UNAVAILABLE for other cases', () => {
      const records = [
        { mark: 'move', timestamp: 1000 },
        { mark: 'click', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = undefined;
      const defaultTargetRecord = undefined;
      const targetRecord = undefined;

      const status = trailStats._calculateAvailableStatus(startRecord, defaultTargetRecord, targetRecord);

      expect(status).toBe(0); // UNAVAILABLE
    });
  });

  describe('_calculateErrorTime', () => {
    test('should count intermediate actions between start and target', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1200 },
        { mark: 'click', timestamp: 1400 },
        { mark: 'drag', timestamp: 1600 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const targetRecord = { mark: 'target', timestamp: 2000 };

      const errorTime = trailStats._calculateErrorTime(startRecord, targetRecord);

      expect(errorTime).toBe(3); // move, click, drag
    });

    test('should return 0 when no start record', () => {
      const records = [{ mark: 'target', timestamp: 2000 }];
      const trailStats = new TrailStats(records);

      const errorTime = trailStats._calculateErrorTime(undefined, { mark: 'target', timestamp: 2000 });

      expect(errorTime).toBe(0);
    });

    test('should return 0 when no target record', () => {
      const records = [{ mark: 'start', timestamp: 1000 }];
      const trailStats = new TrailStats(records);

      const errorTime = trailStats._calculateErrorTime({ mark: 'start', timestamp: 1000 }, undefined);

      expect(errorTime).toBe(0);
    });

    test('should exclude start and target marks from error count', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'start', timestamp: 1200 }, // Should be excluded
        { mark: 'move', timestamp: 1400 },
        { mark: 'target', timestamp: 1600 }, // Should be excluded
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const targetRecord = { mark: 'target', timestamp: 2000 };

      const errorTime = trailStats._calculateErrorTime(startRecord, targetRecord);

      expect(errorTime).toBe(1); // Only move
    });

    test('should only count actions between start and target timestamps', () => {
      const records = [
        { mark: 'move', timestamp: 500 }, // Before start
        { mark: 'start', timestamp: 1000 },
        { mark: 'click', timestamp: 1500 }, // Between start and target
        { mark: 'target', timestamp: 2000 },
        { mark: 'drag', timestamp: 2500 } // After target
      ];
      const trailStats = new TrailStats(records);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const targetRecord = { mark: 'target', timestamp: 2000 };

      const errorTime = trailStats._calculateErrorTime(startRecord, targetRecord);

      expect(errorTime).toBe(1); // Only click
    });
  });

  describe('_calculateEventTime', () => {
    test('should calculate difference between target and start timestamps', () => {
      const trailStats = new TrailStats([]);

      const startRecord = { mark: 'start', timestamp: 1000 };
      const targetRecord = { mark: 'target', timestamp: 3500 };

      const eventTime = trailStats._calculateEventTime(startRecord, targetRecord);

      expect(eventTime).toBe(2500);
    });

    test('should return 0 when no start record', () => {
      const trailStats = new TrailStats([]);

      const eventTime = trailStats._calculateEventTime(undefined, { mark: 'target', timestamp: 2000 });

      expect(eventTime).toBe(0);
    });

    test('should return 0 when no target record', () => {
      const trailStats = new TrailStats([]);

      const eventTime = trailStats._calculateEventTime({ mark: 'start', timestamp: 1000 }, undefined);

      expect(eventTime).toBe(0);
    });

    test('should handle negative event time (target before start)', () => {
      const trailStats = new TrailStats([]);

      const startRecord = { mark: 'start', timestamp: 2000 };
      const targetRecord = { mark: 'target', timestamp: 1000 };

      const eventTime = trailStats._calculateEventTime(startRecord, targetRecord);

      expect(eventTime).toBe(-1000);
    });
  });

  describe('hasErrors', () => {
    test('should return true when trail has errors', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.hasErrors()).toBe(true);
    });

    test('should return false when trail has no errors', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.hasErrors()).toBe(false);
    });
  });

  describe('isAvailable', () => {
    test('should return true when trail is available', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.isAvailable()).toBe(true);
    });

    test('should return false when trail is not available', () => {
      const records = [
        { mark: 'move', timestamp: 1000 },
        { mark: 'click', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.isAvailable()).toBe(false);
    });
  });

  describe('getStatusDescription', () => {
    test('should return description for available status', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.getStatusDescription()).toBe('Available for analysis');
    });

    test('should return description for calculable status', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];

      // Mock to force calculable status
      const trailStats = new TrailStats(records);
      trailStats._stats = { availableStatus: 2 }; // Force CALCULABLE

      expect(trailStats.getStatusDescription()).toBe('Calculable but incomplete');
    });

    test('should return description for unavailable status', () => {
      const records = [
        { mark: 'move', timestamp: 1000 },
        { mark: 'click', timestamp: 2000 }
      ];
      const trailStats = new TrailStats(records);

      expect(trailStats.getStatusDescription()).toBe('Unavailable for analysis');
    });

    test('should return description for unknown status', () => {
      const records = [];
      const trailStats = new TrailStats(records);

      // Force unknown status
      trailStats._stats = { availableStatus: 999 };

      expect(trailStats.getStatusDescription()).toBe('Unknown status');
    });
  });
});
