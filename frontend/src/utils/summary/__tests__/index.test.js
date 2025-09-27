import { describe, test, expect } from 'vitest';
import * as summaryUtilsExports from '../index.js';
import summaryUtilsDefault from '../index.js';
import {
  formatDate,
  getSortIcon,
  loadSummaries,
  handleSort,
  summaryUtils
} from '../summaryUtils.jsx';

describe('summary utils index', () => {
  test('should export all named exports from summaryUtils', () => {
    expect(summaryUtilsExports.formatDate).toBe(formatDate);
    expect(summaryUtilsExports.getSortIcon).toBe(getSortIcon);
    expect(summaryUtilsExports.loadSummaries).toBe(loadSummaries);
    expect(summaryUtilsExports.handleSort).toBe(handleSort);
    expect(summaryUtilsExports.summaryUtils).toBe(summaryUtils);
  });

  test('should export default from summaryUtils', () => {
    expect(summaryUtilsDefault).toBe(summaryUtils);
  });

  test('should have all expected named exports', () => {
    const expectedFunctions = [
      'formatDate',
      'getSortIcon',
      'loadSummaries',
      'handleSort'
    ];

    expectedFunctions.forEach(exportName => {
      expect(summaryUtilsExports).toHaveProperty(exportName);
      expect(typeof summaryUtilsExports[exportName]).toBe('function');
    });

    // summaryUtils is an object, not a function
    expect(summaryUtilsExports).toHaveProperty('summaryUtils');
    expect(typeof summaryUtilsExports.summaryUtils).toBe('object');
  });

  test('should export default as object with utility functions', () => {
    expect(typeof summaryUtilsDefault).toBe('object');
    expect(summaryUtilsDefault).toHaveProperty('formatDate');
    expect(summaryUtilsDefault).toHaveProperty('getSortIcon');
    expect(summaryUtilsDefault).toHaveProperty('loadSummaries');
    expect(summaryUtilsDefault).toHaveProperty('handleSort');
  });
});
