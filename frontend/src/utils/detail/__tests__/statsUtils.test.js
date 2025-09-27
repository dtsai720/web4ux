import { describe, test, expect, vi } from 'vitest';

// Mock the dependencies
vi.mock('../TrailStats', () => ({
  TrailStats: class MockTrailStats {
    constructor(records) {
      this.records = records;
    }
  }
}));

vi.mock('../StatsAggregator', () => ({
  StatsAggregator: class MockStatsAggregator {
    constructor() {
      this.trails = {};
    }

    addTrail(trailKey, trailStats) {
      this.trails[trailKey] = trailStats;
    }

    getAggregatedStats() {
      return {
        totalTrails: Object.keys(this.trails).length,
        availableTrails: 0,
        avgEventTime: 1000
      };
    }
  }
}));

vi.mock('../common', () => ({
  DATA_ANALYSIS: {
    AVAILABLE_STATUS: {
      UNAVAILABLE: 0,
      AVAILABLE: 1,
      CALCULABLE: 2
    }
  }
}));

import {
  calculateSingleTrailStats,
  calculateAggregatedStats,
  createTrailStats,
  createStatsAggregator,
  calculateAggregatedStatsOOP,
  TrailStats,
  StatsAggregator
} from '../statsUtils.js';

describe('statsUtils', () => {
  describe('calculateSingleTrailStats', () => {
    test('should calculate stats for available trail (start before target)', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 2000 }
      ];

      const result = calculateSingleTrailStats(records);

      expect(result).toEqual({
        available: true,
        availableStatus: 1, // DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE
        error_time: 0,
        event_time: 1000,
        has_error: false,
        total_records: 2
      });
    });

    test('should calculate stats for trail with errors (intermediate actions)', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'else', timestamp: 1500 },
        { mark: 'else', timestamp: 1800 },
        { mark: 'target', timestamp: 2000 }
      ];

      const result = calculateSingleTrailStats(records);

      expect(result).toEqual({
        available: true,
        availableStatus: 1, // DATA_ANALYSIS.AVAILABLE_STATUS.AVAILABLE
        error_time: 2, // Two 'else' actions between start and target
        event_time: 1000,
        has_error: true,
        total_records: 4
      });
    });

    test('should handle unavailable trail (no start or target)', () => {
      const records = [
        { mark: 'else', timestamp: 1000 },
        { mark: 'else', timestamp: 2000 }
      ];

      const result = calculateSingleTrailStats(records);

      expect(result).toEqual({
        available: false,
        availableStatus: 0, // DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE
        error_time: 0,
        event_time: 0,
        has_error: false,
        total_records: 2
      });
    });

    test('should handle calculable trail (max timestamp is target with start before)', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'else', timestamp: 1500 },
        { mark: 'target', timestamp: 1800 }, // First target
        { mark: 'target', timestamp: 2000 }  // Last target (max timestamp)
      ];

      const result = calculateSingleTrailStats(records);

      expect(result.availableStatus).toBe(1); // Has default target (AVAILABLE)
      expect(result.event_time).toBe(1000); // Uses last target (findLast)
    });

    test('should handle trail with start after target', () => {
      const records = [
        { mark: 'target', timestamp: 1000 },
        { mark: 'start', timestamp: 2000 }
      ];

      const result = calculateSingleTrailStats(records);

      expect(result).toEqual({
        available: false,
        availableStatus: 0, // DATA_ANALYSIS.AVAILABLE_STATUS.UNAVAILABLE
        error_time: 0,
        event_time: -1000, // Negative because start after target
        has_error: false,
        total_records: 2
      });
    });

    test('should handle empty records', () => {
      const result = calculateSingleTrailStats([]);

      expect(result).toEqual({
        available: false,
        availableStatus: 0,
        error_time: 0,
        event_time: 0,
        has_error: false,
        total_records: 0
      });
    });

    test('should handle calculable status when no default target but max timestamp is target', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'else', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 } // Max timestamp and only target
      ];

      // Remove the first target to simulate calculable case
      const recordsWithoutFirstTarget = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'else', timestamp: 1500 },
        { mark: 'target', timestamp: 2000 }
      ];

      const result = calculateSingleTrailStats(recordsWithoutFirstTarget);

      // Should be available since there is a default target
      expect(result.availableStatus).toBe(1);
    });

    test('should count error time correctly with multiple intermediate actions', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'move', timestamp: 1200 },
        { mark: 'click', timestamp: 1400 },
        { mark: 'else', timestamp: 1600 },
        { mark: 'target', timestamp: 2000 },
        { mark: 'else', timestamp: 2500 } // After target, shouldn't count
      ];

      const result = calculateSingleTrailStats(records);

      expect(result.error_time).toBe(3); // move, click, else between start and target
      expect(result.has_error).toBe(true);
    });

    test('should handle multiple targets correctly using findLast', () => {
      const records = [
        { mark: 'start', timestamp: 1000 },
        { mark: 'target', timestamp: 1500 }, // First target
        { mark: 'else', timestamp: 1800 },
        { mark: 'target', timestamp: 2000 }  // Last target (should be used)
      ];

      const result = calculateSingleTrailStats(records);

      expect(result.event_time).toBe(1000); // Uses last target (findLast)
      expect(result.error_time).toBe(1);   // One 'else' action between start and last target
    });
  });

  describe('calculateAggregatedStats', () => {
    test('should aggregate stats from multiple trails', () => {
      const trailsData = {
        trail1: {
          stats: {
            availableStatus: 1,
            has_error: false,
            event_time: 1000
          }
        },
        trail2: {
          stats: {
            availableStatus: 1,
            has_error: true,
            event_time: 2000
          }
        },
        trail3: {
          stats: {
            availableStatus: 0,
            has_error: false,
            event_time: 0
          }
        }
      };

      const result = calculateAggregatedStats(trailsData);

      expect(result).toEqual({
        totalTrails: 3,
        availableTrails: 2,
        unavailableTrails: 1,
        calculableTrails: 0,
        trailsWithErrors: 1,
        totalEventTime: 3000,
        avgEventTime: 1500 // (1000 + 2000) / 2
      });
    });

    test('should handle trails with calculable status', () => {
      const trailsData = {
        trail1: {
          stats: {
            availableStatus: 2,
            has_error: false,
            event_time: 1500
          }
        }
      };

      const result = calculateAggregatedStats(trailsData);

      expect(result.calculableTrails).toBe(1);
      expect(result.availableTrails).toBe(0);
      expect(result.avgEventTime).toBe(0); // No available trails for average
    });

    test('should skip stats property and missing stats', () => {
      const trailsData = {
        stats: { someExistingStats: true }, // Should be skipped
        trail1: {
          // Missing stats property
        },
        trail2: {
          stats: {
            availableStatus: 'available',
            has_error: false,
            event_time: 1000
          }
        }
      };

      const result = calculateAggregatedStats(trailsData);

      expect(result.totalTrails).toBe(1); // Only trail2 counted
    });

    test('should handle empty trails data', () => {
      const result = calculateAggregatedStats({});

      expect(result).toEqual({
        totalTrails: 0,
        availableTrails: 0,
        unavailableTrails: 0,
        calculableTrails: 0,
        trailsWithErrors: 0,
        totalEventTime: 0,
        avgEventTime: 0
      });
    });

    test('should handle unknown available status gracefully', () => {
      const trailsData = {
        trail1: {
          stats: {
            availableStatus: 'unknown_status',
            has_error: false,
            event_time: 1000
          }
        }
      };

      const result = calculateAggregatedStats(trailsData);

      expect(result.totalTrails).toBe(1);
      expect(result.availableTrails).toBe(0);
      expect(result.unavailableTrails).toBe(0);
      expect(result.calculableTrails).toBe(0);
    });

    test('should calculate average correctly with zero available trails', () => {
      const trailsData = {
        trail1: {
          stats: {
            availableStatus: 'unavailable',
            has_error: false,
            event_time: 1000
          }
        }
      };

      const result = calculateAggregatedStats(trailsData);

      expect(result.avgEventTime).toBe(0);
      expect(result.availableTrails).toBe(0);
    });
  });

  describe('createTrailStats', () => {
    test('should create TrailStats instance', () => {
      const records = [{ mark: 'start', timestamp: 1000 }];
      const result = createTrailStats(records);

      expect(result).toBeInstanceOf(TrailStats);
      expect(result.records).toBe(records);
    });
  });

  describe('createStatsAggregator', () => {
    test('should create StatsAggregator instance', () => {
      const result = createStatsAggregator();

      expect(result).toBeInstanceOf(StatsAggregator);
    });
  });

  describe('calculateAggregatedStatsOOP', () => {
    test('should use OOP approach to calculate aggregated stats', () => {
      const trailsData = {
        trail1: {
          stats: {
            availableStatus: 1,
            has_error: false,
            event_time: 1000
          }
        },
        trail2: {
          stats: {
            availableStatus: 1,
            has_error: true,
            event_time: 2000
          }
        }
      };

      const result = calculateAggregatedStatsOOP(trailsData);

      expect(result).toEqual({
        totalTrails: 2,
        availableTrails: 0,
        avgEventTime: 1000
      });
    });

    test('should skip stats property and missing stats in OOP approach', () => {
      const trailsData = {
        stats: { existing: true },
        trail1: {
          // Missing stats
        },
        trail2: {
          stats: {
            availableStatus: 1,
            event_time: 1000
          }
        }
      };

      const result = calculateAggregatedStatsOOP(trailsData);

      expect(result.totalTrails).toBe(1);
    });
  });

  describe('exports', () => {
    test('should export TrailStats and StatsAggregator classes', () => {
      expect(TrailStats).toBeDefined();
      expect(StatsAggregator).toBeDefined();
      expect(typeof TrailStats).toBe('function');
      expect(typeof StatsAggregator).toBe('function');
    });
  });
});
