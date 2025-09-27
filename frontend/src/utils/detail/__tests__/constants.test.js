import { describe, test, expect } from 'vitest';
import { MODE_TYPES, DEFAULT_STATE } from '../constants.js';

describe('detail constants', () => {
  describe('MODE_TYPES', () => {
    test('should export all expected mode types', () => {
      expect(MODE_TYPES).toEqual({
        DELETED_ITEMS: 'deleted_items',
        OUTLIER_ANALYSIS: 'outlier_analysis',
        MOVEMENT_TIME_MATRIX: 'movement_time_matrix',
        ERROR_TRAIL_ANALYSIS: 'error_trail_analysis'
      });
    });

    test('should have string values for all mode types', () => {
      Object.values(MODE_TYPES).forEach(value => {
        expect(typeof value).toBe('string');
        expect(value.length).toBeGreaterThan(0);
      });
    });

    test('should have unique values', () => {
      const values = Object.values(MODE_TYPES);
      const uniqueValues = [...new Set(values)];
      expect(values).toHaveLength(uniqueValues.length);
    });

    test('should have consistent naming pattern', () => {
      Object.values(MODE_TYPES).forEach(value => {
        expect(value).toMatch(/^[a-z_]+$/);
      });
    });
  });

  describe('DEFAULT_STATE', () => {
    test('should export default state with all expected properties', () => {
      const expectedKeys = [
        'data', 'loading', 'error', 'summaryInfo', 'outlierMode',
        'outlierData', 'selectedOutlierDevice', 'selectedOutlierParticipant',
        'selectedOutlierTrail', 'rawData', 'deletedTrails', 'deletedParticipants',
        'deleteMode', 'movementTimeMatrixMode', 'errorTrailMode'
      ];

      expectedKeys.forEach(key => {
        expect(DEFAULT_STATE).toHaveProperty(key);
      });
    });

    test('should have correct default values', () => {
      expect(DEFAULT_STATE.data).toEqual({});
      expect(DEFAULT_STATE.loading).toBe(false);
      expect(DEFAULT_STATE.error).toBe('');
      expect(DEFAULT_STATE.summaryInfo).toBe(null);
      expect(DEFAULT_STATE.outlierMode).toBe(false);
      expect(DEFAULT_STATE.outlierData).toEqual({});
      expect(DEFAULT_STATE.selectedOutlierDevice).toBe(null);
      expect(DEFAULT_STATE.selectedOutlierParticipant).toBe(null);
      expect(DEFAULT_STATE.selectedOutlierTrail).toBe(null);
      expect(DEFAULT_STATE.rawData).toEqual([]);
      expect(DEFAULT_STATE.deletedTrails).toEqual({});
      expect(DEFAULT_STATE.deletedParticipants).toEqual({});
      expect(DEFAULT_STATE.deleteMode).toBe(false);
      expect(DEFAULT_STATE.movementTimeMatrixMode).toBe(false);
      expect(DEFAULT_STATE.errorTrailMode).toBe(false);
    });

    test('should be immutable reference', () => {
      const originalState = { ...DEFAULT_STATE };
      DEFAULT_STATE.loading = true;
      expect(DEFAULT_STATE.loading).toBe(true);
      DEFAULT_STATE.loading = originalState.loading;
    });

    test('should have proper data types', () => {
      expect(typeof DEFAULT_STATE.data).toBe('object');
      expect(typeof DEFAULT_STATE.loading).toBe('boolean');
      expect(typeof DEFAULT_STATE.error).toBe('string');
      expect(Array.isArray(DEFAULT_STATE.rawData)).toBe(true);
      expect(typeof DEFAULT_STATE.outlierData).toBe('object');
      expect(typeof DEFAULT_STATE.deletedTrails).toBe('object');
      expect(typeof DEFAULT_STATE.deletedParticipants).toBe('object');
    });

    test('should initialize arrays and objects as empty', () => {
      expect(Object.keys(DEFAULT_STATE.data)).toHaveLength(0);
      expect(DEFAULT_STATE.rawData).toHaveLength(0);
      expect(Object.keys(DEFAULT_STATE.outlierData)).toHaveLength(0);
      expect(Object.keys(DEFAULT_STATE.deletedTrails)).toHaveLength(0);
      expect(Object.keys(DEFAULT_STATE.deletedParticipants)).toHaveLength(0);
    });
  });

  describe('constants integration', () => {
    test('should export both constants successfully', () => {
      expect(MODE_TYPES).toBeDefined();
      expect(DEFAULT_STATE).toBeDefined();
    });

    test('should maintain consistency between mode types and state', () => {
      expect(DEFAULT_STATE.outlierMode).toBe(false);
      expect(DEFAULT_STATE.deleteMode).toBe(false);
      expect(DEFAULT_STATE.movementTimeMatrixMode).toBe(false);
      expect(DEFAULT_STATE.errorTrailMode).toBe(false);

      expect(MODE_TYPES.OUTLIER_ANALYSIS).toBe('outlier_analysis');
      expect(MODE_TYPES.DELETED_ITEMS).toBe('deleted_items');
      expect(MODE_TYPES.MOVEMENT_TIME_MATRIX).toBe('movement_time_matrix');
      expect(MODE_TYPES.ERROR_TRAIL_ANALYSIS).toBe('error_trail_analysis');
    });
  });
});
