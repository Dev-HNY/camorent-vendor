/**
 * Production Logger
 * Replaces console statements in production builds
 * Keeps errors and warnings, removes debug logs
 */

const isDevelopment = __DEV__;

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  warn: (...args: any[]) => {
    // Always log warnings
    console.warn(...args);
  },

  error: (...args: any[]) => {
    // Always log errors
    console.error(...args);
  },

  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
};

// Global console override for production
export const disableConsoleInProduction = () => {
  if (!isDevelopment) {
    console.log = () => {};
    console.info = () => {};
    console.debug = () => {};
    // Keep console.warn and console.error
  }
};
