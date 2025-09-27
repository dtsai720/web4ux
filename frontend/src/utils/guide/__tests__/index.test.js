import { describe, test, expect } from 'vitest';
import * as guideUtilsExports from '../index.js';
import { toggleAccordion, isAccordionActive } from '../accordionUtils.js';

describe('guide utils index', () => {
  test('should export all functions from accordionUtils', () => {
    expect(guideUtilsExports.toggleAccordion).toBe(toggleAccordion);
    expect(guideUtilsExports.isAccordionActive).toBe(isAccordionActive);
  });

  test('should have all expected exports', () => {
    const expectedExports = ['toggleAccordion', 'isAccordionActive'];

    expectedExports.forEach(exportName => {
      expect(guideUtilsExports).toHaveProperty(exportName);
      expect(typeof guideUtilsExports[exportName]).toBe('function');
    });
  });

  test('should export all functions as named exports', () => {
    const exportNames = Object.keys(guideUtilsExports);

    expect(exportNames).toContain('toggleAccordion');
    expect(exportNames).toContain('isAccordionActive');
    expect(exportNames.length).toBe(2);
  });

  test('should export working functions', () => {
    const { toggleAccordion, isAccordionActive } = guideUtilsExports;

    // Test that exported functions work correctly
    expect(isAccordionActive('test', 'test')).toBe(true);
    expect(isAccordionActive('test', 'other')).toBe(false);

    const mockSetActiveAccordion = () => {};
    expect(() => toggleAccordion('test', 'other', mockSetActiveAccordion)).not.toThrow();
  });

  test('should not have any default export', () => {
    // Since the index.js uses export *, there should be no default export
    expect(guideUtilsExports.default).toBeUndefined();
  });

  test('should maintain function signatures', () => {
    const { toggleAccordion, isAccordionActive } = guideUtilsExports;

    // toggleAccordion should accept 3 parameters
    expect(toggleAccordion.length).toBe(3);

    // isAccordionActive should accept 2 parameters
    expect(isAccordionActive.length).toBe(2);
  });

  test('should export functions that handle edge cases', () => {
    const { isAccordionActive } = guideUtilsExports;

    // Test edge cases work as expected
    expect(isAccordionActive(null, null)).toBe(true);
    expect(isAccordionActive(undefined, undefined)).toBe(true);
    expect(isAccordionActive('', '')).toBe(true);
    expect(isAccordionActive('test', null)).toBe(false);
  });

  test('should have consistent naming pattern', () => {
    const exportNames = Object.keys(guideUtilsExports);

    // All exports should be camelCase functions
    exportNames.forEach(name => {
      expect(name).toMatch(/^[a-z][a-zA-Z]*$/);
      expect(typeof guideUtilsExports[name]).toBe('function');
    });
  });

  test('should group related accordion functionality', () => {
    const exportNames = Object.keys(guideUtilsExports);

    // Should include accordion-related functions
    const hasToggleFunction = exportNames.some(name => name.includes('toggle') || name.includes('Toggle'));
    const hasCheckFunction = exportNames.some(name => name.includes('is') || name.includes('Active'));

    expect(hasToggleFunction).toBe(true);
    expect(hasCheckFunction).toBe(true);
  });
});
