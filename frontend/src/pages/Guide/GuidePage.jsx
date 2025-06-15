import React, { useState } from 'react';

const GuidePage = ({ setCurrentPage }) => {
  const [activeAccordion, setActiveAccordion] = useState('sync-guide');

  const toggleAccordion = (id) => {
    setActiveAccordion(activeAccordion === id ? '' : id);
  };

  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">User Guide</h2>

          <div className="accordion" id="guideAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${activeAccordion !== 'sync-guide' ? 'collapsed' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion('sync-guide')}
                  style={{ cursor: 'pointer' }}
                >
                  How to Use Sync Function
                </button>
              </h2>
              <div
                className="accordion-collapse collapse"
                style={{
                  display: activeAccordion === 'sync-guide' ? 'block' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="accordion-body">
                  <ol>
                    <li>Click the "Sync" button on the homepage</li>
                    <li>Enter your Email and Password</li>
                    <li>Click "Login & Sync" button</li>
                    <li>Wait for sync progress to complete</li>
                    <li>Once sync is complete, you can view data in the Summary page</li>
                  </ol>
                  <div className="alert alert-info">
                    <strong>Note:</strong> The sync process may take several minutes. Please maintain a stable internet connection.
                  </div>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${activeAccordion !== 'summary-guide' ? 'collapsed' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion('summary-guide')}
                  style={{ cursor: 'pointer' }}
                >
                  How to View Data Summary
                </button>
              </h2>
              <div
                className="accordion-collapse collapse"
                style={{
                  display: activeAccordion === 'summary-guide' ? 'block' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="accordion-body">
                  <p>The Summary page displays the following information:</p>
                  <ul>
                    <li><strong>Total Items:</strong> Total number of synchronized records</li>
                    <li><strong>Category Statistics:</strong> Data distribution by categories</li>
                    <li><strong>Sync Status:</strong> Current synchronization status</li>
                    <li><strong>Last Updated:</strong> Time of last data synchronization</li>
                  </ul>
                  <div className="alert alert-warning">
                    <strong>Reminder:</strong> If no sync has been performed, the Summary page will prompt you to sync first.
                  </div>
                </div>
              </div>
            </div>

            <div className="accordion-item">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button ${activeAccordion !== 'troubleshooting' ? 'collapsed' : ''}`}
                  type="button"
                  onClick={() => toggleAccordion('troubleshooting')}
                  style={{ cursor: 'pointer' }}
                >
                  Frequently Asked Questions
                </button>
              </h2>
              <div
                className="accordion-collapse collapse"
                style={{
                  display: activeAccordion === 'troubleshooting' ? 'block' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div className="accordion-body">
                  <h6>Q: What to do if sync fails?</h6>
                  <p>A: Please check your network connection and verify your credentials, then try syncing again.</p>

                  <h6>Q: How often should I sync data?</h6>
                  <p>A: Data needs to be manually synchronized. We recommend regular syncing to ensure data is up-to-date.</p>

                  <h6>Q: Can I use the app offline?</h6>
                  <p>A: After syncing, data is stored locally and you can view summary data offline.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentPage('home')}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default GuidePage;
