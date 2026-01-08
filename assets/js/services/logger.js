/* Logger: Centralized logging service with production support */

/**
 * Log levels
 */
export const LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  NONE: 'none'
};

/**
 * Logger Service
 * Provides centralized logging with level-based filtering
 */
class Logger {
  constructor() {
    // Determine log level based on environment
    const isDev = window.location.hostname === 'localhost' || 
                  window.location.hostname === '127.0.0.1' ||
                  new URLSearchParams(window.location.search).has('dev');
    
    this.level = isDev ? LogLevel.DEBUG : LogLevel.ERROR;
    this.enabled = true;
    this.errorLog = [];
    this.maxErrorLogSize = 50;
    
    // Optional: Sentry integration
    this.sentryEnabled = false;
  }

  /**
   * Set log level
   * @param {string} level - Log level
   */
  setLevel(level) {
    if (Object.values(LogLevel).includes(level)) {
      this.level = level;
    }
  }

  /**
   * Enable/disable logging
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Check if level should be logged
   * @param {string} level
   * @returns {boolean}
   */
  shouldLog(level) {
    if (!this.enabled) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(this.level);
    const messageIndex = levels.indexOf(level);
    
    return messageIndex >= currentIndex;
  }

  /**
   * Debug log
   * @param {...any} args
   */
  debug(...args) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug('[DEBUG]', ...args);
    }
  }

  /**
   * Info log
   * @param {...any} args
   */
  info(...args) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warn log
   * @param {...any} args
   */
  warn(...args) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error log
   * @param {...any} args
   */
  error(...args) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error('[ERROR]', ...args);
      
      // Add to error log
      this.errorLog.push({
        message: args.join(' '),
        timestamp: new Date().toISOString(),
        stack: new Error().stack
      });
      
      if (this.errorLog.length > this.maxErrorLogSize) {
        this.errorLog.shift();
      }
      
      // Optional: Send to Sentry
      if (this.sentryEnabled && window.Sentry) {
        window.Sentry.captureException(new Error(args.join(' ')), {
          extra: { args }
        });
      }
    }
  }

  /**
   * Group logs
   * @param {string} label
   * @param {Function} callback
   */
  group(label, callback) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.group(label);
      if (typeof callback === 'function') {
        callback();
      }
      console.groupEnd();
    }
  }

  /**
   * Table log
   * @param {any} data
   */
  table(data) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.table(data);
    }
  }

  /**
   * Time measurement
   * @param {string} label
   */
  time(label) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }

  /**
   * End time measurement
   * @param {string} label
   */
  timeEnd(label) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }

  /**
   * Get error log
   * @returns {Array}
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Enable Sentry integration
   * @param {string} dsn - Sentry DSN
   */
  enableSentry(dsn) {
    this.sentryEnabled = true;
    // Sentry would be initialized separately
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (...args) => logger.debug(...args),
  info: (...args) => logger.info(...args),
  warn: (...args) => logger.warn(...args),
  error: (...args) => logger.error(...args),
  group: (label, callback) => logger.group(label, callback),
  table: (data) => logger.table(data),
  time: (label) => logger.time(label),
  timeEnd: (label) => logger.timeEnd(label)
};









