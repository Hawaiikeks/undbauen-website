/**
 * Progress Bar Component
 * Simple, clean progress indicators
 */

/**
 * Create progress bar element
 * @param {Object} options - Options
 * @param {number} options.value - Progress value (0-100)
 * @param {string} options.label - Optional label
 * @param {string} options.className - Additional CSS class
 * @returns {HTMLElement} Progress bar element
 */
export function createProgressBar(options = {}) {
  const { value = 0, label = null, className = '' } = options;
  
  const container = document.createElement('div');
  container.className = `progress-container ${className}`;
  
  if (label) {
    const labelEl = document.createElement('div');
    labelEl.className = 'progress-label';
    labelEl.textContent = label;
    container.appendChild(labelEl);
  }
  
  const bar = document.createElement('div');
  bar.className = 'progress-bar';
  bar.setAttribute('role', 'progressbar');
  bar.setAttribute('aria-valuenow', value);
  bar.setAttribute('aria-valuemin', '0');
  bar.setAttribute('aria-valuemax', '100');
  
  const fill = document.createElement('div');
  fill.className = 'progress-fill';
  fill.style.width = `${Math.min(100, Math.max(0, value))}%`;
  
  bar.appendChild(fill);
  container.appendChild(bar);
  
  return container;
}

/**
 * Update progress bar value
 * @param {HTMLElement} progressBar - Progress bar element
 * @param {number} value - New value (0-100)
 */
export function updateProgressBar(progressBar, value) {
  const fill = progressBar?.querySelector('.progress-fill');
  if (fill) {
    fill.style.width = `${Math.min(100, Math.max(0, value))}%`;
    const bar = progressBar.querySelector('.progress-bar');
    if (bar) {
      bar.setAttribute('aria-valuenow', value);
    }
  }
}

/**
 * Remove progress bar
 * @param {HTMLElement} progressBar - Progress bar element
 */
export function removeProgressBar(progressBar) {
  if (progressBar && progressBar.parentNode) {
    progressBar.parentNode.removeChild(progressBar);
  }
}





