import React from 'react';
import { GuideAccordion, BackToHomeButton } from '../../components/guide';

/**
 * GuidePage component that displays user guide information
 * @param {Object} props - Component props
 * @param {Function} props.setCurrentPage - Function to set the current page
 */
const GuidePage = ({ setCurrentPage }) => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">User Guide</h2>
          <GuideAccordion />
        </div>
      </div>
      <BackToHomeButton setCurrentPage={setCurrentPage} />
    </div>
  );
};

export default GuidePage;
