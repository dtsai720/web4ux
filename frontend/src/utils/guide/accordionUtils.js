/**
 * Toggle accordion state
 * @param {string} id - The ID of the accordion to toggle
 * @param {string} activeAccordion - The currently active accordion ID
 * @param {Function} setActiveAccordion - State setter function for the active accordion
 */
export const toggleAccordion = (id, activeAccordion, setActiveAccordion) => {
  setActiveAccordion(activeAccordion === id ? '' : id);
};

/**
 * Check if an accordion is active
 * @param {string} id - The ID of the accordion to check
 * @param {string} activeAccordion - The currently active accordion ID
 * @returns {boolean} - Whether the accordion is active
 */
export const isAccordionActive = (id, activeAccordion) => {
  return activeAccordion === id;
};
