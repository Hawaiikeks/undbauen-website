/* Error Boundary: Global error handler for unexpected errors */

import { errorHandler, ErrorCategory } from '../services/errorHandler.js';
import { renderErrorState } from './emptyStates.js';

/**
 * Error Boundary Component
 * Catches and handles unexpected errors globally
 */
export class ErrorBoundary {
  constructor(container, fallbackContainer = null) {
    this.container = container;
    this.fallbackContainer = fallbackContainer || container;
    this.error = null;
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  setupGlobalHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      event.preventDefault();
      this.handleError(event.reason, {
        type: 'unhandledrejection',
        preventDefault: true
      });
    });

    // Handle global errors
    window.addEventListener('error', (event) => {
      event.preventDefault();
      this.handleError(event.error || event.message, {
        type: 'global',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
  }

  /**
   * Handle error
   * @param {Error|string} error
   * @param {Object} context
   */
  handleError(error, context = {}) {
    this.error = error;
    
    // Use error handler service
    const errorInfo = errorHandler.handle(error, {
      ...context,
      boundary: true
    });

    // Show fallback UI if container exists
    if (this.fallbackContainer) {
      this.showFallbackUI(errorInfo);
    }
  }

  /**
   * Show fallback UI
   * @param {Object} errorInfo
   */
  showFallbackUI(errorInfo) {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';

    const errorHTML = renderErrorState({
      title: 'Ein Fehler ist aufgetreten',
      message: errorInfo.message,
      retryLabel: errorInfo.retryable ? 'Erneut versuchen' : null,
      retryCallback: errorInfo.retryable ? () => this.recover() : null
    });

    // Add error details in development
    if (isDevelopment && errorInfo.originalError) {
      const details = document.createElement('details');
      details.style.marginTop = '16px';
      details.style.padding = '12px';
      details.style.background = 'var(--bg)';
      details.style.borderRadius = '6px';
      details.innerHTML = `
        <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px;">
          Fehlerdetails (nur in Development)
        </summary>
        <pre style="font-size: 12px; overflow: auto; max-height: 200px;">
${JSON.stringify({
  category: errorInfo.category,
  message: errorInfo.originalError?.message || errorInfo.message,
  stack: errorInfo.originalError?.stack,
  context: errorInfo.context
}, null, 2)}
        </pre>
      `;
      
      const errorContainer = document.createElement('div');
      errorContainer.innerHTML = errorHTML;
      errorContainer.appendChild(details);
      this.fallbackContainer.innerHTML = '';
      this.fallbackContainer.appendChild(errorContainer);
    } else {
      this.fallbackContainer.innerHTML = errorHTML;
    }

    // Wire retry button
    const retryBtn = this.fallbackContainer.querySelector('#errorStateRetry');
    if (retryBtn && errorInfo.retryable) {
      retryBtn.addEventListener('click', () => this.recover());
    }
  }

  /**
   * Recover from error
   */
  recover() {
    this.error = null;
    if (this.container) {
      this.container.innerHTML = '';
    }
    // Reload page or re-render
    window.location.reload();
  }

  /**
   * Reset error state
   */
  reset() {
    this.error = null;
  }

  /**
   * Check if in error state
   * @returns {boolean}
   */
  hasError() {
    return this.error !== null;
  }
}

/**
 * Create error boundary for a container
 * @param {HTMLElement|string} container - Container element or selector
 * @param {HTMLElement|string} fallbackContainer - Fallback container (optional)
 * @returns {ErrorBoundary}
 */
export function createErrorBoundary(container, fallbackContainer = null) {
  const containerEl = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
  
  const fallbackEl = fallbackContainer 
    ? (typeof fallbackContainer === 'string' 
        ? document.querySelector(fallbackContainer) 
        : fallbackContainer)
    : containerEl;

  if (!containerEl) {
    console.warn('ErrorBoundary: Container not found');
    return null;
  }

  return new ErrorBoundary(containerEl, fallbackEl);
}

/**
 * Initialize global error boundary
 */
export function initGlobalErrorBoundary() {
  const mainContainer = document.querySelector('main') || document.body;
  return createErrorBoundary(mainContainer);
}

// Auto-initialize on load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.globalErrorBoundary = initGlobalErrorBoundary();
  });
}









