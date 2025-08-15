import React, { useState } from 'react';
import AccordionItem from './AccordionItem';
import { toggleAccordion } from '../../utils/guide';

/**
 * GuideAccordion component that contains all guide accordion items
 */
const GuideAccordion = () => {
  const [activeAccordion, setActiveAccordion] = useState('app-workflow');

  const handleToggleAccordion = (id, currentActive) => {
    toggleAccordion(id, currentActive, setActiveAccordion);
  };

  return (
    <div className="accordion" id="guideAccordion">
      <AccordionItem
        id="app-workflow"
        title="App Workflow Overview"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>Follow these steps to effectively use the application:</p>
        <ol>
          <li><strong>Sync Data:</strong> First, synchronize your data from the server</li>
          <li><strong>View Summary:</strong> Check the summary page for an overview of your data</li>
          <li><strong>Detail Records:</strong> Explore detailed records for specific information</li>
          <li><strong>Outlier Management:</strong> Identify and manage outliers in your data</li>
        </ol>
        <div className="alert alert-primary">
          <strong>Important:</strong> Always start with the Sync process to ensure you have the latest data.
        </div>
      </AccordionItem>

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
        <p>After syncing, access the Summary page to view an overview of your data:</p>
        <ol>
          <li>Click on "Summary" from the homepage or navigation menu</li>
          <li>Use the search and filter options to find specific projects</li>
          <li>Click on any project to view its detailed information</li>
        </ol>
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
        id="detail-record-guide"
        title="Using Detail Records"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>Detail Records provide comprehensive information about specific data points:</p>
        <ol>
          <li>Access Detail Records from the Summary page by clicking on a specific project</li>
          <li>Use the navigation buttons to move between different sections</li>
          <li>Toggle between different view modes using the mode selection buttons</li>
          <li>Use the Group By selector to organize data in different ways</li>
        </ol>
        <p>The Detail Record view includes:</p>
        <ul>
          <li><strong>Project Information:</strong> Overview of the selected project</li>
          <li><strong>Participant Data:</strong> Information about participants in the project</li>
          <li><strong>Trial Information:</strong> Detailed data about individual trials</li>
          <li><strong>Statistical Metrics:</strong> Various statistical measurements of the data</li>
        </ul>
        <div className="alert alert-info">
          <strong>Trail Availability Status:</strong>
          <ul className="mb-0 mt-2">
            <li><strong>Available (Green):</strong> Trail has both start and target marks, with start occurring before target.</li>
            <li><strong>Calculable (Blue):</strong> Trail has target as the last timestamp and start occurs before target, but may have other format concerns. Despite these concerns, these trails are still calculable and included in calculations.</li>
            <li><strong>Unavailable (Yellow):</strong> Trail is missing start or target marks, or has other critical issues that prevent calculation.</li>
          </ul>
        </div>
        <div className="alert alert-info">
          <strong>Tip:</strong> Use the accordion interface to expand and collapse sections for better readability.
        </div>
      </AccordionItem>


      <AccordionItem
        id="outlier-guide"
        title="Understanding Outliers"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>The Outlier Analysis helps identify and manage data points that deviate significantly from the norm:</p>
        <ol>
          <li>Access the Outlier tab from the Detail page</li>
          <li>Review the Outlier Device Cards showing statistical anomalies</li>
          <li>Examine the Outlier Participant and Trail Tables for detailed information</li>
          <li>Use the navigation options to explore different outlier categories</li>
        </ol>
        <p>Important outlier management features:</p>
        <ul>
          <li><strong>Outlier Detection:</strong> Automatic identification of statistical outliers</li>
          <li><strong>Detailed Analysis:</strong> In-depth information about each outlier</li>
          <li><strong>Data Management:</strong> Options to handle outliers appropriately</li>
          <li><strong>Delete Function:</strong> Remove outliers from your dataset (only available in the Outlier page)</li>
        </ul>
        <div className="alert alert-info">
          <strong>Definition:</strong> In this application, outliers are defined as data points that are more than 2 standard deviations from the mean. This statistical threshold helps identify values that significantly deviate from normal patterns.
        </div>
        <div className="alert alert-info">
          <strong>Data Inclusion:</strong> Outlier calculations include data that is either fully available or calculable (but not fully available), and not deleted, ensuring accurate anomaly detection based on your current dataset.
        </div>
        <div className="alert alert-info">
          <strong>Trail Availability Status:</strong>
          <ul className="mb-0 mt-2">
            <li><strong>Available (Green):</strong> Trail has both start and target marks, with start occurring before target.</li>
            <li><strong>Calculable (Blue):</strong> Trail has target as the last timestamp and start occurs before target, but may have other format concerns. Despite these concerns, these trails are still calculable and included in calculations.</li>
            <li><strong>Unavailable (Yellow):</strong> Trail is missing start or target marks, or has other critical issues that prevent calculation.</li>
          </ul>
        </div>
        <div className="alert alert-warning">
          <strong>Important:</strong> Deletion of data is only available in the Outlier page to prevent accidental data loss.
        </div>
      </AccordionItem>

      <AccordionItem
        id="data-management-guide"
        title="Managing Data (Delete & Restore)"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>Properly manage your data with delete and restore functions:</p>
        <h6>Deleting Data:</h6>
        <ol>
          <li>Navigate to the Outlier page where deletion is enabled</li>
          <li>Select the outlier data points you wish to remove</li>
          <li>Click the Delete button to remove the selected data</li>
          <li>Confirm the deletion when prompted</li>
        </ol>
        <h6>Restoring Deleted Data:</h6>
        <ol>
          <li>Access the Deleted Items section from the navigation menu</li>
          <li>Browse through the list of deleted items</li>
          <li>Select the items you wish to restore</li>
          <li>Click the Restore button to recover the selected data</li>
        </ol>
        <div className="alert alert-danger">
          <strong>Caution:</strong> Deletion operations should be performed carefully as they affect your dataset integrity.
        </div>
        <div className="alert alert-info">
          <strong>Note:</strong> The restore function allows you to recover accidentally deleted data, providing a safety net for your operations.
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

        <h6>Q: Why can I only delete data from the Outlier page?</h6>
        <p>A: This is a safety feature to prevent accidental deletion of important data. Outliers are the most common data points that need removal.</p>

        <h6>Q: How do I know if my data has outliers?</h6>
        <p>A: The Outlier Analysis automatically identifies statistical outliers in your dataset and highlights them for your review.</p>
      </AccordionItem>
    </div>
  );
};

export default GuideAccordion;
