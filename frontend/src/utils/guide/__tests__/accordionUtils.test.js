import { describe, test, expect, vi } from 'vitest';
import {
  toggleAccordion,
  isAccordionActive
} from '../accordionUtils.js';

describe('accordionUtils', () => {
  describe('toggleAccordion', () => {
    test('should set accordion active when different id is provided', () => {
      const mockSetActiveAccordion = vi.fn();
      const currentActive = 'accordion1';
      const newId = 'accordion2';

      toggleAccordion(newId, currentActive, mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledWith('accordion2');
    });

    test('should close accordion when same id is provided', () => {
      const mockSetActiveAccordion = vi.fn();
      const currentActive = 'accordion1';
      const sameId = 'accordion1';

      toggleAccordion(sameId, currentActive, mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledWith('');
    });

    test('should open accordion when no accordion is currently active', () => {
      const mockSetActiveAccordion = vi.fn();
      const currentActive = '';
      const newId = 'accordion1';

      toggleAccordion(newId, currentActive, mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledWith('accordion1');
    });

    test('should handle null current active accordion', () => {
      const mockSetActiveAccordion = vi.fn();
      const currentActive = null;
      const newId = 'accordion1';

      toggleAccordion(newId, currentActive, mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledWith('accordion1');
    });

    test('should handle undefined current active accordion', () => {
      const mockSetActiveAccordion = vi.fn();
      const currentActive = undefined;
      const newId = 'accordion1';

      toggleAccordion(newId, currentActive, mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledWith('accordion1');
    });

    test('should call setActiveAccordion exactly once', () => {
      const mockSetActiveAccordion = vi.fn();

      toggleAccordion('test', 'other', mockSetActiveAccordion);

      expect(mockSetActiveAccordion).toHaveBeenCalledTimes(1);
    });

    test('should handle empty string ids', () => {
      const mockSetActiveAccordion = vi.fn();

      // Empty string id with different active accordion
      toggleAccordion('', 'active', mockSetActiveAccordion);
      expect(mockSetActiveAccordion).toHaveBeenCalledWith('');

      // Empty string id with empty string active accordion (should close)
      vi.clearAllMocks();
      toggleAccordion('', '', mockSetActiveAccordion);
      expect(mockSetActiveAccordion).toHaveBeenCalledWith('');
    });

    test('should handle numeric ids', () => {
      const mockSetActiveAccordion = vi.fn();

      toggleAccordion(1, 2, mockSetActiveAccordion);
      expect(mockSetActiveAccordion).toHaveBeenCalledWith(1);

      vi.clearAllMocks();
      toggleAccordion(1, 1, mockSetActiveAccordion);
      expect(mockSetActiveAccordion).toHaveBeenCalledWith('');
    });

    test('should throw when setActiveAccordion is null', () => {
      expect(() => {
        toggleAccordion('test', 'other', null);
      }).toThrow();
    });

    test('should throw when setActiveAccordion is undefined', () => {
      expect(() => {
        toggleAccordion('test', 'other', undefined);
      }).toThrow();
    });

    test('should handle complex id strings', () => {
      const mockSetActiveAccordion = vi.fn();
      const complexId = 'accordion-section-1-subsection-a';

      toggleAccordion(complexId, 'different', mockSetActiveAccordion);
      expect(mockSetActiveAccordion).toHaveBeenCalledWith(complexId);
    });
  });

  describe('isAccordionActive', () => {
    test('should return true when ids match', () => {
      const result = isAccordionActive('accordion1', 'accordion1');
      expect(result).toBe(true);
    });

    test('should return false when ids do not match', () => {
      const result = isAccordionActive('accordion1', 'accordion2');
      expect(result).toBe(false);
    });

    test('should return false when activeAccordion is null', () => {
      const result = isAccordionActive('accordion1', null);
      expect(result).toBe(false);
    });

    test('should return false when activeAccordion is undefined', () => {
      const result = isAccordionActive('accordion1', undefined);
      expect(result).toBe(false);
    });

    test('should return true when both are empty strings', () => {
      const result = isAccordionActive('', '');
      expect(result).toBe(true);
    });

    test('should return false when one is empty string and other is not', () => {
      expect(isAccordionActive('', 'accordion1')).toBe(false);
      expect(isAccordionActive('accordion1', '')).toBe(false);
    });

    test('should handle numeric ids', () => {
      expect(isAccordionActive(1, 1)).toBe(true);
      expect(isAccordionActive(1, 2)).toBe(false);
      expect(isAccordionActive(1, '1')).toBe(false); // Different types
    });

    test('should be case sensitive', () => {
      expect(isAccordionActive('Accordion1', 'accordion1')).toBe(false);
      expect(isAccordionActive('ACCORDION1', 'accordion1')).toBe(false);
    });

    test('should handle special characters in ids', () => {
      const specialId = 'accordion-1_section@2024!';
      expect(isAccordionActive(specialId, specialId)).toBe(true);
      expect(isAccordionActive(specialId, 'different')).toBe(false);
    });

    test('should handle whitespace in ids', () => {
      const idWithSpaces = 'accordion 1';
      expect(isAccordionActive(idWithSpaces, idWithSpaces)).toBe(true);
      expect(isAccordionActive(idWithSpaces, 'accordion1')).toBe(false);
    });

    test('should be a pure function', () => {
      // Multiple calls with same inputs should return same result
      const id = 'test';
      const activeAccordion = 'test';

      const result1 = isAccordionActive(id, activeAccordion);
      const result2 = isAccordionActive(id, activeAccordion);
      const result3 = isAccordionActive(id, activeAccordion);

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
      expect(result1).toBe(true);
    });

    test('should handle boolean values', () => {
      expect(isAccordionActive(true, true)).toBe(true);
      expect(isAccordionActive(false, false)).toBe(true);
      expect(isAccordionActive(true, false)).toBe(false);
    });

    test('should return correct type', () => {
      const result = isAccordionActive('test', 'test');
      expect(typeof result).toBe('boolean');
    });
  });
});
