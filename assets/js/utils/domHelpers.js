/**
 * DOM Helper Functions
 * Safe alternatives to innerHTML for XSS protection
 */

/**
 * Safely set text content (prevents XSS)
 * @param {HTMLElement} element - Target element
 * @param {string} text - Text content
 */
export function setTextContent(element, text) {
  if (element) {
    element.textContent = text;
  }
}

/**
 * Safely set HTML content with basic sanitization
 * Only use for trusted content!
 * @param {HTMLElement} element - Target element
 * @param {string} html - HTML content
 */
export function setHTML(element, html) {
  if (!element) return;
  
  // Basic sanitization - remove script tags
  const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  element.innerHTML = sanitized;
}

/**
 * Create element from HTML string (with sanitization)
 * @param {string} html - HTML string
 * @returns {HTMLElement} Created element
 */
export function createFromHTML(html) {
  const div = document.createElement('div');
  setHTML(div, html);
  return div.firstElementChild || div;
}

/**
 * Clear element content safely
 * @param {HTMLElement} element - Target element
 */
export function clearElement(element) {
  if (element) {
    element.textContent = '';
  }
}

/**
 * Ensure image has lazy loading
 * @param {HTMLImageElement} img - Image element
 */
export function ensureLazyLoading(img) {
  if (img && !img.loading) {
    img.loading = 'lazy';
  }
}

/**
 * Add lazy loading to all images in container
 * @param {HTMLElement} container - Container element
 */
export function addLazyLoadingToImages(container) {
  if (!container) return;
  
  const images = container.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.loading = 'lazy';
  });
}





