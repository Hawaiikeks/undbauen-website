/**
 * Rate Limiter Service
 * Prevents abuse by limiting requests per time window
 */

class RateLimiter {
  constructor(maxRequests = 5, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map(); // key -> [timestamp1, timestamp2, ...]
  }

  /**
   * Check if request is allowed
   * @param {string} key - Unique identifier (e.g., user ID, IP, action type)
   * @returns {boolean} True if request is allowed
   */
  check(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];

    // Remove old requests outside the time window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(key, recentRequests);

    return true;
  }

  /**
   * Get remaining requests for a key
   * @param {string} key
   * @returns {number} Remaining requests
   */
  getRemaining(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Get time until next request is allowed
   * @param {string} key
   * @returns {number} Milliseconds until next request
   */
  getTimeUntilNext(key) {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);

    if (recentRequests.length < this.maxRequests) {
      return 0; // Request allowed now
    }

    // Find oldest request in window
    const oldestRequest = Math.min(...recentRequests);
    return oldestRequest + this.windowMs - now;
  }

  /**
   * Reset rate limit for a key
   * @param {string} key
   */
  reset(key) {
    this.requests.delete(key);
  }

  /**
   * Clear all rate limits
   */
  clear() {
    this.requests.clear();
  }

  /**
   * Cleanup old entries (call periodically)
   */
  cleanup() {
    const now = Date.now();
    for (const [key, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(time => now - time < this.windowMs);
      if (recentRequests.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recentRequests);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Export class for custom instances
export { RateLimiter };

// Auto-cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(
    () => {
      rateLimiter.cleanup();
    },
    5 * 60 * 1000
  );
}
