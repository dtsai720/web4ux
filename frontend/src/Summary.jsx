// import React, { useState, useEffect } from 'react';

// // SummaryPage 組件
// // const SummaryPage = ({ setCurrentPage, setSelectedSummaryId }) => {
// //   const [summaries, setSummaries] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');

// //   // 搜尋和排序狀態
// //   const [searchName, setSearchName] = useState('');
// //   const [searchCreator, setSearchCreator] = useState('');
// //   const [orderBy, setOrderBy] = useState('name'); // name, creator, updatedAt
// //   const [orderDirection, setOrderDirection] = useState('asc'); // asc, desc

// //   // 分頁狀態
// //   const [currentPageNum, setCurrentPageNum] = useState(1);
// //   const [totalItems, setTotalItems] = useState(0);
// //   const itemsPerPage = 20;

// //   // 載入資料
// //   const loadSummaries = async () => {
// //     setLoading(true);
// //     setError('');

// //     try {
// //       const offset = (currentPageNum - 1) * itemsPerPage;
// //       const order = `${orderBy}_${orderDirection}`;

// //       // 使用 mock data 進行測試
// //       // const result = await window.go.main.App.get_summary(
// //       //   searchName,
// //       //   searchCreator,
// //       //   order,
// //       //   offset,
// //       //   itemsPerPage
// //       // );

// //       // Mock data for testing
// //       const result = {
// //         data: [
// //           {id: '111', name: '222', creator: '333', updatedAt: '2025-06-25T00:00:00Z'},
// //           {id: '112', name: 'Test Data', creator: 'User A', updatedAt: '2025-06-24T10:30:00Z'},
// //           {id: '113', name: 'Sample', creator: 'User B', updatedAt: '2025-06-23T15:45:00Z'}
// //         ],
// //         total: 3
// //       };

// //       setSummaries(result.data || []);
// //       setTotalItems(result.total || 0);
// //     } catch (err) {
// //       setError('Failed to load summaries: ' + err.message);
// //       setSummaries([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   // 初始載入和依賴更新時重新載入
// //   useEffect(() => {
// //     loadSummaries();
// //   }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

// //   // 重置搜尋
// //   const handleReset = () => {
// //     setSearchName('');
// //     setSearchCreator('');
// //     setOrderBy('name');
// //     setOrderDirection('asc');
// //     setCurrentPageNum(1);
// //   };

// //   // 處理排序
// //   const handleSort = (field) => {
// //     if (orderBy === field) {
// //       setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
// //     } else {
// //       setOrderBy(field);
// //       setOrderDirection('asc');
// //     }
// //     setCurrentPageNum(1); // 重置到第一頁
// //   };

// //   // 處理分頁
// //   const totalPages = Math.ceil(totalItems / itemsPerPage);
// //   const handlePageChange = (page) => {
// //     setCurrentPageNum(page);
// //   };

// //   // 處理點擊項目
// //   const handleItemClick = (summaryId) => {
// //     setSelectedSummaryId(summaryId);
// //     setCurrentPage('detail');
// //   };

// //   // 渲染排序箭頭
// //   const getSortIcon = (field) => {
// //     if (orderBy !== field) return '';
// //     return orderDirection === 'asc' ? ' ↑' : ' ↓';
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //         <div className="col-12">
// //           <h2 className="mb-4">Data Summary</h2>

// //           {/* 搜尋區域 */}
// //           <div className="card mb-4">
// //             <div className="card-header">
// //               <h5 className="mb-0">Search & Filter</h5>
// //             </div>
// //             <div className="card-body">
// //               <div className="row">
// //                 <div className="col-md-4">
// //                   <label className="form-label">Search by Name</label>
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     placeholder="Enter name..."
// //                     value={searchName}
// //                     onChange={(e) => setSearchName(e.target.value)}
// //                   />
// //                 </div>
// //                 <div className="col-md-4">
// //                   <label className="form-label">Search by Creator</label>
// //                   <input
// //                     type="text"
// //                     className="form-control"
// //                     placeholder="Enter creator..."
// //                     value={searchCreator}
// //                     onChange={(e) => setSearchCreator(e.target.value)}
// //                   />
// //                 </div>
// //                 <div className="col-md-4 d-flex align-items-end">
// //                   <button
// //                     className="btn btn-outline-secondary me-2"
// //                     onClick={handleReset}
// //                   >
// //                     Reset
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 載入狀態 */}
// //           {loading && (
// //             <div className="text-center mb-4">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* 錯誤訊息 */}
// //           {error && (
// //             <div className="alert alert-danger" role="alert">
// //               {error}
// //             </div>
// //           )}

// //           {/* 資料表格 */}
// //           {!loading && !error && (
// //             <>
// //               <div className="card">
// //                 <div className="card-header d-flex justify-content-between align-items-center">
// //                   <h5 className="mb-0">Results ({totalItems} items)</h5>
// //                 </div>
// //                 <div className="card-body p-0">
// //                   {summaries.length > 0 ? (
// //                     <div className="table-responsive">
// //                       <table className="table table-hover mb-0">
// //                         <thead className="table-light">
// //                           <tr>
// //                             <th
// //                               scope="col"
// //                               style={{ cursor: 'pointer' }}
// //                               onClick={() => handleSort('name')}
// //                             >
// //                               Name{getSortIcon('name')}
// //                             </th>
// //                             <th
// //                               scope="col"
// //                               style={{ cursor: 'pointer' }}
// //                               onClick={() => handleSort('creator')}
// //                             >
// //                               Creator{getSortIcon('creator')}
// //                             </th>
// //                             <th
// //                               scope="col"
// //                               style={{ cursor: 'pointer' }}
// //                               onClick={() => handleSort('updatedAt')}
// //                             >
// //                               Updated At{getSortIcon('updatedAt')}
// //                             </th>
// //                           </tr>
// //                         </thead>
// //                         <tbody>
// //                           {summaries.map((summary) => (
// //                             <tr
// //                               key={summary.id}
// //                               style={{ cursor: 'pointer' }}
// //                               onClick={() => handleItemClick(summary.id)}
// //                             >
// //                               <td>{summary.name}</td>
// //                               <td>{summary.creator}</td>
// //                               <td>{new Date(summary.updatedAt).toLocaleString()}</td>
// //                             </tr>
// //                           ))}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   ) : (
// //                     <div className="text-center p-4">
// //                       <h5>No Data Found</h5>
// //                       <p className="text-muted">Try adjusting your search criteria</p>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>

// //               {/* 分頁 */}
// //               {totalPages > 1 && (
// //                 <nav className="mt-4">
// //                   <ul className="pagination justify-content-center">
// //                     <li className={`page-item ${currentPageNum === 1 ? 'disabled' : ''}`}>
// //                       <button
// //                         className="page-link"
// //                         onClick={() => handlePageChange(currentPageNum - 1)}
// //                         disabled={currentPageNum === 1}
// //                       >
// //                         Previous
// //                       </button>
// //                     </li>

// //                     {/* 頁碼按鈕 */}
// //                     {[...Array(totalPages)].map((_, index) => {
// //                       const page = index + 1;
// //                       // 只顯示當前頁面附近的頁碼
// //                       if (
// //                         page === 1 ||
// //                         page === totalPages ||
// //                         (page >= currentPageNum - 2 && page <= currentPageNum + 2)
// //                       ) {
// //                         return (
// //                           <li key={page} className={`page-item ${currentPageNum === page ? 'active' : ''}`}>
// //                             <button
// //                               className="page-link"
// //                               onClick={() => handlePageChange(page)}
// //                             >
// //                               {page}
// //                             </button>
// //                           </li>
// //                         );
// //                       } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
// //                         return (
// //                           <li key={page} className="page-item disabled">
// //                             <span className="page-link">...</span>
// //                           </li>
// //                         );
// //                       }
// //                       return null;
// //                     })}

// //                     <li className={`page-item ${currentPageNum === totalPages ? 'disabled' : ''}`}>
// //                       <button
// //                         className="page-link"
// //                         onClick={() => handlePageChange(currentPageNum + 1)}
// //                         disabled={currentPageNum === totalPages}
// //                       >
// //                         Next
// //                       </button>
// //                     </li>
// //                   </ul>
// //                 </nav>
// //               )}
// //             </>
// //           )}

// //           {/* 返回按鈕 */}
// //           <div className="text-center mt-4">
// //             <button
// //               className="btn btn-secondary"
// //               onClick={() => setCurrentPage('home')}
// //             >
// //               Back to Home
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // DetailPage 組件
// // const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
// //   const [details, setDetails] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [summaryInfo, setSummaryInfo] = useState(null);

// //   // 載入詳細資料
// //   const loadDetails = async () => {
// //     if (!selectedSummaryId) {
// //       setError('No summary ID provided');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');

// //     try {
// //       // 使用 mock data 進行測試
// //       // const result = await window.go.main.App.get_detail(selectedSummaryId);

// //       // Mock data for testing
// //       const result = {
// //         summary: {
// //           id: selectedSummaryId,
// //           name: 'Test Summary',
// //           creator: 'Test Creator',
// //           updatedAt: '2025-06-25T00:00:00Z'
// //         },
// //         details: [
// //           {device: 'Device A', participant: 'Participant 1', trail: 1, is_error: false, is_available: true, deleted: false},
// //           {device: 'Device B', participant: 'Participant 2', trail: 2, is_error: true, is_available: false, deleted: false},
// //           {device: 'Device C', participant: 'Participant 3', trail: 3, is_error: false, is_available: true, deleted: true}
// //         ]
// //       };

// //       setDetails(result.details || []);
// //       setSummaryInfo(result.summary || null);
// //     } catch (err) {
// //       setError('Failed to load details: ' + err.message);
// //       setDetails([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadDetails();
// //   }, [selectedSummaryId]);

// //   // 統計資訊
// //   const stats = {
// //     total: details.length,
// //     errors: details.filter(d => d.is_error).length,
// //     available: details.filter(d => d.is_available).length,
// //     deleted: details.filter(d => d.deleted).length
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //         <div className="col-12">
// //           <div className="d-flex justify-content-between align-items-center mb-4">
// //             <h2>Detail View</h2>
// //             <div>
// //               <button
// //                 className="btn btn-outline-secondary me-2"
// //                 onClick={() => setCurrentPage('summary')}
// //               >
// //                 Back to Summary
// //               </button>
// //               <button
// //                 className="btn btn-secondary"
// //                 onClick={() => setCurrentPage('home')}
// //               >
// //                 Home
// //               </button>
// //             </div>
// //           </div>

// //           {/* 摘要資訊 */}
// //           {summaryInfo && (
// //             <div className="card mb-4">
// //               <div className="card-header">
// //                 <h5 className="mb-0">Summary Information</h5>
// //               </div>
// //               <div className="card-body">
// //                 <div className="row">
// //                   <div className="col-md-4">
// //                     <strong>Name:</strong> {summaryInfo.name}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Creator:</strong> {summaryInfo.creator}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {/* 統計卡片 */}
// //           <div className="row mb-4">
// //             <div className="col-md-3">
// //               <div className="card bg-primary text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.total}</h3>
// //                   <p className="mb-0">Total Items</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-success text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.available}</h3>
// //                   <p className="mb-0">Available</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-danger text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.errors}</h3>
// //                   <p className="mb-0">Errors</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-warning text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.deleted}</h3>
// //                   <p className="mb-0">Deleted</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 載入狀態 */}
// //           {loading && (
// //             <div className="text-center mb-4">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* 錯誤訊息 */}
// //           {error && (
// //             <div className="alert alert-danger" role="alert">
// //               {error}
// //             </div>
// //           )}

// //           {/* 詳細資料表格 */}
// //           {!loading && !error && (
// //             <div className="card">
// //               <div className="card-header">
// //                 <h5 className="mb-0">Detail Records</h5>
// //               </div>
// //               <div className="card-body p-0">
// //                 {details.length > 0 ? (
// //                   <div className="table-responsive">
// //                     <table className="table table-striped mb-0">
// //                       <thead className="table-dark">
// //                         <tr>
// //                           <th scope="col">Device</th>
// //                           <th scope="col">Participant</th>
// //                           <th scope="col">Trail</th>
// //                           <th scope="col">Status</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {details.map((detail, index) => (
// //                           <tr key={index}>
// //                             <td>{detail.device}</td>
// //                             <td>{detail.participant}</td>
// //                             <td>{detail.trail}</td>
// //                             <td>
// //                               <div>
// //                                 {detail.is_error && (
// //                                   <span className="badge bg-danger me-1">Error</span>
// //                                 )}
// //                                 {detail.is_available && (
// //                                   <span className="badge bg-success me-1">Available</span>
// //                                 )}
// //                                 {detail.deleted && (
// //                                   <span className="badge bg-warning me-1">Deleted</span>
// //                                 )}
// //                                 {!detail.is_error && !detail.is_available && !detail.deleted && (
// //                                   <span className="badge bg-secondary">Normal</span>
// //                                 )}
// //                               </div>
// //                             </td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 ) : (
// //                   <div className="text-center p-4">
// //                     <h5>No Detail Records Found</h5>
// //                     <p className="text-muted">This summary has no associated detail records</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // import { useState, useEffect } from 'react';

// // const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
// //   const [details, setDetails] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [summaryInfo, setSummaryInfo] = useState(null);
// //   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
// //   const [expandedGroups, setExpandedGroups] = useState({});

// //   // 載入詳細資料
// //   const loadDetails = async () => {
// //     if (!selectedSummaryId) {
// //       setError('No summary ID provided');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');

// //     try {
// //       // Mock data 生成更完整的測試數據
// //       const mockDetails = [];

// //       // 4 devices, 12 participants, 32 trails per participant per device
// //       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
// //         for (let participantNum = 1; participantNum <= 12; participantNum++) {
// //           for (let trailNum = 1; trailNum <= 32; trailNum++) {
// //             mockDetails.push({
// //               id: `${deviceNum}-${participantNum}-${trailNum}`,
// //               device: `Device ${deviceNum}`,
// //               participant: `Participant ${participantNum}`,
// //               trail: trailNum,
// //               is_error: Math.random() < 0.1, // 10% error rate
// //               is_available: Math.random() < 0.8, // 80% available
// //               deleted: Math.random() < 0.05 // 5% deleted
// //             });
// //           }
// //         }
// //       }

// //       const result = {
// //         summary: {
// //           id: selectedSummaryId,
// //           name: 'Test Summary',
// //           creator: 'Test Creator',
// //           updatedAt: '2025-06-25T00:00:00Z'
// //         },
// //         details: mockDetails
// //       };

// //       setDetails(result.details || []);
// //       setSummaryInfo(result.summary || null);
// //     } catch (err) {
// //       setError('Failed to load details: ' + err.message);
// //       setDetails([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadDetails();
// //   }, [selectedSummaryId]);

// //   // 切換刪除狀態
// //   const toggleDelete = (itemId) => {
// //     setDetails(prevDetails =>
// //       prevDetails.map(detail =>
// //         detail.id === itemId
// //           ? { ...detail, deleted: !detail.deleted }
// //           : detail
// //       )
// //     );
// //   };

// //   // 統計資訊
// //   const stats = {
// //     total: details.length,
// //     errors: details.filter(d => d.is_error).length,
// //     available: details.filter(d => d.is_available).length,
// //     deleted: details.filter(d => d.deleted).length
// //   };

// //   // 分組資料
// //   const getGroupedData = () => {
// //     const grouped = {};

// //     details.forEach(detail => {
// //       const primaryKey = detail[groupBy];
// //       if (!grouped[primaryKey]) {
// //         grouped[primaryKey] = {};
// //       }

// //       // 確定次級和三級分組鍵
// //       let secondaryKey, tertiaryKey;
// //       if (groupBy === 'device') {
// //         secondaryKey = detail.participant;
// //         tertiaryKey = `Trail ${detail.trail}`;
// //       } else if (groupBy === 'participant') {
// //         secondaryKey = detail.device;
// //         tertiaryKey = `Trail ${detail.trail}`;
// //       } else { // trail
// //         secondaryKey = detail.device;
// //         tertiaryKey = detail.participant;
// //       }

// //       if (!grouped[primaryKey][secondaryKey]) {
// //         grouped[primaryKey][secondaryKey] = [];
// //       }

// //       grouped[primaryKey][secondaryKey].push({
// //         ...detail,
// //         displayKey: tertiaryKey
// //       });
// //     });

// //     return grouped;
// //   };

// //   // 切換展開狀態
// //   const toggleExpand = (groupKey) => {
// //     setExpandedGroups(prev => ({
// //       ...prev,
// //       [groupKey]: !prev[groupKey]
// //     }));
// //   };

// //   const groupedData = getGroupedData();

// //   // 獲取狀態徽章
// //   const getStatusBadges = (detail) => {
// //     const badges = [];
// //     if (detail.is_available) {
// //       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
// //     }
// //     if (detail.is_error) {
// //       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
// //     }
// //     if (detail.deleted) {
// //       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
// //     }
// //     if (badges.length === 0) {
// //       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
// //     }
// //     return badges;
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //         <div className="col-12">
// //           <div className="d-flex justify-content-between align-items-center mb-4">
// //             <h2>Detail View</h2>
// //             <div>
// //               <button
// //                 className="btn btn-outline-secondary me-2"
// //                 onClick={() => setCurrentPage('summary')}
// //               >
// //                 Back to Summary
// //               </button>
// //               <button
// //                 className="btn btn-secondary"
// //                 onClick={() => setCurrentPage('home')}
// //               >
// //                 Home
// //               </button>
// //             </div>
// //           </div>

// //           {/* 摘要資訊 */}
// //           {summaryInfo && (
// //             <div className="card mb-4">
// //               <div className="card-header">
// //                 <h5 className="mb-0">Summary Information</h5>
// //               </div>
// //               <div className="card-body">
// //                 <div className="row">
// //                   <div className="col-md-4">
// //                     <strong>Name:</strong> {summaryInfo.name}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Creator:</strong> {summaryInfo.creator}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {/* 統計卡片 */}
// //           <div className="row mb-4">
// //             <div className="col-md-3">
// //               <div className="card bg-primary text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.total}</h3>
// //                   <p className="mb-0">Total Items</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-success text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.available}</h3>
// //                   <p className="mb-0">Available</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-danger text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.errors}</h3>
// //                   <p className="mb-0">Errors</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-warning text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.deleted}</h3>
// //                   <p className="mb-0">Deleted</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 分組選項 */}
// //           <div className="card mb-4">
// //             <div className="card-body">
// //               <h6 className="mb-3">Group By:</h6>
// //               <div className="btn-group" role="group">
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => setGroupBy('device')}
// //                 >
// //                   Device
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => setGroupBy('participant')}
// //                 >
// //                   Participant
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => setGroupBy('trail')}
// //                 >
// //                   Trail
// //                 </button>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 載入狀態 */}
// //           {loading && (
// //             <div className="text-center mb-4">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* 錯誤訊息 */}
// //           {error && (
// //             <div className="alert alert-danger" role="alert">
// //               {error}
// //             </div>
// //           )}

// //           {/* 分組詳細資料 */}
// //           {!loading && !error && (
// //             <div className="card">
// //               <div className="card-header">
// //                 <h5 className="mb-0">
// //                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
// //                 </h5>
// //               </div>
// //               <div className="card-body">
// //                 {Object.keys(groupedData).length > 0 ? (
// //                   <div className="accordion" id="detailAccordion">
// //                     {Object.entries(groupedData).map(([primaryGroup, secondaryGroups]) => (
// //                       <div key={primaryGroup} className="accordion-item mb-3">
// //                         <h2 className="accordion-header">
// //                           <button
// //                             className="accordion-button"
// //                             type="button"
// //                             onClick={() => toggleExpand(primaryGroup)}
// //                             aria-expanded={expandedGroups[primaryGroup] || false}
// //                           >
// //                             <strong>{primaryGroup}</strong>
// //                             <span className="badge bg-secondary ms-2">
// //                               {Object.values(secondaryGroups).reduce((sum, items) => sum + items.length, 0)} items
// //                             </span>
// //                           </button>
// //                         </h2>
// //                         {(expandedGroups[primaryGroup] || false) && (
// //                           <div className="accordion-collapse collapse show">
// //                             <div className="accordion-body">
// //                               {Object.entries(secondaryGroups).map(([secondaryGroup, items]) => (
// //                                 <div key={secondaryGroup} className="mb-4">
// //                                   <h6 className="text-primary mb-3">
// //                                     {secondaryGroup}
// //                                     <span className="badge bg-info ms-2">{items.length} items</span>
// //                                   </h6>
// //                                   <div className="row">
// //                                     {items.map((item) => (
// //                                       <div key={item.id} className="col-md-6 col-lg-4 mb-3">
// //                                         <div className="card h-100">
// //                                           <div className="card-body">
// //                                             <h6 className="card-title">{item.displayKey}</h6>
// //                                             <div className="mb-2">
// //                                               {getStatusBadges(item)}
// //                                             </div>
// //                                             <div className="d-flex justify-content-between align-items-center">
// //                                               <small className="text-muted">
// //                                                 ID: {item.id}
// //                                               </small>
// //                                               <button
// //                                                 className={`btn btn-sm ${
// //                                                   item.deleted
// //                                                     ? 'btn-outline-success'
// //                                                     : 'btn-outline-danger'
// //                                                 }`}
// //                                                 onClick={() => toggleDelete(item.id)}
// //                                               >
// //                                                 {item.deleted ? 'Restore' : 'Delete'}
// //                                               </button>
// //                                             </div>
// //                                           </div>
// //                                         </div>
// //                                       </div>
// //                                     ))}
// //                                   </div>
// //                                 </div>
// //                               ))}
// //                             </div>
// //                           </div>
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <div className="text-center p-4">
// //                     <h5>No Detail Records Found</h5>
// //                     <p className="text-muted">This summary has no associated detail records</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DetailPage;


// // import { useState, useEffect } from 'react';

// // const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
// //   const [details, setDetails] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [summaryInfo, setSummaryInfo] = useState(null);
// //   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
// //   const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
// //   const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
// //   const [expandedLevel3, setExpandedLevel3] = useState({}); // 第三層展開狀態

// //   // 載入詳細資料
// //   const loadDetails = async () => {
// //     if (!selectedSummaryId) {
// //       setError('No summary ID provided');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');

// //     try {
// //       // Mock data 生成更完整的測試數據
// //       const mockDetails = [];

// //       // 4 devices, 12 participants, 32 trails per participant per device
// //       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
// //         for (let participantNum = 1; participantNum <= 12; participantNum++) {
// //           for (let trailNum = 1; trailNum <= 32; trailNum++) {
// //             mockDetails.push({
// //               id: `${deviceNum}-${participantNum}-${trailNum}`,
// //               device: `Device ${deviceNum}`,
// //               participant: `Participant ${participantNum}`,
// //               trail: trailNum,
// //               from: `Point ${Math.floor(Math.random() * 100)}`,
// //               to: `Point ${Math.floor(Math.random() * 100)}`,
// //               is_error: Math.random() < 0.1, // 10% error rate
// //               is_available: Math.random() < 0.8, // 80% available
// //               deleted: Math.random() < 0.05 // 5% deleted
// //             });
// //           }
// //         }
// //       }

// //       const result = {
// //         summary: {
// //           id: selectedSummaryId,
// //           name: 'Test Summary',
// //           creator: 'Test Creator',
// //           updatedAt: '2025-06-25T00:00:00Z'
// //         },
// //         details: mockDetails
// //       };

// //       setDetails(result.details || []);
// //       setSummaryInfo(result.summary || null);
// //     } catch (err) {
// //       setError('Failed to load details: ' + err.message);
// //       setDetails([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadDetails();
// //   }, [selectedSummaryId]);

// //   // 切換刪除狀態
// //   const toggleDelete = (itemId) => {
// //     setDetails(prevDetails =>
// //       prevDetails.map(detail =>
// //         detail.id === itemId
// //           ? { ...detail, deleted: !detail.deleted }
// //           : detail
// //       )
// //     );
// //   };

// //   // 統計資訊
// //   const stats = {
// //     total: details.length,
// //     errors: details.filter(d => d.is_error).length,
// //     available: details.filter(d => d.is_available).length,
// //     deleted: details.filter(d => d.deleted).length
// //   };

// //   // 分組資料 - 三層結構
// //   const getGroupedData = () => {
// //     const grouped = {};

// //     details.forEach(detail => {
// //       let level1Key, level2Key, level3Key;

// //       // 根據分組方式決定三層的鍵值
// //       if (groupBy === 'device') {
// //         level1Key = detail.device;
// //         level2Key = detail.participant;
// //         level3Key = `Trail ${detail.trail}`;
// //       } else if (groupBy === 'participant') {
// //         level1Key = detail.participant;
// //         level2Key = detail.device;
// //         level3Key = `Trail ${detail.trail}`;
// //       } else { // trail
// //         level1Key = `Trail ${detail.trail}`;
// //         level2Key = detail.device;
// //         level3Key = detail.participant;
// //       }

// //       // 建立三層結構
// //       if (!grouped[level1Key]) {
// //         grouped[level1Key] = {};
// //       }
// //       if (!grouped[level1Key][level2Key]) {
// //         grouped[level1Key][level2Key] = {};
// //       }
// //       if (!grouped[level1Key][level2Key][level3Key]) {
// //         grouped[level1Key][level2Key][level3Key] = [];
// //       }

// //       grouped[level1Key][level2Key][level3Key].push(detail);
// //     });

// //     return grouped;
// //   };

// //   // 切換展開狀態
// //   const toggleExpandLevel1 = (key) => {
// //     setExpandedLevel1(prev => ({
// //       ...prev,
// //       [key]: !prev[key]
// //     }));
// //   };

// //   const toggleExpandLevel2 = (level1Key, level2Key) => {
// //     const combinedKey = `${level1Key}-${level2Key}`;
// //     setExpandedLevel2(prev => ({
// //       ...prev,
// //       [combinedKey]: !prev[combinedKey]
// //     }));
// //   };

// //   const toggleExpandLevel3 = (level1Key, level2Key, level3Key) => {
// //     const combinedKey = `${level1Key}-${level2Key}-${level3Key}`;
// //     setExpandedLevel3(prev => ({
// //       ...prev,
// //       [combinedKey]: !prev[combinedKey]
// //     }));
// //   };

// //   const groupedData = getGroupedData();

// //   // 獲取狀態徽章
// //   const getStatusBadges = (detail) => {
// //     const badges = [];
// //     if (detail.is_available) {
// //       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
// //     }
// //     if (detail.is_error) {
// //       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
// //     }
// //     if (detail.deleted) {
// //       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
// //     }
// //     if (badges.length === 0) {
// //       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
// //     }
// //     return badges;
// //   };

// //   // 計算統計數據
// //   const getGroupStats = (group) => {
// //     let totalItems = 0;
// //     const traverse = (obj) => {
// //       if (Array.isArray(obj)) {
// //         totalItems += obj.length;
// //       } else {
// //         Object.values(obj).forEach(traverse);
// //       }
// //     };
// //     traverse(group);
// //     return totalItems;
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //         <div className="col-12">
// //           <div className="d-flex justify-content-between align-items-center mb-4">
// //             <h2>Detail View</h2>
// //             <div>
// //               <button
// //                 className="btn btn-outline-secondary me-2"
// //                 onClick={() => setCurrentPage('summary')}
// //               >
// //                 Back to Summary
// //               </button>
// //               <button
// //                 className="btn btn-secondary"
// //                 onClick={() => setCurrentPage('home')}
// //               >
// //                 Home
// //               </button>
// //             </div>
// //           </div>

// //           {/* 摘要資訊 */}
// //           {summaryInfo && (
// //             <div className="card mb-4">
// //               <div className="card-header">
// //                 <h5 className="mb-0">Summary Information</h5>
// //               </div>
// //               <div className="card-body">
// //                 <div className="row">
// //                   <div className="col-md-4">
// //                     <strong>Name:</strong> {summaryInfo.name}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Creator:</strong> {summaryInfo.creator}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {/* 統計卡片 */}
// //           <div className="row mb-4">
// //             <div className="col-md-3">
// //               <div className="card bg-primary text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.total}</h3>
// //                   <p className="mb-0">Total Items</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-success text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.available}</h3>
// //                   <p className="mb-0">Available</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-danger text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.errors}</h3>
// //                   <p className="mb-0">Errors</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-3">
// //               <div className="card bg-warning text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.deleted}</h3>
// //                   <p className="mb-0">Deleted</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 分組選項 */}
// //           <div className="card mb-4">
// //             <div className="card-body">
// //               <h6 className="mb-3">Group By:</h6>
// //               <div className="btn-group" role="group">
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('device');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Device
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('participant');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Participant
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('trail');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Trail
// //                 </button>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 載入狀態 */}
// //           {loading && (
// //             <div className="text-center mb-4">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* 錯誤訊息 */}
// //           {error && (
// //             <div className="alert alert-danger" role="alert">
// //               {error}
// //             </div>
// //           )}

// //           {/* 三層分組詳細資料 */}
// //           {!loading && !error && (
// //             <div className="card">
// //               <div className="card-header">
// //                 <h5 className="mb-0">
// //                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
// //                 </h5>
// //               </div>
// //               <div className="card-body">
// //                 {Object.keys(groupedData).length > 0 ? (
// //                   <div className="accordion" id="detailAccordion">
// //                     {/* 第一層 */}
// //                     {Object.entries(groupedData).map(([level1Key, level2Data]) => (
// //                       <div key={level1Key} className="accordion-item mb-3">
// //                         <h2 className="accordion-header">
// //                           <button
// //                             className="accordion-button collapsed"
// //                             type="button"
// //                             onClick={() => toggleExpandLevel1(level1Key)}
// //                             aria-expanded={expandedLevel1[level1Key] || false}
// //                           >
// //                             <strong className="text-primary">{level1Key}</strong>
// //                             <span className="badge bg-primary ms-2">
// //                               {getGroupStats(level2Data)} total items
// //                             </span>
// //                           </button>
// //                         </h2>
// //                         {(expandedLevel1[level1Key] || false) && (
// //                           <div className="accordion-collapse collapse show">
// //                             <div className="accordion-body">

// //                               {/* 第二層 */}
// //                               <div className="accordion" id={`level2-${level1Key}`}>
// //                                 {Object.entries(level2Data).map(([level2Key, level3Data]) => (
// //                                   <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
// //                                     <h2 className="accordion-header">
// //                                       <button
// //                                         className="accordion-button collapsed"
// //                                         type="button"
// //                                         onClick={() => toggleExpandLevel2(level1Key, level2Key)}
// //                                         aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
// //                                       >
// //                                         <strong className="text-success">{level2Key}</strong>
// //                                         <span className="badge bg-success ms-2">
// //                                           {getGroupStats(level3Data)} items
// //                                         </span>
// //                                       </button>
// //                                     </h2>
// //                                     {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
// //                                       <div className="accordion-collapse collapse show">
// //                                         <div className="accordion-body">

// //                                           {/* 第三層 */}
// //                                           <div className="accordion" id={`level3-${level1Key}-${level2Key}`}>
// //                                             {Object.entries(level3Data).map(([level3Key, items]) => (
// //                                               <div key={`${level1Key}-${level2Key}-${level3Key}`} className="accordion-item mb-2">
// //                                                 <h2 className="accordion-header">
// //                                                   <button
// //                                                     className="accordion-button collapsed"
// //                                                     type="button"
// //                                                     onClick={() => toggleExpandLevel3(level1Key, level2Key, level3Key)}
// //                                                     aria-expanded={expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false}
// //                                                   >
// //                                                     <strong className="text-info">{level3Key}</strong>
// //                                                     <span className="badge bg-info ms-2">
// //                                                       {items.length} records
// //                                                     </span>
// //                                                   </button>
// //                                                 </h2>
// //                                                 {(expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false) && (
// //                                                   <div className="accordion-collapse collapse show">
// //                                                     <div className="accordion-body">

// //                                                       {/* 最內層資料 */}
// //                                                       {items.map((item) => (
// //                                                         <div key={item.id} className="card mb-3">
// //                                                           <div className="card-body">
// //                                                             <div className="row">
// //                                                               <div className="col-md-8">
// //                                                                 <h6 className="card-title">
// //                                                                   {item.device} - {item.participant} - Trail {item.trail}
// //                                                                 </h6>
// //                                                                 <p className="card-text">
// //                                                                   <strong>From:</strong> {item.from} <br/>
// //                                                                   <strong>To:</strong> {item.to}
// //                                                                 </p>
// //                                                                 <div className="mb-2">
// //                                                                   {getStatusBadges(item)}
// //                                                                 </div>
// //                                                                 <small className="text-muted">ID: {item.id}</small>
// //                                                               </div>
// //                                                               <div className="col-md-4 text-end">
// //                                                                 <button
// //                                                                   className={`btn btn-sm ${
// //                                                                     item.deleted
// //                                                                       ? 'btn-outline-success'
// //                                                                       : 'btn-outline-danger'
// //                                                                   } mb-2`}
// //                                                                   onClick={() => toggleDelete(item.id)}
// //                                                                 >
// //                                                                   {item.deleted ? 'Restore' : 'Delete'}
// //                                                                 </button>
// //                                                                 <br/>
// //                                                                 <button className="btn btn-sm btn-outline-info">
// //                                                                   View Details
// //                                                                 </button>
// //                                                               </div>
// //                                                             </div>
// //                                                           </div>
// //                                                         </div>
// //                                                       ))}

// //                                                     </div>
// //                                                   </div>
// //                                                 )}
// //                                               </div>
// //                                             ))}
// //                                           </div>

// //                                         </div>
// //                                       </div>
// //                                     )}
// //                                   </div>
// //                                 ))}
// //                               </div>

// //                             </div>
// //                           </div>
// //                         )}
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <div className="text-center p-4">
// //                     <h5>No Detail Records Found</h5>
// //                     <p className="text-muted">This summary has no associated detail records</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default DetailPage;

// // export { SummaryPage, DetailPage };

// // const DetailPage = () => {
// //   const [details, setDetails] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState('');
// //   const [summaryInfo, setSummaryInfo] = useState(null);
// //   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
// //   const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
// //   const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
// //   const [expandedLevel3, setExpandedLevel3] = useState({}); // 第三層展開狀態

// //   // 載入詳細資料
// //   const loadDetails = async () => {
// //     if (!selectedSummaryId) {
// //       setError('No summary ID provided');
// //       return;
// //     }

// //     setLoading(true);
// //     setError('');

// //     try {
// //       // Mock data 生成更完整的測試數據
// //       const mockDetails = [];

// //       // 4 devices, 12 participants, 32 trails per participant per device
// //       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
// //         for (let participantNum = 1; participantNum <= 12; participantNum++) {
// //           for (let trailNum = 1; trailNum <= 32; trailNum++) {
// //             mockDetails.push({
// //               id: `${deviceNum}-${participantNum}-${trailNum}`,
// //               device: `Device ${deviceNum}`,
// //               participant: `Participant ${participantNum}`,
// //               trail: trailNum,
// //               from: `Point ${Math.floor(Math.random() * 100)}`,
// //               to: `Point ${Math.floor(Math.random() * 100)}`,
// //               is_error: Math.random() < 0.1, // 10% error rate
// //               is_available: Math.random() < 0.8, // 80% available
// //               deleted: Math.random() < 0.05, // 5% deleted
// //               event_time: Math.floor(Math.random() * 1000), // 隨機事件時間
// //               has_error: Math.random() < 0.15 // 15% has error
// //             });
// //           }
// //         }
// //       }

// //       const result = {
// //         summary: {
// //           id: selectedSummaryId,
// //           name: 'Test Summary',
// //           creator: 'Test Creator',
// //           updatedAt: '2025-06-25T00:00:00Z'
// //         },
// //         details: mockDetails
// //       };

// //       setDetails(result.details || []);
// //       setSummaryInfo(result.summary || null);
// //     } catch (err) {
// //       setError('Failed to load details: ' + err.message);
// //       setDetails([]);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     loadDetails();
// //   }, [selectedSummaryId]);

// //   // 切換刪除狀態
// //   const toggleDelete = (itemId) => {
// //     setDetails(prevDetails =>
// //       prevDetails.map(detail =>
// //         detail.id === itemId
// //           ? { ...detail, deleted: !detail.deleted }
// //           : detail
// //       )
// //     );
// //   };

// //   // 切換組級刪除狀態
// //   const toggleGroupDelete = (groupItems) => {
// //     const hasAnyDeleted = groupItems.some(item => item.deleted);
// //     const newDeletedState = !hasAnyDeleted;

// //     setDetails(prevDetails =>
// //       prevDetails.map(detail => {
// //         const shouldUpdate = groupItems.some(item => item.id === detail.id);
// //         return shouldUpdate
// //           ? { ...detail, deleted: newDeletedState }
// //           : detail;
// //       })
// //     );
// //   };

// //   // 統計資訊
// //   const stats = {
// //     total: details.length,
// //     errors: details.filter(d => d.is_error).length,
// //     deleted: details.filter(d => d.deleted).length
// //   };

// //   // 分組資料 - 三層結構
// //   const getGroupedData = () => {
// //     const grouped = {};

// //     details.forEach(detail => {
// //       let level1Key, level2Key, level3Key;

// //       // 根據分組方式決定三層的鍵值
// //       if (groupBy === 'device') {
// //         level1Key = detail.device;
// //         level2Key = detail.participant;
// //         level3Key = `Trail ${detail.trail}`;
// //       } else if (groupBy === 'participant') {
// //         level1Key = detail.participant;
// //         level2Key = detail.device;
// //         level3Key = `Trail ${detail.trail}`;
// //       } else { // trail
// //         level1Key = `Trail ${detail.trail}`;
// //         level2Key = detail.device;
// //         level3Key = detail.participant;
// //       }

// //       // 建立三層結構
// //       if (!grouped[level1Key]) {
// //         grouped[level1Key] = {};
// //       }
// //       if (!grouped[level1Key][level2Key]) {
// //         grouped[level1Key][level2Key] = {};
// //       }
// //       if (!grouped[level1Key][level2Key][level3Key]) {
// //         grouped[level1Key][level2Key][level3Key] = [];
// //       }

// //       grouped[level1Key][level2Key][level3Key].push(detail);
// //     });

// //     return grouped;
// //   };

// //   // 切換展開狀態
// //   const toggleExpandLevel1 = (key) => {
// //     setExpandedLevel1(prev => ({
// //       ...prev,
// //       [key]: !prev[key]
// //     }));
// //   };

// //   const toggleExpandLevel2 = (level1Key, level2Key) => {
// //     const combinedKey = `${level1Key}-${level2Key}`;
// //     setExpandedLevel2(prev => ({
// //       ...prev,
// //       [combinedKey]: !prev[combinedKey]
// //     }));
// //   };

// //   const toggleExpandLevel3 = (level1Key, level2Key, level3Key) => {
// //     const combinedKey = `${level1Key}-${level2Key}-${level3Key}`;
// //     setExpandedLevel3(prev => ({
// //       ...prev,
// //       [combinedKey]: !prev[combinedKey]
// //     }));
// //   };

// //   const groupedData = getGroupedData();

// //   // 獲取狀態徽章
// //   const getStatusBadges = (detail) => {
// //     const badges = [];
// //     if (detail.is_available) {
// //       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
// //     }
// //     if (detail.is_error) {
// //       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
// //     }
// //     if (detail.deleted) {
// //       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
// //     }
// //     if (badges.length === 0) {
// //       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
// //     }
// //     return badges;
// //   };

// //   // 計算第一、二層統計數據
// //   const getLevel1Stats = (level2Data) => {
// //     let errorCount = 0;
// //     let eventTimeSum = 0;
// //     let totalItems = 0;
// //     let deletedCount = 0;

// //     const traverse = (obj) => {
// //       if (Array.isArray(obj)) {
// //         obj.forEach(item => {
// //           totalItems++;
// //           if (item.is_error || item.has_error) errorCount++;
// //           eventTimeSum += item.event_time || 0;
// //           if (item.deleted) deletedCount++;
// //         });
// //       } else {
// //         Object.values(obj).forEach(traverse);
// //       }
// //     };

// //     traverse(level2Data);
// //     return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
// //   };

// //   const getLevel2Stats = (level3Data) => {
// //     let errorCount = 0;
// //     let eventTimeSum = 0;
// //     let totalItems = 0;
// //     let deletedCount = 0;

// //     const traverse = (obj) => {
// //       if (Array.isArray(obj)) {
// //         obj.forEach(item => {
// //           totalItems++;
// //           if (item.is_error || item.has_error) errorCount++;
// //           eventTimeSum += item.event_time || 0;
// //           if (item.deleted) deletedCount++;
// //         });
// //       } else {
// //         Object.values(obj).forEach(traverse);
// //       }
// //     };

// //     traverse(level3Data);
// //     return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
// //   };

// //   // 計算第三層統計數據
// //   const getLevel3Stats = (items) => {
// //     const errorCount = items.filter(item => item.is_error || item.has_error).length;
// //     const deletedCount = items.filter(item => item.deleted).length;
// //     const hasError = items.some(item => item.is_error || item.has_error);
// //     const isAvailable = items.some(item => item.is_available);
// //     const avgEventTime = Math.round(items.reduce((sum, item) => sum + (item.event_time || 0), 0) / items.length) || 0;

// //     return { errorCount, deletedCount, hasError, isAvailable, avgEventTime };
// //   };

// //   // 獲取組級所有項目
// //   const getGroupItems = (groupData) => {
// //     const items = [];
// //     const traverse = (obj) => {
// //       if (Array.isArray(obj)) {
// //         items.push(...obj);
// //       } else {
// //         Object.values(obj).forEach(traverse);
// //       }
// //     };
// //     traverse(groupData);
// //     return items;
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row">
// //         <div className="col-12">
// //           <div className="d-flex justify-content-between align-items-center mb-4">
// //             <h2>Detail View</h2>
// //             <div>
// //               <button
// //                 className="btn btn-outline-secondary me-2"
// //                 onClick={() => setCurrentPage('summary')}
// //               >
// //                 Back to Summary
// //               </button>
// //               <button
// //                 className="btn btn-secondary"
// //                 onClick={() => setCurrentPage('home')}
// //               >
// //                 Home
// //               </button>
// //             </div>
// //           </div>

// //           {/* 摘要資訊 */}
// //           {summaryInfo && (
// //             <div className="card mb-4">
// //               <div className="card-header">
// //                 <h5 className="mb-0">Summary Information</h5>
// //               </div>
// //               <div className="card-body">
// //                 <div className="row">
// //                   <div className="col-md-4">
// //                     <strong>Name:</strong> {summaryInfo.name}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Creator:</strong> {summaryInfo.creator}
// //                   </div>
// //                   <div className="col-md-4">
// //                     <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
// //                   </div>
// //                 </div>
// //               </div>
// //             </div>
// //           )}

// //           {/* 統計卡片 - 移除 Available */}
// //           <div className="row mb-4">
// //             <div className="col-md-4">
// //               <div className="card bg-primary text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.total}</h3>
// //                   <p className="mb-0">Total Items</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-4">
// //               <div className="card bg-danger text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.errors}</h3>
// //                   <p className="mb-0">Errors</p>
// //                 </div>
// //               </div>
// //             </div>
// //             <div className="col-md-4">
// //               <div className="card bg-warning text-white">
// //                 <div className="card-body text-center">
// //                   <h3>{stats.deleted}</h3>
// //                   <p className="mb-0">Deleted</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 分組選項 */}
// //           <div className="card mb-4">
// //             <div className="card-body">
// //               <h6 className="mb-3">Group By:</h6>
// //               <div className="btn-group" role="group">
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('device');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Device
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('participant');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Participant
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
// //                   onClick={() => {
// //                     setGroupBy('trail');
// //                     setExpandedLevel1({});
// //                     setExpandedLevel2({});
// //                     setExpandedLevel3({});
// //                   }}
// //                 >
// //                   Trail
// //                 </button>
// //               </div>
// //             </div>
// //           </div>

// //           {/* 載入狀態 */}
// //           {loading && (
// //             <div className="text-center mb-4">
// //               <div className="spinner-border" role="status">
// //                 <span className="visually-hidden">Loading...</span>
// //               </div>
// //             </div>
// //           )}

// //           {/* 錯誤訊息 */}
// //           {error && (
// //             <div className="alert alert-danger" role="alert">
// //               {error}
// //             </div>
// //           )}

// //           {/* 三層分組詳細資料 */}
// //           {!loading && !error && (
// //             <div className="card">
// //               <div className="card-header">
// //                 <h5 className="mb-0">
// //                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
// //                 </h5>
// //               </div>
// //               <div className="card-body">
// //                 {Object.keys(groupedData).length > 0 ? (
// //                   <div className="accordion" id="detailAccordion">
// //                     {/* 第一層 */}
// //                     {Object.entries(groupedData).map(([level1Key, level2Data]) => {
// //                       const level1Stats = getLevel1Stats(level2Data);
// //                       const level1Items = getGroupItems(level2Data);

// //                       return (
// //                         <div key={level1Key} className="accordion-item mb-3">
// //                           <h2 className="accordion-header">
// //                             <button
// //                               className="accordion-button collapsed d-flex justify-content-between align-items-center"
// //                               type="button"
// //                               onClick={() => toggleExpandLevel1(level1Key)}
// //                               aria-expanded={expandedLevel1[level1Key] || false}
// //                             >
// //                               <div className="d-flex align-items-center">
// //                                 <strong className="text-primary me-3">{level1Key}</strong>
// //                                 <span className="badge bg-danger me-2">Error: {level1Stats.errorCount}</span>
// //                                 <span className="badge bg-info me-2">Event Time: {level1Stats.avgEventTime}</span>
// //                                 <span className="badge bg-warning me-2">Deleted: {level1Stats.deletedCount}</span>
// //                               </div>
// //                               <button
// //                                 className={`btn btn-sm ms-2 ${level1Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
// //                                 onClick={(e) => {
// //                                   e.stopPropagation();
// //                                   toggleGroupDelete(level1Items);
// //                                 }}
// //                               >
// //                                 {level1Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
// //                               </button>
// //                             </button>
// //                           </h2>
// //                           {(expandedLevel1[level1Key] || false) && (
// //                             <div className="accordion-collapse collapse show">
// //                               <div className="accordion-body">

// //                                 {/* 第二層 */}
// //                                 <div className="accordion" id={`level2-${level1Key}`}>
// //                                   {Object.entries(level2Data).map(([level2Key, level3Data]) => {
// //                                     const level2Stats = getLevel2Stats(level3Data);
// //                                     const level2Items = getGroupItems(level3Data);

// //                                     return (
// //                                       <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
// //                                         <h2 className="accordion-header">
// //                                           <button
// //                                             className="accordion-button collapsed d-flex justify-content-between align-items-center"
// //                                             type="button"
// //                                             onClick={() => toggleExpandLevel2(level1Key, level2Key)}
// //                                             aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
// //                                           >
// //                                             <div className="d-flex align-items-center">
// //                                               <strong className="text-success me-3">{level2Key}</strong>
// //                                               <span className="badge bg-danger me-2">Error: {level2Stats.errorCount}</span>
// //                                               <span className="badge bg-info me-2">Event Time: {level2Stats.avgEventTime}</span>
// //                                               <span className="badge bg-warning me-2">Deleted: {level2Stats.deletedCount}</span>
// //                                             </div>
// //                                             <button
// //                                               className={`btn btn-sm ms-2 ${level2Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
// //                                               onClick={(e) => {
// //                                                 e.stopPropagation();
// //                                                 toggleGroupDelete(level2Items);
// //                                               }}
// //                                             >
// //                                               {level2Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
// //                                             </button>
// //                                           </button>
// //                                         </h2>
// //                                         {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
// //                                           <div className="accordion-collapse collapse show">
// //                                             <div className="accordion-body">

// //                                               {/* 第三層 */}
// //                                               <div className="accordion" id={`level3-${level1Key}-${level2Key}`}>
// //                                                 {Object.entries(level3Data).map(([level3Key, items]) => {
// //                                                   const level3Stats = getLevel3Stats(items);

// //                                                   return (
// //                                                     <div key={`${level1Key}-${level2Key}-${level3Key}`} className="accordion-item mb-2">
// //                                                       <h2 className="accordion-header">
// //                                                         <button
// //                                                           className="accordion-button collapsed d-flex justify-content-between align-items-center"
// //                                                           type="button"
// //                                                           onClick={() => toggleExpandLevel3(level1Key, level2Key, level3Key)}
// //                                                           aria-expanded={expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false}
// //                                                         >
// //                                                           <div className="d-flex align-items-center">
// //                                                             <strong className="text-info me-3">{level3Key}</strong>
// //                                                             <span className={`badge me-2 ${level3Stats.hasError ? 'bg-danger' : 'bg-success'}`}>
// //                                                               Has Error: {level3Stats.hasError ? 'Yes' : 'No'}
// //                                                             </span>
// //                                                             <span className={`badge me-2 ${level3Stats.isAvailable ? 'bg-success' : 'bg-secondary'}`}>
// //                                                               Available: {level3Stats.isAvailable ? 'Yes' : 'No'}
// //                                                             </span>
// //                                                             <span className="badge bg-info me-2">Event Time: {level3Stats.avgEventTime}</span>
// //                                                             <span className="badge bg-warning me-2">Deleted: {level3Stats.deletedCount}</span>
// //                                                           </div>
// //                                                           <button
// //                                                             className={`btn btn-sm ms-2 ${items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
// //                                                             onClick={(e) => {
// //                                                               e.stopPropagation();
// //                                                               toggleGroupDelete(items);
// //                                                             }}
// //                                                           >
// //                                                             {items.some(item => item.deleted) ? 'Recover' : 'Delete'}
// //                                                           </button>
// //                                                         </button>
// //                                                       </h2>
// //                                                       {(expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false) && (
// //                                                         <div className="accordion-collapse collapse show">
// //                                                           <div className="accordion-body">

// //                                                             {/* 最內層資料 - 顯示完整詳細資訊 */}
// //                                                             {items.map((item) => (
// //                                                               <div key={item.id} className="card mb-3">
// //                                                                 <div className="card-body">
// //                                                                   <div className="row">
// //                                                                     <div className="col-md-9">
// //                                                                       <h6 className="card-title">
// //                                                                         {item.device} - {item.participant} - Trail {item.trail}
// //                                                                       </h6>
// //                                                                       <div className="row mb-3">
// //                                                                         <div className="col-md-6">
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>From:</strong> {item.from}
// //                                                                           </p>
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>To:</strong> {item.to}
// //                                                                           </p>
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>ID:</strong> {item.id}
// //                                                                           </p>
// //                                                                         </div>
// //                                                                         <div className="col-md-6">
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>Event Time:</strong> {item.event_time}
// //                                                                           </p>
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>Available:</strong> {item.is_available ? 'Yes' : 'No'}
// //                                                                           </p>
// //                                                                           <p className="card-text mb-1">
// //                                                                             <strong>Has Error:</strong> {item.has_error || item.is_error ? 'Yes' : 'No'}
// //                                                                           </p>
// //                                                                         </div>
// //                                                                       </div>
// //                                                                       <div className="mb-2">
// //                                                                         {getStatusBadges(item)}
// //                                                                       </div>
// //                                                                     </div>
// //                                                                     <div className="col-md-3 text-end">
// //                                                                       <button
// //                                                                         className={`btn btn-sm ${
// //                                                                           item.deleted
// //                                                                             ? 'btn-outline-success'
// //                                                                             : 'btn-outline-danger'
// //                                                                         }`}
// //                                                                         onClick={() => toggleDelete(item.id)}
// //                                                                       >
// //                                                                         {item.deleted ? 'Recover' : 'Delete'}
// //                                                                       </button>
// //                                                                     </div>
// //                                                                   </div>
// //                                                                 </div>
// //                                                               </div>
// //                                                             ))}

// //                                                           </div>
// //                                                         </div>
// //                                                       )}
// //                                                     </div>
// //                                                   );
// //                                                 })}
// //                                               </div>

// //                                             </div>
// //                                           </div>
// //                                         )}
// //                                       </div>
// //                                     );
// //                                   })}
// //                                 </div>

// //                               </div>
// //                             </div>
// //                           )}
// //                         </div>
// //                       );
// //                     })}
// //                   </div>
// //                 ) : (
// //                   <div className="text-center p-4">
// //                     <h5>No Detail Records Found</h5>
// //                     <p className="text-muted">This summary has no associated detail records</p>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const SyncPage = ({ setCurrentPage }) => {
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [loading, setLoading] = useState(false);
// //   const [isLoggedIn, setIsLoggedIn] = useState(false);
// //   const [isSyncing, setIsSyncing] = useState(false);
// //   const [syncProgress, setSyncProgress] = useState({
// //     currentProject: '',
// //     progress: 0,
// //     totalProjects: 0,
// //     isCompleted: false,
// //     isCancelled: false
// //   });
// //   const [loginError, setLoginError] = useState('');
// //   const [syncData, setSyncData] = useState(null);

// //   useEffect(() => {
// //     // 監聽同步進度事件
// //     const unsubscribe = EventsOn('sync-progress', (progress) => {
// //       setSyncProgress(progress);

// //       if (progress.isCompleted) {
// //         setIsSyncing(false);
// //         setSyncData({
// //           totalRecords: progress.totalProjects,
// //           lastSync: new Date().toISOString()
// //         });
// //       } else if (progress.isCancelled) {
// //         setIsSyncing(false);
// //       }
// //     });

// //     // 檢查同步狀態
// //     checkSyncStatus();

// //     return () => {
// //       EventsOff('sync-progress');
// //     };
// //   }, []);

// //   const checkSyncStatus = async () => {
// //     try {
// //       const status = await GetSyncStatus();
// //       setIsSyncing(status.isSyncing);
// //     } catch (error) {
// //       console.error('Failed to get sync status:', error);
// //     }
// //   };

// //   const handleLogin = async () => {
// //     if (email && password) {
// //       setLoading(true);
// //       setLoginError('');

// //       try {
// //         const response = await LoginAndSync(email, password);
// //         if (response.success) {
// //           setIsLoggedIn(true);
// //           // 登入成功後立即開始同步
// //           handleStartSync();
// //         } else {
// //           setLoginError(response.message);
// //         }
// //       } catch (error) {
// //         console.error("Login failed:", error);
// //         setLoginError('Login failed. Please check your credentials.');
// //       }

// //       setLoading(false);
// //     }
// //   };

// //   const handleStartSync = async () => {
// //     try {
// //       setIsSyncing(true);
// //       setSyncProgress({
// //         currentProject: '',
// //         progress: 0,
// //         totalProjects: 5,
// //         isCompleted: false,
// //         isCancelled: false
// //       });
// //       await StartSync();
// //     } catch (error) {
// //       console.error("Failed to start sync:", error);
// //       setIsSyncing(false);
// //     }
// //   };

// //   const handleCancelSync = async () => {
// //     try {
// //       await CancelSync();
// //       setIsSyncing(false);
// //       setSyncProgress(prev => ({
// //         ...prev,
// //         isCancelled: true
// //       }));
// //     } catch (error) {
// //       console.error("Failed to cancel sync:", error);
// //     }
// //   };

// //   const resetSync = () => {
// //     setIsLoggedIn(false);
// //     setIsSyncing(false);
// //     setSyncData(null);
// //     setSyncProgress({
// //       currentProject: '',
// //       progress: 0,
// //       totalProjects: 0,
// //       isCompleted: false,
// //       isCancelled: false
// //     });
// //     setEmail('');
// //     setPassword('');
// //     setLoginError('');
// //   };

// //   return (
// //     <div className="container mt-5">
// //       <div className="row justify-content-center">
// //         <div className="col-md-6">
// //           <div className="card shadow">
// //             <div className="card-header bg-primary text-white">
// //               <h3 className="mb-0">Data Synchronization</h3>
// //             </div>
// //             <div className="card-body">
// //               {!isLoggedIn ? (
// //                 <div>
// //                   <div className="mb-3">
// //                     <label htmlFor="email" className="form-label">Email</label>
// //                     <input
// //                       type="email"
// //                       className="form-control"
// //                       id="email"
// //                       value={email}
// //                       onChange={(e) => setEmail(e.target.value)}
// //                       placeholder="admin@example.com"
// //                     />
// //                   </div>
// //                   <div className="mb-3">
// //                     <label htmlFor="password" className="form-label">Password</label>
// //                     <input
// //                       type="password"
// //                       className="form-control"
// //                       id="password"
// //                       value={password}
// //                       onChange={(e) => setPassword(e.target.value)}
// //                       placeholder="password123"
// //                     />
// //                   </div>

// //                   {loginError && (
// //                     <div className="alert alert-danger" role="alert">
// //                       {loginError}
// //                     </div>
// //                   )}

// //                   <button
// //                     onClick={handleLogin}
// //                     className="btn btn-primary w-100"
// //                     disabled={loading || !email || !password}
// //                   >
// //                     {loading ? 'Logging in...' : 'Login & Start Sync'}
// //                   </button>
// //                 </div>
// //               ) : (
// //                 <div>
// //                   {syncProgress.isCompleted && !isSyncing ? (
// //                     <div className="text-center">
// //                       <div className="alert alert-success">
// //                         <h5>✅ Sync Completed!</h5>
// //                         <p>Successfully synchronized {syncData?.totalRecords} projects</p>
// //                         <small>Last sync: {new Date(syncData?.lastSync).toLocaleString()}</small>
// //                       </div>
// //                       <button
// //                         onClick={resetSync}
// //                         className="btn btn-info me-2"
// //                       >
// //                         Start New Sync
// //                       </button>
// //                     </div>
// //                   ) : syncProgress.isCancelled ? (
// //                     <div className="text-center">
// //                       <div className="alert alert-warning">
// //                         <h5>⚠️ Sync Cancelled</h5>
// //                         <p>Synchronization was cancelled during: <strong>{syncProgress.currentProject}</strong></p>
// //                       </div>
// //                       <button
// //                         onClick={handleStartSync}
// //                         className="btn btn-primary me-2"
// //                       >
// //                         Restart Sync
// //                       </button>
// //                       <button
// //                         onClick={resetSync}
// //                         className="btn btn-secondary"
// //                       >
// //                         New Login
// //                       </button>
// //                     </div>
// //                   ) : (
// //                     <div className="text-center">
// //                       <div className="alert alert-info">
// //                         <h5>📊 Synchronization in Progress</h5>
// //                         {syncProgress.currentProject && (
// //                           <p className="mb-2">
// //                             Currently syncing: <strong>{syncProgress.currentProject}</strong>
// //                           </p>
// //                         )}
// //                       </div>
// //                     </div>
// //                   )}
// //                 </div>
// //               )}

// //               {isSyncing && (
// //                 <div className="mt-3">
// //                   <div className="progress mb-3">
// //                     <div
// //                       className="progress-bar progress-bar-striped progress-bar-animated bg-success"
// //                       role="progressbar"
// //                       style={{ width: `${syncProgress.progress}%` }}
// //                     >
// //                       {syncProgress.progress}%
// //                     </div>
// //                   </div>

// //                   <div className="text-center">
// //                     <p className="mb-2">
// //                       <strong>Status:</strong> {syncProgress.currentProject || 'Initializing...'}
// //                     </p>
// //                     <p className="text-muted small mb-3">
// //                       Progress: {syncProgress.progress}% ({Math.floor(syncProgress.progress / 20)}/{syncProgress.totalProjects} projects)
// //                     </p>

// //                     <button
// //                       onClick={handleCancelSync}
// //                       className="btn btn-danger btn-sm"
// //                     >
// //                       🛑 Cancel Sync
// //                     </button>
// //                   </div>
// //                 </div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="text-center mt-4">
// //         <button
// //           className="btn btn-secondary"
// //           onClick={() => setCurrentPage('home')}
// //           disabled={isSyncing}
// //         >
// //           Back to Home
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// const DetailPage = () => {
//   const [data, setData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [summaryInfo, setSummaryInfo] = useState(null);
//   const [groupBy, setGroupBy] = useState('device'); // device, participant
//   const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
//   const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
//   const [detailedData, setDetailedData] = useState({}); // 最內層詳細資料
//   const [loadingDetailed, setLoadingDetailed] = useState({});
//   const [deletedRecords, setDeletedRecords] = useState([]);
//   const [showDeletedModal, setShowDeletedModal] = useState(false);

//   // 載入主要資料
//   const loadData = async () => {
//     if (!selectedSummaryId) {
//       setError('No summary ID provided');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // 模擬 API 呼叫
//       const response = await fetch(`/api/details/${selectedSummaryId}?groupBy=${groupBy}`);
//       const result = await response.json();

//       if (result.success) {
//         setData(result.data || {});
//         setSummaryInfo(result.summary || null);
//         setDeletedRecords(result.deletedRecords || []);
//       } else {
//         throw new Error(result.message || 'Failed to load data');
//       }
//     } catch (err) {
//       // 生成 Mock 資料
//       const mockData = generateMockData(groupBy);
//       setData(mockData.data);
//       setSummaryInfo(mockData.summary);
//       setDeletedRecords(mockData.deletedRecords);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 生成 Mock 資料
//   const generateMockData = (groupByType) => {
//     const data = {};
//     const deletedRecords = [];

//     if (groupByType === 'device') {
//       // Device -> Participant 結構
//       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
//         const deviceKey = `Device ${deviceNum}`;
//         data[deviceKey] = {};

//         for (let participantNum = 1; participantNum <= 12; participantNum++) {
//           const participantKey = `Participant ${participantNum}`;
//           const records = [];

//           for (let i = 0; i < 5; i++) {
//             const record = {
//               device: deviceKey,
//               participant: participantKey,
//               error_time: Math.floor(Math.random() * 100),
//               event_time: Math.floor(Math.random() * 1000),
//               available: Math.random() > 0.2,
//               deleted: Math.random() < 0.1
//             };

//             records.push(record);
//             if (record.deleted) {
//               deletedRecords.push({
//                 ...record,
//                 id: `${deviceKey}-${participantKey}-${i}`,
//                 deletedAt: new Date().toISOString()
//               });
//             }
//           }

//           data[deviceKey][participantKey] = records;
//         }
//       }
//     } else {
//       // Participant -> Device 結構
//       for (let participantNum = 1; participantNum <= 12; participantNum++) {
//         const participantKey = `Participant ${participantNum}`;
//         data[participantKey] = {};

//         for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
//           const deviceKey = `Device ${deviceNum}`;
//           const records = [];

//           for (let i = 0; i < 5; i++) {
//             const record = {
//               device: deviceKey,
//               participant: participantKey,
//               error_time: Math.floor(Math.random() * 100),
//               event_time: Math.floor(Math.random() * 1000),
//               available: Math.random() > 0.2,
//               deleted: Math.random() < 0.1
//             };

//             records.push(record);
//             if (record.deleted) {
//               deletedRecords.push({
//                 ...record,
//                 id: `${participantKey}-${deviceKey}-${i}`,
//                 deletedAt: new Date().toISOString()
//               });
//             }
//           }

//           data[participantKey][deviceKey] = records;
//         }
//       }
//     }

//     return {
//       data,
//       summary: {
//         id: selectedSummaryId,
//         name: 'Test Summary',
//         creator: 'Test Creator',
//         updatedAt: '2025-06-04T00:00:00Z'
//       },
//       deletedRecords
//     };
//   };

//   useEffect(() => {
//     loadData();
//   }, [selectedSummaryId, groupBy]);

//   // 載入最內層詳細資料
//   const loadDetailedData = async (level1Key, level2Key) => {
//     const combinedKey = `${level1Key}-${level2Key}`;
//     setLoadingDetailed(prev => ({ ...prev, [combinedKey]: true }));

//     try {
//       // 模擬 API 呼叫
//       const response = await fetch(`/api/details/inner/${selectedSummaryId}?level1=${level1Key}&level2=${level2Key}`);
//       const result = await response.json();

//       if (result.success) {
//         setDetailedData(prev => ({
//           ...prev,
//           [combinedKey]: result.data
//         }));
//       } else {
//         throw new Error(result.message);
//       }
//     } catch (err) {
//       // 生成 Mock 詳細資料
//       const mockDetailedData = [];
//       for (let i = 1; i <= 10; i++) {
//         mockDetailedData.push({
//           device: level1Key.startsWith('Device') ? level1Key : level2Key,
//           participant: level1Key.startsWith('Participant') ? level1Key : level2Key,
//           trail: `Trail ${i}`,
//           target: `Target ${Math.floor(Math.random() * 100)}`,
//           position: `${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}`,
//           createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString()
//         });
//       }

//       setDetailedData(prev => ({
//         ...prev,
//         [combinedKey]: mockDetailedData
//       }));
//     } finally {
//       setLoadingDetailed(prev => ({ ...prev, [combinedKey]: false }));
//     }
//   };

//   // 刪除/復原第二層資料
//   const toggleLevel2Delete = async (level1Key, level2Key) => {
//     try {
//       // 呼叫後端 API
//       const response = await fetch(`/api/details/toggle-delete`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           summaryId: selectedSummaryId,
//           level1: level1Key,
//           level2: level2Key,
//           type: 'level2'
//         })
//       });

//       if (response.ok) {
//         // 重新載入資料
//         await loadData();
//       }
//     } catch (err) {
//       console.error('Toggle delete failed:', err);
//       // 在 mock 模式下直接更新本地狀態
//       await loadData();
//     }
//   };

//   // 刪除/復原第三層資料
//   const toggleLevel3Delete = async (level1Key, level2Key, recordIndex) => {
//     try {
//       // 呼叫後端 API
//       const response = await fetch(`/api/details/toggle-delete`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           summaryId: selectedSummaryId,
//           level1: level1Key,
//           level2: level2Key,
//           recordIndex: recordIndex,
//           type: 'level3'
//         })
//       });

//       if (response.ok) {
//         // 重新載入資料
//         await loadData();
//       }
//     } catch (err) {
//       console.error('Toggle delete failed:', err);
//       // 在 mock 模式下直接更新本地狀態
//       await loadData();
//     }
//   };

//   // 復原已刪除的記錄
//   const restoreDeletedRecord = async (recordId) => {
//     try {
//       const response = await fetch(`/api/details/restore/${recordId}`, {
//         method: 'POST'
//       });

//       if (response.ok) {
//         await loadData();
//       }
//     } catch (err) {
//       console.error('Restore failed:', err);
//       // Mock 模式下移除記錄
//       setDeletedRecords(prev => prev.filter(record => record.id !== recordId));
//     }
//   };

//   // 切換展開狀態
//   const toggleExpandLevel1 = (key) => {
//     setExpandedLevel1(prev => ({
//       ...prev,
//       [key]: !prev[key]
//     }));
//   };

//   const toggleExpandLevel2 = (level1Key, level2Key) => {
//     const combinedKey = `${level1Key}-${level2Key}`;
//     const isExpanded = !expandedLevel2[combinedKey];

//     setExpandedLevel2(prev => ({
//       ...prev,
//       [combinedKey]: isExpanded
//     }));

//     // 如果展開且沒有載入過詳細資料，則載入
//     if (isExpanded && !detailedData[combinedKey]) {
//       loadDetailedData(level1Key, level2Key);
//     }
//   };

//   // 計算統計資料
//   const getLevel1Stats = (level2Data) => {
//     let total = 0;
//     let errors = 0;
//     let deleted = 0;
//     let eventTimeSum = 0;

//     Object.values(level2Data).forEach(records => {
//       records.forEach(record => {
//         total++;
//         if (record.error_time > 50) errors++;
//         if (record.deleted) deleted++;
//         eventTimeSum += record.event_time;
//       });
//     });

//     const avgEventTime = Math.round(eventTimeSum / total) || 0;
//     return { total, errors, deleted, avgEventTime };
//   };

//   const getLevel2Stats = (records) => {
//     const total = records.length;
//     const errors = records.filter(r => r.error_time > 50).length;
//     const deleted = records.filter(r => r.deleted).length;
//     const avgEventTime = Math.round(records.reduce((sum, r) => sum + r.event_time, 0) / total) || 0;

//     return { total, errors, deleted, avgEventTime };
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2>Detail View</h2>
//             <div>
//               <button
//                 className="btn btn-outline-warning me-2"
//                 onClick={() => setShowDeletedModal(true)}
//               >
//                 View Deleted ({deletedRecords.length})
//               </button>
//               <button
//                 className="btn btn-outline-secondary me-2"
//                 onClick={() => setCurrentPage('summary')}
//               >
//                 Back to Summary
//               </button>
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setCurrentPage('home')}
//               >
//                 Home
//               </button>
//             </div>
//           </div>

//           {/* 摘要資訊 */}
//           {summaryInfo && (
//             <div className="card mb-4">
//               <div className="card-header">
//                 <h5 className="mb-0">Summary Information</h5>
//               </div>
//               <div className="card-body">
//                 <div className="row">
//                   <div className="col-md-4">
//                     <strong>Name:</strong> {summaryInfo.name}
//                   </div>
//                   <div className="col-md-4">
//                     <strong>Creator:</strong> {summaryInfo.creator}
//                   </div>
//                   <div className="col-md-4">
//                     <strong>Updated:</strong> {new Date(summaryInfo.updatedAt).toLocaleString()}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* 分組選項 */}
//           <div className="card mb-4">
//             <div className="card-body">
//               <h6 className="mb-3">Group By:</h6>
//               <div className="btn-group" role="group">
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => {
//                     setGroupBy('device');
//                     setExpandedLevel1({});
//                     setExpandedLevel2({});
//                     setDetailedData({});
//                   }}
//                 >
//                   Device
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => {
//                     setGroupBy('participant');
//                     setExpandedLevel1({});
//                     setExpandedLevel2({});
//                     setDetailedData({});
//                   }}
//                 >
//                   Participant
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* 載入狀態 */}
//           {loading && (
//             <div className="text-center mb-4">
//               <div className="spinner-border" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//             </div>
//           )}

//           {/* 錯誤訊息 */}
//           {error && (
//             <div className="alert alert-danger" role="alert">
//               {error}
//             </div>
//           )}

//           {/* 分組資料 */}
//           {!loading && !error && (
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">
//                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
//                 </h5>
//               </div>
//               <div className="card-body">
//                 {Object.keys(data).length > 0 ? (
//                   <div className="accordion" id="detailAccordion">
//                     {/* 第一層 */}
//                     {Object.entries(data).map(([level1Key, level2Data]) => {
//                       const level1Stats = getLevel1Stats(level2Data);

//                       return (
//                         <div key={level1Key} className="accordion-item mb-3">
//                           <h2 className="accordion-header">
//                             <button
//                               className="accordion-button collapsed"
//                               type="button"
//                               onClick={() => toggleExpandLevel1(level1Key)}
//                               aria-expanded={expandedLevel1[level1Key] || false}
//                             >
//                               <div className="d-flex align-items-center">
//                                 <strong className="text-primary me-3">{level1Key}</strong>
//                                 <span className="badge bg-primary me-2">Total: {level1Stats.total}</span>
//                                 <span className="badge bg-danger me-2">Errors: {level1Stats.errors}</span>
//                                 <span className="badge bg-warning me-2">Deleted: {level1Stats.deleted}</span>
//                                 <span className="badge bg-info me-2">Avg Event Time: {level1Stats.avgEventTime}</span>
//                               </div>
//                             </button>
//                           </h2>
//                         {(expandedLevel1[level1Key] || false) && (
//                           <div className="accordion-collapse collapse show">
//                             <div className="accordion-body">

//                               {/* 第二層 */}
//                               <div className="accordion" id={`level2-${level1Key}`}>
//                                 {Object.entries(level2Data).map(([level2Key, records]) => {
//                                   const stats = getLevel2Stats(records);
//                                   const hasDeleted = records.some(r => r.deleted);

//                                   return (
//                                     <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
//                                       <h2 className="accordion-header">
//                                         <button
//                                           className="accordion-button collapsed d-flex justify-content-between align-items-center w-100"
//                                           type="button"
//                                           onClick={() => toggleExpandLevel2(level1Key, level2Key)}
//                                           aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
//                                         >
//                                           <div className="d-flex align-items-center">
//                                             <strong className="text-success me-3">{level2Key}</strong>
//                                             <span className="badge bg-primary me-2">Total: {stats.total}</span>
//                                             <span className="badge bg-danger me-2">Errors: {stats.errors}</span>
//                                             <span className="badge bg-warning me-2">Deleted: {stats.deleted}</span>
//                                             <span className="badge bg-info me-2">Avg Event Time: {stats.avgEventTime}</span>
//                                           </div>
//                                           <button
//                                             className={`btn btn-sm ms-2 ${hasDeleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
//                                             onClick={(e) => {
//                                               e.stopPropagation();
//                                               toggleLevel2Delete(level1Key, level2Key);
//                                             }}
//                                           >
//                                             {hasDeleted ? 'Restore All' : 'Delete All'}
//                                           </button>
//                                         </button>
//                                       </h2>
//                                       {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
//                                         <div className="accordion-collapse collapse show">
//                                           <div className="accordion-body">

//                                             {/* 第三層 - 記錄列表 */}
//                                             <div className="row mb-3">
//                                               <div className="col-12">
//                                                 <h6>Records:</h6>
//                                                 {records.map((record, index) => (
//                                                   <div key={index} className="card mb-2">
//                                                     <div className="card-body py-2">
//                                                       <div className="row align-items-center">
//                                                         <div className="col-md-8">
//                                                           <div className="d-flex align-items-center">
//                                                             <span className="me-3">
//                                                               <strong>Error Time:</strong> {record.error_time}
//                                                             </span>
//                                                             <span className="me-3">
//                                                               <strong>Event Time:</strong> {record.event_time}
//                                                             </span>
//                                                             <span className={`badge me-2 ${record.available ? 'bg-success' : 'bg-secondary'}`}>
//                                                               {record.available ? 'Available' : 'Unavailable'}
//                                                             </span>
//                                                             {record.deleted && (
//                                                               <span className="badge bg-warning">Deleted</span>
//                                                             )}
//                                                           </div>
//                                                         </div>
//                                                         <div className="col-md-4 text-end">
//                                                           <button
//                                                             className={`btn btn-sm ${record.deleted ? 'btn-outline-success' : 'btn-outline-danger'}`}
//                                                             onClick={() => toggleLevel3Delete(level1Key, level2Key, index)}
//                                                           >
//                                                             {record.deleted ? 'Restore' : 'Delete'}
//                                                           </button>
//                                                         </div>
//                                                       </div>
//                                                     </div>
//                                                   </div>
//                                                 ))}
//                                               </div>
//                                             </div>

//                                             {/* 詳細資料載入按鈕和內容 */}
//                                             <div className="border-top pt-3">
//                                               <h6>Detailed Information:</h6>
//                                               {loadingDetailed[`${level1Key}-${level2Key}`] ? (
//                                                 <div className="text-center">
//                                                   <div className="spinner-border spinner-border-sm" role="status">
//                                                     <span className="visually-hidden">Loading...</span>
//                                                   </div>
//                                                 </div>
//                                               ) : detailedData[`${level1Key}-${level2Key}`] ? (
//                                                 <div className="table-responsive">
//                                                   <table className="table table-sm">
//                                                     <thead>
//                                                       <tr>
//                                                         <th>Device</th>
//                                                         <th>Participant</th>
//                                                         <th>Trail</th>
//                                                         <th>Target</th>
//                                                         <th>Position</th>
//                                                         <th>Created At</th>
//                                                       </tr>
//                                                     </thead>
//                                                     <tbody>
//                                                       {detailedData[`${level1Key}-${level2Key}`].map((item, idx) => (
//                                                         <tr key={idx}>
//                                                           <td>{item.device}</td>
//                                                           <td>{item.participant}</td>
//                                                           <td>{item.trail}</td>
//                                                           <td>{item.target}</td>
//                                                           <td>{item.position}</td>
//                                                           <td>{new Date(item.createdAt).toLocaleString()}</td>
//                                                         </tr>
//                                                       ))}
//                                                     </tbody>
//                                                   </table>
//                                                 </div>
//                                               ) : (
//                                                 <p className="text-muted">Click expand above to load detailed information.</p>
//                                               )}
//                                             </div>

//                                           </div>
//                                         </div>
//                                       )}
//                                     </div>
//                                   );
//                                 })}
//                               </div>

//                             </div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-center p-4">
//                     <h5>No Detail Records Found</h5>
//                     <p className="text-muted">This summary has no associated detail records</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* 已刪除記錄 Modal */}
//       {showDeletedModal && (
//         <div className="modal show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">Deleted Records</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowDeletedModal(false)}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 {deletedRecords.length > 0 ? (
//                   <div>
//                     {deletedRecords.map((record, index) => (
//                       <div key={record.id || index} className="card mb-2">
//                         <div className="card-body py-2">
//                           <div className="row align-items-center">
//                             <div className="col-md-8">
//                               <div>
//                                 <strong>{record.device}</strong> - <strong>{record.participant}</strong>
//                               </div>
//                               <small className="text-muted">
//                                 Deleted at: {new Date(record.deletedAt).toLocaleString()}
//                               </small>
//                             </div>
//                             <div className="col-md-4 text-end">
//                               <button
//                                 className="btn btn-sm btn-outline-success"
//                                 onClick={() => restoreDeletedRecord(record.id)}
//                               >
//                                 Restore
//                               </button>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-center text-muted">No deleted records found.</p>
//                 )}
//               </div>
//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowDeletedModal(false)}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
import React, { useState, useEffect, useCallback } from 'react';

// 模擬 get_summary API 函數
const get_summary = async (name = '', creator = '', orderBy = 'updatedAt') => {
  // 模擬 API 延遲
  await new Promise(resolve => setTimeout(resolve, 800));

  // 模擬數據
  const mockData = [
    { id: 1, name: 'Q1 Sales Report', creator: 'John Doe', updatedAt: '2024-03-15T10:30:00Z' },
    { id: 2, name: 'Marketing Analysis', creator: 'Jane Smith', updatedAt: '2024-03-14T14:20:00Z' },
    { id: 3, name: 'Product Roadmap', creator: 'Mike Johnson', updatedAt: '2024-03-13T09:15:00Z' },
    { id: 4, name: 'Customer Feedback', creator: 'Sarah Wilson', updatedAt: '2024-03-12T16:45:00Z' },
    { id: 5, name: 'Budget Planning', creator: 'David Brown', updatedAt: '2024-03-11T11:30:00Z' },
    { id: 6, name: 'Team Performance', creator: 'Lisa Garcia', updatedAt: '2024-03-10T13:20:00Z' },
    { id: 7, name: 'Market Research', creator: 'Tom Anderson', updatedAt: '2024-03-09T08:45:00Z' },
    { id: 8, name: 'Risk Assessment', creator: 'Emma Davis', updatedAt: '2024-03-08T15:30:00Z' },
  ];

  // 模擬搜索過濾
  let filteredData = mockData.filter(item => {
    const matchName = name ? item.name.toLowerCase().includes(name.toLowerCase()) : true;
    const matchCreator = creator ? item.creator.toLowerCase().includes(creator.toLowerCase()) : true;
    return matchName && matchCreator;
  });

  // 模擬排序
  filteredData.sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === 'updatedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  });

  return {
    data: filteredData,
    total: filteredData.length
  };
};

const SummaryPage = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 搜尋和排序狀態
  const [searchName, setSearchName] = useState('');
  const [searchCreator, setSearchCreator] = useState('');
  const [orderBy, setOrderBy] = useState('updatedAt');
  const [orderDirection, setOrderDirection] = useState('desc');

  // 分頁狀態
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; // 減少每頁顯示數量以便演示

  // 載入資料的函數
  const loadSummaries = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // 調用 get_summary 函數，傳入三個參數
      const result = await get_summary(searchName, searchCreator, orderBy);

      let sortedData = [...result.data];

      // 根據排序方向調整數據
      if (orderDirection === 'desc') {
        sortedData.reverse();
      }

      // 計算分頁
      const startIndex = (currentPageNum - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedData = sortedData.slice(startIndex, endIndex);

      setSummaries(paginatedData);
      setTotalItems(sortedData.length);
    } catch (err) {
      setError('Failed to load summaries: ' + err.message);
      setSummaries([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

  // 初始載入和依賴更新時重新載入
  useEffect(() => {
    loadSummaries();
  }, [loadSummaries]);

  // 重置搜尋
  const handleReset = () => {
    setSearchName('');
    setSearchCreator('');
    setOrderBy('updatedAt');
    setOrderDirection('desc');
    setCurrentPageNum(1);
  };

  // 處理排序
  const handleSort = (field) => {
    if (orderBy === field) {
      setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setOrderBy(field);
      setOrderDirection('desc'); // 預設降序
    }
    setCurrentPageNum(1); // 重置到第一頁
  };

  // 處理分頁
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const handlePageChange = (page) => {
    setCurrentPageNum(page);
  };

  // 處理點擊項目
  const handleItemClick = (summaryId) => {
    alert(`Clicked summary ID: ${summaryId}`);
    // setSelectedSummaryId(summaryId);
    // setCurrentPage('detail');
  };

  // 渲染排序圖標
  const getSortIcon = (field) => {
    if (orderBy !== field) {
      return <span className="text-gray-400 ml-1">⇅</span>;
    }
    return orderDirection === 'asc' ?
      <span className="text-blue-600 ml-1">↑</span> :
      <span className="text-blue-600 ml-1">↓</span>;
  };

  // 格式化日期
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* 標題區域 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Summary</h1>
          <p className="text-gray-600">Search, filter and manage your data summaries</p>
        </div>

        {/* 搜尋和篩選區域 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-lg">🔍</span>
              <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search by Creator
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter creator..."
                  value={searchCreator}
                  onChange={(e) => setSearchCreator(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  onClick={handleReset}
                >
                  <span className="text-sm">🔄</span>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 載入狀態 */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading summaries...</span>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-red-800 text-lg">❌</div>
              <div className="ml-3 text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* 資料表格 */}
        {!loading && !error && (
          <>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* 表格標題和計數 */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Results ({totalItems} items)
                  </h3>
                </div>
              </div>

              {summaries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-2">
                            Name
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('creator')}
                        >
                          <div className="flex items-center gap-2">
                            Creator
                            {getSortIcon('creator')}
                          </div>
                        </th>
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('updatedAt')}
                        >
                          <div className="flex items-center gap-2">
                            Updated At
                            {getSortIcon('updatedAt')}
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {summaries.map((summary) => (
                        <tr
                          key={summary.id}
                          className="hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleItemClick(summary.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {summary.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700">
                              {summary.creator}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatDate(summary.updatedAt)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 text-4xl">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Found</h3>
                  <p className="text-gray-500">Try adjusting your search criteria</p>
                </div>
              )}
            </div>

            {/* 分頁控制 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPageNum === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(currentPageNum - 1)}
                    disabled={currentPageNum === 1}
                  >
                    Previous
                  </button>

                  {/* 頁碼按鈕 */}
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPageNum - 2 && page <= currentPageNum + 2)
                    ) {
                      return (
                        <button
                          key={page}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            currentPageNum === page
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
                      return (
                        <span key={page} className="px-3 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      currentPageNum === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handlePageChange(currentPageNum + 1)}
                    disabled={currentPageNum === totalPages}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* 返回按鈕 */}
        <div className="text-center mt-8">
          <button
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => alert('Back to Home')}
          >
            <span>🏠</span>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage;
