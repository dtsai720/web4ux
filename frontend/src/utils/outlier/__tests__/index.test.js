import { describe, test, expect } from 'vitest';
import * as outlierUtilsExports from '../index.js';

describe('outlier utils index', () => {
  test('should export all functions from outlierUtils', () => {
    // Check that the export works
    expect(outlierUtilsExports).toBeTruthy();
  });

  test('should have expected exports from outlierUtils', () => {
    const expectedExports = [
      'formatDateTime',
      'isOutlier',
      'detectDoubleClicks',
      'calculateDoubleClickStats',
      'trailHasDoubleClick',
      'getOutlierSummary'
    ];

    expectedExports.forEach(exportName => {
      expect(outlierUtilsExports).toHaveProperty(exportName);
      expect(typeof outlierUtilsExports[exportName]).toBe('function');
    });
  });

  test('should export working functions', () => {
    const { formatDateTime, isOutlier } = outlierUtilsExports;

    // Test that exported functions work
    expect(typeof formatDateTime).toBe('function');
    expect(typeof isOutlier).toBe('function');

    // Basic functionality test
    expect(formatDateTime(null)).toBe('');
    expect(typeof isOutlier).toBe('function');
  });

  test('should not have any default export', () => {
    expect(outlierUtilsExports.default).toBeUndefined();
  });

  test('should maintain function signatures', () => {
    const {
      formatDateTime,
      isOutlier,
      detectDoubleClicks,
      calculateDoubleClickStats,
      trailHasDoubleClick,
      getOutlierSummary
    } = outlierUtilsExports;

    // Check function parameter counts
    expect(formatDateTime.length).toBe(1);
    expect(isOutlier.length).toBe(2);
    expect(detectDoubleClicks.length).toBe(1);
    expect(calculateDoubleClickStats.length).toBe(1);
    expect(trailHasDoubleClick.length).toBe(1);
    expect(getOutlierSummary.length).toBe(1);
  });
});
