import React from 'react';
import { GuideAccordion, BackToHomeButton } from '../../components/guide';

/**
 * GuidePage component that displays user guide information
 * @param {Object} props - Component props
 * @param {Function} props.navigate - Function to navigate to a different page
 */
const GuidePage = ({ navigate }) => {
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">User Guide</h2>
          <GuideAccordion />
        </div>
      </div>
      <BackToHomeButton navigate={navigate} />
    </div>
  );
};

export default GuidePage;
