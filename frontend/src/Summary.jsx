import React, { useState, useEffect } from 'react';

// SummaryPage 組件
// const SummaryPage = ({ setCurrentPage, setSelectedSummaryId }) => {
//   const [summaries, setSummaries] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // 搜尋和排序狀態
//   const [searchName, setSearchName] = useState('');
//   const [searchCreator, setSearchCreator] = useState('');
//   const [orderBy, setOrderBy] = useState('name'); // name, creator, updatedAt
//   const [orderDirection, setOrderDirection] = useState('asc'); // asc, desc

//   // 分頁狀態
//   const [currentPageNum, setCurrentPageNum] = useState(1);
//   const [totalItems, setTotalItems] = useState(0);
//   const itemsPerPage = 20;

//   // 載入資料
//   const loadSummaries = async () => {
//     setLoading(true);
//     setError('');

//     try {
//       const offset = (currentPageNum - 1) * itemsPerPage;
//       const order = `${orderBy}_${orderDirection}`;

//       // 使用 mock data 進行測試
//       // const result = await window.go.main.App.get_summary(
//       //   searchName,
//       //   searchCreator,
//       //   order,
//       //   offset,
//       //   itemsPerPage
//       // );

//       // Mock data for testing
//       const result = {
//         data: [
//           {id: '111', name: '222', creator: '333', updatedAt: '2025-06-25T00:00:00Z'},
//           {id: '112', name: 'Test Data', creator: 'User A', updatedAt: '2025-06-24T10:30:00Z'},
//           {id: '113', name: 'Sample', creator: 'User B', updatedAt: '2025-06-23T15:45:00Z'}
//         ],
//         total: 3
//       };

//       setSummaries(result.data || []);
//       setTotalItems(result.total || 0);
//     } catch (err) {
//       setError('Failed to load summaries: ' + err.message);
//       setSummaries([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // 初始載入和依賴更新時重新載入
//   useEffect(() => {
//     loadSummaries();
//   }, [searchName, searchCreator, orderBy, orderDirection, currentPageNum]);

//   // 重置搜尋
//   const handleReset = () => {
//     setSearchName('');
//     setSearchCreator('');
//     setOrderBy('name');
//     setOrderDirection('asc');
//     setCurrentPageNum(1);
//   };

//   // 處理排序
//   const handleSort = (field) => {
//     if (orderBy === field) {
//       setOrderDirection(orderDirection === 'asc' ? 'desc' : 'asc');
//     } else {
//       setOrderBy(field);
//       setOrderDirection('asc');
//     }
//     setCurrentPageNum(1); // 重置到第一頁
//   };

//   // 處理分頁
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
//   const handlePageChange = (page) => {
//     setCurrentPageNum(page);
//   };

//   // 處理點擊項目
//   const handleItemClick = (summaryId) => {
//     setSelectedSummaryId(summaryId);
//     setCurrentPage('detail');
//   };

//   // 渲染排序箭頭
//   const getSortIcon = (field) => {
//     if (orderBy !== field) return '';
//     return orderDirection === 'asc' ? ' ↑' : ' ↓';
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <h2 className="mb-4">Data Summary</h2>

//           {/* 搜尋區域 */}
//           <div className="card mb-4">
//             <div className="card-header">
//               <h5 className="mb-0">Search & Filter</h5>
//             </div>
//             <div className="card-body">
//               <div className="row">
//                 <div className="col-md-4">
//                   <label className="form-label">Search by Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter name..."
//                     value={searchName}
//                     onChange={(e) => setSearchName(e.target.value)}
//                   />
//                 </div>
//                 <div className="col-md-4">
//                   <label className="form-label">Search by Creator</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     placeholder="Enter creator..."
//                     value={searchCreator}
//                     onChange={(e) => setSearchCreator(e.target.value)}
//                   />
//                 </div>
//                 <div className="col-md-4 d-flex align-items-end">
//                   <button
//                     className="btn btn-outline-secondary me-2"
//                     onClick={handleReset}
//                   >
//                     Reset
//                   </button>
//                 </div>
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

//           {/* 資料表格 */}
//           {!loading && !error && (
//             <>
//               <div className="card">
//                 <div className="card-header d-flex justify-content-between align-items-center">
//                   <h5 className="mb-0">Results ({totalItems} items)</h5>
//                 </div>
//                 <div className="card-body p-0">
//                   {summaries.length > 0 ? (
//                     <div className="table-responsive">
//                       <table className="table table-hover mb-0">
//                         <thead className="table-light">
//                           <tr>
//                             <th
//                               scope="col"
//                               style={{ cursor: 'pointer' }}
//                               onClick={() => handleSort('name')}
//                             >
//                               Name{getSortIcon('name')}
//                             </th>
//                             <th
//                               scope="col"
//                               style={{ cursor: 'pointer' }}
//                               onClick={() => handleSort('creator')}
//                             >
//                               Creator{getSortIcon('creator')}
//                             </th>
//                             <th
//                               scope="col"
//                               style={{ cursor: 'pointer' }}
//                               onClick={() => handleSort('updatedAt')}
//                             >
//                               Updated At{getSortIcon('updatedAt')}
//                             </th>
//                           </tr>
//                         </thead>
//                         <tbody>
//                           {summaries.map((summary) => (
//                             <tr
//                               key={summary.id}
//                               style={{ cursor: 'pointer' }}
//                               onClick={() => handleItemClick(summary.id)}
//                             >
//                               <td>{summary.name}</td>
//                               <td>{summary.creator}</td>
//                               <td>{new Date(summary.updatedAt).toLocaleString()}</td>
//                             </tr>
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   ) : (
//                     <div className="text-center p-4">
//                       <h5>No Data Found</h5>
//                       <p className="text-muted">Try adjusting your search criteria</p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* 分頁 */}
//               {totalPages > 1 && (
//                 <nav className="mt-4">
//                   <ul className="pagination justify-content-center">
//                     <li className={`page-item ${currentPageNum === 1 ? 'disabled' : ''}`}>
//                       <button
//                         className="page-link"
//                         onClick={() => handlePageChange(currentPageNum - 1)}
//                         disabled={currentPageNum === 1}
//                       >
//                         Previous
//                       </button>
//                     </li>

//                     {/* 頁碼按鈕 */}
//                     {[...Array(totalPages)].map((_, index) => {
//                       const page = index + 1;
//                       // 只顯示當前頁面附近的頁碼
//                       if (
//                         page === 1 ||
//                         page === totalPages ||
//                         (page >= currentPageNum - 2 && page <= currentPageNum + 2)
//                       ) {
//                         return (
//                           <li key={page} className={`page-item ${currentPageNum === page ? 'active' : ''}`}>
//                             <button
//                               className="page-link"
//                               onClick={() => handlePageChange(page)}
//                             >
//                               {page}
//                             </button>
//                           </li>
//                         );
//                       } else if (page === currentPageNum - 3 || page === currentPageNum + 3) {
//                         return (
//                           <li key={page} className="page-item disabled">
//                             <span className="page-link">...</span>
//                           </li>
//                         );
//                       }
//                       return null;
//                     })}

//                     <li className={`page-item ${currentPageNum === totalPages ? 'disabled' : ''}`}>
//                       <button
//                         className="page-link"
//                         onClick={() => handlePageChange(currentPageNum + 1)}
//                         disabled={currentPageNum === totalPages}
//                       >
//                         Next
//                       </button>
//                     </li>
//                   </ul>
//                 </nav>
//               )}
//             </>
//           )}

//           {/* 返回按鈕 */}
//           <div className="text-center mt-4">
//             <button
//               className="btn btn-secondary"
//               onClick={() => setCurrentPage('home')}
//             >
//               Back to Home
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// DetailPage 組件
// const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
//   const [details, setDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [summaryInfo, setSummaryInfo] = useState(null);

//   // 載入詳細資料
//   const loadDetails = async () => {
//     if (!selectedSummaryId) {
//       setError('No summary ID provided');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // 使用 mock data 進行測試
//       // const result = await window.go.main.App.get_detail(selectedSummaryId);

//       // Mock data for testing
//       const result = {
//         summary: {
//           id: selectedSummaryId,
//           name: 'Test Summary',
//           creator: 'Test Creator',
//           updatedAt: '2025-06-25T00:00:00Z'
//         },
//         details: [
//           {device: 'Device A', participant: 'Participant 1', trail: 1, is_error: false, is_available: true, deleted: false},
//           {device: 'Device B', participant: 'Participant 2', trail: 2, is_error: true, is_available: false, deleted: false},
//           {device: 'Device C', participant: 'Participant 3', trail: 3, is_error: false, is_available: true, deleted: true}
//         ]
//       };

//       setDetails(result.details || []);
//       setSummaryInfo(result.summary || null);
//     } catch (err) {
//       setError('Failed to load details: ' + err.message);
//       setDetails([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDetails();
//   }, [selectedSummaryId]);

//   // 統計資訊
//   const stats = {
//     total: details.length,
//     errors: details.filter(d => d.is_error).length,
//     available: details.filter(d => d.is_available).length,
//     deleted: details.filter(d => d.deleted).length
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2>Detail View</h2>
//             <div>
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

//           {/* 統計卡片 */}
//           <div className="row mb-4">
//             <div className="col-md-3">
//               <div className="card bg-primary text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.total}</h3>
//                   <p className="mb-0">Total Items</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-success text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.available}</h3>
//                   <p className="mb-0">Available</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-danger text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.errors}</h3>
//                   <p className="mb-0">Errors</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-warning text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.deleted}</h3>
//                   <p className="mb-0">Deleted</p>
//                 </div>
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

//           {/* 詳細資料表格 */}
//           {!loading && !error && (
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">Detail Records</h5>
//               </div>
//               <div className="card-body p-0">
//                 {details.length > 0 ? (
//                   <div className="table-responsive">
//                     <table className="table table-striped mb-0">
//                       <thead className="table-dark">
//                         <tr>
//                           <th scope="col">Device</th>
//                           <th scope="col">Participant</th>
//                           <th scope="col">Trail</th>
//                           <th scope="col">Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {details.map((detail, index) => (
//                           <tr key={index}>
//                             <td>{detail.device}</td>
//                             <td>{detail.participant}</td>
//                             <td>{detail.trail}</td>
//                             <td>
//                               <div>
//                                 {detail.is_error && (
//                                   <span className="badge bg-danger me-1">Error</span>
//                                 )}
//                                 {detail.is_available && (
//                                   <span className="badge bg-success me-1">Available</span>
//                                 )}
//                                 {detail.deleted && (
//                                   <span className="badge bg-warning me-1">Deleted</span>
//                                 )}
//                                 {!detail.is_error && !detail.is_available && !detail.deleted && (
//                                   <span className="badge bg-secondary">Normal</span>
//                                 )}
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
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
//     </div>
//   );
// };

// import { useState, useEffect } from 'react';

// const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
//   const [details, setDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [summaryInfo, setSummaryInfo] = useState(null);
//   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
//   const [expandedGroups, setExpandedGroups] = useState({});

//   // 載入詳細資料
//   const loadDetails = async () => {
//     if (!selectedSummaryId) {
//       setError('No summary ID provided');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Mock data 生成更完整的測試數據
//       const mockDetails = [];

//       // 4 devices, 12 participants, 32 trails per participant per device
//       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
//         for (let participantNum = 1; participantNum <= 12; participantNum++) {
//           for (let trailNum = 1; trailNum <= 32; trailNum++) {
//             mockDetails.push({
//               id: `${deviceNum}-${participantNum}-${trailNum}`,
//               device: `Device ${deviceNum}`,
//               participant: `Participant ${participantNum}`,
//               trail: trailNum,
//               is_error: Math.random() < 0.1, // 10% error rate
//               is_available: Math.random() < 0.8, // 80% available
//               deleted: Math.random() < 0.05 // 5% deleted
//             });
//           }
//         }
//       }

//       const result = {
//         summary: {
//           id: selectedSummaryId,
//           name: 'Test Summary',
//           creator: 'Test Creator',
//           updatedAt: '2025-06-25T00:00:00Z'
//         },
//         details: mockDetails
//       };

//       setDetails(result.details || []);
//       setSummaryInfo(result.summary || null);
//     } catch (err) {
//       setError('Failed to load details: ' + err.message);
//       setDetails([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDetails();
//   }, [selectedSummaryId]);

//   // 切換刪除狀態
//   const toggleDelete = (itemId) => {
//     setDetails(prevDetails =>
//       prevDetails.map(detail =>
//         detail.id === itemId
//           ? { ...detail, deleted: !detail.deleted }
//           : detail
//       )
//     );
//   };

//   // 統計資訊
//   const stats = {
//     total: details.length,
//     errors: details.filter(d => d.is_error).length,
//     available: details.filter(d => d.is_available).length,
//     deleted: details.filter(d => d.deleted).length
//   };

//   // 分組資料
//   const getGroupedData = () => {
//     const grouped = {};

//     details.forEach(detail => {
//       const primaryKey = detail[groupBy];
//       if (!grouped[primaryKey]) {
//         grouped[primaryKey] = {};
//       }

//       // 確定次級和三級分組鍵
//       let secondaryKey, tertiaryKey;
//       if (groupBy === 'device') {
//         secondaryKey = detail.participant;
//         tertiaryKey = `Trail ${detail.trail}`;
//       } else if (groupBy === 'participant') {
//         secondaryKey = detail.device;
//         tertiaryKey = `Trail ${detail.trail}`;
//       } else { // trail
//         secondaryKey = detail.device;
//         tertiaryKey = detail.participant;
//       }

//       if (!grouped[primaryKey][secondaryKey]) {
//         grouped[primaryKey][secondaryKey] = [];
//       }

//       grouped[primaryKey][secondaryKey].push({
//         ...detail,
//         displayKey: tertiaryKey
//       });
//     });

//     return grouped;
//   };

//   // 切換展開狀態
//   const toggleExpand = (groupKey) => {
//     setExpandedGroups(prev => ({
//       ...prev,
//       [groupKey]: !prev[groupKey]
//     }));
//   };

//   const groupedData = getGroupedData();

//   // 獲取狀態徽章
//   const getStatusBadges = (detail) => {
//     const badges = [];
//     if (detail.is_available) {
//       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
//     }
//     if (detail.is_error) {
//       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
//     }
//     if (detail.deleted) {
//       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
//     }
//     if (badges.length === 0) {
//       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
//     }
//     return badges;
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2>Detail View</h2>
//             <div>
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

//           {/* 統計卡片 */}
//           <div className="row mb-4">
//             <div className="col-md-3">
//               <div className="card bg-primary text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.total}</h3>
//                   <p className="mb-0">Total Items</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-success text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.available}</h3>
//                   <p className="mb-0">Available</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-danger text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.errors}</h3>
//                   <p className="mb-0">Errors</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-warning text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.deleted}</h3>
//                   <p className="mb-0">Deleted</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* 分組選項 */}
//           <div className="card mb-4">
//             <div className="card-body">
//               <h6 className="mb-3">Group By:</h6>
//               <div className="btn-group" role="group">
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'device' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => setGroupBy('device')}
//                 >
//                   Device
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'participant' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => setGroupBy('participant')}
//                 >
//                   Participant
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => setGroupBy('trail')}
//                 >
//                   Trail
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

//           {/* 分組詳細資料 */}
//           {!loading && !error && (
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">
//                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
//                 </h5>
//               </div>
//               <div className="card-body">
//                 {Object.keys(groupedData).length > 0 ? (
//                   <div className="accordion" id="detailAccordion">
//                     {Object.entries(groupedData).map(([primaryGroup, secondaryGroups]) => (
//                       <div key={primaryGroup} className="accordion-item mb-3">
//                         <h2 className="accordion-header">
//                           <button
//                             className="accordion-button"
//                             type="button"
//                             onClick={() => toggleExpand(primaryGroup)}
//                             aria-expanded={expandedGroups[primaryGroup] || false}
//                           >
//                             <strong>{primaryGroup}</strong>
//                             <span className="badge bg-secondary ms-2">
//                               {Object.values(secondaryGroups).reduce((sum, items) => sum + items.length, 0)} items
//                             </span>
//                           </button>
//                         </h2>
//                         {(expandedGroups[primaryGroup] || false) && (
//                           <div className="accordion-collapse collapse show">
//                             <div className="accordion-body">
//                               {Object.entries(secondaryGroups).map(([secondaryGroup, items]) => (
//                                 <div key={secondaryGroup} className="mb-4">
//                                   <h6 className="text-primary mb-3">
//                                     {secondaryGroup}
//                                     <span className="badge bg-info ms-2">{items.length} items</span>
//                                   </h6>
//                                   <div className="row">
//                                     {items.map((item) => (
//                                       <div key={item.id} className="col-md-6 col-lg-4 mb-3">
//                                         <div className="card h-100">
//                                           <div className="card-body">
//                                             <h6 className="card-title">{item.displayKey}</h6>
//                                             <div className="mb-2">
//                                               {getStatusBadges(item)}
//                                             </div>
//                                             <div className="d-flex justify-content-between align-items-center">
//                                               <small className="text-muted">
//                                                 ID: {item.id}
//                                               </small>
//                                               <button
//                                                 className={`btn btn-sm ${
//                                                   item.deleted
//                                                     ? 'btn-outline-success'
//                                                     : 'btn-outline-danger'
//                                                 }`}
//                                                 onClick={() => toggleDelete(item.id)}
//                                               >
//                                                 {item.deleted ? 'Restore' : 'Delete'}
//                                               </button>
//                                             </div>
//                                           </div>
//                                         </div>
//                                       </div>
//                                     ))}
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
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
//     </div>
//   );
// };

// export default DetailPage;


// import { useState, useEffect } from 'react';

// const DetailPage = ({ selectedSummaryId, setCurrentPage }) => {
//   const [details, setDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [summaryInfo, setSummaryInfo] = useState(null);
//   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
//   const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
//   const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
//   const [expandedLevel3, setExpandedLevel3] = useState({}); // 第三層展開狀態

//   // 載入詳細資料
//   const loadDetails = async () => {
//     if (!selectedSummaryId) {
//       setError('No summary ID provided');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Mock data 生成更完整的測試數據
//       const mockDetails = [];

//       // 4 devices, 12 participants, 32 trails per participant per device
//       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
//         for (let participantNum = 1; participantNum <= 12; participantNum++) {
//           for (let trailNum = 1; trailNum <= 32; trailNum++) {
//             mockDetails.push({
//               id: `${deviceNum}-${participantNum}-${trailNum}`,
//               device: `Device ${deviceNum}`,
//               participant: `Participant ${participantNum}`,
//               trail: trailNum,
//               from: `Point ${Math.floor(Math.random() * 100)}`,
//               to: `Point ${Math.floor(Math.random() * 100)}`,
//               is_error: Math.random() < 0.1, // 10% error rate
//               is_available: Math.random() < 0.8, // 80% available
//               deleted: Math.random() < 0.05 // 5% deleted
//             });
//           }
//         }
//       }

//       const result = {
//         summary: {
//           id: selectedSummaryId,
//           name: 'Test Summary',
//           creator: 'Test Creator',
//           updatedAt: '2025-06-25T00:00:00Z'
//         },
//         details: mockDetails
//       };

//       setDetails(result.details || []);
//       setSummaryInfo(result.summary || null);
//     } catch (err) {
//       setError('Failed to load details: ' + err.message);
//       setDetails([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDetails();
//   }, [selectedSummaryId]);

//   // 切換刪除狀態
//   const toggleDelete = (itemId) => {
//     setDetails(prevDetails =>
//       prevDetails.map(detail =>
//         detail.id === itemId
//           ? { ...detail, deleted: !detail.deleted }
//           : detail
//       )
//     );
//   };

//   // 統計資訊
//   const stats = {
//     total: details.length,
//     errors: details.filter(d => d.is_error).length,
//     available: details.filter(d => d.is_available).length,
//     deleted: details.filter(d => d.deleted).length
//   };

//   // 分組資料 - 三層結構
//   const getGroupedData = () => {
//     const grouped = {};

//     details.forEach(detail => {
//       let level1Key, level2Key, level3Key;

//       // 根據分組方式決定三層的鍵值
//       if (groupBy === 'device') {
//         level1Key = detail.device;
//         level2Key = detail.participant;
//         level3Key = `Trail ${detail.trail}`;
//       } else if (groupBy === 'participant') {
//         level1Key = detail.participant;
//         level2Key = detail.device;
//         level3Key = `Trail ${detail.trail}`;
//       } else { // trail
//         level1Key = `Trail ${detail.trail}`;
//         level2Key = detail.device;
//         level3Key = detail.participant;
//       }

//       // 建立三層結構
//       if (!grouped[level1Key]) {
//         grouped[level1Key] = {};
//       }
//       if (!grouped[level1Key][level2Key]) {
//         grouped[level1Key][level2Key] = {};
//       }
//       if (!grouped[level1Key][level2Key][level3Key]) {
//         grouped[level1Key][level2Key][level3Key] = [];
//       }

//       grouped[level1Key][level2Key][level3Key].push(detail);
//     });

//     return grouped;
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
//     setExpandedLevel2(prev => ({
//       ...prev,
//       [combinedKey]: !prev[combinedKey]
//     }));
//   };

//   const toggleExpandLevel3 = (level1Key, level2Key, level3Key) => {
//     const combinedKey = `${level1Key}-${level2Key}-${level3Key}`;
//     setExpandedLevel3(prev => ({
//       ...prev,
//       [combinedKey]: !prev[combinedKey]
//     }));
//   };

//   const groupedData = getGroupedData();

//   // 獲取狀態徽章
//   const getStatusBadges = (detail) => {
//     const badges = [];
//     if (detail.is_available) {
//       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
//     }
//     if (detail.is_error) {
//       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
//     }
//     if (detail.deleted) {
//       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
//     }
//     if (badges.length === 0) {
//       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
//     }
//     return badges;
//   };

//   // 計算統計數據
//   const getGroupStats = (group) => {
//     let totalItems = 0;
//     const traverse = (obj) => {
//       if (Array.isArray(obj)) {
//         totalItems += obj.length;
//       } else {
//         Object.values(obj).forEach(traverse);
//       }
//     };
//     traverse(group);
//     return totalItems;
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2>Detail View</h2>
//             <div>
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

//           {/* 統計卡片 */}
//           <div className="row mb-4">
//             <div className="col-md-3">
//               <div className="card bg-primary text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.total}</h3>
//                   <p className="mb-0">Total Items</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-success text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.available}</h3>
//                   <p className="mb-0">Available</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-danger text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.errors}</h3>
//                   <p className="mb-0">Errors</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-3">
//               <div className="card bg-warning text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.deleted}</h3>
//                   <p className="mb-0">Deleted</p>
//                 </div>
//               </div>
//             </div>
//           </div>

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
//                     setExpandedLevel3({});
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
//                     setExpandedLevel3({});
//                   }}
//                 >
//                   Participant
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => {
//                     setGroupBy('trail');
//                     setExpandedLevel1({});
//                     setExpandedLevel2({});
//                     setExpandedLevel3({});
//                   }}
//                 >
//                   Trail
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

//           {/* 三層分組詳細資料 */}
//           {!loading && !error && (
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">
//                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
//                 </h5>
//               </div>
//               <div className="card-body">
//                 {Object.keys(groupedData).length > 0 ? (
//                   <div className="accordion" id="detailAccordion">
//                     {/* 第一層 */}
//                     {Object.entries(groupedData).map(([level1Key, level2Data]) => (
//                       <div key={level1Key} className="accordion-item mb-3">
//                         <h2 className="accordion-header">
//                           <button
//                             className="accordion-button collapsed"
//                             type="button"
//                             onClick={() => toggleExpandLevel1(level1Key)}
//                             aria-expanded={expandedLevel1[level1Key] || false}
//                           >
//                             <strong className="text-primary">{level1Key}</strong>
//                             <span className="badge bg-primary ms-2">
//                               {getGroupStats(level2Data)} total items
//                             </span>
//                           </button>
//                         </h2>
//                         {(expandedLevel1[level1Key] || false) && (
//                           <div className="accordion-collapse collapse show">
//                             <div className="accordion-body">

//                               {/* 第二層 */}
//                               <div className="accordion" id={`level2-${level1Key}`}>
//                                 {Object.entries(level2Data).map(([level2Key, level3Data]) => (
//                                   <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
//                                     <h2 className="accordion-header">
//                                       <button
//                                         className="accordion-button collapsed"
//                                         type="button"
//                                         onClick={() => toggleExpandLevel2(level1Key, level2Key)}
//                                         aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
//                                       >
//                                         <strong className="text-success">{level2Key}</strong>
//                                         <span className="badge bg-success ms-2">
//                                           {getGroupStats(level3Data)} items
//                                         </span>
//                                       </button>
//                                     </h2>
//                                     {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
//                                       <div className="accordion-collapse collapse show">
//                                         <div className="accordion-body">

//                                           {/* 第三層 */}
//                                           <div className="accordion" id={`level3-${level1Key}-${level2Key}`}>
//                                             {Object.entries(level3Data).map(([level3Key, items]) => (
//                                               <div key={`${level1Key}-${level2Key}-${level3Key}`} className="accordion-item mb-2">
//                                                 <h2 className="accordion-header">
//                                                   <button
//                                                     className="accordion-button collapsed"
//                                                     type="button"
//                                                     onClick={() => toggleExpandLevel3(level1Key, level2Key, level3Key)}
//                                                     aria-expanded={expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false}
//                                                   >
//                                                     <strong className="text-info">{level3Key}</strong>
//                                                     <span className="badge bg-info ms-2">
//                                                       {items.length} records
//                                                     </span>
//                                                   </button>
//                                                 </h2>
//                                                 {(expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false) && (
//                                                   <div className="accordion-collapse collapse show">
//                                                     <div className="accordion-body">

//                                                       {/* 最內層資料 */}
//                                                       {items.map((item) => (
//                                                         <div key={item.id} className="card mb-3">
//                                                           <div className="card-body">
//                                                             <div className="row">
//                                                               <div className="col-md-8">
//                                                                 <h6 className="card-title">
//                                                                   {item.device} - {item.participant} - Trail {item.trail}
//                                                                 </h6>
//                                                                 <p className="card-text">
//                                                                   <strong>From:</strong> {item.from} <br/>
//                                                                   <strong>To:</strong> {item.to}
//                                                                 </p>
//                                                                 <div className="mb-2">
//                                                                   {getStatusBadges(item)}
//                                                                 </div>
//                                                                 <small className="text-muted">ID: {item.id}</small>
//                                                               </div>
//                                                               <div className="col-md-4 text-end">
//                                                                 <button
//                                                                   className={`btn btn-sm ${
//                                                                     item.deleted
//                                                                       ? 'btn-outline-success'
//                                                                       : 'btn-outline-danger'
//                                                                   } mb-2`}
//                                                                   onClick={() => toggleDelete(item.id)}
//                                                                 >
//                                                                   {item.deleted ? 'Restore' : 'Delete'}
//                                                                 </button>
//                                                                 <br/>
//                                                                 <button className="btn btn-sm btn-outline-info">
//                                                                   View Details
//                                                                 </button>
//                                                               </div>
//                                                             </div>
//                                                           </div>
//                                                         </div>
//                                                       ))}

//                                                     </div>
//                                                   </div>
//                                                 )}
//                                               </div>
//                                             ))}
//                                           </div>

//                                         </div>
//                                       </div>
//                                     )}
//                                   </div>
//                                 ))}
//                               </div>

//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
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
//     </div>
//   );
// };

// export default DetailPage;

// export { SummaryPage, DetailPage };

// const DetailPage = () => {
//   const [details, setDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [summaryInfo, setSummaryInfo] = useState(null);
//   const [groupBy, setGroupBy] = useState('device'); // device, participant, trail
//   const [expandedLevel1, setExpandedLevel1] = useState({}); // 第一層展開狀態
//   const [expandedLevel2, setExpandedLevel2] = useState({}); // 第二層展開狀態
//   const [expandedLevel3, setExpandedLevel3] = useState({}); // 第三層展開狀態

//   // 載入詳細資料
//   const loadDetails = async () => {
//     if (!selectedSummaryId) {
//       setError('No summary ID provided');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       // Mock data 生成更完整的測試數據
//       const mockDetails = [];

//       // 4 devices, 12 participants, 32 trails per participant per device
//       for (let deviceNum = 1; deviceNum <= 4; deviceNum++) {
//         for (let participantNum = 1; participantNum <= 12; participantNum++) {
//           for (let trailNum = 1; trailNum <= 32; trailNum++) {
//             mockDetails.push({
//               id: `${deviceNum}-${participantNum}-${trailNum}`,
//               device: `Device ${deviceNum}`,
//               participant: `Participant ${participantNum}`,
//               trail: trailNum,
//               from: `Point ${Math.floor(Math.random() * 100)}`,
//               to: `Point ${Math.floor(Math.random() * 100)}`,
//               is_error: Math.random() < 0.1, // 10% error rate
//               is_available: Math.random() < 0.8, // 80% available
//               deleted: Math.random() < 0.05, // 5% deleted
//               event_time: Math.floor(Math.random() * 1000), // 隨機事件時間
//               has_error: Math.random() < 0.15 // 15% has error
//             });
//           }
//         }
//       }

//       const result = {
//         summary: {
//           id: selectedSummaryId,
//           name: 'Test Summary',
//           creator: 'Test Creator',
//           updatedAt: '2025-06-25T00:00:00Z'
//         },
//         details: mockDetails
//       };

//       setDetails(result.details || []);
//       setSummaryInfo(result.summary || null);
//     } catch (err) {
//       setError('Failed to load details: ' + err.message);
//       setDetails([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadDetails();
//   }, [selectedSummaryId]);

//   // 切換刪除狀態
//   const toggleDelete = (itemId) => {
//     setDetails(prevDetails =>
//       prevDetails.map(detail =>
//         detail.id === itemId
//           ? { ...detail, deleted: !detail.deleted }
//           : detail
//       )
//     );
//   };

//   // 切換組級刪除狀態
//   const toggleGroupDelete = (groupItems) => {
//     const hasAnyDeleted = groupItems.some(item => item.deleted);
//     const newDeletedState = !hasAnyDeleted;

//     setDetails(prevDetails =>
//       prevDetails.map(detail => {
//         const shouldUpdate = groupItems.some(item => item.id === detail.id);
//         return shouldUpdate
//           ? { ...detail, deleted: newDeletedState }
//           : detail;
//       })
//     );
//   };

//   // 統計資訊
//   const stats = {
//     total: details.length,
//     errors: details.filter(d => d.is_error).length,
//     deleted: details.filter(d => d.deleted).length
//   };

//   // 分組資料 - 三層結構
//   const getGroupedData = () => {
//     const grouped = {};

//     details.forEach(detail => {
//       let level1Key, level2Key, level3Key;

//       // 根據分組方式決定三層的鍵值
//       if (groupBy === 'device') {
//         level1Key = detail.device;
//         level2Key = detail.participant;
//         level3Key = `Trail ${detail.trail}`;
//       } else if (groupBy === 'participant') {
//         level1Key = detail.participant;
//         level2Key = detail.device;
//         level3Key = `Trail ${detail.trail}`;
//       } else { // trail
//         level1Key = `Trail ${detail.trail}`;
//         level2Key = detail.device;
//         level3Key = detail.participant;
//       }

//       // 建立三層結構
//       if (!grouped[level1Key]) {
//         grouped[level1Key] = {};
//       }
//       if (!grouped[level1Key][level2Key]) {
//         grouped[level1Key][level2Key] = {};
//       }
//       if (!grouped[level1Key][level2Key][level3Key]) {
//         grouped[level1Key][level2Key][level3Key] = [];
//       }

//       grouped[level1Key][level2Key][level3Key].push(detail);
//     });

//     return grouped;
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
//     setExpandedLevel2(prev => ({
//       ...prev,
//       [combinedKey]: !prev[combinedKey]
//     }));
//   };

//   const toggleExpandLevel3 = (level1Key, level2Key, level3Key) => {
//     const combinedKey = `${level1Key}-${level2Key}-${level3Key}`;
//     setExpandedLevel3(prev => ({
//       ...prev,
//       [combinedKey]: !prev[combinedKey]
//     }));
//   };

//   const groupedData = getGroupedData();

//   // 獲取狀態徽章
//   const getStatusBadges = (detail) => {
//     const badges = [];
//     if (detail.is_available) {
//       badges.push(<span key="available" className="badge bg-success me-1">Available</span>);
//     }
//     if (detail.is_error) {
//       badges.push(<span key="error" className="badge bg-danger me-1">Error</span>);
//     }
//     if (detail.deleted) {
//       badges.push(<span key="deleted" className="badge bg-warning me-1">Deleted</span>);
//     }
//     if (badges.length === 0) {
//       badges.push(<span key="normal" className="badge bg-secondary">Normal</span>);
//     }
//     return badges;
//   };

//   // 計算第一、二層統計數據
//   const getLevel1Stats = (level2Data) => {
//     let errorCount = 0;
//     let eventTimeSum = 0;
//     let totalItems = 0;
//     let deletedCount = 0;

//     const traverse = (obj) => {
//       if (Array.isArray(obj)) {
//         obj.forEach(item => {
//           totalItems++;
//           if (item.is_error || item.has_error) errorCount++;
//           eventTimeSum += item.event_time || 0;
//           if (item.deleted) deletedCount++;
//         });
//       } else {
//         Object.values(obj).forEach(traverse);
//       }
//     };

//     traverse(level2Data);
//     return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
//   };

//   const getLevel2Stats = (level3Data) => {
//     let errorCount = 0;
//     let eventTimeSum = 0;
//     let totalItems = 0;
//     let deletedCount = 0;

//     const traverse = (obj) => {
//       if (Array.isArray(obj)) {
//         obj.forEach(item => {
//           totalItems++;
//           if (item.is_error || item.has_error) errorCount++;
//           eventTimeSum += item.event_time || 0;
//           if (item.deleted) deletedCount++;
//         });
//       } else {
//         Object.values(obj).forEach(traverse);
//       }
//     };

//     traverse(level3Data);
//     return { errorCount, avgEventTime: Math.round(eventTimeSum / totalItems) || 0, totalItems, deletedCount };
//   };

//   // 計算第三層統計數據
//   const getLevel3Stats = (items) => {
//     const errorCount = items.filter(item => item.is_error || item.has_error).length;
//     const deletedCount = items.filter(item => item.deleted).length;
//     const hasError = items.some(item => item.is_error || item.has_error);
//     const isAvailable = items.some(item => item.is_available);
//     const avgEventTime = Math.round(items.reduce((sum, item) => sum + (item.event_time || 0), 0) / items.length) || 0;

//     return { errorCount, deletedCount, hasError, isAvailable, avgEventTime };
//   };

//   // 獲取組級所有項目
//   const getGroupItems = (groupData) => {
//     const items = [];
//     const traverse = (obj) => {
//       if (Array.isArray(obj)) {
//         items.push(...obj);
//       } else {
//         Object.values(obj).forEach(traverse);
//       }
//     };
//     traverse(groupData);
//     return items;
//   };

//   return (
//     <div className="container mt-5">
//       <div className="row">
//         <div className="col-12">
//           <div className="d-flex justify-content-between align-items-center mb-4">
//             <h2>Detail View</h2>
//             <div>
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

//           {/* 統計卡片 - 移除 Available */}
//           <div className="row mb-4">
//             <div className="col-md-4">
//               <div className="card bg-primary text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.total}</h3>
//                   <p className="mb-0">Total Items</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="card bg-danger text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.errors}</h3>
//                   <p className="mb-0">Errors</p>
//                 </div>
//               </div>
//             </div>
//             <div className="col-md-4">
//               <div className="card bg-warning text-white">
//                 <div className="card-body text-center">
//                   <h3>{stats.deleted}</h3>
//                   <p className="mb-0">Deleted</p>
//                 </div>
//               </div>
//             </div>
//           </div>

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
//                     setExpandedLevel3({});
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
//                     setExpandedLevel3({});
//                   }}
//                 >
//                   Participant
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${groupBy === 'trail' ? 'btn-primary' : 'btn-outline-primary'}`}
//                   onClick={() => {
//                     setGroupBy('trail');
//                     setExpandedLevel1({});
//                     setExpandedLevel2({});
//                     setExpandedLevel3({});
//                   }}
//                 >
//                   Trail
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

//           {/* 三層分組詳細資料 */}
//           {!loading && !error && (
//             <div className="card">
//               <div className="card-header">
//                 <h5 className="mb-0">
//                   Detail Records (Grouped by {groupBy.charAt(0).toUpperCase() + groupBy.slice(1)})
//                 </h5>
//               </div>
//               <div className="card-body">
//                 {Object.keys(groupedData).length > 0 ? (
//                   <div className="accordion" id="detailAccordion">
//                     {/* 第一層 */}
//                     {Object.entries(groupedData).map(([level1Key, level2Data]) => {
//                       const level1Stats = getLevel1Stats(level2Data);
//                       const level1Items = getGroupItems(level2Data);

//                       return (
//                         <div key={level1Key} className="accordion-item mb-3">
//                           <h2 className="accordion-header">
//                             <button
//                               className="accordion-button collapsed d-flex justify-content-between align-items-center"
//                               type="button"
//                               onClick={() => toggleExpandLevel1(level1Key)}
//                               aria-expanded={expandedLevel1[level1Key] || false}
//                             >
//                               <div className="d-flex align-items-center">
//                                 <strong className="text-primary me-3">{level1Key}</strong>
//                                 <span className="badge bg-danger me-2">Error: {level1Stats.errorCount}</span>
//                                 <span className="badge bg-info me-2">Event Time: {level1Stats.avgEventTime}</span>
//                                 <span className="badge bg-warning me-2">Deleted: {level1Stats.deletedCount}</span>
//                               </div>
//                               <button
//                                 className={`btn btn-sm ms-2 ${level1Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   toggleGroupDelete(level1Items);
//                                 }}
//                               >
//                                 {level1Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
//                               </button>
//                             </button>
//                           </h2>
//                           {(expandedLevel1[level1Key] || false) && (
//                             <div className="accordion-collapse collapse show">
//                               <div className="accordion-body">

//                                 {/* 第二層 */}
//                                 <div className="accordion" id={`level2-${level1Key}`}>
//                                   {Object.entries(level2Data).map(([level2Key, level3Data]) => {
//                                     const level2Stats = getLevel2Stats(level3Data);
//                                     const level2Items = getGroupItems(level3Data);

//                                     return (
//                                       <div key={`${level1Key}-${level2Key}`} className="accordion-item mb-2">
//                                         <h2 className="accordion-header">
//                                           <button
//                                             className="accordion-button collapsed d-flex justify-content-between align-items-center"
//                                             type="button"
//                                             onClick={() => toggleExpandLevel2(level1Key, level2Key)}
//                                             aria-expanded={expandedLevel2[`${level1Key}-${level2Key}`] || false}
//                                           >
//                                             <div className="d-flex align-items-center">
//                                               <strong className="text-success me-3">{level2Key}</strong>
//                                               <span className="badge bg-danger me-2">Error: {level2Stats.errorCount}</span>
//                                               <span className="badge bg-info me-2">Event Time: {level2Stats.avgEventTime}</span>
//                                               <span className="badge bg-warning me-2">Deleted: {level2Stats.deletedCount}</span>
//                                             </div>
//                                             <button
//                                               className={`btn btn-sm ms-2 ${level2Items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
//                                               onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 toggleGroupDelete(level2Items);
//                                               }}
//                                             >
//                                               {level2Items.some(item => item.deleted) ? 'Recover' : 'Delete'}
//                                             </button>
//                                           </button>
//                                         </h2>
//                                         {(expandedLevel2[`${level1Key}-${level2Key}`] || false) && (
//                                           <div className="accordion-collapse collapse show">
//                                             <div className="accordion-body">

//                                               {/* 第三層 */}
//                                               <div className="accordion" id={`level3-${level1Key}-${level2Key}`}>
//                                                 {Object.entries(level3Data).map(([level3Key, items]) => {
//                                                   const level3Stats = getLevel3Stats(items);

//                                                   return (
//                                                     <div key={`${level1Key}-${level2Key}-${level3Key}`} className="accordion-item mb-2">
//                                                       <h2 className="accordion-header">
//                                                         <button
//                                                           className="accordion-button collapsed d-flex justify-content-between align-items-center"
//                                                           type="button"
//                                                           onClick={() => toggleExpandLevel3(level1Key, level2Key, level3Key)}
//                                                           aria-expanded={expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false}
//                                                         >
//                                                           <div className="d-flex align-items-center">
//                                                             <strong className="text-info me-3">{level3Key}</strong>
//                                                             <span className={`badge me-2 ${level3Stats.hasError ? 'bg-danger' : 'bg-success'}`}>
//                                                               Has Error: {level3Stats.hasError ? 'Yes' : 'No'}
//                                                             </span>
//                                                             <span className={`badge me-2 ${level3Stats.isAvailable ? 'bg-success' : 'bg-secondary'}`}>
//                                                               Available: {level3Stats.isAvailable ? 'Yes' : 'No'}
//                                                             </span>
//                                                             <span className="badge bg-info me-2">Event Time: {level3Stats.avgEventTime}</span>
//                                                             <span className="badge bg-warning me-2">Deleted: {level3Stats.deletedCount}</span>
//                                                           </div>
//                                                           <button
//                                                             className={`btn btn-sm ms-2 ${items.some(item => item.deleted) ? 'btn-outline-success' : 'btn-outline-danger'}`}
//                                                             onClick={(e) => {
//                                                               e.stopPropagation();
//                                                               toggleGroupDelete(items);
//                                                             }}
//                                                           >
//                                                             {items.some(item => item.deleted) ? 'Recover' : 'Delete'}
//                                                           </button>
//                                                         </button>
//                                                       </h2>
//                                                       {(expandedLevel3[`${level1Key}-${level2Key}-${level3Key}`] || false) && (
//                                                         <div className="accordion-collapse collapse show">
//                                                           <div className="accordion-body">

//                                                             {/* 最內層資料 - 顯示完整詳細資訊 */}
//                                                             {items.map((item) => (
//                                                               <div key={item.id} className="card mb-3">
//                                                                 <div className="card-body">
//                                                                   <div className="row">
//                                                                     <div className="col-md-9">
//                                                                       <h6 className="card-title">
//                                                                         {item.device} - {item.participant} - Trail {item.trail}
//                                                                       </h6>
//                                                                       <div className="row mb-3">
//                                                                         <div className="col-md-6">
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>From:</strong> {item.from}
//                                                                           </p>
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>To:</strong> {item.to}
//                                                                           </p>
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>ID:</strong> {item.id}
//                                                                           </p>
//                                                                         </div>
//                                                                         <div className="col-md-6">
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>Event Time:</strong> {item.event_time}
//                                                                           </p>
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>Available:</strong> {item.is_available ? 'Yes' : 'No'}
//                                                                           </p>
//                                                                           <p className="card-text mb-1">
//                                                                             <strong>Has Error:</strong> {item.has_error || item.is_error ? 'Yes' : 'No'}
//                                                                           </p>
//                                                                         </div>
//                                                                       </div>
//                                                                       <div className="mb-2">
//                                                                         {getStatusBadges(item)}
//                                                                       </div>
//                                                                     </div>
//                                                                     <div className="col-md-3 text-end">
//                                                                       <button
//                                                                         className={`btn btn-sm ${
//                                                                           item.deleted
//                                                                             ? 'btn-outline-success'
//                                                                             : 'btn-outline-danger'
//                                                                         }`}
//                                                                         onClick={() => toggleDelete(item.id)}
//                                                                       >
//                                                                         {item.deleted ? 'Recover' : 'Delete'}
//                                                                       </button>
//                                                                     </div>
//                                                                   </div>
//                                                                 </div>
//                                                               </div>
//                                                             ))}

//                                                           </div>
//                                                         </div>
//                                                       )}
//                                                     </div>
//                                                   );
//                                                 })}
//                                               </div>

//                                             </div>
//                                           </div>
//                                         )}
//                                       </div>
//                                     );
//                                   })}
//                                 </div>

//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
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
//     </div>
//   );
// };
