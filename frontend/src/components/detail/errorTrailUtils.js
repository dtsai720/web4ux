export const processErrorTrails = (errorTrails) => {
  const allErrorRecords = [];

  errorTrails.forEach(trail => {
    trail.records.forEach(record => {
      allErrorRecords.push({
        participantSerial: trail.participantSerial,
        trailNumber: trail.trailNumber,
        difficultyId: trail.difficultyId,
        action: record.mark,
        position: `(${record.x}, ${record.y})`,
        timestamp: record.timestamp,
        eventTime: null,
        hasDoubleClick: record.mark === 'start-else',
        trailKey: `${trail.participantSerial}-${trail.trailNumber}`,
        trailRecords: trail.records
      });
    });
  });

  allErrorRecords.forEach(record => {
    const startRecord = record.trailRecords.find(r => r.mark === 'start');
    const targetRecord = record.trailRecords.find(r => r.mark === 'target');
    if (startRecord && targetRecord) {
      record.eventTime = targetRecord.timestamp - startRecord.timestamp;
    }
  });

  allErrorRecords.sort((a, b) => {
    const participantCompare = a.participantSerial.localeCompare(b.participantSerial);
    if (participantCompare !== 0) return participantCompare;

    const trailCompare = a.trailNumber - b.trailNumber;
    if (trailCompare !== 0) return trailCompare;

    return a.timestamp - b.timestamp;
  });

  return allErrorRecords;
};
