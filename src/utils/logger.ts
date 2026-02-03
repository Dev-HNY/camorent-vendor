/**
 * Logger Utility
 * Conditional logging that only outputs in development mode
 * Production-safe logging with different log levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabledInProd: boolean;
  minLevel: LogLevel;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const defaultConfig: LoggerConfig = {
  enabledInProd: false,
  minLevel: 'debug',
};

let config: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger
 */
export const configureLogger = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
};

/**
 * Check if logging is enabled
 */
const shouldLog = (level: LogLevel): boolean => {
  // Always log errors
  if (level === 'error') return true;

  // In production, only log if explicitly enabled
  if (!__DEV__ && !config.enabledInProd) return false;

  // Check log level
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
};

/**
 * Format log message with timestamp and level
 */
const formatMessage = (level: LogLevel, tag: string, message: string): string => {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level.toUpperCase()}] [${tag}] ${message}`;
};

/**
 * Logger object with methods for each log level
 */
export const logger = {
  /**
   * Debug level - detailed information for debugging
   */
  debug: (tag: string, message: string, ...args: any[]): void => {
    if (shouldLog('debug')) {
      console.log(formatMessage('debug', tag, message), ...args);
    }
  },

  /**
   * Info level - general information
   */
  info: (tag: string, message: string, ...args: any[]): void => {
    if (shouldLog('info')) {
      console.log(formatMessage('info', tag, message), ...args);
    }
  },

  /**
   * Warn level - warning messages
   */
  warn: (tag: string, message: string, ...args: any[]): void => {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', tag, message), ...args);
    }
  },

  /**
   * Error level - error messages (always logged)
   */
  error: (tag: string, message: string, ...args: any[]): void => {
    if (shouldLog('error')) {
      console.error(formatMessage('error', tag, message), ...args);
    }
  },

  /**
   * API logging - for network requests
   */
  api: (method: string, url: string, data?: any): void => {
    if (shouldLog('debug')) {
      console.log(`[API] ${method} ${url}`, data ? { data } : '');
    }
  },

  /**
   * Performance logging - for timing operations
   */
  perf: (tag: string, operationName: string, durationMs: number): void => {
    if (shouldLog('debug')) {
      console.log(`[PERF] [${tag}] ${operationName}: ${durationMs.toFixed(2)}ms`);
    }
  },

  /**
   * Create a scoped logger for a specific module
   */
  scope: (tag: string) => ({
    debug: (message: string, ...args: any[]) => logger.debug(tag, message, ...args),
    info: (message: string, ...args: any[]) => logger.info(tag, message, ...args),
    warn: (message: string, ...args: any[]) => logger.warn(tag, message, ...args),
    error: (message: string, ...args: any[]) => logger.error(tag, message, ...args),
  }),
};

/**
 * Performance timer utility
 */
export const createTimer = (tag: string) => {
  const startTime = performance.now();

  return {
    end: (operationName: string): number => {
      const duration = performance.now() - startTime;
      logger.perf(tag, operationName, duration);
      return duration;
    },
  };
};

export default logger;
