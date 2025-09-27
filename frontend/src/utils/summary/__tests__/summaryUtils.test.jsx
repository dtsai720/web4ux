import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import {
  formatDate,
  getSortIcon,
  loadSummaries,
  handleSort,
  summaryUtils
} from '../summaryUtils.jsx';

describe('summaryUtils', () => {
  describe('formatDate', () => {
    test('should format date string correctly', () => {
      const dateString = '2024-01-15T10:30:45Z';
      const result = formatDate(dateString);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}$/);
      expect(result).toContain('2024-01-15');
    });

    test('should handle date string with different timezone', () => {
      const dateString = '2024-06-20T15:45:30.123Z';
      const result = formatDate(dateString);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}$/);
      expect(result).toContain('2024-06-20');
    });

    test('should handle local date string', () => {
      const dateString = '2024-12-25T00:00:00';
      const result = formatDate(dateString);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} [+-]\d{2}:\d{2}$/);
      expect(result).toContain('2024-12-25');
    });

    test('should pad single digit values correctly', () => {
      const dateString = '2024-01-05T08:05:03Z';
      const result = formatDate(dateString);

      expect(result).toContain('2024-01-05');
      // Time might be adjusted for timezone, check the format instead
      expect(result).toMatch(/\d{2}:\d{2}:\d{2}/);
    });

    test('should handle invalid date string', () => {
      const dateString = 'invalid-date';
      const result = formatDate(dateString);

      expect(result).toContain('NaN');
    });
  });

  describe('getSortIcon', () => {
    test('should return neutral icon when field is not current orderBy', () => {
      const { container } = render(getSortIcon('name', 'createdAt', 'asc'));
      const icon = container.querySelector('span');

      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('⇅');
      expect(icon.className).toContain('text-muted');
    });

    test('should return up arrow for ascending order', () => {
      const { container } = render(getSortIcon('name', 'name', 'asc'));
      const icon = container.querySelector('span');

      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('↑');
      expect(icon.className).toContain('text-primary');
    });

    test('should return down arrow for descending order', () => {
      const { container } = render(getSortIcon('name', 'name', 'desc'));
      const icon = container.querySelector('span');

      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('↓');
      expect(icon.className).toContain('text-primary');
    });

    test('should handle different field names', () => {
      const { container } = render(getSortIcon('createdAt', 'creator', 'asc'));
      const icon = container.querySelector('span');

      expect(icon.textContent).toBe('⇅');
      expect(icon.className).toContain('text-muted');
    });
  });

  describe('loadSummaries', () => {
    let mockSetters;
    let mockListSummaries;

    beforeEach(() => {
      mockSetters = {
        setSummaries: vi.fn(),
        setTotalItems: vi.fn(),
        setLoading: vi.fn(),
        setError: vi.fn()
      };
      mockListSummaries = vi.fn();
    });

    test('should load summaries successfully', async () => {
      const mockData = [
        { id: 1, name: 'Test Summary 1' },
        { id: 2, name: 'Test Summary 2' }
      ];
      const mockResult = { data: mockData, total: 25 };
      mockListSummaries.mockResolvedValue(mockResult);

      const params = {
        searchName: 'test',
        searchCreator: 'creator',
        orderBy: 'name',
        orderDirection: 'asc',
        currentPageNum: 2,
        itemsPerPage: 10,
        ListSummaries: mockListSummaries,
        ...mockSetters
      };

      await loadSummaries(params);

      expect(mockSetters.setLoading).toHaveBeenCalledWith(true);
      expect(mockSetters.setError).toHaveBeenCalledWith('');
      expect(mockListSummaries).toHaveBeenCalledWith(
        'test', 'creator', 'name', 'asc', 10, 10
      );
      expect(mockSetters.setSummaries).toHaveBeenCalledWith(mockData);
      expect(mockSetters.setTotalItems).toHaveBeenCalledWith(25);
      expect(mockSetters.setLoading).toHaveBeenCalledWith(false);
    });

    test('should calculate pagination correctly', async () => {
      const mockResult = { data: [], total: 0 };
      mockListSummaries.mockResolvedValue(mockResult);

      const params = {
        searchName: '',
        searchCreator: '',
        orderBy: 'createdAt',
        orderDirection: 'desc',
        currentPageNum: 3,
        itemsPerPage: 15,
        ListSummaries: mockListSummaries,
        ...mockSetters
      };

      await loadSummaries(params);

      // Page 3 with 15 items per page = offset 30
      expect(mockListSummaries).toHaveBeenCalledWith(
        '', '', 'createdAt', 'desc', 30, 15
      );
    });

    test('should handle API error gracefully', async () => {
      const errorMessage = 'Network error';
      mockListSummaries.mockRejectedValue(new Error(errorMessage));

      const params = {
        searchName: '',
        searchCreator: '',
        orderBy: 'name',
        orderDirection: 'asc',
        currentPageNum: 1,
        itemsPerPage: 10,
        ListSummaries: mockListSummaries,
        ...mockSetters
      };

      await loadSummaries(params);

      expect(mockSetters.setError).toHaveBeenCalledWith('Failed to load summaries: ' + errorMessage);
      expect(mockSetters.setSummaries).toHaveBeenCalledWith([]);
      expect(mockSetters.setTotalItems).toHaveBeenCalledWith(0);
      expect(mockSetters.setLoading).toHaveBeenCalledWith(false);
    });

    test('should handle empty result data', async () => {
      const mockResult = { data: null, total: null };
      mockListSummaries.mockResolvedValue(mockResult);

      const params = {
        searchName: '',
        searchCreator: '',
        orderBy: 'name',
        orderDirection: 'asc',
        currentPageNum: 1,
        itemsPerPage: 10,
        ListSummaries: mockListSummaries,
        ...mockSetters
      };

      await loadSummaries(params);

      expect(mockSetters.setSummaries).toHaveBeenCalledWith([]);
      expect(mockSetters.setTotalItems).toHaveBeenCalledWith(0);
    });

    test('should set loading to false even when error occurs', async () => {
      mockListSummaries.mockRejectedValue(new Error('Test error'));

      const params = {
        searchName: '',
        searchCreator: '',
        orderBy: 'name',
        orderDirection: 'asc',
        currentPageNum: 1,
        itemsPerPage: 10,
        ListSummaries: mockListSummaries,
        ...mockSetters
      };

      await loadSummaries(params);

      expect(mockSetters.setLoading).toHaveBeenCalledWith(false);
    });
  });

  describe('handleSort', () => {
    let mockSetters;

    beforeEach(() => {
      mockSetters = {
        setOrderBy: vi.fn(),
        setOrderDirection: vi.fn(),
        setCurrentPageNum: vi.fn()
      };
    });

    test('should toggle direction when clicking same field', () => {
      handleSort(
        'name',
        'name',
        mockSetters.setOrderBy,
        'asc',
        mockSetters.setOrderDirection,
        mockSetters.setCurrentPageNum
      );

      expect(mockSetters.setOrderDirection).toHaveBeenCalledWith('desc');
      expect(mockSetters.setCurrentPageNum).toHaveBeenCalledWith(1);
      expect(mockSetters.setOrderBy).not.toHaveBeenCalled();
    });

    test('should toggle from desc to asc', () => {
      handleSort(
        'createdAt',
        'createdAt',
        mockSetters.setOrderBy,
        'desc',
        mockSetters.setOrderDirection,
        mockSetters.setCurrentPageNum
      );

      expect(mockSetters.setOrderDirection).toHaveBeenCalledWith('asc');
      expect(mockSetters.setCurrentPageNum).toHaveBeenCalledWith(1);
    });

    test('should set new field and default to desc', () => {
      handleSort(
        'creator',
        'name',
        mockSetters.setOrderBy,
        'asc',
        mockSetters.setOrderDirection,
        mockSetters.setCurrentPageNum
      );

      expect(mockSetters.setOrderBy).toHaveBeenCalledWith('creator');
      expect(mockSetters.setOrderDirection).toHaveBeenCalledWith('desc');
      expect(mockSetters.setCurrentPageNum).toHaveBeenCalledWith(1);
    });

    test('should always reset page to 1', () => {
      handleSort(
        'name',
        'name',
        mockSetters.setOrderBy,
        'asc',
        mockSetters.setOrderDirection,
        mockSetters.setCurrentPageNum
      );

      expect(mockSetters.setCurrentPageNum).toHaveBeenCalledWith(1);
    });
  });

  describe('summaryUtils export', () => {
    test('should export all utility functions', () => {
      expect(summaryUtils.formatDate).toBe(formatDate);
      expect(summaryUtils.getSortIcon).toBe(getSortIcon);
      expect(summaryUtils.loadSummaries).toBe(loadSummaries);
      expect(summaryUtils.handleSort).toBe(handleSort);
    });

    test('should have all expected properties', () => {
      expect(summaryUtils).toHaveProperty('formatDate');
      expect(summaryUtils).toHaveProperty('getSortIcon');
      expect(summaryUtils).toHaveProperty('loadSummaries');
      expect(summaryUtils).toHaveProperty('handleSort');
    });
  });
});
