/**
 * Response Caching Middleware
 * Caches GET responses in memory for improved performance
 */

// Simple in-memory cache (for production, use Redis)
const cache = new Map();

/**
 * Cache middleware
 * @param {number} duration - Cache duration in seconds (default: 300 = 5 minutes)
 * @returns {Function} Express middleware
 */
export const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Don't cache authenticated requests (except public endpoints)
    const isPublicEndpoint = req.path.includes('/members') || 
                            req.path.includes('/updates') ||
                            req.path.includes('/publications') ||
                            req.path.includes('/events') && !req.path.includes('/participants');
    
    if (req.headers.authorization && !isPublicEndpoint) {
      return next();
    }

    // Create cache key
    const cacheKey = `${req.method}:${req.originalUrl}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      // Set cache headers
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', `public, max-age=${Math.floor((cached.expiresAt - Date.now()) / 1000)}`);
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to cache response
    res.json = function(data) {
      // Cache the response
      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + (duration * 1000)
      });

      // Set cache headers
      res.set('X-Cache', 'MISS');
      res.set('Cache-Control', `public, max-age=${duration}`);
      
      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

/**
 * Clear cache for specific pattern
 * @param {string} pattern - URL pattern to clear (e.g., '/api/events')
 */
export const clearCache = (pattern) => {
  for (const [key] of cache.entries()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

/**
 * Clear all cache
 */
export const clearAllCache = () => {
  cache.clear();
};

/**
 * Clean expired cache entries (run periodically)
 */
export const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now >= value.expiresAt) {
      cache.delete(key);
    }
  }
};

// Clean expired cache every 5 minutes
setInterval(cleanExpiredCache, 5 * 60 * 1000);





