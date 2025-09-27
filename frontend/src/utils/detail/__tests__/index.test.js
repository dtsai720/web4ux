import { describe, test, expect } from 'vitest';

// Mock all the imported modules to avoid dependency issues
vi.mock('../apiUtils', () => ({
  fetchApiData: vi.fn(),
  processApiResponse: vi.fn()
}));

vi.mock('../dataUtils', () => ({
  processData: vi.fn(),
  formatData: vi.fn()
}));

vi.mock('../errorTrailUtils', () => ({
  analyzeErrorTrails: vi.fn(),
  getErrorStats: vi.fn()
}));

vi.mock('../moveTimeUtils', () => ({
  calculateMoveTime: vi.fn(),
  analyzeMovePattern: vi.fn()
}));

vi.mock('../statsUtils', () => ({
  calculateStats: vi.fn(),
  aggregateStats: vi.fn()
}));

vi.mock('../TrailStats', () => ({
  TrailStats: class MockTrailStats {
    constructor() {
      this.data = {};
    }
  }
}));

vi.mock('../StatsAggregator', () => ({
  StatsAggregator: class MockStatsAggregator {
    constructor() {
      this.results = {};
    }
  }
}));

vi.mock('../organizationUtils', () => ({
  organizeData: vi.fn(),
  structureResults: vi.fn()
}));

vi.mock('../outlierAnalysisUtils', () => ({
  analyzeOutliers: vi.fn(),
  detectAnomalies: vi.fn()
}));

import * as detailIndex from '../index.js';

describe('utils/detail index', () => {
  test('should export all expected modules and classes', () => {
    // Test that the index file exports exist
    expect(detailIndex).toBeDefined();
    expect(typeof detailIndex).toBe('object');
  });

  test('should export TrailStats class', () => {
    expect(detailIndex.TrailStats).toBeDefined();
    expect(typeof detailIndex.TrailStats).toBe('function');

    // Test that it can be instantiated
    const instance = new detailIndex.TrailStats();
    expect(instance).toBeInstanceOf(detailIndex.TrailStats);
  });

  test('should export StatsAggregator class', () => {
    expect(detailIndex.StatsAggregator).toBeDefined();
    expect(typeof detailIndex.StatsAggregator).toBe('function');

    // Test that it can be instantiated
    const instance = new detailIndex.StatsAggregator();
    expect(instance).toBeInstanceOf(detailIndex.StatsAggregator);
  });

  test('should re-export functions from apiUtils', () => {
    expect(detailIndex.fetchApiData).toBeDefined();
    expect(detailIndex.processApiResponse).toBeDefined();
  });

  test('should re-export functions from dataUtils', () => {
    expect(detailIndex.processData).toBeDefined();
    expect(detailIndex.formatData).toBeDefined();
  });

  test('should re-export functions from errorTrailUtils', () => {
    expect(detailIndex.analyzeErrorTrails).toBeDefined();
    expect(detailIndex.getErrorStats).toBeDefined();
  });

  test('should re-export functions from moveTimeUtils', () => {
    expect(detailIndex.calculateMoveTime).toBeDefined();
    expect(detailIndex.analyzeMovePattern).toBeDefined();
  });

  test('should re-export functions from statsUtils', () => {
    expect(detailIndex.calculateStats).toBeDefined();
    expect(detailIndex.aggregateStats).toBeDefined();
  });

  test('should re-export functions from organizationUtils', () => {
    expect(detailIndex.organizeData).toBeDefined();
    expect(detailIndex.structureResults).toBeDefined();
  });

  test('should re-export functions from outlierAnalysisUtils', () => {
    expect(detailIndex.analyzeOutliers).toBeDefined();
    expect(detailIndex.detectAnomalies).toBeDefined();
  });

  test('should have all exports as functions or constructors', () => {
    const exports = Object.keys(detailIndex);

    exports.forEach(exportName => {
      const exportedItem = detailIndex[exportName];
      expect(['function', 'object']).toContain(typeof exportedItem);
    });
  });

  test('should maintain consistent export structure', () => {
    // Test that the exports are stable and don't change unexpectedly
    const exportKeys = Object.keys(detailIndex);
    expect(exportKeys.length).toBeGreaterThan(0);

    // Ensure specific key exports exist
    expect(exportKeys).toContain('TrailStats');
    expect(exportKeys).toContain('StatsAggregator');
  });
});
