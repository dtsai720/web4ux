import React, { useState } from 'react';
import AccordionItem from './AccordionItem';
import { toggleAccordion } from '../../utils/guide';

/**
 * GuideAccordion component that contains all guide accordion items
 */
const GuideAccordion = () => {
  const [activeAccordion, setActiveAccordion] = useState('sync-guide');

  const handleToggleAccordion = (id, currentActive) => {
    toggleAccordion(id, currentActive, setActiveAccordion);
  };

  return (
    <div className="accordion" id="guideAccordion">
      <AccordionItem
        id="sync-guide"
        title="How to Use Sync Function"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
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
      </AccordionItem>

      <AccordionItem
        id="summary-guide"
        title="How to View Data Summary"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
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
      </AccordionItem>

      <AccordionItem
        id="troubleshooting"
        title="Frequently Asked Questions"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <h6>Q: What to do if sync fails?</h6>
        <p>A: Please check your network connection and verify your credentials, then try syncing again.</p>

        <h6>Q: How often should I sync data?</h6>
        <p>A: Data needs to be manually synchronized. We recommend regular syncing to ensure data is up-to-date.</p>

        <h6>Q: Can I use the app offline?</h6>
        <p>A: After syncing, data is stored locally and you can view summary data offline.</p>
      </AccordionItem>
    </div>
  );
};

export default GuideAccordion;
