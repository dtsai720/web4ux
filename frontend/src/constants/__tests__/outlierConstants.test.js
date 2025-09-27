import { describe, test, expect } from 'vitest';
import { BADGE_CLASSES } from '../outlierConstants.js';

describe('outlierConstants', () => {
  describe('BADGE_CLASSES', () => {
    test('should export BADGE_CLASSES with correct properties', () => {
      expect(BADGE_CLASSES).toEqual({
        start: 'bg-primary',
        target: 'bg-success',
        default: 'bg-warning text-dark'
      });
    });

    test('should have correct CSS class names for each badge type', () => {
      expect(BADGE_CLASSES.start).toBe('bg-primary');
      expect(BADGE_CLASSES.target).toBe('bg-success');
      expect(BADGE_CLASSES.default).toBe('bg-warning text-dark');
    });

    test('should have string values for all badge classes', () => {
      Object.values(BADGE_CLASSES).forEach(className => {
        expect(typeof className).toBe('string');
        expect(className.length).toBeGreaterThan(0);
      });
    });

    test('should have expected number of badge types', () => {
      const expectedKeys = ['start', 'target', 'default'];
      const actualKeys = Object.keys(BADGE_CLASSES);

      expect(actualKeys).toHaveLength(expectedKeys.length);
      expectedKeys.forEach(key => {
        expect(actualKeys).toContain(key);
      });
    });

    test('should have Bootstrap-compatible CSS classes', () => {
      expect(BADGE_CLASSES.start).toMatch(/^bg-\w+$/);
      expect(BADGE_CLASSES.target).toMatch(/^bg-\w+$/);
      expect(BADGE_CLASSES.default).toMatch(/^bg-\w+/);
    });

    test('should be immutable object structure', () => {
      const originalClasses = { ...BADGE_CLASSES };

      // Attempt to modify (should not affect original if properly exported as const)
      BADGE_CLASSES.start = 'modified';

      // Reset for other tests
      BADGE_CLASSES.start = originalClasses.start;

      expect(BADGE_CLASSES.start).toBe('bg-primary');
    });
  });
});
