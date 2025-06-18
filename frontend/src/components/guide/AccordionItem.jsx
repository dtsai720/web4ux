import React from 'react';
import { isAccordionActive } from '../../utils/guide';

/**
 * AccordionItem component for the guide page
 * @param {Object} props - Component props
 * @param {string} props.id - Unique identifier for the accordion item
 * @param {string} props.title - Title of the accordion item
 * @param {string} props.activeAccordion - Currently active accordion ID
 * @param {Function} props.toggleAccordion - Function to toggle accordion state
 * @param {React.ReactNode} props.children - Content of the accordion item
 */
const AccordionItem = ({ id, title, activeAccordion, toggleAccordion, children }) => {
  const isActive = isAccordionActive(id, activeAccordion);

  return (
    <div className="accordion-item">
      <h2 className="accordion-header">
        <button
          className={`accordion-button ${!isActive ? 'collapsed' : ''}`}
          type="button"
          onClick={() => toggleAccordion(id, activeAccordion)}
          style={{ cursor: 'pointer' }}
        >
          {title}
        </button>
      </h2>
      <div
        className="accordion-collapse collapse"
        style={{
          display: isActive ? 'block' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <div className="accordion-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AccordionItem;
