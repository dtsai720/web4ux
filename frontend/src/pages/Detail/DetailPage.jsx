import React, { useState, useEffect } from 'react';
import { GetProjectDetailByID, DeleteOrRestore } from '../../../wailsjs/go/pkg/App';

function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  return Object.entries(obj)
    .sort(([a], [b]) => a.localeCompare(b))
    .reduce((acc, [key, value]) => {
      acc[key] = sortObjectKeys(value);
      return acc;
    }, {});
}

const DetailPage = ({ setCurrentPage, selectedSummaryId }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryInfo, setSummaryInfo] = useState(null);
  const [groupBy, setGroupBy] = useState('by_device'); // by_device, by_participant
  const [expandedLevel1, setExpandedLevel1] = useState({});
  const [expandedLevel2, setExpandedLevel2] = useState({});
  const [expandedTrails, setExpandedTrails] = useState({});
  const [detailedData, setDetailedData] = useState({});
  const [loadingDetailed, setLoadingDetailed] = useState({});
  const [outlierMode, setOutlierMode] = useState(false);
  const [outlierData, setOutlierData] = useState({});
  const [selectedOutlierDevice, setSelectedOutlierDevice] = useState(null);
  const [selectedOutlierParticipant, setSelectedOutlierParticipant] = useState(null);
  const [selectedOutlierTrail, setSelectedOutlierTrail] = useState(null);
  const [rawData, setRawData] = useState([]); // 儲存原始數據
  const [deletedTrails, setDeletedTrails] = useState({});
  const [deletedParticipants, setDeletedParticipants] = useState({});
  const [showDeletedModal, setShowDeletedModal] = useState(false);

  const loadData = async () => {
    if (!selectedSummaryId) {
      setError('No summary ID provided');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await GetProjectDetailByID(selectedSummaryId);

      if (result && Array.isArray(result)) {
        setRawData(result);

        // 處理並組織數據
        const organizedData = organizeData(result, groupBy);



        setData(organizedData.data);

        // 收集已刪除的 trails 和 participants
        collectDeletedItems(result);

        // 設置摘要信息（從第一筆數據獲取）
        if (result.length > 0) {
          setSummaryInfo({
            id: selectedSummaryId,
            name: result[0].projectName,
            creator: result[0].projectCreator,
            updatedAt: result[0].projectUpdatedAt
          });
        }
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (err) {
      console.error('Load data error:', err);
      setError(err.message || 'An error occurred while loading data');
    } finally {
      setLoading(false);
    }
  };

  // 收集已刪除的 trails 和 participants
  const collectDeletedItems = (data) => {
    const deletedTrailsMap = {};
    const deletedParticipantsMap = {};

    // 過濾出已刪除的記錄
    const deletedRecords = data.filter(record => record.deleted);

    // 按照 device 和 participant 分組
    deletedRecords.forEach(record => {
      const deviceKey = record.deviceName;
      const participantKey = record.participantSerial;
      const trailKey = record.trailNumber;
      const combinedTrailKey = `${deviceKey}-${participantKey}-${trailKey}`;

      // 收集已刪除的 trails
      if (!deletedTrailsMap[combinedTrailKey]) {
        deletedTrailsMap[combinedTrailKey] = {
          device: deviceKey,
          participant: participantKey,
          participantName: record.participantName,
          trail: trailKey,
          records: []
        };
      }
      deletedTrailsMap[combinedTrailKey].records.push(record);

      // 收集已刪除的 participants
      const combinedParticipantKey = `${deviceKey}-${participantKey}`;
      if (!deletedParticipantsMap[combinedParticipantKey]) {
        deletedParticipantsMap[combinedParticipantKey] = {
          device: deviceKey,
          participant: participantKey,
          participantName: record.participantName,
          trailCount: 0,
          recordCount: 0
        };
      }

      // 檢查這個 trail 是否已經計算過
      const trails = Object.keys(deletedParticipantsMap[combinedParticipantKey]).filter(
        key => key.startsWith('trail-')
      );
      if (!trails.includes(`trail-${trailKey}`)) {
        deletedParticipantsMap[combinedParticipantKey][`trail-${trailKey}`] = true;
        deletedParticipantsMap[combinedParticipantKey].trailCount++;
      }

      deletedParticipantsMap[combinedParticipantKey].recordCount++;
    });

    setDeletedTrails(deletedTrailsMap);
    setDeletedParticipants(deletedParticipantsMap);
  };

  // 刪除/復原 participant 層級資料
  const toggleParticipantDelete = async (deviceKey, participantKey, isDelete = true) => {
    try {
      // 找到相關記錄 - 所有屬於該 device 和 participant 的記錄
      const recordsToUpdate = rawData.filter(record =>
        record.deviceName === deviceKey &&
        record.participantSerial === participantKey &&
        record.deleted !== isDelete
      );

      if (recordsToUpdate.length === 0) {
        console.log(`No records found to ${isDelete ? 'delete' : 'restore'} for participant: ${participantKey}`);
        return;
      }

      // 調用刪除/復原API
      for (const record of recordsToUpdate) {
        await DeleteOrRestore(record.informationId, isDelete);
        console.log(`${isDelete ? 'Deleted' : 'Restored'} participant record: ${record.informationId}`);
      }

      // 重新載入資料
      await loadData();
    } catch (err) {
      console.error(`Toggle participant ${isDelete ? 'delete' : 'restore'} failed:`, err);
    }
  };

  // 刪除/復原 trail 層級資料
  const toggleTrailDelete = async (deviceKey, participantKey, trailKey, isDelete = true) => {
    try {
      // 找到相關記錄
      const recordsToUpdate = rawData.filter(record =>
        record.deviceName === deviceKey &&
        record.participantSerial === participantKey &&
        record.trailNumber === trailKey &&
        record.deleted !== isDelete
      );

      if (recordsToUpdate.length === 0) {
        console.log(`No records found to ${isDelete ? 'delete' : 'restore'} for trail: ${trailKey}`);
        return;
      }

      // 調用刪除/復原API
      for (const record of recordsToUpdate) {
        await DeleteOrRestore(record.informationId, isDelete);
        console.log(`${isDelete ? 'Deleted' : 'Restored'} trail record: ${record.informationId}`);
      }

      // 重新載入資料
      await loadData();
    } catch (err) {
      console.error(`Toggle trail ${isDelete ? 'delete' : 'restore'} failed:`, err);
    }
  };

  // 組織數據的函數 - 修改為按照 trail number 分組
  const organizeData = (rawData, groupByType) => {
    const organized = {};

    // 過濾掉已刪除的記錄
    const activeData = rawData.filter(record => !record.deleted);

    // 對 device 和 participant 進行排序，確保按照數字順序顯示
    const sortByNumeric = (a, b) => {
      // 提取數字部分
      const numA = parseInt(a.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.replace(/\D/g, '')) || 0;
      // 直接比較數字大小
      return a < b? -1: 1;
    };

    // 獲取排序後的 device 和 participant 列表
    const sortedDevices = [...new Set(activeData.map(record => record.deviceName))].sort(sortByNumeric);
    const sortedParticipants = [...new Set(activeData.map(record => record.participantSerial))].sort(sortByNumeric);

    if (groupByType === 'by_device') {
      // Device -> Participant -> Trail 結構
      sortedDevices.forEach(deviceKey => {
        organized[deviceKey] = {};

        // 只獲取當前 device 的記錄
        const deviceRecords = activeData.filter(record => record.deviceName === deviceKey);

        // 對當前 device 的 participants 進行排序
        const deviceParticipants = [...new Set(deviceRecords.map(record => record.participantSerial))].sort(sortByNumeric);
        deviceParticipants.forEach(participantKey => {
          organized[deviceKey][participantKey] = {};

          // 獲取當前 device 和 participant 的記錄
          const participantRecords = deviceRecords.filter(record => record.participantSerial === participantKey);

          // 獲取所有 trail numbers
          const trailNumbers = [...new Set(participantRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

          trailNumbers.forEach(trailKey => {
            // 獲取當前 trail 的所有記錄
            const trailRecords = participantRecords.filter(record => record.trailNumber === trailKey);

            organized[deviceKey][participantKey][trailKey] = trailRecords;
          });
        });
      });
    } else {
      // Participant -> Device -> Trail 結構
      sortedParticipants.forEach(participantKey => {
        organized[participantKey] = {};

        // 只獲取當前 participant 的記錄
        const participantRecords = activeData.filter(record => record.participantSerial === participantKey);

        // 對當前 participant 的 devices 進行排序
        const participantDevices = [...new Set(participantRecords.map(record => record.deviceName))].sort(sortByNumeric);

        participantDevices.forEach(deviceKey => {
          organized[participantKey][deviceKey] = {};

          // 獲取當前 participant 和 device 的記錄
          const deviceRecords = participantRecords.filter(record => record.deviceName === deviceKey);

          // 獲取所有 trail numbers
          const trailNumbers = [...new Set(deviceRecords.map(record => record.trailNumber))].sort((a, b) => a - b);

          trailNumbers.forEach(trailKey => {
            // 獲取當前 trail 的所有記錄
            const trailRecords = deviceRecords.filter(record => record.trailNumber === trailKey);

            organized[participantKey][deviceKey][trailKey] = trailRecords;
          });
        });
      });
    }

    // 計算每個 trail 的統計數據
    calculateTrailStats(organized, groupByType);

    // TODO: sort by participant
    console.log({organized})

    return { data: organized };
  };

  // 計算每個 trail 的統計數據
  const calculateTrailStats = (organizedData, groupByType) => {
    // 遍歷所有 level1 (device 或 participant)
    Object.keys(organizedData).forEach(level1Key => {
      // 遍歷所有 level2 (participant 或 device)
      Object.keys(organizedData[level1Key]).forEach(level2Key => {
        // 遍歷所有 trails
        Object.keys(organizedData[level1Key][level2Key]).forEach(trailKey => {
          const records = organizedData[level1Key][level2Key][trailKey];

          // 尋找 start 和 target 標記
          const startRecord = records.find(r => r.mark === 'start');
          const targetRecord = records.find(r => r.mark === 'target');

          // 計算 available
          const available = startRecord && targetRecord &&
                           startRecord.timestamp < targetRecord.timestamp;

          // 計算 error_time (start 和 target 之間的非 start 與 target 的數量)
          let errorTime = 0;
          if (startRecord && targetRecord) {
            const startTime = startRecord.timestamp;
            const targetTime = targetRecord.timestamp;

            errorTime = records.filter(r => {
              return r.mark !== 'start' && r.mark !== 'target' &&
                     r.timestamp > startTime && r.timestamp < targetTime;
            }).length;
          }

          // 計算 event_time (start 到 target 的時間)
          let eventTime = 0;
          if (startRecord && targetRecord) {
            eventTime = targetRecord.timestamp - startRecord.timestamp;
          }

          // 計算 has_error (error_time > 0)
          const hasError = errorTime > 0;

          // 將統計數據添加到 trail 對象
          organizedData[level1Key][level2Key][trailKey].stats = {
            available: available,
            error_time: errorTime,
            event_time: eventTime,
            has_error: hasError,
            total_records: records.length
          };
        });

        // 計算 level2 的統計數據
        const level2Stats = {
          totalTrails: 0,
          availableTrails: 0,
          trailsWithErrors: 0,
          totalEventTime: 0,
          avgEventTime: 0
        };

        Object.keys(organizedData[level1Key][level2Key]).forEach(trailKey => {
          const trailStats = organizedData[level1Key][level2Key][trailKey].stats;
          level2Stats.totalTrails++;

          if (trailStats.available) {
            level2Stats.availableTrails++;
          }

          if (trailStats.has_error) {
            level2Stats.trailsWithErrors++;
          }

          level2Stats.totalEventTime += trailStats.event_time;
        });

        // 計算平均事件時間
        if (level2Stats.availableTrails > 0) {
          level2Stats.avgEventTime = Math.round(level2Stats.totalEventTime / level2Stats.availableTrails);
        }

        // 將 level2 統計數據添加到對象
        organizedData[level1Key][level2Key].stats = level2Stats;
      });

      // 計算 level1 的統計數據
      const level1Stats = {
        totalLevel2: 0,
        totalTrails: 0,
        availableTrails: 0,
        trailsWithErrors: 0,
        totalEventTime: 0,
        avgEventTime: 0
      };

      Object.keys(organizedData[level1Key]).forEach(level2Key => {
        const level2Stats = organizedData[level1Key][level2Key].stats;
        level1Stats.totalLevel2++;
        level1Stats.totalTrails += level2Stats.totalTrails;
        level1Stats.availableTrails += level2Stats.availableTrails;
        level1Stats.trailsWithErrors += level2Stats.trailsWithErrors;
        level1Stats.totalEventTime += level2Stats.totalEventTime;
      });

      // 計算平均事件時間
      if (level1Stats.availableTrails > 0) {
        level1Stats.avgEventTime = Math.round(level1Stats.totalEventTime / level1Stats.availableTrails);
      }

      // 將 level1 統計數據添加到對象
      organizedData[level1Key].stats = level1Stats;
    });
  };

  // 計算 outlier 數據
  const calculateOutliers = () => {
    // 只在 by_device 分組模式下計算
    if (groupBy !== 'by_device') {
      setGroupBy('by_device');
    }

    const outliers = {};

    // 遍歷所有 devices
    Object.keys(data).forEach(deviceKey => {
      outliers[deviceKey] = {
        participants: {},
        stats: {
          avgErrorCount: 0,
          stdDevErrorCount: 0,
          avgErrorTime: 0,
          stdDevErrorTime: 0
        }
      };

      const device = data[deviceKey];
      const participantKeys = Object.keys(device).filter(key => key !== 'stats');

      // 收集所有參與者的錯誤數據
      const errorCounts = [];
      const errorTimes = [];

      participantKeys.forEach(participantKey => {
        const participant = device[participantKey];
        const trailKeys = Object.keys(participant).filter(key => key !== 'stats');

        // 計算此參與者的總錯誤數和錯誤時間
        let participantErrorCount = 0;
        let participantErrorTime = 0;
        let participantTrailCount = 0;
        const errorTrails = [];

        trailKeys.forEach(trailKey => {
          const trail = participant[trailKey];
          const trailStats = trail.stats || {};

          if (trailStats.has_error) {
            participantErrorCount++;
            participantErrorTime += trailStats.error_time;
            errorTrails.push(trailKey);
          }
          participantTrailCount++;
        });

        // 存儲參與者的錯誤數據
        outliers[deviceKey].participants[participantKey] = {
          errorCount: participantErrorCount,
          errorTime: participantErrorTime,
          trailCount: participantTrailCount,
          errorTrails: errorTrails,
          isOutlier: false
        };

        // 添加到設備的總體統計
        errorCounts.push(participantErrorCount);
        errorTimes.push(participantErrorTime);
      });

      // 計算平均值和標準差
      if (errorCounts.length > 0) {
        // 計算平均錯誤數
        const avgErrorCount = errorCounts.reduce((sum, count) => sum + count, 0) / errorCounts.length;

        // 計算錯誤數的標準差
        const stdDevErrorCount = Math.sqrt(
          errorCounts.reduce((sum, count) => sum + Math.pow(count - avgErrorCount, 2), 0) / errorCounts.length
        );

        // 計算平均錯誤時間
        const avgErrorTime = errorTimes.reduce((sum, time) => sum + time, 0) / errorTimes.length;

        // 計算錯誤時間的標準差
        const stdDevErrorTime = Math.sqrt(
          errorTimes.reduce((sum, time) => sum + Math.pow(time - avgErrorTime, 2), 0) / errorTimes.length
        );

        // 存儲設備的統計數據
        outliers[deviceKey].stats = {
          avgErrorCount,
          stdDevErrorCount,
          avgErrorTime,
          stdDevErrorTime
        };

        // 標記 outliers (超過平均值 + 2 * 標準差)
        participantKeys.forEach(participantKey => {
          const participant = outliers[deviceKey].participants[participantKey];
          const errorCountThreshold = avgErrorCount + 2 * stdDevErrorCount;
          const errorTimeThreshold = avgErrorTime + 2 * stdDevErrorTime;

          participant.isOutlier =
            participant.errorCount > errorCountThreshold ||
            participant.errorTime > errorTimeThreshold;
        });
      }
    });

    setOutlierData(outliers);
    setOutlierMode(true);
  };

  // 處理選擇 outlier device
  const handleSelectOutlierDevice = (deviceKey) => {
    setSelectedOutlierDevice(deviceKey);
    setSelectedOutlierParticipant(null);
    setSelectedOutlierTrail(null);
  };

  // 處理選擇 outlier participant
  const handleSelectOutlierParticipant = (participantKey) => {
    setSelectedOutlierParticipant(participantKey);
    setSelectedOutlierTrail(null);
  };

  // 處理選擇 outlier trail
  const handleSelectOutlierTrail = (trailKey) => {
    setSelectedOutlierTrail(trailKey);
  };

  // 關閉 outlier 模式
  const closeOutlierMode = () => {
    setOutlierMode(false);
    setSelectedOutlierDevice(null);
    setSelectedOutlierParticipant(null);
    setSelectedOutlierTrail(null);
  };

  useEffect(() => {
    loadData();
  }, [selectedSummaryId]);

  // 當 groupBy 改變時重新組織數據
  useEffect(() => {
    if (rawData.length > 0) {
      const organizedData = organizeData(rawData, groupBy);
      setData(organizedData.data);

      // 重置展開狀態
      setExpandedLevel1({});
      setExpandedLevel2({});
      setExpandedTrails({});
      setDetailedData({});

      // 如果在 outlier 模式下切換了分組方式，關閉 outlier 模式
      if (outlierMode && groupBy !== 'by_device') {
        closeOutlierMode();
      }
    }
  }, [groupBy, rawData]);

  // 格式化時間戳為日期時間字符串 (YYYY-MM-DD HH:MM:SS)
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toISOString().replace('T', ' ').substring(0, 19);
  };

  // 切換展開狀態
  const toggleExpandLevel1 = (key) => {
    setExpandedLevel1(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleExpandLevel2 = (level1Key, level2Key) => {
    const combinedKey = `${level1Key}-${level2Key}`;
    setExpandedLevel2(prev => ({
      ...prev,
      [combinedKey]: !prev[combinedKey]
    }));
  };

  const toggleExpandTrail = (level1Key, level2Key, trailKey) => {
    const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;
    setExpandedTrails(prev => ({
      ...prev,
      [combinedKey]: !prev[combinedKey]
    }));
  };


  // 分組選項配置
  const groupByOptions = {
    by_device: {
      label: 'Grouped by Device',
      description: 'Organize data with devices as primary groups, participants as subgroups',
      icon: '🖥️',
      structure: 'Device ➜ Participant ➜ Trail'
    },
    by_participant: {
      label: 'Grouped by Participant',
      description: 'Organize data with participants as primary groups, devices as subgroups',
      icon: '👤',
      structure: 'Participant ➜ Device ➜ Trail'
    }
  };

  // 處理分組切換
  const handleGroupByChange = (newGroupBy) => {
    setGroupBy(newGroupBy);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Detail View</h2>
            <div>
              <button
                className="btn btn-outline-warning me-2"
                onClick={() => setShowDeletedModal(true)}
              >
                <i className="bi bi-trash"></i> Deleted Items
              </button>
              {!outlierMode ? (
                <button
                  className="btn btn-outline-info me-2"
                  onClick={calculateOutliers}
                >
                  <i className="bi bi-graph-up"></i> Analyze Outliers
                </button>
              ) : (
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={closeOutlierMode}
                >
                  <i className="bi bi-x-circle"></i> Close Outlier Analysis
                </button>
              )}
              <button
                className="btn btn-outline-secondary me-2"
                onClick={() => setCurrentPage('summary')}
              >
                <i className="bi bi-arrow-left"></i> Back to Summary
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setCurrentPage('home')}
              >
                <i className="bi bi-house"></i> Home
              </button>
            </div>
          </div>

          {/* 摘要資訊 */}
          {summaryInfo && (
            <div className="card mb-4 border-primary">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  Summary Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-file-text me-2 text-primary"></i>
                      <div>
                        <small className="text-muted">Name</small>
                        <div><strong>{summaryInfo.name}</strong></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-person me-2 text-success"></i>
                      <div>
                        <small className="text-muted">Creator</small>
                        <div><strong>{summaryInfo.creator}</strong></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-clock me-2 text-info"></i>
                      <div>
                        <small className="text-muted">Last Updated</small>
                        <div><strong>{new Date(summaryInfo.updatedAt).toLocaleString()}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 改良的分組選項 */}
          <div className="card mb-4 border-info">
            <div className="card-header bg-light">
              <h6 className="mb-0">
                <i className="bi bi-diagram-3 me-2"></i>
                Data Organization
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                {Object.entries(groupByOptions).map(([key, option]) => (
                  <div key={key} className="col-md-6 mb-3">
                    <div
                      className={`card h-100 cursor-pointer border-2 ${groupBy === key ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                      onClick={() => handleGroupByChange(key)}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <div className="card-body text-center">
                        <div className="fs-2 mb-2">{option.icon}</div>
                        <h6 className={`card-title ${groupBy === key ? 'text-primary' : ''}`}>
                          {option.label}
                        </h6>
                        <p className="card-text text-muted small mb-2">
                          {option.description}
                        </p>
                        <div className={`badge ${groupBy === key ? 'bg-primary' : 'bg-secondary'}`}>
                          {option.structure}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3">
                <small className="text-muted">
                  <i className="bi bi-lightbulb me-1"></i>
                  Click on a card to change the data organization view
                </small>
              </div>
            </div>
          </div>

          {/* Outlier Analysis */}
          {outlierMode && (
            <div className="card mb-4 border-info">
              <div className="card-header bg-info text-white">
                <h5 className="mb-0">
                  <i className="bi bi-graph-up me-2"></i>
                  Outlier Analysis
                </h5>
              </div>
              <div className="card-body">
                {selectedOutlierDevice ? (
                  <div>
                    <div className="d-flex align-items-center mb-3">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() => setSelectedOutlierDevice(null)}
                      >
                        <i className="bi bi-arrow-left"></i> Back to Devices
                      </button>
                      <h5 className="mb-0">Device: {selectedOutlierDevice}</h5>
                    </div>

                    {selectedOutlierParticipant ? (
                      <div>
                        <div className="d-flex align-items-center mb-3">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => setSelectedOutlierParticipant(null)}
                          >
                            <i className="bi bi-arrow-left"></i> Back to Participants
                          </button>
                          <h6 className="mb-0">Participant: {selectedOutlierParticipant}</h6>
                        </div>

                        {selectedOutlierTrail ? (
                          <div>
                            <div className="d-flex align-items-center mb-3">
                              <button
                                className="btn btn-sm btn-outline-secondary me-2"
                                onClick={() => setSelectedOutlierTrail(null)}
                              >
                                <i className="bi bi-arrow-left"></i> Back to Trails
                              </button>
                              <h6 className="mb-0">Trail: {selectedOutlierTrail}</h6>
                            </div>

                            {/* Trail Details */}
                            <div className="card">
                              <div className="card-header bg-light">
                                <h6 className="mb-0">Trail Details</h6>
                              </div>
                              <div className="card-body">
                                <div className="table-responsive">
                                  <table className="table table-sm table-striped">
                                    <thead className="table-dark">
                                      <tr>
                                        <th><i className="bi bi-tag me-1"></i>Mark</th>
                                        <th><i className="bi bi-calendar me-1"></i>DateTime</th>
                                        <th><i className="bi bi-clock me-1"></i>Timestamp</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[selectedOutlierTrail]?.map((record, idx) => (
                                        <tr key={idx}>
                                          <td>
                                            <span className={`badge ${record.mark === 'start' ? 'bg-primary' : record.mark === 'target' ? 'bg-success' : 'bg-secondary'}`}>
                                              {record.mark}
                                            </span>
                                          </td>
                                          <td>
                                            <small>{formatDateTime(record.timestamp)}</small>
                                          </td>
                                          <td>
                                            <small>{record.timestamp}</small>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <h6 className="border-bottom pb-2 mb-3">Error Trails</h6>
                            <div className="table-responsive">
                              <table className="table table-hover">
                                <thead className="table-light">
                                  <tr>
                                    <th>Trail</th>
                                    <th>Error Time</th>
                                    <th>Event Time</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {outlierData[selectedOutlierDevice]?.participants[selectedOutlierParticipant]?.errorTrails?.map(trailKey => (
                                    <tr key={trailKey}>
                                      <td>Trail {trailKey}</td>
                                      <td>{data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[trailKey]?.stats?.error_time || 0}</td>
                                      <td>{data[selectedOutlierDevice]?.[selectedOutlierParticipant]?.[trailKey]?.stats?.event_time || 0}ms</td>
                                      <td>
                                        <button
                                          className="btn btn-sm btn-primary me-2"
                                          onClick={() => handleSelectOutlierTrail(trailKey)}
                                        >
                                          <i className="bi bi-eye me-1"></i> View
                                        </button>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => toggleTrailDelete(selectedOutlierDevice, selectedOutlierParticipant, trailKey, true)}
                                        >
                                          <i className="bi bi-trash me-1"></i> Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div className="card mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0">Device Statistics</h6>
                          </div>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-3">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h6 className="text-muted">Avg Error Count</h6>
                                    <h4>{outlierData[selectedOutlierDevice]?.stats?.avgErrorCount?.toFixed(2) || '0.00'}</h4>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h6 className="text-muted">StdDev Error Count</h6>
                                    <h4>{outlierData[selectedOutlierDevice]?.stats?.stdDevErrorCount?.toFixed(2) || '0.00'}</h4>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h6 className="text-muted">Avg Error Time</h6>
                                    <h4>{outlierData[selectedOutlierDevice]?.stats?.avgErrorTime?.toFixed(2) || '0.00'}</h4>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-3">
                                <div className="card bg-light">
                                  <div className="card-body text-center">
                                    <h6 className="text-muted">StdDev Error Time</h6>
                                    <h4>{outlierData[selectedOutlierDevice]?.stats?.stdDevErrorTime?.toFixed(2) || '0.00'}</h4>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <h6 className="border-bottom pb-2 mb-3">Participants</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead className="table-light">
                              <tr>
                                <th>Participant</th>
                                <th>Error Count</th>
                                <th>Error Time</th>
                                <th>Trail Count</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(outlierData[selectedOutlierDevice]?.participants || {}).map(([participantKey, participantData]) => (
                                <tr key={participantKey} className={participantData.isOutlier ? 'table-danger' : ''}>
                                  <td>{participantKey}</td>
                                  <td>{participantData.errorCount}</td>
                                  <td>{participantData.errorTime}</td>
                                  <td>{participantData.trailCount}</td>
                                  <td>
                                    {participantData.isOutlier ? (
                                      <span className="badge bg-danger">Outlier</span>
                                    ) : (
                                      <span className="badge bg-success">Normal</span>
                                    )}
                                  </td>
                                  <td>
                                    <div>
                                      <button
                                        className="btn btn-sm btn-primary me-2"
                                        onClick={() => handleSelectOutlierParticipant(participantKey)}
                                      >
                                        <i className="bi bi-eye me-1"></i> View
                                      </button>
                                      {participantData.isOutlier && (
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={() => toggleParticipantDelete(selectedOutlierDevice, participantKey, true)}
                                        >
                                          <i className="bi bi-trash me-1"></i> Delete
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                    <div>
                      <h6 className="border-bottom pb-2 mb-3">Select a Device to Analyze</h6>
                      <div className="row">
                        {Object.keys(outlierData).map(deviceKey => (
                          <div key={deviceKey} className="col-md-4 mb-3">
                            <div className="card h-100">
                              <div className="card-body">
                                <h5 className="card-title">{deviceKey}</h5>
                                <p className="card-text">
                                  <small className="text-muted">
                                    <i className="bi bi-people me-1"></i>
                                    {Object.keys(outlierData[deviceKey]?.participants || {}).length} participants
                                  </small>
                                </p>
                                <p className="card-text">
                                  <small className="text-muted">
                                    <i className="bi bi-exclamation-triangle me-1"></i>
                                    {Object.values(outlierData[deviceKey]?.participants || {}).filter(p => p?.isOutlier).length} outliers detected
                                  </small>
                                </p>
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => handleSelectOutlierDevice(deviceKey)}
                                >
                                  <i className="bi bi-graph-up me-1"></i> Analyze
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                )}
              </div>
            </div>
          )}

          {/* 載入狀態 */}
          {loading && (
            <div className="text-center mb-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2 text-muted">Loading detail data...</div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div className="alert alert-danger d-flex align-items-center" role="alert">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <div>{error}</div>
            </div>
          )}

          {/* 分組資料 */}
          {!loading && !error && (
            <div className="card border-success">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-table me-2"></i>
                  Detail Records - {groupByOptions[groupBy].label}
                </h5>
                <small className="opacity-75">{groupByOptions[groupBy].structure}</small>
              </div>
              <div className="card-body">
                {Object.keys(data).length > 0 ? (
                  <div className="accordion" id="detailAccordion">
                    {/* 第一層 */}
                    {Object.entries(data).map(([level1Key, level2Data]) => (
                      <div key={level1Key} className="accordion-item mb-3 border-2">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button collapsed fw-bold"
                            type="button"
                            onClick={() => toggleExpandLevel1(level1Key)}
                            aria-expanded={expandedLevel1[level1Key] || false}
                          >
                            <div className="d-flex align-items-center">
                              <span className="me-2">
                                {groupBy === 'by_device' ? '🖥️' : '👤'}
                              </span>
                              <span className="text-primary">{level1Key}</span>
                              <span className="badge bg-info ms-3">
                                {Object.keys(level2Data).filter(key => key !== 'stats').length} items
                              </span>
                              {level2Data.stats && (
                                <>
                                  <span className="badge bg-danger ms-2">
                                    <i className="bi bi-exclamation-circle me-1"></i>
                                    {level2Data.stats.trailsWithErrors} errors
                                  </span>
                                  <span className="badge bg-success ms-2">
                                    <i className="bi bi-check-circle me-1"></i>
                                    {level2Data.stats.availableTrails}/{level2Data.stats.totalTrails} available
                                  </span>
                                  <span className="badge bg-info ms-2">
                                    <i className="bi bi-clock me-1"></i>
                                    Total: {level2Data.stats.totalEventTime}ms / Avg: {level2Data.stats.avgEventTime}ms
                                  </span>
                                </>
                              )}
                            </div>
                          </button>
                        </h2>
                        {(expandedLevel1[level1Key] || false) && (
                          <div className="accordion-collapse collapse show">
                            <div className="accordion-body bg-light">

                              {/* 第二層 */}
                              <div className="accordion" id={`level2-${level1Key}`}>
                                {Object.entries(level2Data).map(([level2Key, trailsData]) => {
                                  if (level2Key === 'stats') return ;

                                  // 使用已計算好的統計數據
                                  const stats = trailsData.stats || {
                                    totalTrails: 0,
                                    availableTrails: 0,
                                    trailsWithErrors: 0,
                                    avgEventTime: 0
                                  };

                                  return (
                                    <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2 border">
                                      <h2 className="accordion-header">
                                        <div className="d-flex justify-content-between align-items-center w-100">
                                          <button
                                            className="accordion-button collapsed flex-grow-1"
                                            type="button"
                                            onClick={() => toggleExpandLevel2(level1Key, level2Key)}
                                            aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
                                          >
                                            <div className="d-flex align-items-center flex-wrap">
                                              <span className="me-2">
                                                {groupBy === 'by_device' ? '👤' : '🖥️'}
                                              </span>
                                              <strong className="text-success me-3">{level2Key}</strong>
                                              <span className="badge bg-primary me-2">
                                                <i className="bi bi-signpost-split me-1"></i>
                                                {stats.totalTrails} trails
                                              </span>
                                              <span className="badge bg-danger me-2">
                                                <i className="bi bi-exclamation-triangle me-1"></i>
                                                {stats.trailsWithErrors} with errors
                                              </span>
                                              <span className="badge bg-success me-2">
                                                <i className="bi bi-check-circle me-1"></i>
                                                {stats.availableTrails} available
                                              </span>
                                              <span className="badge bg-info me-2">
                                                <i className="bi bi-clock me-1"></i>
                                                Avg {stats.avgEventTime}ms
                                              </span>
                                              <span className="badge bg-secondary me-2">
                                                <i className="bi bi-clock-history me-1"></i>
                                                Total {stats.totalEventTime}ms
                                              </span>
                                            </div>
                                          </button>

                                        </div>
                                      </h2>
                                      {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
                                        <div className="accordion-collapse collapse show">
                                          <div className="accordion-body bg-white">

                                            {/* 第三層 - Trail 列表 */}
                                            <div className="row mb-3">
                                              <div className="col-12">
                                                <h6 className="border-bottom pb-2">
                                                  <i className="bi bi-list-ul me-2"></i>
                                                  Trails ({Object.keys(trailsData).length})
                                                </h6>

                                                {/* 顯示 Trails */}
                                                {Object.entries(trailsData).filter(([key]) => key !== 'stats').map(([trailKey, records]) => {
                                                  const trailStats = records.stats || {};
                                                  const combinedKey = `${level1Key}-${level2Key}-${trailKey}`;
                                                  const isExpanded = expandedTrails[combinedKey] || false;

                                                  return (
                                                    <div key={combinedKey} className="card mb-2 border-start border-4 border-primary">
                                                      <div className="card-body py-2">
                                                        <div className="row align-items-center">
                                                          <div className="col-md-8">
                                                            <div
                                                              className="d-flex align-items-center flex-wrap"
                                                              style={{ cursor: 'pointer' }}
                                                              onClick={() => toggleExpandTrail(level1Key, level2Key, trailKey)}
                                                            >
                                                              <span className="me-2">
                                                                <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'}`}></i>
                                                              </span>
                                                              <strong className="me-3">Trail {trailKey}</strong>
                                                              <span className="me-3">
                                                                <i className="bi bi-exclamation-circle text-warning me-1"></i>
                                                                <strong>Errors:</strong> {trailStats.error_time || 0}
                                                              </span>
                                                              <span className="me-3">
                                                                <i className="bi bi-clock text-info me-1"></i>
                                                                <strong>Event Time:</strong> {trailStats.event_time || 0}ms
                                                              </span>
                                                              <span className={`badge me-2 ${trailStats.available ? 'bg-success' : 'bg-secondary'}`}>
                                                                <i className={`bi ${trailStats.available ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                                                                {trailStats.available ? 'Available' : 'Unavailable'}
                                                              </span>
                                                            </div>
                                                          </div>
                                                          <div className="col-md-4 text-end">
                                                            {/* Delete button removed */}
                                                          </div>
                                                        </div>

                                                        {/* 展開後顯示 Trail 內的記錄 */}
                                                        {isExpanded && (
                                                          <div className="mt-3 border-top pt-3">
                                                            <h6 className="text-muted mb-3">Records in Trail {trailKey}</h6>
                                                            <div className="table-responsive">
                                                              <table className="table table-sm table-striped">
                                                                <thead className="table-dark">
                                                                  <tr>
                                                                    <th><i className="bi bi-tag me-1"></i>Mark</th>
                                                                    <th><i className="bi bi-calendar me-1"></i>DateTime</th>
                                                                    <th><i className="bi bi-clock me-1"></i>Timestamp</th>
                                                                  </tr>
                                                                </thead>
                                                                <tbody>
                                                                  {records.map((record, idx) => (
                                                                    <tr key={idx}>
                                                                      <td>
                                                                        <span className={`badge ${record.mark === 'start' ? 'bg-primary' : record.mark === 'target' ? 'bg-success' : 'bg-secondary'}`}>
                                                                          {record.mark}
                                                                        </span>
                                                                      </td>
                                                                      <td>
                                                                        <small>{formatDateTime(record.timestamp)}</small>
                                                                      </td>
                                                                      <td>
                                                                        <small>{record.timestamp}</small>
                                                                      </td>
                                                                    </tr>
                                                                  ))}
                                                                </tbody>
                                                              </table>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <i className="bi bi-inbox fs-1 text-muted"></i>
                    <h5 className="mt-3">No Detail Records Found</h5>
                    <p className="text-muted">This summary has no associated detail records</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 已刪除記錄 Modal */}
      {showDeletedModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="bi bi-trash me-2"></i>
                  Deleted Items
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeletedModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs mb-3" id="deletedTabs" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link active"
                      id="trails-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#trails"
                      type="button"
                      role="tab"
                      aria-controls="trails"
                      aria-selected="true"
                    >
                      <i className="bi bi-signpost-split me-1"></i>
                      Deleted Trails ({Object.keys(deletedTrails).length})
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className="nav-link"
                      id="participants-tab"
                      data-bs-toggle="tab"
                      data-bs-target="#participants"
                      type="button"
                      role="tab"
                      aria-controls="participants"
                      aria-selected="false"
                    >
                      <i className="bi bi-people me-1"></i>
                      Deleted Participants ({Object.keys(deletedParticipants).length})
                    </button>
                  </li>
                </ul>
                <div className="tab-content" id="deletedTabsContent">
                  <div className="tab-pane fade show active" id="trails" role="tabpanel" aria-labelledby="trails-tab">
                    {Object.keys(deletedTrails).length > 0 ? (
                      <div className="list-group">
                        {Object.entries(deletedTrails).map(([key, trail]) => (
                          <div key={key} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">
                                  <i className="bi bi-display me-1 text-primary"></i>
                                  {trail.device} /
                                  <i className="bi bi-person me-1 ms-2 text-success"></i>
                                  {trail.participant} /
                                  <i className="bi bi-signpost-split me-1 ms-2 text-info"></i>
                                  Trail {trail.trail}
                                </h6>
                                <small className="text-muted">
                                  {trail.records.length} records deleted
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => toggleTrailDelete(trail.device, trail.participant, trail.trail, false)}
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="bi bi-check-circle fs-1 text-success"></i>
                        <p className="text-center text-muted mt-3">No deleted trails found.</p>
                      </div>
                    )}
                  </div>
                  <div className="tab-pane fade" id="participants" role="tabpanel" aria-labelledby="participants-tab">
                    {Object.keys(deletedParticipants).length > 0 ? (
                      <div className="list-group">
                        {Object.entries(deletedParticipants).map(([key, participant]) => (
                          <div key={key} className="list-group-item list-group-item-action">
                            <div className="d-flex w-100 justify-content-between align-items-center">
                              <div>
                                <h6 className="mb-1">
                                  <i className="bi bi-display me-1 text-primary"></i>
                                  {participant.device} /
                                  <i className="bi bi-person me-1 ms-2 text-success"></i>
                                  {participant.participant} ({participant.participantName})
                                </h6>
                                <small className="text-muted">
                                  {participant.trailCount} trails / {participant.recordCount} records deleted
                                </small>
                              </div>
                              <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => toggleParticipantDelete(participant.device, participant.participant, false)}
                              >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                Restore
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <i className="bi bi-check-circle fs-1 text-success"></i>
                        <p className="text-center text-muted mt-3">No deleted participants found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeletedModal(false)}
                >
                  <i className="bi bi-x me-1"></i>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DetailPage;
