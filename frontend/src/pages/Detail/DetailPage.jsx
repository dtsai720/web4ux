import React, { useState, useEffect } from 'react';
import { GetProjectDetailByID, DeleteOrRestore } from '../../../wailsjs/go/pkg/App';
import DetailRecordComponent from './DetailRecordComponent';
import OutlierAnalysisComponent from './OutlierAnalysisComponent';
import DeleteItemComponent from './DeleteItemComponent';
import ResultAnalysisComponent from './ResultAnalysisComponent';

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
  const [deleteMode, setDeleteMode] = useState(false);
  const [resultMode, setResultMode] = useState(false);

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

          // 展開第一個 level1 項目作為預設顯示
          if (Object.keys(organizedData.data).length > 0) {
            const firstLevel1Key = Object.keys(organizedData.data)[0];
            setExpandedLevel1({
              [firstLevel1Key]: true
            });

            // 如果有 level2 項目，也展開第一個
            if (Object.keys(organizedData.data[firstLevel1Key]).length > 0) {
              const firstLevel2Key = Object.keys(organizedData.data[firstLevel1Key]).filter(key => key !== 'stats')[0];
              if (firstLevel2Key) {
                setExpandedLevel2({
                  [`${firstLevel1Key}-${firstLevel2Key}`]: true
                });

                // 如果有 trail 項目，也展開第一個
                if (Object.keys(organizedData.data[firstLevel1Key][firstLevel2Key]).length > 0) {
                  const firstTrailKey = Object.keys(organizedData.data[firstLevel1Key][firstLevel2Key]).filter(key => key !== 'stats')[0];
                  if (firstTrailKey) {
                    setExpandedTrails({
                      [`${firstLevel1Key}-${firstLevel2Key}-${firstTrailKey}`]: true
                    });
                  }
                }
              }
            }
          }
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
      // 如果不是 by_device 模式，先切換到 by_device 模式
      // 實際計算會在 useEffect 中處理，當 groupBy 變更後
      setGroupBy('by_device');
      // 延遲設置 outlierMode，確保數據已經重新組織完成
      setTimeout(() => {
        setOutlierMode(true);
      }, 50);
      return;
    }

    // 如果已經是 by_device 模式，直接設置 outlierMode
    // 實際計算會在 useEffect 中處理
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

  // 關閉 delete 模式
  const closeDeleteMode = () => {
    setDeleteMode(false);
  };

  // 關閉 result 模式
  const closeResultMode = () => {
    setResultMode(false);
  };

  useEffect(() => {
    loadData();
    // Ensure we're in detail record mode by default
    setDeleteMode(false);
    setOutlierMode(false);
    setResultMode(false);
  }, [selectedSummaryId]);

  // When outlierMode is activated, calculate outliers
  useEffect(() => {
    if (outlierMode && rawData.length > 0 && groupBy === 'by_device') {
      // Only calculate outliers when in by_device mode and not during the initial switch
      // Use a timeout to ensure data reorganization has completed
      const timer = setTimeout(() => {
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
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [outlierMode, rawData, groupBy, data]);

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
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Detail View</h2>
              <div className="d-flex">
                <button
                  className="btn btn-outline-secondary me-2"
                  onClick={() => setCurrentPage('summary')}
                >
                  <i className="bi bi-arrow-left"></i> Back
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage('home')}
                >
                  <i className="bi bi-house"></i> Home
                </button>
              </div>
            </div>

            <div className="btn-toolbar" role="toolbar">
              <div className="btn-group me-2 mb-2" role="group">
                <button
                  className={`btn ${!deleteMode && !outlierMode && !resultMode ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => {
                    setDeleteMode(false);
                    setOutlierMode(false);
                    setResultMode(false);
                  }}
                >
                  <i className="bi bi-list-ul"></i> Detail Record
                </button>
                <button
                  className={`btn ${deleteMode ? 'btn-warning' : 'btn-outline-warning'}`}
                  onClick={() => {
                    setDeleteMode(true);
                    setOutlierMode(false);
                    setResultMode(false);
                  }}
                >
                  <i className="bi bi-trash"></i> Deleted Items
                </button>
              </div>

              <div className="btn-group me-2 mb-2" role="group">
                {!outlierMode ? (
                  <button
                    className="btn btn-outline-info"
                    onClick={calculateOutliers}
                  >
                    <i className="bi bi-graph-up"></i> Analyze Outliers
                  </button>
                ) : (
                  <button
                    className="btn btn-info"
                    onClick={closeOutlierMode}
                  >
                    <i className="bi bi-x-circle"></i> Close Outlier Analysis
                  </button>
                )}
              </div>

              <div className="btn-group mb-2" role="group">
                {!resultMode ? (
                  <button
                    className="btn btn-outline-success"
                    onClick={() => {
                      setResultMode(true);
                      setDeleteMode(false);
                      setOutlierMode(false);
                    }}
                  >
                    <i className="bi bi-bar-chart-line"></i> Result Analysis
                  </button>
                ) : (
                  <button
                    className="btn btn-success"
                    onClick={closeResultMode}
                  >
                    <i className="bi bi-x-circle"></i> Close Result Analysis
                  </button>
                )}
              </div>
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

          {/* Render the appropriate component based on mode */}
          {outlierMode ? (
            <OutlierAnalysisComponent
              outlierData={outlierData}
              selectedOutlierDevice={selectedOutlierDevice}
              selectedOutlierParticipant={selectedOutlierParticipant}
              selectedOutlierTrail={selectedOutlierTrail}
              handleSelectOutlierDevice={handleSelectOutlierDevice}
              handleSelectOutlierParticipant={handleSelectOutlierParticipant}
              handleSelectOutlierTrail={handleSelectOutlierTrail}
              closeOutlierMode={closeOutlierMode}
              data={data}
              formatDateTime={formatDateTime}
              toggleTrailDelete={toggleTrailDelete}
              toggleParticipantDelete={toggleParticipantDelete}
            />
          ) : deleteMode ? (
            <DeleteItemComponent
              deletedTrails={deletedTrails}
              deletedParticipants={deletedParticipants}
              toggleTrailDelete={toggleTrailDelete}
              toggleParticipantDelete={toggleParticipantDelete}
              closeDeleteMode={closeDeleteMode}
            />
          ) : resultMode ? (
            <ResultAnalysisComponent
              rawData={rawData}
              closeResultMode={closeResultMode}
            />
          ) : (
            <DetailRecordComponent
              data={data}
              loading={loading}
              error={error}
              summaryInfo={summaryInfo}
              groupBy={groupBy}
              groupByOptions={groupByOptions}
              handleGroupByChange={handleGroupByChange}
              expandedLevel1={expandedLevel1}
              toggleExpandLevel1={toggleExpandLevel1}
              expandedLevel2={expandedLevel2}
              toggleExpandLevel2={toggleExpandLevel2}
              expandedTrails={expandedTrails}
              toggleExpandTrail={toggleExpandTrail}
              formatDateTime={formatDateTime}
              toggleTrailDelete={toggleTrailDelete}
              toggleParticipantDelete={toggleParticipantDelete}
              setCurrentPage={setCurrentPage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
