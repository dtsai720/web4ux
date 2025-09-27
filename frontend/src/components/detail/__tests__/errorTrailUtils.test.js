import { describe, test, expect } from 'vitest';
import { processErrorTrails } from '../errorTrailUtils.js';

describe('components/detail/errorTrailUtils', () => {
  describe('processErrorTrails', () => {
    test('should process empty error trails array', () => {
      const result = processErrorTrails([]);

      expect(result).toEqual([]);
    });

    test('should process single trail with single record', () => {
      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        records: [{
          mark: 'start',
          x: 100,
          y: 200,
          timestamp: 1000
        }]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        action: 'start',
        position: '(100, 200)',
        timestamp: 1000,
        eventTime: null,
        hasDoubleClick: false,
        trailKey: 'P001-1'
      });
    });

    test('should process multiple trails with multiple records', () => {
      const errorTrails = [
        {
          participantSerial: 'P001',
          trailNumber: 1,
          difficultyId: 'Easy',
          records: [
            { mark: 'start', x: 100, y: 200, timestamp: 1000 },
            { mark: 'target', x: 300, y: 400, timestamp: 2000 }
          ]
        },
        {
          participantSerial: 'P002',
          trailNumber: 2,
          difficultyId: 'Hard',
          records: [
            { mark: 'start-else', x: 150, y: 250, timestamp: 1500 }
          ]
        }
      ];

      const result = processErrorTrails(errorTrails);

      expect(result).toHaveLength(3);

      // Check first record
      expect(result[0]).toMatchObject({
        participantSerial: 'P001',
        trailNumber: 1,
        action: 'start',
        hasDoubleClick: false
      });

      // Check second record
      expect(result[1]).toMatchObject({
        participantSerial: 'P001',
        trailNumber: 1,
        action: 'target',
        hasDoubleClick: false
      });

      // Check third record with double click
      expect(result[2]).toMatchObject({
        participantSerial: 'P002',
        trailNumber: 2,
        action: 'start-else',
        hasDoubleClick: true
      });
    });

    test('should calculate eventTime correctly', () => {
      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Medium',
        records: [
          { mark: 'start', x: 100, y: 200, timestamp: 1000 },
          { mark: 'else', x: 200, y: 300, timestamp: 1500 },
          { mark: 'target', x: 300, y: 400, timestamp: 2000 }
        ]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result).toHaveLength(3);

      // All records should have the same eventTime (target - start)
      result.forEach(record => {
        expect(record.eventTime).toBe(1000); // 2000 - 1000
      });
    });

    test('should handle trails without start or target records', () => {
      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        records: [
          { mark: 'else', x: 100, y: 200, timestamp: 1000 },
          { mark: 'other', x: 200, y: 300, timestamp: 2000 }
        ]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result).toHaveLength(2);

      // Should not calculate eventTime without start and target
      result.forEach(record => {
        expect(record.eventTime).toBeNull();
      });
    });

    test('should sort records correctly', () => {
      const errorTrails = [
        {
          participantSerial: 'P002',
          trailNumber: 1,
          difficultyId: 'Easy',
          records: [{ mark: 'start', x: 100, y: 200, timestamp: 3000 }]
        },
        {
          participantSerial: 'P001',
          trailNumber: 2,
          difficultyId: 'Easy',
          records: [{ mark: 'start', x: 100, y: 200, timestamp: 2000 }]
        },
        {
          participantSerial: 'P001',
          trailNumber: 1,
          difficultyId: 'Easy',
          records: [{ mark: 'start', x: 100, y: 200, timestamp: 1000 }]
        }
      ];

      const result = processErrorTrails(errorTrails);

      // Should be sorted by participant, then trail number, then timestamp
      expect(result[0].participantSerial).toBe('P001');
      expect(result[0].trailNumber).toBe(1);
      expect(result[1].participantSerial).toBe('P001');
      expect(result[1].trailNumber).toBe(2);
      expect(result[2].participantSerial).toBe('P002');
      expect(result[2].trailNumber).toBe(1);
    });

    test('should sort by timestamp within same participant and trail', () => {
      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        records: [
          { mark: 'target', x: 300, y: 400, timestamp: 3000 },
          { mark: 'start', x: 100, y: 200, timestamp: 1000 },
          { mark: 'else', x: 200, y: 300, timestamp: 2000 }
        ]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result).toHaveLength(3);
      expect(result[0].timestamp).toBe(1000);
      expect(result[1].timestamp).toBe(2000);
      expect(result[2].timestamp).toBe(3000);
    });

    test('should create correct trailKey format', () => {
      const errorTrails = [{
        participantSerial: 'P123',
        trailNumber: 45,
        difficultyId: 'Hard',
        records: [{ mark: 'start', x: 100, y: 200, timestamp: 1000 }]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result[0].trailKey).toBe('P123-45');
    });

    test('should preserve all trail record data', () => {
      const records = [
        { mark: 'start', x: 100, y: 200, timestamp: 1000 },
        { mark: 'target', x: 300, y: 400, timestamp: 2000 }
      ];

      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        records: records
      }];

      const result = processErrorTrails(errorTrails);

      // Both records should reference the same trail records array
      expect(result[0].trailRecords).toBe(records);
      expect(result[1].trailRecords).toBe(records);
    });

    test('should handle various mark types for hasDoubleClick', () => {
      const errorTrails = [{
        participantSerial: 'P001',
        trailNumber: 1,
        difficultyId: 'Easy',
        records: [
          { mark: 'start', x: 100, y: 200, timestamp: 1000 },
          { mark: 'start-else', x: 150, y: 250, timestamp: 1500 },
          { mark: 'target', x: 300, y: 400, timestamp: 2000 },
          { mark: 'other', x: 350, y: 450, timestamp: 2500 }
        ]
      }];

      const result = processErrorTrails(errorTrails);

      expect(result[0].hasDoubleClick).toBe(false); // start
      expect(result[1].hasDoubleClick).toBe(true);  // start-else
      expect(result[2].hasDoubleClick).toBe(false); // target
      expect(result[3].hasDoubleClick).toBe(false); // other
    });
  });
});
