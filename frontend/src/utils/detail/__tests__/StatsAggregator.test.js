import { describe, test, expect, vi, beforeEach } from 'vitest';

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

import { StatsAggregator } from '../StatsAggregator.js';

describe('StatsAggregator', () => {
  let aggregator;

  beforeEach(() => {
    aggregator = new StatsAggregator();
  });

  describe('constructor', () => {
    test('should initialize with empty trails and null cached stats', () => {
      expect(aggregator.hasTrails()).toBe(false);
      expect(aggregator.getTrailCount()).toBe(0);
    });
  });

  describe('addTrail', () => {
    test('should add trail with statistics', () => {
      const trailStats = {
        availableStatus: 1,
        has_error: false,
        event_time: 1000
      };

      aggregator.addTrail('trail1', trailStats);

      expect(aggregator.hasTrails()).toBe(true);
      expect(aggregator.getTrailCount()).toBe(1);
    });

    test('should reset cached stats when adding trail', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };

      aggregator.addTrail('trail1', trailStats);
      aggregator.getAggregatedStats(); // This caches the stats

      aggregator.addTrail('trail2', trailStats);

      const stats = aggregator.getAggregatedStats();
      expect(stats.totalTrails).toBe(2);
    });

    test('should overwrite existing trail with same key', () => {
      const trailStats1 = { availableStatus: 1, has_error: false, event_time: 1000 };
      const trailStats2 = { availableStatus: 1, has_error: true, event_time: 2000 };

      aggregator.addTrail('trail1', trailStats1);
      aggregator.addTrail('trail1', trailStats2);

      expect(aggregator.getTrailCount()).toBe(1);

      const stats = aggregator.getAggregatedStats();
      expect(stats.trailsWithErrors).toBe(1);
      expect(stats.totalEventTime).toBe(2000);
    });
  });

  describe('removeTrail', () => {
    test('should remove trail by key', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };

      aggregator.addTrail('trail1', trailStats);
      aggregator.addTrail('trail2', trailStats);

      aggregator.removeTrail('trail1');

      expect(aggregator.getTrailCount()).toBe(1);
    });

    test('should reset cached stats when removing trail', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };

      aggregator.addTrail('trail1', trailStats);
      aggregator.addTrail('trail2', trailStats);
      aggregator.getAggregatedStats(); // Cache stats

      aggregator.removeTrail('trail1');

      const stats = aggregator.getAggregatedStats();
      expect(stats.totalTrails).toBe(1);
    });

    test('should handle removing non-existent trail gracefully', () => {
      aggregator.removeTrail('nonexistent');

      expect(aggregator.getTrailCount()).toBe(0);
      expect(aggregator.hasTrails()).toBe(false);
    });
  });

  describe('clearTrails', () => {
    test('should clear all trails', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };

      aggregator.addTrail('trail1', trailStats);
      aggregator.addTrail('trail2', trailStats);

      aggregator.clearTrails();

      expect(aggregator.getTrailCount()).toBe(0);
      expect(aggregator.hasTrails()).toBe(false);
    });

    test('should reset cached stats when clearing trails', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };

      aggregator.addTrail('trail1', trailStats);
      aggregator.getAggregatedStats(); // Cache stats

      aggregator.clearTrails();

      const stats = aggregator.getAggregatedStats();
      expect(stats.totalTrails).toBe(0);
    });
  });

  describe('getAggregatedStats', () => {
    test('should calculate aggregated stats for available trails', () => {
      aggregator.addTrail('trail1', {
        availableStatus: 1,
        has_error: false,
        event_time: 1000
      });
      aggregator.addTrail('trail2', {
        availableStatus: 1,
        has_error: true,
        event_time: 2000
      });

      const stats = aggregator.getAggregatedStats();

      expect(stats).toEqual({
        totalTrails: 2,
        availableTrails: 2,
        unavailableTrails: 0,
        calculableTrails: 0,
        trailsWithErrors: 1,
        totalEventTime: 3000,
        avgEventTime: 1500
      });
    });

    test('should calculate stats for mixed trail statuses', () => {
      aggregator.addTrail('trail1', {
        availableStatus: 1, // AVAILABLE
        has_error: false,
        event_time: 1000
      });
      aggregator.addTrail('trail2', {
        availableStatus: 0, // UNAVAILABLE
        has_error: false,
        event_time: 0
      });
      aggregator.addTrail('trail3', {
        availableStatus: 2, // CALCULABLE
        has_error: true,
        event_time: 1500
      });

      const stats = aggregator.getAggregatedStats();

      expect(stats).toEqual({
        totalTrails: 3,
        availableTrails: 1,
        unavailableTrails: 1,
        calculableTrails: 1,
        trailsWithErrors: 1,
        totalEventTime: 2500,
        avgEventTime: 2500 // Only available trails count for average
      });
    });

    test('should handle empty trails collection', () => {
      const stats = aggregator.getAggregatedStats();

      expect(stats).toEqual({
        totalTrails: 0,
        availableTrails: 0,
        unavailableTrails: 0,
        calculableTrails: 0,
        trailsWithErrors: 0,
        totalEventTime: 0,
        avgEventTime: 0
      });
    });

    test('should cache aggregated stats and return same object', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };
      aggregator.addTrail('trail1', trailStats);

      const stats1 = aggregator.getAggregatedStats();
      const stats2 = aggregator.getAggregatedStats();

      expect(stats1).toBe(stats2); // Should be the same object reference
    });

    test('should handle trails with missing event_time', () => {
      aggregator.addTrail('trail1', {
        availableStatus: 1,
        has_error: false
        // event_time is missing
      });

      const stats = aggregator.getAggregatedStats();

      expect(stats.totalEventTime).toBe(0);
      expect(stats.avgEventTime).toBe(0);
    });

    test('should handle null trail stats', () => {
      aggregator.addTrail('trail1', null);
      aggregator.addTrail('trail2', {
        availableStatus: 1,
        has_error: false,
        event_time: 1000
      });

      const stats = aggregator.getAggregatedStats();

      expect(stats.totalTrails).toBe(1); // Only trail2 should be counted
    });

    test('should handle unknown availableStatus values', () => {
      aggregator.addTrail('trail1', {
        availableStatus: 999, // Unknown status
        has_error: false,
        event_time: 1000
      });

      const stats = aggregator.getAggregatedStats();

      expect(stats.totalTrails).toBe(1);
      expect(stats.availableTrails).toBe(0);
      expect(stats.unavailableTrails).toBe(0);
      expect(stats.calculableTrails).toBe(0);
    });
  });

  describe('recalculateStats', () => {
    test('should force recalculation of stats', () => {
      const trailStats = { availableStatus: 1, has_error: false, event_time: 1000 };
      aggregator.addTrail('trail1', trailStats);

      const stats1 = aggregator.getAggregatedStats();
      const stats2 = aggregator.recalculateStats();

      expect(stats1).not.toBe(stats2); // Should be different object references
      expect(stats1).toEqual(stats2); // But same values
    });
  });

  describe('getTrailsByStatus', () => {
    beforeEach(() => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 0, has_error: false, event_time: 0 });
      aggregator.addTrail('trail3', { availableStatus: 1, has_error: true, event_time: 2000 });
      aggregator.addTrail('trail4', { availableStatus: 2, has_error: false, event_time: 1500 });
    });

    test('should return trails with available status', () => {
      const availableTrails = aggregator.getTrailsByStatus(1);

      expect(availableTrails).toEqual(['trail1', 'trail3']);
    });

    test('should return trails with unavailable status', () => {
      const unavailableTrails = aggregator.getTrailsByStatus(0);

      expect(unavailableTrails).toEqual(['trail2']);
    });

    test('should return trails with calculable status', () => {
      const calculableTrails = aggregator.getTrailsByStatus(2);

      expect(calculableTrails).toEqual(['trail4']);
    });

    test('should return empty array for non-existent status', () => {
      const result = aggregator.getTrailsByStatus(999);

      expect(result).toEqual([]);
    });

    test('should skip null trail stats', () => {
      aggregator.addTrail('nullTrail', null);
      const availableTrails = aggregator.getTrailsByStatus(1);

      expect(availableTrails).toEqual(['trail1', 'trail3']);
    });
  });

  describe('getTrailsWithErrors', () => {
    test('should return trails that have errors', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 1, has_error: true, event_time: 2000 });
      aggregator.addTrail('trail3', { availableStatus: 0, has_error: true, event_time: 0 });

      const errorTrails = aggregator.getTrailsWithErrors();

      expect(errorTrails).toEqual(['trail2', 'trail3']);
    });

    test('should return empty array when no trails have errors', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });

      const errorTrails = aggregator.getTrailsWithErrors();

      expect(errorTrails).toEqual([]);
    });

    test('should skip null trail stats', () => {
      aggregator.addTrail('nullTrail', null);
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: true, event_time: 1000 });

      const errorTrails = aggregator.getTrailsWithErrors();

      expect(errorTrails).toEqual(['trail1']);
    });
  });

  describe('getSummary', () => {
    test('should return summary with rates and totals', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 1, has_error: true, event_time: 2000 });
      aggregator.addTrail('trail3', { availableStatus: 0, has_error: false, event_time: 0 });
      aggregator.addTrail('trail4', { availableStatus: 2, has_error: false, event_time: 1500 });

      const summary = aggregator.getSummary();

      expect(summary).toEqual({
        total: 4,
        available: 2,
        unavailable: 1,
        calculable: 1,
        withErrors: 1,
        availabilityRate: 50, // 2/4 * 100
        errorRate: 25, // 1/4 * 100
        avgEventTime: 2250 // Math.round((1000+2000)/2)
      });
    });

    test('should handle empty aggregator', () => {
      const summary = aggregator.getSummary();

      expect(summary).toEqual({
        total: 0,
        available: 0,
        unavailable: 0,
        calculable: 0,
        withErrors: 0,
        availabilityRate: 0,
        errorRate: 0,
        avgEventTime: 0
      });
    });

    test('should round rates to nearest integer', () => {
      // Add 3 trails: 1 available, 1 error = 33.33% availability, 33.33% error rate
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 0, has_error: true, event_time: 0 });
      aggregator.addTrail('trail3', { availableStatus: 0, has_error: false, event_time: 0 });

      const summary = aggregator.getSummary();

      expect(summary.availabilityRate).toBe(33); // Math.round(33.33)
      expect(summary.errorRate).toBe(33); // Math.round(33.33)
    });
  });

  describe('hasTrails', () => {
    test('should return false for empty aggregator', () => {
      expect(aggregator.hasTrails()).toBe(false);
    });

    test('should return true when trails are added', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });

      expect(aggregator.hasTrails()).toBe(true);
    });

    test('should return false after clearing trails', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.clearTrails();

      expect(aggregator.hasTrails()).toBe(false);
    });
  });

  describe('getTrailCount', () => {
    test('should return 0 for empty aggregator', () => {
      expect(aggregator.getTrailCount()).toBe(0);
    });

    test('should return correct count after adding trails', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 1, has_error: false, event_time: 2000 });

      expect(aggregator.getTrailCount()).toBe(2);
    });

    test('should return correct count after removing trails', () => {
      aggregator.addTrail('trail1', { availableStatus: 1, has_error: false, event_time: 1000 });
      aggregator.addTrail('trail2', { availableStatus: 1, has_error: false, event_time: 2000 });
      aggregator.removeTrail('trail1');

      expect(aggregator.getTrailCount()).toBe(1);
    });
  });
});
