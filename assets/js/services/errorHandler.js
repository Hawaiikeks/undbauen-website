/* Error Handler: Centralized error handling service */

/**
 * Error categories
 */
export const ErrorCategory = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  NOT_FOUND: 'not_found',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * Error Handler Service
 */
class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.sentryEnabled = false;
  }

  /**
   * Handle error
   * @param {Error|string|Object} error - Error object, string, or error info
   * @param {Object} context - Additional context
   * @returns {Object} Error info with user-friendly message
   */
  handle(error, context = {}) {
    const errorInfo = this.categorizeError(error, context);
    const userMessage = this.getUserMessage(errorInfo);
    
    // Log error
    this.logError(errorInfo, context);
    
    // Show user-friendly message
    this.showUserMessage(userMessage, errorInfo);
    
    return {
      category: errorInfo.category,
      message: userMessage,
      originalError: errorInfo.originalError,
      retryable: errorInfo.retryable,
      context
    };
  }

  /**
   * Categorize error
   * @param {Error|string|Object} error
   * @param {Object} context
   * @returns {Object} Error info
   */
  categorizeError(error, context) {
    let originalError = error;
    let message = '';
    let category = ErrorCategory.UNKNOWN;
    let retryable = false;

    // Handle different error types
    if (error instanceof Error) {
      message = error.message;
      originalError = error;
      
      // Network errors
      if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
        category = ErrorCategory.NETWORK;
        retryable = true;
      }
      // Permission errors
      else if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
        category = ErrorCategory.PERMISSION;
      }
      // Not found errors
      else if (message.includes('not found') || message.includes('404')) {
        category = ErrorCategory.NOT_FOUND;
      }
      // Server errors
      else if (message.includes('500') || message.includes('server error')) {
        category = ErrorCategory.SERVER;
        retryable = true;
      }
    } else if (typeof error === 'string') {
      message = error;
      // Check for validation errors
      if (message.includes('erforderlich') || message.includes('ungültig') || message.includes('fehlt')) {
        category = ErrorCategory.VALIDATION;
      }
    } else if (error && typeof error === 'object') {
      message = error.message || error.error || 'Unbekannter Fehler';
      category = error.category || ErrorCategory.UNKNOWN;
      retryable = error.retryable || false;
      originalError = error.originalError || error;
    }

    return {
      category,
      message,
      originalError,
      retryable,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get user-friendly error message
   * @param {Object} errorInfo
   * @returns {string} User-friendly message
   */
  getUserMessage(errorInfo) {
    const { category, message } = errorInfo;

    const messages = {
      [ErrorCategory.NETWORK]: 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
      [ErrorCategory.VALIDATION]: message || 'Ungültige Eingabe. Bitte überprüfen Sie Ihre Eingaben.',
      [ErrorCategory.PERMISSION]: 'Sie haben keine Berechtigung für diese Aktion.',
      [ErrorCategory.NOT_FOUND]: 'Die angeforderte Ressource wurde nicht gefunden.',
      [ErrorCategory.SERVER]: 'Serverfehler. Bitte versuchen Sie es später erneut.',
      [ErrorCategory.UNKNOWN]: message || 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.'
    };

    return messages[category] || messages[ErrorCategory.UNKNOWN];
  }

  /**
   * Log error
   * @param {Object} errorInfo
   * @param {Object} context
   */
  logError(errorInfo, context) {
    const logEntry = {
      ...errorInfo,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Add to log
    this.errorLog.push(logEntry);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console log (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.error('Error:', logEntry);
    }

    // Optional: Send to error tracking service (Sentry, Rollbar, etc.)
    if (this.sentryEnabled && window.Sentry) {
      window.Sentry.captureException(errorInfo.originalError, {
        tags: { category: errorInfo.category },
        extra: context
      });
    }
  }

  /**
   * Show user message
   * @param {string} message
   * @param {Object} errorInfo
   */
  showUserMessage(message, errorInfo) {
    // Import toast dynamically
    import('./../components/toast.js').then(({ toast }) => {
      toast.error(message);
    }).catch(() => {
      // Fallback if toast not available
      console.error('Error:', message);
    });
  }

  /**
   * Wrap async function with error handling
   * @param {Function} fn - Async function
   * @param {Object} context - Context for error handling
   * @returns {Function} Wrapped function
   */
  wrapAsync(fn, context = {}) {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        return this.handle(error, { ...context, function: fn.name, args });
      }
    };
  }

  /**
   * Wrap sync function with error handling
   * @param {Function} fn - Sync function
   * @param {Object} context - Context for error handling
   * @returns {Function} Wrapped function
   */
  wrapSync(fn, context = {}) {
    return (...args) => {
      try {
        return fn(...args);
      } catch (error) {
        this.handle(error, { ...context, function: fn.name, args });
        return null;
      }
    };
  }

  /**
   * Get error log
   * @returns {Array} Error log
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
export const errorHandler = new ErrorHandler();

// Export convenience functions
export const handleError = (error, context) => errorHandler.handle(error, context);
export const wrapAsync = (fn, context) => errorHandler.wrapAsync(fn, context);
export const wrapSync = (fn, context) => errorHandler.wrapSync(fn, context);









