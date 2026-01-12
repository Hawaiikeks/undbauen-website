/* Optimized Image: Component for optimized image loading with WebP support */

/**
 * Create optimized image element
 * @param {string} src - Image source
 * @param {string} alt - Alt text
 * @param {Object} options - Options
 * @returns {HTMLImageElement}
 */
export function createOptimizedImage(src, alt, options = {}) {
  const {
    lazy = true,
    sizes = '100vw',
    srcset = null,
    width = null,
    height = null,
    className = '',
    style = '',
    onLoad = null,
    onError = null
  } = options;

  const img = document.createElement('img');
  img.alt = alt || '';
  img.loading = lazy ? 'lazy' : 'eager';
  
  if (className) {
    img.className = className;
  }
  
  if (style) {
    img.style.cssText = style;
  }

  // Set dimensions if provided
  if (width) img.width = width;
  if (height) img.height = height;

  // WebP with fallback using srcset
  if (srcset) {
    img.srcset = srcset;
    img.sizes = sizes;
    // Fallback src for browsers that don't support srcset
    img.src = src;
  } else {
    // Try to use WebP if available
    const webpSrc = convertToWebP(src);
    if (webpSrc && supportsWebP()) {
      img.src = webpSrc;
      // Fallback for browsers without WebP support
      img.onerror = () => {
        img.src = src;
      };
    } else {
      img.src = src;
    }
  }

  // Event handlers
  if (onLoad) {
    img.addEventListener('load', onLoad);
  }
  
  if (onError) {
    img.addEventListener('error', onError);
  }

  return img;
}

/**
 * Convert image URL to WebP format
 * @param {string} src - Original image source
 * @returns {string|null} WebP URL or null
 */
function convertToWebP(src) {
  if (!src) return null;
  
  // If already WebP, return as is
  if (src.endsWith('.webp')) return src;
  
  // If it's a data URL, return null (can't convert)
  if (src.startsWith('data:')) return null;
  
  // Try to replace extension with .webp
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  
  // Only return if different (meaning conversion is possible)
  return webpSrc !== src ? webpSrc : null;
}

/**
 * Check if browser supports WebP
 * @returns {boolean}
 */
function supportsWebP() {
  // Check if already cached
  if (typeof supportsWebP.cached !== 'undefined') {
    return supportsWebP.cached;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  const result = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  supportsWebP.cached = result;
  
  return result;
}

/**
 * Generate srcset for responsive images
 * @param {string} baseSrc - Base image source
 * @param {Array<number>} widths - Array of widths
 * @returns {string} srcset string
 */
export function generateSrcset(baseSrc, widths = [400, 800, 1200, 1600]) {
  return widths
    .map(width => {
      const webpSrc = convertToWebP(baseSrc);
      const src = webpSrc || baseSrc;
      // Assume image service can resize (adjust URL pattern as needed)
      const resizedSrc = src.replace(/(\.[^.]+)$/, `_${width}w$1`);
      return `${resizedSrc} ${width}w`;
    })
    .join(', ');
}

/**
 * Create responsive image with srcset
 * @param {string} src - Base image source
 * @param {string} alt - Alt text
 * @param {Object} options - Options
 * @returns {HTMLImageElement}
 */
export function createResponsiveImage(src, alt, options = {}) {
  const {
    widths = [400, 800, 1200, 1600],
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    ...restOptions
  } = options;

  const srcset = generateSrcset(src, widths);
  
  return createOptimizedImage(src, alt, {
    ...restOptions,
    srcset,
    sizes
  });
}

/**
 * Lazy load image with placeholder
 * @param {string} src - Image source
 * @param {string} alt - Alt text
 * @param {Object} options - Options
 * @returns {HTMLElement} Container with image
 */
export function createLazyImage(src, alt, options = {}) {
  const {
    placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E',
    className = 'lazy-image',
    ...restOptions
  } = options;

  const container = document.createElement('div');
  container.className = className;
  container.style.cssText = 'position: relative; overflow: hidden;';

  const img = createOptimizedImage(src, alt, {
    ...restOptions,
    lazy: true,
    style: 'width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; opacity: 0;'
  });

  // Placeholder
  if (placeholder) {
    img.src = placeholder;
    img.dataset.src = src;
    
    // Load actual image when in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          if (target.dataset.src) {
            target.src = target.dataset.src;
            target.removeAttribute('data-src');
            target.style.opacity = '1';
            observer.unobserve(target);
          }
        }
      });
    }, {
      rootMargin: '50px'
    });

    observer.observe(img);
  }

  container.appendChild(img);
  return container;
}









