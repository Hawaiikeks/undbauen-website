/**
 * Monitoring Service
 *
 * Provides error tracking, analytics, and performance monitoring.
 * Supports integration with external services (Sentry, Analytics, etc.)
 *
 * @module services/monitoring
 */

/**
 * Monitoring Service Class
 */
class Monitoring {
  constructor() {
    this.sentryEnabled = false;
    this.analyticsEnabled = false;
    this.errorLog = [];
    this.maxErrorLogSize = 100;
    this.performanceMetrics = [];
  }

  /**
   * Initialize monitoring
   * @param {Object} options - Configuration options
   * @param {string} [options.sentryDsn] - Sentry DSN for error tracking
   * @param {boolean} [options.enableAnalytics] - Enable analytics tracking
   */
  init(options = {}) {
    // Initialize Sentry if DSN provided
    if (options.sentryDsn && typeof window !== 'undefined' && window.Sentry) {
      try {
        window.Sentry.init({
          dsn: options.sentryDsn,
          environment: this.getEnvironment(),
          release: this.getVersion()
        });
        this.sentryEnabled = true;
        console.log('✅ Sentry initialized');
      } catch (error) {
        console.warn('Failed to initialize Sentry:', error);
      }
    }

    // Initialize analytics
    if (options.enableAnalytics) {
      this.analyticsEnabled = true;
    }

    // Track page load performance
    if (typeof window !== 'undefined' && window.performance) {
      this.trackPageLoad();
    }
  }

  /**
   * Track error
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context
   */
  trackError(error, context = {}) {
    const errorInfo = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
    };

    // Add to local log
    this.errorLog.push(errorInfo);
    if (this.errorLog.length > this.maxErrorLogSize) {
      this.errorLog.shift();
    }

    // Send to Sentry if enabled
    if (this.sentryEnabled && typeof window !== 'undefined' && window.Sentry) {
      try {
        window.Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
          tags: context.tags || {},
          extra: context
        });
      } catch (e) {
        console.warn('Failed to send error to Sentry:', e);
      }
    }

    // Log to console in development
    if (this.isDevelopment()) {
      console.error('Error tracked:', errorInfo);
    }
  }

  /**
   * Track custom event
   * @param {string} eventName - Event name
   * @param {Object} properties - Event properties
   */
  trackEvent(eventName, properties = {}) {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : ''
    };

    // Send to analytics if enabled
    if (this.analyticsEnabled) {
      // Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, properties);
      }

      // Custom analytics
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track(eventName, properties);
      }
    }

    // Log in development
    if (this.isDevelopment()) {
      console.log('Event tracked:', event);
    }
  }

  /**
   * Track page view
   * @param {string} page - Page name/path
   */
  trackPageView(page) {
    this.trackEvent('page_view', { page });

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: page
      });
    }
  }

  /**
   * Track performance metric
   * @param {string} metricName - Metric name
   * @param {number} value - Metric value (in milliseconds)
   * @param {Object} tags - Additional tags
   */
  trackPerformance(metricName, value, tags = {}) {
    const metric = {
      name: metricName,
      value,
      tags,
      timestamp: new Date().toISOString()
    };

    this.performanceMetrics.push(metric);

    // Keep only last 50 metrics
    if (this.performanceMetrics.length > 50) {
      this.performanceMetrics.shift();
    }

    // Send to analytics
    if (this.analyticsEnabled) {
      this.trackEvent('performance', {
        metric: metricName,
        value,
        ...tags
      });
    }
  }

  /**
   * Track page load performance
   */
  trackPageLoad() {
    if (typeof window === 'undefined' || !window.performance) {
      return;
    }

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = window.performance.timing;
        const navigation = window.performance.getEntriesByType('navigation')[0];

        if (perfData) {
          // Time to First Byte
          const ttfb = perfData.responseStart - perfData.requestStart;
          this.trackPerformance('ttfb', ttfb);

          // DOM Content Loaded
          const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.navigationStart;
          this.trackPerformance('dom_content_loaded', domContentLoaded);

          // Page Load
          const pageLoad = perfData.loadEventEnd - perfData.navigationStart;
          this.trackPerformance('page_load', pageLoad);
        }

        if (navigation) {
          // First Contentful Paint
          const fcp = navigation.firstContentfulPaint;
          if (fcp) {
            this.trackPerformance('first_contentful_paint', fcp);
          }

          // Largest Contentful Paint
          if (window.PerformanceObserver) {
            try {
              const observer = new PerformanceObserver(list => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                this.trackPerformance(
                  'largest_contentful_paint',
                  lastEntry.renderTime || lastEntry.loadTime
                );
              });
              observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
              // LCP not supported
            }
          }
        }
      }, 0);
    });
  }

  /**
   * Get error log
   * @returns {Array} Error log
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Get performance metrics
   * @returns {Array} Performance metrics
   */
  getPerformanceMetrics() {
    return [...this.performanceMetrics];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
  }

  /**
   * Check if in development environment
   * @returns {boolean}
   */
  isDevelopment() {
    if (typeof window === 'undefined') {
      return false;
    }
    return (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.startsWith('192.168.')
    );
  }

  /**
   * Get current environment
   * @returns {string}
   */
  getEnvironment() {
    if (typeof window === 'undefined') {
      return 'unknown';
    }
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    }
    return 'production';
  }

  /**
   * Get application version
   * @returns {string}
   */
  getVersion() {
    if (typeof document === 'undefined') {
      return 'unknown';
    }
    const meta = document.querySelector('meta[name="app-version"]');
    return meta ? meta.content : '1.0.0';
  }

  /**
   * Set user context for error tracking
   * @param {Object} user - User information
   */
  setUser(user) {
    if (this.sentryEnabled && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name
      });
    }
  }

  /**
   * Clear user context
   */
  clearUser() {
    if (this.sentryEnabled && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.setUser(null);
    }
  }
}

// Export singleton instance
export const monitoring = new Monitoring();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Initialize with default settings
  monitoring.init({
    enableAnalytics: true
  });
}








