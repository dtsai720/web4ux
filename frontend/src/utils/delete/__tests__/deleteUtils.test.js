import { describe, test, expect, vi } from 'vitest';
import {
  handleDoubleClick,
  toggleActiveTab
} from '../deleteUtils.js';

describe('deleteUtils', () => {
  describe('handleDoubleClick', () => {
    test('should return a function when called', () => {
      const mockCloseDeleteMode = vi.fn();
      const handler = handleDoubleClick(mockCloseDeleteMode);

      expect(typeof handler).toBe('function');
      expect(mockCloseDeleteMode).not.toHaveBeenCalled();
    });

    test('should call closeDeleteMode when returned function is executed', () => {
      const mockCloseDeleteMode = vi.fn();
      const handler = handleDoubleClick(mockCloseDeleteMode);

      handler();

      expect(mockCloseDeleteMode).toHaveBeenCalledOnce();
    });

    test('should call closeDeleteMode multiple times when handler is called multiple times', () => {
      const mockCloseDeleteMode = vi.fn();
      const handler = handleDoubleClick(mockCloseDeleteMode);

      handler();
      handler();
      handler();

      expect(mockCloseDeleteMode).toHaveBeenCalledTimes(3);
    });

    test('should not affect other handlers when multiple handlers are created', () => {
      const mockCloseDeleteMode1 = vi.fn();
      const mockCloseDeleteMode2 = vi.fn();

      const handler1 = handleDoubleClick(mockCloseDeleteMode1);
      const handler2 = handleDoubleClick(mockCloseDeleteMode2);

      handler1();

      expect(mockCloseDeleteMode1).toHaveBeenCalledOnce();
      expect(mockCloseDeleteMode2).not.toHaveBeenCalled();

      handler2();

      expect(mockCloseDeleteMode1).toHaveBeenCalledOnce();
      expect(mockCloseDeleteMode2).toHaveBeenCalledOnce();
    });

    test('should work with arrow function callback', () => {
      const mockCloseDeleteMode = vi.fn();
      const handler = handleDoubleClick(() => mockCloseDeleteMode());

      handler();

      expect(mockCloseDeleteMode).toHaveBeenCalledOnce();
    });

    test('should handle null callback gracefully', () => {
      expect(() => {
        const handler = handleDoubleClick(null);
        handler();
      }).toThrow();
    });

    test('should handle undefined callback gracefully', () => {
      expect(() => {
        const handler = handleDoubleClick(undefined);
        handler();
      }).toThrow();
    });

    test('should preserve callback context', () => {
      const context = { value: 42 };
      const mockCloseDeleteMode = vi.fn(function() {
        return this.value;
      });

      const handler = handleDoubleClick(mockCloseDeleteMode.bind(context));
      handler();

      expect(mockCloseDeleteMode).toHaveBeenCalledOnce();
    });
  });

  describe('toggleActiveTab', () => {
    test('should call setActiveTab with provided tab name', () => {
      const mockSetActiveTab = vi.fn();
      const tabName = 'trails';

      toggleActiveTab(tabName, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith('trails');
      expect(mockSetActiveTab).toHaveBeenCalledOnce();
    });

    test('should call setActiveTab with participants tab', () => {
      const mockSetActiveTab = vi.fn();
      const tabName = 'participants';

      toggleActiveTab(tabName, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith('participants');
    });

    test('should handle empty string tab name', () => {
      const mockSetActiveTab = vi.fn();

      toggleActiveTab('', mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith('');
    });

    test('should handle null tab name', () => {
      const mockSetActiveTab = vi.fn();

      toggleActiveTab(null, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith(null);
    });

    test('should handle undefined tab name', () => {
      const mockSetActiveTab = vi.fn();

      toggleActiveTab(undefined, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith(undefined);
    });

    test('should handle numeric tab name', () => {
      const mockSetActiveTab = vi.fn();

      toggleActiveTab(123, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith(123);
    });

    test('should handle object tab name', () => {
      const mockSetActiveTab = vi.fn();
      const tabObject = { name: 'test' };

      toggleActiveTab(tabObject, mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledWith(tabObject);
    });

    test('should throw when setActiveTab is null', () => {
      expect(() => {
        toggleActiveTab('trails', null);
      }).toThrow();
    });

    test('should throw when setActiveTab is undefined', () => {
      expect(() => {
        toggleActiveTab('trails', undefined);
      }).toThrow();
    });

    test('should work with multiple consecutive calls', () => {
      const mockSetActiveTab = vi.fn();

      toggleActiveTab('trails', mockSetActiveTab);
      toggleActiveTab('participants', mockSetActiveTab);
      toggleActiveTab('trails', mockSetActiveTab);

      expect(mockSetActiveTab).toHaveBeenCalledTimes(3);
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(1, 'trails');
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(2, 'participants');
      expect(mockSetActiveTab).toHaveBeenNthCalledWith(3, 'trails');
    });

    test('should not modify the input parameters', () => {
      const mockSetActiveTab = vi.fn();
      const originalTabName = 'trails';
      const tabNameCopy = originalTabName;

      toggleActiveTab(tabNameCopy, mockSetActiveTab);

      expect(tabNameCopy).toBe(originalTabName);
      expect(mockSetActiveTab).toHaveBeenCalledWith('trails');
    });
  });
});
