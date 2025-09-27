import { describe, test, expect } from 'vitest';

import {
  sortByNumeric,
  createDeviceOrderMapping,
  sortDevicesByOrder,
  organizeByDevice,
  organizeByParticipant
} from '../organizationUtils.js';

describe('organizationUtils', () => {
  describe('sortByNumeric', () => {
    test('should sort items by numeric value', () => {
      const items = ['device10', 'device2', 'device1', 'device20'];
      const sorted = items.sort(sortByNumeric);

      expect(sorted).toEqual(['device1', 'device2', 'device10', 'device20']);
    });

    test('should handle items with different prefixes', () => {
      const items = ['p10', 'p2', 'p1'];
      const sorted = items.sort(sortByNumeric);

      expect(sorted).toEqual(['p1', 'p2', 'p10']);
    });

    test('should handle items without numbers (return 0)', () => {
      const items = ['abc', 'def', 'ghi'];
      const sorted = items.sort(sortByNumeric);

      // Should maintain original order since all resolve to 0
      expect(sorted).toEqual(['abc', 'def', 'ghi']);
    });

    test('should handle mixed alphanumeric strings', () => {
      const items = ['test5abc', 'test10def', 'test1xyz'];
      const sorted = items.sort(sortByNumeric);

      expect(sorted).toEqual(['test1xyz', 'test5abc', 'test10def']);
    });

    test('should handle empty strings', () => {
      const items = ['', 'device1', ''];
      const sorted = items.sort(sortByNumeric);

      expect(sorted).toEqual(['', '', 'device1']);
    });

    test('should handle multiple numbers (uses all digits)', () => {
      const items = ['p1d2', 'p2d1', 'p11d2'];
      const sorted = items.sort(sortByNumeric);

      // parseInt('12') = 12, parseInt('21') = 21, parseInt('112') = 112
      expect(sorted).toEqual(['p1d2', 'p2d1', 'p11d2']);
    });
  });

  describe('createDeviceOrderMapping', () => {
    test('should create device to order mapping', () => {
      const data = [
        { deviceName: 'Device1', deviceOrder: 'A' },
        { deviceName: 'Device2', deviceOrder: 'B' },
        { deviceName: 'Device1', deviceOrder: 'A' } // Duplicate, should use first
      ];

      const result = createDeviceOrderMapping(data);

      expect(result).toEqual({
        'Device1': 'A',
        'Device2': 'B'
      });
    });

    test('should handle empty data', () => {
      const result = createDeviceOrderMapping([]);

      expect(result).toEqual({});
    });

    test('should use first occurrence for duplicates', () => {
      const data = [
        { deviceName: 'Device1', deviceOrder: 'A' },
        { deviceName: 'Device1', deviceOrder: 'Z' } // Should be ignored
      ];

      const result = createDeviceOrderMapping(data);

      expect(result).toEqual({
        'Device1': 'A'
      });
    });

    test('should handle missing deviceOrder property', () => {
      const data = [
        { deviceName: 'Device1', deviceOrder: 'A' },
        { deviceName: 'Device2' } // Missing deviceOrder
      ];

      const result = createDeviceOrderMapping(data);

      expect(result).toEqual({
        'Device1': 'A',
        'Device2': undefined
      });
    });
  });

  describe('sortDevicesByOrder', () => {
    test('should sort devices by their order', () => {
      const devices = ['Device3', 'Device1', 'Device2'];
      const deviceOrderMap = {
        'Device1': 'A',
        'Device2': 'B',
        'Device3': 'C'
      };

      const result = sortDevicesByOrder(devices, deviceOrderMap);

      expect(result).toEqual(['Device1', 'Device2', 'Device3']);
    });

    test('should handle missing device orders (empty string fallback)', () => {
      const devices = ['DeviceX', 'Device1'];
      const deviceOrderMap = {
        'Device1': 'B'
        // DeviceX missing
      };

      const result = sortDevicesByOrder(devices, deviceOrderMap);

      expect(result).toEqual(['DeviceX', 'Device1']); // Empty string sorts before 'B'
    });

    test('should handle empty devices array', () => {
      const result = sortDevicesByOrder([], {});

      expect(result).toEqual([]);
    });

    test('should handle numeric device orders', () => {
      const devices = ['Device2', 'Device1', 'Device10'];
      const deviceOrderMap = {
        'Device1': '1',
        'Device2': '2',
        'Device10': '10'
      };

      const result = sortDevicesByOrder(devices, deviceOrderMap);

      expect(result).toEqual(['Device1', 'Device10', 'Device2']); // String comparison: '1' < '10' < '2'
    });
  });

  describe('organizeByDevice', () => {
    const mockData = [
      { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, mark: 'start', timestamp: 1000 },
      { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, mark: 'target', timestamp: 2000 },
      { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 2, mark: 'start', timestamp: 3000 },
      { deviceName: 'Device1', participantSerial: 'P002', trailNumber: 1, mark: 'start', timestamp: 4000 },
      { deviceName: 'Device2', participantSerial: 'P001', trailNumber: 1, mark: 'start', timestamp: 5000 }
    ];

    test('should organize data by device-participant-trail structure', () => {
      const sortedDevices = ['Device1', 'Device2'];

      const result = organizeByDevice(mockData, sortedDevices);

      expect(result).toHaveProperty('Device1');
      expect(result).toHaveProperty('Device2');
      expect(result.Device1).toHaveProperty('P001');
      expect(result.Device1).toHaveProperty('P002');
      expect(result.Device1.P001).toHaveProperty('1');
      expect(result.Device1.P001).toHaveProperty('2');
      expect(result.Device1.P001[1]).toHaveLength(2); // start and target
    });

    test('should sort participants numerically', () => {
      const dataWithNumericParticipants = [
        { deviceName: 'Device1', participantSerial: 'P010', trailNumber: 1, mark: 'start' },
        { deviceName: 'Device1', participantSerial: 'P002', trailNumber: 1, mark: 'start' },
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, mark: 'start' }
      ];

      const result = organizeByDevice(dataWithNumericParticipants, ['Device1']);
      const participantKeys = Object.keys(result.Device1);

      expect(participantKeys).toEqual(['P001', 'P002', 'P010']);
    });

    test('should sort trail numbers numerically', () => {
      const dataWithTrails = [
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 10 },
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 2 },
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1 }
      ];

      const result = organizeByDevice(dataWithTrails, ['Device1']);
      const trailKeys = Object.keys(result.Device1.P001).map(Number);

      expect(trailKeys).toEqual([1, 2, 10]);
    });

    test('should handle empty data', () => {
      const result = organizeByDevice([], ['Device1']);

      expect(result).toEqual({
        Device1: {}
      });
    });

    test('should handle device not in data', () => {
      const result = organizeByDevice(mockData, ['DeviceX']);

      expect(result).toEqual({
        DeviceX: {}
      });
    });
  });

  describe('organizeByParticipant', () => {
    const mockData = [
      { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'A' },
      { deviceName: 'Device2', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'B' },
      { deviceName: 'Device1', participantSerial: 'P002', trailNumber: 1, deviceOrder: 'A' },
      { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 2, deviceOrder: 'A' }
    ];

    test('should organize data by participant-device-trail structure', () => {
      const sortedParticipants = ['P001', 'P002'];

      const result = organizeByParticipant(mockData, sortedParticipants);

      expect(result).toHaveProperty('P001');
      expect(result).toHaveProperty('P002');
      expect(result.P001).toHaveProperty('Device1');
      expect(result.P001).toHaveProperty('Device2');
      expect(result.P001.Device1).toHaveProperty('1');
      expect(result.P001.Device1).toHaveProperty('2');
    });

    test('should sort devices by order within participant', () => {
      const dataWithDeviceOrder = [
        { deviceName: 'DeviceC', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'C' },
        { deviceName: 'DeviceA', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'A' },
        { deviceName: 'DeviceB', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'B' }
      ];

      const result = organizeByParticipant(dataWithDeviceOrder, ['P001']);
      const deviceKeys = Object.keys(result.P001);

      expect(deviceKeys).toEqual(['DeviceA', 'DeviceB', 'DeviceC']);
    });

    test('should handle empty data', () => {
      const result = organizeByParticipant([], ['P001']);

      expect(result).toEqual({
        P001: {}
      });
    });

    test('should handle participant not in data', () => {
      const result = organizeByParticipant(mockData, ['P999']);

      expect(result).toEqual({
        P999: {}
      });
    });

    test('should create device order mapping per participant', () => {
      const dataWithDifferentOrders = [
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'A' },
        { deviceName: 'Device2', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'B' },
        { deviceName: 'Device1', participantSerial: 'P002', trailNumber: 1, deviceOrder: 'Z' }, // Different order for P002
        { deviceName: 'Device2', participantSerial: 'P002', trailNumber: 1, deviceOrder: 'Y' }
      ];

      const result = organizeByParticipant(dataWithDifferentOrders, ['P001', 'P002']);

      // P001 should have Device1, Device2 order (A, B)
      expect(Object.keys(result.P001)).toEqual(['Device1', 'Device2']);

      // P002 should have Device2, Device1 order (Y, Z)
      expect(Object.keys(result.P002)).toEqual(['Device2', 'Device1']);
    });

    test('should sort trail numbers within device', () => {
      const dataWithTrails = [
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 3, deviceOrder: 'A' },
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 1, deviceOrder: 'A' },
        { deviceName: 'Device1', participantSerial: 'P001', trailNumber: 2, deviceOrder: 'A' }
      ];

      const result = organizeByParticipant(dataWithTrails, ['P001']);
      const trailKeys = Object.keys(result.P001.Device1).map(Number);

      expect(trailKeys).toEqual([1, 2, 3]);
    });
  });
});
