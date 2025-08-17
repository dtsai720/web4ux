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
        <p>Follow these steps to effectively use UX Analytics Studio:</p>
        <ol>
          <li><strong>Sync Data:</strong> First, synchronize your UX test data from the server</li>
          <li><strong>Browse Projects:</strong> Use the Projects Dashboard to view and manage your test projects</li>
          <li><strong>Analyze Data:</strong> Access Project Analysis with multiple analysis modes (color-coded for easy identification)</li>
          <li><strong>Navigate Efficiently:</strong> Use double-click navigation and color-coded modes for seamless workflow</li>
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
          <li>Click the "Sync" button from the UX Analytics Studio homepage</li>
          <li>Enter your Email and Password</li>
          <li>Click "Login & Sync" button</li>
          <li>Wait for sync progress to complete</li>
          <li>Once sync is complete, you can view projects in the Projects Dashboard</li>
        </ol>
        <div className="alert alert-info">
          <strong>Note:</strong> The sync process may take several minutes. Please maintain a stable internet connection.
        </div>
      </AccordionItem>

      <AccordionItem
        id="summary-guide"
        title="How to Use Projects Dashboard"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>After syncing, access the Projects Dashboard to manage your UX test projects:</p>
        <ol>
          <li>Click on "Projects" from the homepage</li>
          <li>Use the search and filter options to find specific projects</li>
          <li>Click on any project to enter Project Analysis mode</li>
        </ol>
        <p>The Projects Dashboard displays:</p>
        <ul>
          <li><strong>Project List:</strong> All available UX test projects with metadata</li>
          <li><strong>Search & Filter:</strong> Tools to quickly locate specific projects</li>
          <li><strong>Project Details:</strong> Name, creator, and last updated information</li>
          <li><strong>Quick Access:</strong> Direct navigation to project analysis</li>
        </ul>
        <div className="alert alert-warning">
          <strong>Reminder:</strong> If no sync has been performed, the Projects Dashboard will prompt you to sync first.
        </div>
      </AccordionItem>

      <AccordionItem
        id="analysis-tools-guide"
        title="Using Analysis Tools"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>Project Analysis provides comprehensive tools for analyzing UX/UI testing data with color-coded modes:</p>
        <ol>
          <li>Access analysis from the Projects Dashboard by clicking on a specific project</li>
          <li>Use the color-coded mode selection buttons to switch between analysis types</li>
          <li>Double-click headers to quickly return to previous views</li>
        </ol>
        <p>Available analysis modes (color-coded):</p>
        <ul>
          <li><strong>🔵 Outlier Analysis (Dark Blue):</strong> Identify statistical outliers in movement data (Default mode)</li>
          <li><strong>🟢 Movement Time Matrix (Green):</strong> Analyze movement patterns and timing data</li>
          <li><strong>🟠 Error Trail Analysis (Orange):</strong> Examine trails with errors or extra clicks</li>
          <li><strong>🔴 Deleted Items (Red):</strong> Manage deleted participants and restore data</li>
        </ul>
        <div className="alert alert-success">
          <strong>Note:</strong> The application automatically opens in Outlier Analysis mode when entering a project for efficient data analysis.
        </div>
      </AccordionItem>


      <AccordionItem
        id="outlier-guide"
        title="Understanding Outliers"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>The 🔵 <strong>Outlier Analysis (Dark Blue Mode)</strong> helps identify participants whose performance deviates significantly from normal patterns:</p>
        <ol>
          <li>Access from Project Analysis - automatically opens in this mode</li>
          <li>Choose between "Device Overview" and "Device Analysis" views</li>
          <li>Review outlier statistics and participant data</li>
          <li>Use double-click navigation to drill down into specific data</li>
          <li>Manage outliers through delete/restore functions</li>
        </ol>
        <p><strong>Outlier Detection Algorithm:</strong></p>
        <ul>
          <li><strong>Statistical Threshold:</strong> Data points exceeding mean + 2 standard deviations</li>
          <li><strong>Error Count Analysis:</strong> Participants with significantly more errors than average</li>
          <li><strong>Extra Clicks Analysis:</strong> Participants with exceptionally high extra click counts</li>
          <li><strong>Double-Click Detection:</strong> Automatic identification using 'start-else' markers in trail data</li>
        </ul>
        <p><strong>Analysis Features:</strong></p>
        <ul>
          <li><strong>Device vs Difficulty Matrix:</strong> Visual comparison across devices and difficulty levels</li>
          <li><strong>Participant Ranking:</strong> Sorted lists showing outlier participants</li>
          <li><strong>Trail-Level Details:</strong> Individual trail analysis with error patterns</li>
          <li><strong>Delete Function:</strong> Remove outliers from dataset (only available in Outlier Analysis)</li>
        </ul>
        <div className="alert alert-primary">
          <strong>Outlier Definition:</strong> Participants whose error count or error time exceeds mean + 2 standard deviations are automatically flagged as outliers.
        </div>
        <div className="alert alert-info">
          <strong>Data Inclusion:</strong> Calculations include both available and calculable trails that are not deleted, ensuring comprehensive analysis.
        </div>
        <div className="alert alert-danger">
          <strong>Data Safety:</strong> Deletion is only available in 🔵 Outlier Analysis mode to prevent accidental data loss.
        </div>
      </AccordionItem>

      <AccordionItem
        id="data-management-guide"
        title="Managing Data (Delete & Restore)"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <p>Efficiently manage your UX test data with comprehensive delete and restore functions:</p>
        <h6>🔵 Deleting Data (Outlier Analysis):</h6>
        <ol>
          <li>Navigate to 🔵 Outlier Analysis mode (dark blue header)</li>
          <li>Review outlier participants and trails identified by the system</li>
          <li>Click delete buttons next to specific participants or trails</li>
          <li>Confirm deletion when prompted - data is soft-deleted, not permanently removed</li>
        </ol>
        <h6>🔴 Restoring Deleted Data:</h6>
        <ol>
          <li>Click 🔴 "Deleted Items" button to access restoration interface</li>
          <li>Browse deleted participants with trail counts and record details</li>
          <li>Click "Restore" buttons to recover specific participants</li>
          <li>Data immediately returns to active dataset for analysis</li>
        </ol>
        <h6>📝 Double-Click Navigation:</h6>
        <ol>
          <li>Double-click any analysis mode header to return to previous view</li>
          <li>Double-click works in all color-coded modes for quick navigation</li>
          <li>Provides fast workflow for exploring data at different levels</li>
        </ol>
        <div className="alert alert-info">
          <strong>Double-Click Detection:</strong> The system identifies double-clicks through 'start-else' markers in the raw trail data, which indicate unintended repeated user inputs during testing.
        </div>
        <div className="alert alert-warning">
          <strong>Data Safety:</strong> All deletions are soft-deletes. Data remains in the system and can be restored at any time through the 🔴 Deleted Items interface.
        </div>
      </AccordionItem>

      <AccordionItem
        id="mode-instructions"
        title="Complete Mode Usage Guide"
        activeAccordion={activeAccordion}
        toggleAccordion={handleToggleAccordion}
      >
        <h6>🔵 Outlier Analysis (Dark Blue Mode) - Default:</h6>
        <ul>
          <li><strong>Purpose:</strong> Identify participants with statistical anomalies in performance</li>
          <li><strong>Views:</strong> Switch between "Device Overview" (all devices) and "Device Analysis" (single device)</li>
          <li><strong>Navigation:</strong> Click participants to drill down to trail-level details</li>
          <li><strong>Features:</strong> Delete outliers, view error patterns, double-click detection</li>
        </ul>

        <h6>🟢 Movement Time Matrix (Green Mode):</h6>
        <ul>
          <li><strong>Purpose:</strong> Analyze movement patterns and timing relationships based on Fitts's Law</li>
          <li><strong>Views:</strong> Matrix visualization showing movement correlations across difficulty levels</li>
          <li><strong>Device Selection:</strong> Choose specific devices for focused analysis</li>
          <li><strong>Features:</strong> Time-based analysis, pattern recognition, difficulty comparison</li>
          <li><strong>ID Values:</strong> "ID" refers to Index of Difficulty from Fitts's Law (calculated as log₂(distance/width + 1))</li>
        </ul>

        <h6>🟠 Error Trail Analysis (Orange Mode):</h6>
        <ul>
          <li><strong>Purpose:</strong> Examine trails containing errors or anomalous behaviors</li>
          <li><strong>Focus:</strong> Detailed error pattern analysis and extra clicks</li>
          <li><strong>Data:</strong> Shows error sequences, timing, and user behavior patterns</li>
          <li><strong>Features:</strong> Error classification, behavior analysis</li>
        </ul>

        <h6>🔴 Deleted Items (Red Mode):</h6>
        <ul>
          <li><strong>Purpose:</strong> Manage and restore soft-deleted data</li>
          <li><strong>Safety Net:</strong> View all deleted participants with restoration options</li>
          <li><strong>Details:</strong> See deletion impact (trail counts, record counts)</li>
          <li><strong>Features:</strong> One-click restoration, data integrity protection</li>
        </ul>

        <div className="alert alert-success">
          <strong>Pro Tip:</strong> Use the color-coded system to quickly identify your current analysis mode. Each mode has distinct capabilities optimized for different aspects of UX analysis.
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

        <h6>Q: Why can I only delete data from the 🔵 Outlier Analysis mode?</h6>
        <p>A: This is a safety feature to prevent accidental deletion. Outlier Analysis identifies the most statistically relevant candidates for removal.</p>

        <h6>Q: How does the system detect double-clicks?</h6>
        <p>A: The system identifies double-clicks by detecting 'start-else' markers in the raw trail data, indicating unintended user input events.</p>

        <h6>Q: What do the different colors mean?</h6>
        <p>A: 🔵 Dark Blue = Outlier Analysis, 🟢 Green = Movement Time Matrix, 🟠 Orange = Error Trail Analysis, 🔴 Red = Deleted Items. Each color represents a different analysis mode.</p>

        <h6>Q: What does "ID" mean in the difficulty analysis?</h6>
        <p>A: "ID" stands for Index of Difficulty from Fitts's Law, calculated as log₂(distance/width + 1). It measures how difficult a target is to select based on its size and distance. Higher ID values indicate more difficult targets.</p>

        <h6>Q: How do I quickly navigate between different data levels?</h6>
        <p>A: Use double-click on any mode header to return to the previous view, or use the close buttons to exit analysis modes.</p>
      </AccordionItem>
    </div>
  );
};

export default GuideAccordion;
