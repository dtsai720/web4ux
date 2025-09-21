// Production-safe logging utility
// In development, logs to console. In production, can be configured to send to logging service.
/* eslint-disable no-console */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  error: (message, ...args) => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
    // In production, could send to error reporting service
    // sendToErrorService(message, args);
  },

  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },

  info: (message, ...args) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },

  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};

// For cases where we need to handle errors without logging
export const handleError = (error, fallbackMessage = 'An error occurred') => {
  if (isDevelopment) {
    console.error(fallbackMessage, error);
  }
  // Return a user-friendly error object
  return {
    message: fallbackMessage,
    error: isDevelopment ? error : null
  };
};
