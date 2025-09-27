import { describe, test, expect } from 'vitest';
import * as deleteUtilsExports from '../index.js';
import { handleDoubleClick, toggleActiveTab } from '../deleteUtils.js';

describe('delete utils index', () => {
  test('should export all functions from deleteUtils', () => {
    expect(deleteUtilsExports.handleDoubleClick).toBe(handleDoubleClick);
    expect(deleteUtilsExports.toggleActiveTab).toBe(toggleActiveTab);
  });

  test('should have all expected exports', () => {
    const expectedExports = ['handleDoubleClick', 'toggleActiveTab'];

    expectedExports.forEach(exportName => {
      expect(deleteUtilsExports).toHaveProperty(exportName);
      expect(typeof deleteUtilsExports[exportName]).toBe('function');
    });
  });

  test('should export all functions as named exports', () => {
    const exportNames = Object.keys(deleteUtilsExports);

    expect(exportNames).toContain('handleDoubleClick');
    expect(exportNames).toContain('toggleActiveTab');
    expect(exportNames.length).toBe(2);
  });

  test('should export working functions', () => {
    const { handleDoubleClick, toggleActiveTab } = deleteUtilsExports;

    // Test that exported functions work correctly
    const mockFn = () => {};
    const handler = handleDoubleClick(mockFn);
    expect(typeof handler).toBe('function');

    const mockSetActiveTab = () => {};
    expect(() => toggleActiveTab('test', mockSetActiveTab)).not.toThrow();
  });

  test('should not have any default export', () => {
    // Since the index.js uses export *, there should be no default export
    expect(deleteUtilsExports.default).toBeUndefined();
  });
});
