import { describe, test, expect, vi } from 'vitest';

// Mock dependencies
vi.mock('../../outlier/outlierUtils', () => ({
  calculateDoubleClickStats: vi.fn()
}));

vi.mock('../common/constants', () => ({
  OUTLIER_DETECTION: {
    STANDARD_DEVIATION_MULTIPLIER: 2
  },
  DATA_ANALYSIS: {
    AVAILABLE_STATUS: {
      AVAILABLE: 1,
      UNAVAILABLE: 0,
      CALCULABLE: 2
    }
  }
}));

import {
  calculateParticipantErrorData,
  calculateStatisticalMetrics,
  markOutliers,
  processDeviceOutlierData
} from '../outlierAnalysisUtils.js';
import { calculateDoubleClickStats } from '../../outlier/outlierUtils';

describe('outlierAnalysisUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    calculateDoubleClickStats.mockReturnValue({
      count: 0,
      trails: []
    });
  });

  describe('calculateParticipantErrorData', () => {
    test('should calculate error data for participant with available trails', () => {
      const participant = {
        trail1: {
          stats: {
            available: true,
            has_error: true,
            error_time: 5
          }
        },
        trail2: {
          stats: {
            available: true,
            has_error: false,
            error_time: 0
          }
        },
        trail3: {
          stats: {
            available: false,
            has_error: true,
            error_time: 3
          }
        }
      };

      calculateDoubleClickStats.mockReturnValue({
        count: 1,
        trails: [{ trailKey: 'trail1' }]
      });

      const result = calculateParticipantErrorData(participant);

      expect(result).toEqual({
        errorCount: 1,
        errorTime: 5,
        trailCount: 2,
        errorTrails: ['trail1'],
        allAvailableTrails: ['trail1', 'trail2'],
        doubleClickCount: 1,
        doubleClickTrails: [{ trailKey: 'trail1' }],
        isOutlier: false
      });
    });

    test('should include calculable trails in analysis', () => {
      const participant = {
        trail1: {
          stats: {
            available: false,
            availableStatus: 2,
            has_error: true,
            error_time: 3
          }
        }
      };

      const result = calculateParticipantErrorData(participant);

      expect(result.trailCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.allAvailableTrails).toEqual(['trail1']);
    });

    test('should handle participant with no trails', () => {
      const participant = {};

      const result = calculateParticipantErrorData(participant);

      expect(result).toEqual({
        errorCount: 0,
        errorTime: 0,
        trailCount: 0,
        errorTrails: [],
        allAvailableTrails: [],
        doubleClickCount: 0,
        doubleClickTrails: [],
        isOutlier: false
      });
    });

    test('should skip trails without stats', () => {
      const participant = {
        trail1: {
          // No stats property
        },
        trail2: {
          stats: {
            available: true,
            has_error: true,
            error_time: 2
          }
        }
      };

      const result = calculateParticipantErrorData(participant);

      expect(result.trailCount).toBe(1);
      expect(result.errorCount).toBe(1);
    });

    test('should filter out stats key from trail processing', () => {
      const participant = {
        stats: {
          // This should be ignored
          available: true,
          has_error: true
        },
        trail1: {
          stats: {
            available: true,
            has_error: false,
            error_time: 0
          }
        }
      };

      const result = calculateParticipantErrorData(participant);

      expect(result.trailCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    test('should accumulate error time from multiple error trails', () => {
      const participant = {
        trail1: {
          stats: {
            available: true,
            has_error: true,
            error_time: 5
          }
        },
        trail2: {
          stats: {
            available: true,
            has_error: true,
            error_time: 3
          }
        }
      };

      const result = calculateParticipantErrorData(participant);

      expect(result.errorCount).toBe(2);
      expect(result.errorTime).toBe(8);
      expect(result.errorTrails).toEqual(['trail1', 'trail2']);
    });
  });

  describe('calculateStatisticalMetrics', () => {
    test('should calculate statistics for valid data', () => {
      const errorCounts = [1, 2, 3, 4, 5];
      const errorTimes = [10, 20, 30, 40, 50];

      const result = calculateStatisticalMetrics(errorCounts, errorTimes);

      expect(result.avgErrorCount).toBe(3);
      expect(result.avgErrorTime).toBe(30);
      expect(result.stdDevErrorCount).toBeCloseTo(Math.sqrt(2), 5);
      expect(result.stdDevErrorTime).toBeCloseTo(Math.sqrt(200), 5);
    });

    test('should handle empty arrays', () => {
      const result = calculateStatisticalMetrics([], []);

      expect(result).toEqual({
        avgErrorCount: 0,
        stdDevErrorCount: 0,
        avgErrorTime: 0,
        stdDevErrorTime: 0
      });
    });

    test('should handle single value arrays', () => {
      const result = calculateStatisticalMetrics([5], [10]);

      expect(result).toEqual({
        avgErrorCount: 5,
        stdDevErrorCount: 0,
        avgErrorTime: 10,
        stdDevErrorTime: 0
      });
    });

    test('should handle arrays with zeros', () => {
      const errorCounts = [0, 0, 0];
      const errorTimes = [0, 0, 0];

      const result = calculateStatisticalMetrics(errorCounts, errorTimes);

      expect(result).toEqual({
        avgErrorCount: 0,
        stdDevErrorCount: 0,
        avgErrorTime: 0,
        stdDevErrorTime: 0
      });
    });

    test('should calculate correct standard deviation for identical values', () => {
      const errorCounts = [3, 3, 3];
      const errorTimes = [15, 15, 15];

      const result = calculateStatisticalMetrics(errorCounts, errorTimes);

      expect(result.avgErrorCount).toBe(3);
      expect(result.avgErrorTime).toBe(15);
      expect(result.stdDevErrorCount).toBe(0);
      expect(result.stdDevErrorTime).toBe(0);
    });
  });

  describe('markOutliers', () => {
    test('should mark participants as outliers based on error count threshold', () => {
      const deviceParticipants = {
        P001: { errorCount: 10, errorTime: 5 },
        P002: { errorCount: 2, errorTime: 1 },
        P003: { errorCount: 1, errorTime: 0 }
      };

      const deviceStats = {
        avgErrorCount: 3,
        stdDevErrorCount: 2, // threshold = 3 + 2*2 = 7
        avgErrorTime: 2,
        stdDevErrorTime: 1   // threshold = 2 + 2*1 = 4
      };

      markOutliers(deviceParticipants, deviceStats, ['P001', 'P002', 'P003']);

      expect(deviceParticipants.P001.isOutlier).toBe(true);  // errorCount 10 > 7
      expect(deviceParticipants.P002.isOutlier).toBe(false); // errorCount 2 <= 7, errorTime 1 <= 4
      expect(deviceParticipants.P003.isOutlier).toBe(false); // errorCount 1 <= 7, errorTime 0 <= 4
    });

    test('should mark participants as outliers based on error time threshold', () => {
      const deviceParticipants = {
        P001: { errorCount: 1, errorTime: 10 },
        P002: { errorCount: 2, errorTime: 3 }
      };

      const deviceStats = {
        avgErrorCount: 5,
        stdDevErrorCount: 1, // threshold = 5 + 2*1 = 7
        avgErrorTime: 2,
        stdDevErrorTime: 2   // threshold = 2 + 2*2 = 6
      };

      markOutliers(deviceParticipants, deviceStats, ['P001', 'P002']);

      expect(deviceParticipants.P001.isOutlier).toBe(true);  // errorTime 10 > 6
      expect(deviceParticipants.P002.isOutlier).toBe(false); // errorTime 3 <= 6, errorCount 2 <= 7
    });

    test('should mark outliers when either threshold is exceeded', () => {
      const deviceParticipants = {
        P001: { errorCount: 8, errorTime: 7 } // Both exceed thresholds
      };

      const deviceStats = {
        avgErrorCount: 3,
        stdDevErrorCount: 2, // threshold = 7
        avgErrorTime: 2,
        stdDevErrorTime: 2   // threshold = 6
      };

      markOutliers(deviceParticipants, deviceStats, ['P001']);

      expect(deviceParticipants.P001.isOutlier).toBe(true);
    });

    test('should handle empty participant list', () => {
      const deviceParticipants = {};
      const deviceStats = {
        avgErrorCount: 3,
        stdDevErrorCount: 2,
        avgErrorTime: 2,
        stdDevErrorTime: 1
      };

      expect(() => {
        markOutliers(deviceParticipants, deviceStats, []);
      }).not.toThrow();
    });

    test('should handle zero standard deviations', () => {
      const deviceParticipants = {
        P001: { errorCount: 5, errorTime: 5 }
      };

      const deviceStats = {
        avgErrorCount: 3,
        stdDevErrorCount: 0, // threshold = 3 + 2*0 = 3
        avgErrorTime: 2,
        stdDevErrorTime: 0   // threshold = 2 + 2*0 = 2
      };

      markOutliers(deviceParticipants, deviceStats, ['P001']);

      expect(deviceParticipants.P001.isOutlier).toBe(true); // Both 5 > 3 and 5 > 2
    });
  });

  describe('processDeviceOutlierData', () => {
    test('should process device data and mark outliers', () => {
      const device = {
        P001: {
          trail1: {
            stats: { available: true, has_error: true, error_time: 5 }
          }
        },
        P002: {
          trail1: {
            stats: { available: true, has_error: false, error_time: 0 }
          }
        }
      };

      calculateDoubleClickStats.mockReturnValue({ count: 0, trails: [] });

      const result = processDeviceOutlierData(device);

      expect(result).toHaveProperty('participants');
      expect(result).toHaveProperty('stats');
      expect(result.participants).toHaveProperty('P001');
      expect(result.participants).toHaveProperty('P002');
      expect(result.participants.P001.errorCount).toBe(1);
      expect(result.participants.P002.errorCount).toBe(0);
      expect(typeof result.participants.P001.isOutlier).toBe('boolean');
    });

    test('should handle device with no participants', () => {
      const device = {};

      const result = processDeviceOutlierData(device);

      expect(result.participants).toEqual({});
      expect(result.stats).toEqual({
        avgErrorCount: 0,
        stdDevErrorCount: 0,
        avgErrorTime: 0,
        stdDevErrorTime: 0
      });
    });

    test('should filter out stats key from participants', () => {
      const device = {
        stats: {
          existingDeviceStats: true
        },
        P001: {
          trail1: {
            stats: { available: true, has_error: false, error_time: 0 }
          }
        }
      };

      const result = processDeviceOutlierData(device);

      expect(result.participants).toHaveProperty('P001');
      expect(result.participants).not.toHaveProperty('stats');
      expect(Object.keys(result.participants)).toHaveLength(1);
    });

    test('should calculate correct device statistics', () => {
      const device = {
        P001: {
          trail1: { stats: { available: true, has_error: true, error_time: 3 } },
          trail2: { stats: { available: true, has_error: true, error_time: 2 } }
        },
        P002: {
          trail1: { stats: { available: true, has_error: false, error_time: 0 } }
        }
      };

      const result = processDeviceOutlierData(device);

      // P001: errorCount=2, errorTime=5; P002: errorCount=0, errorTime=0
      // avgErrorCount = (2+0)/2 = 1, avgErrorTime = (5+0)/2 = 2.5
      expect(result.stats.avgErrorCount).toBe(1);
      expect(result.stats.avgErrorTime).toBe(2.5);
    });

    test('should call calculateDoubleClickStats for each participant', () => {
      const device = {
        P001: { trail1: { stats: { available: true, has_error: false, error_time: 0 } } },
        P002: { trail1: { stats: { available: true, has_error: false, error_time: 0 } } }
      };

      processDeviceOutlierData(device);

      expect(calculateDoubleClickStats).toHaveBeenCalledTimes(2);
      expect(calculateDoubleClickStats).toHaveBeenCalledWith(device.P001);
      expect(calculateDoubleClickStats).toHaveBeenCalledWith(device.P002);
    });
  });
});
