import { describe, test, expect } from 'vitest';
import {
  organizeData,
  calculateTrailStats,
  collectDeletedItems,
  formatDateTime,
  calculateOutlierData
} from '../dataUtils.js';

describe('dataUtils', () => {
  const mockRawData = [
    {
      deviceName: 'Device1',
      participantSerial: 'P001',
      participantName: 'Participant 1',
      trailNumber: 1,
      mark: 'start',
      timestamp: 1000,
      deleted: false,
      x: 100,
      y: 200
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P001',
      participantName: 'Participant 1',
      trailNumber: 1,
      mark: 'target',
      timestamp: 2000,
      deleted: false,
      x: 300,
      y: 400
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P001',
      participantName: 'Participant 1',
      trailNumber: 2,
      mark: 'start',
      timestamp: 3000,
      deleted: false,
      x: 150,
      y: 250
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P001',
      participantName: 'Participant 1',
      trailNumber: 2,
      mark: 'error',
      timestamp: 3500,
      deleted: false,
      x: 160,
      y: 260
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P001',
      participantName: 'Participant 1',
      trailNumber: 2,
      mark: 'target',
      timestamp: 4000,
      deleted: false,
      x: 350,
      y: 450
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P002',
      participantName: 'Participant 2',
      trailNumber: 1,
      mark: 'start',
      timestamp: 5000,
      deleted: true,
      x: 200,
      y: 300
    },
    {
      deviceName: 'Device1',
      participantSerial: 'P002',
      participantName: 'Participant 2',
      trailNumber: 1,
      mark: 'target',
      timestamp: 6000,
      deleted: true,
      x: 400,
      y: 500
    }
  ];

  describe('organizeData', () => {
    test('should organize data by device', () => {
      const result = organizeData(mockRawData, 'by_device');

      expect(result.data).toBeDefined();
      expect(result.data['Device1']).toBeDefined();
      expect(result.data['Device1']['P001']).toBeDefined();
      expect(result.data['Device1']['P001'][1]).toBeDefined();
      expect(result.data['Device1']['P001'][2]).toBeDefined();

      // Check that trail 1 has 2 records (start and target)
      expect(result.data['Device1']['P001'][1]).toHaveLength(2);
      expect(result.data['Device1']['P001'][1][0].mark).toBe('start');
      expect(result.data['Device1']['P001'][1][1].mark).toBe('target');

      // Check that trail 2 has 3 records (start, error, target)
      expect(result.data['Device1']['P001'][2]).toHaveLength(3);
      expect(result.data['Device1']['P001'][2].some(r => r.mark === 'error')).toBe(true);
    });

    test('should organize data by participant', () => {
      const result = organizeData(mockRawData, 'by_participant');

      expect(result.data).toBeDefined();
      expect(result.data['P001']).toBeDefined();
      expect(result.data['P001']['Device1']).toBeDefined();
      expect(result.data['P001']['Device1'][1]).toBeDefined();
      expect(result.data['P001']['Device1'][2]).toBeDefined();

      // Check structure is participant -> device -> trail
      expect(result.data['P001']['Device1'][1]).toHaveLength(2);
    });

    test('should filter out deleted records', () => {
      const result = organizeData(mockRawData, 'by_device');

      // P002 should not exist because all its records are deleted
      expect(result.data['Device1']['P002']).toBeUndefined();
    });

    test('should include trail statistics', () => {
      const result = organizeData(mockRawData, 'by_device');

      // Trail 1 should be available (has start and target)
      expect(result.data['Device1']['P001'][1].stats).toBeDefined();
      expect(result.data['Device1']['P001'][1].stats.available).toBe(true);
      expect(result.data['Device1']['P001'][1].stats.has_error).toBe(false);
      expect(result.data['Device1']['P001'][1].stats.event_time).toBe(1000);

      // Trail 2 should have error
      expect(result.data['Device1']['P001'][2].stats.has_error).toBe(true);
      expect(result.data['Device1']['P001'][2].stats.error_time).toBe(1);
    });

    test('should handle empty data', () => {
      const result = organizeData([], 'by_device');
      expect(result.data).toEqual({});
    });
  });

  describe('collectDeletedItems', () => {
    test('should collect deleted trails correctly', () => {
      const result = collectDeletedItems(mockRawData);

      expect(result.deletedTrails).toBeDefined();
      expect(result.deletedParticipants).toBeDefined();

      const deletedTrailKeys = Object.keys(result.deletedTrails);
      expect(deletedTrailKeys).toContain('Device1-P002-1');

      const deletedTrail = result.deletedTrails['Device1-P002-1'];
      expect(deletedTrail.device).toBe('Device1');
      expect(deletedTrail.participant).toBe('P002');
      expect(deletedTrail.trail).toBe(1);
      expect(deletedTrail.records).toHaveLength(2);
    });

    test('should collect deleted participants correctly', () => {
      const result = collectDeletedItems(mockRawData);

      const deletedParticipantKeys = Object.keys(result.deletedParticipants);
      expect(deletedParticipantKeys).toContain('Device1-P002');

      const deletedParticipant = result.deletedParticipants['Device1-P002'];
      expect(deletedParticipant.device).toBe('Device1');
      expect(deletedParticipant.participant).toBe('P002');
      expect(deletedParticipant.trailCount).toBe(1);
      expect(deletedParticipant.recordCount).toBe(2);
    });

    test('should handle data with no deleted items', () => {
      const nonDeletedData = mockRawData.filter(r => !r.deleted);
      const result = collectDeletedItems(nonDeletedData);

      expect(Object.keys(result.deletedTrails)).toHaveLength(0);
      expect(Object.keys(result.deletedParticipants)).toHaveLength(0);
    });
  });

  describe('formatDateTime', () => {
    test('should format timestamp correctly', () => {
      const timestamp = 1640995200000; // 2022-01-01 00:00:00 UTC
      const result = formatDateTime(timestamp);

      expect(result).toBe('2022-01-01 00:00:00');
    });

    test('should return N/A for null timestamp', () => {
      expect(formatDateTime(null)).toBe('N/A');
      expect(formatDateTime(undefined)).toBe('N/A');
      expect(formatDateTime(0)).toBe('N/A');
    });
  });

  describe('calculateOutlierData', () => {
    test('should calculate outlier data correctly', () => {
      // First organize the data
      const organizedResult = organizeData(mockRawData, 'by_device');
      const outlierData = calculateOutlierData(organizedResult.data, mockRawData);

      expect(outlierData['Device1']).toBeDefined();
      expect(outlierData['Device1'].participants).toBeDefined();
      expect(outlierData['Device1'].participants['P001']).toBeDefined();
      expect(outlierData['Device1'].stats).toBeDefined();

      const participant = outlierData['Device1'].participants['P001'];
      expect(participant.errorCount).toBe(1); // Only trail 2 has errors
      expect(participant.errorTime).toBe(1); // One error record
      expect(participant.trailCount).toBe(2); // Two available trails
      expect(participant.errorTrails).toEqual(['2']);
      expect(participant.doubleClickCount).toBeDefined();
      expect(participant.isOutlier).toBeDefined();
    });

    test('should calculate device statistics', () => {
      const organizedResult = organizeData(mockRawData, 'by_device');
      const outlierData = calculateOutlierData(organizedResult.data, mockRawData);

      const deviceStats = outlierData['Device1'].stats;
      expect(deviceStats.avgErrorCount).toBeDefined();
      expect(deviceStats.stdDevErrorCount).toBeDefined();
      expect(deviceStats.avgErrorTime).toBeDefined();
      expect(deviceStats.stdDevErrorTime).toBeDefined();
    });

    test('should handle empty organized data', () => {
      const outlierData = calculateOutlierData({}, []);
      expect(outlierData).toEqual({});
    });
  });

  describe('calculateTrailStats', () => {
    test('should calculate trail stats correctly', () => {
      const organizedData = {
        'Device1': {
          'P001': {
            1: [
              { mark: 'start', timestamp: 1000 },
              { mark: 'target', timestamp: 2000 }
            ],
            2: [
              { mark: 'start', timestamp: 3000 },
              { mark: 'error', timestamp: 3500 },
              { mark: 'target', timestamp: 4000 }
            ]
          }
        }
      };

      calculateTrailStats(organizedData, 'by_device');

      // Check trail 1 stats
      const trail1Stats = organizedData['Device1']['P001'][1].stats;
      expect(trail1Stats.available).toBe(true);
      expect(trail1Stats.has_error).toBe(false);
      expect(trail1Stats.error_time).toBe(0);
      expect(trail1Stats.event_time).toBe(1000);

      // Check trail 2 stats
      const trail2Stats = organizedData['Device1']['P001'][2].stats;
      expect(trail2Stats.available).toBe(true);
      expect(trail2Stats.has_error).toBe(true);
      expect(trail2Stats.error_time).toBe(1);
      expect(trail2Stats.event_time).toBe(1000);

      // Check participant stats
      const participantStats = organizedData['Device1']['P001'].stats;
      expect(participantStats.totalTrails).toBe(2);
      expect(participantStats.availableTrails).toBe(2);
      expect(participantStats.trailsWithErrors).toBe(1);

      // Check device stats
      const deviceStats = organizedData['Device1'].stats;
      expect(deviceStats.totalLevel2).toBe(1);
      expect(deviceStats.totalTrails).toBe(2);
      expect(deviceStats.availableTrails).toBe(2);
      expect(deviceStats.trailsWithErrors).toBe(1);
    });

    test('should handle trails without proper start/target marks', () => {
      const organizedData = {
        'Device1': {
          'P001': {
            1: [
              { mark: 'error', timestamp: 1000 },
              { mark: 'error', timestamp: 2000 }
            ]
          }
        }
      };

      calculateTrailStats(organizedData, 'by_device');

      const trail1Stats = organizedData['Device1']['P001'][1].stats;
      expect(trail1Stats.available).toBe(false);
      expect(trail1Stats.availableStatus).toBe(0); // unavailable
      expect(trail1Stats.event_time).toBe(0);
    });
  });
});
