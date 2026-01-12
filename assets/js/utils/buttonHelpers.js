/**
 * Button Helper Utilities
 * Provides loading states and button management
 */

/**
 * Set button loading state
 * @param {HTMLElement} button - Button element
 * @param {boolean} loading - Loading state
 * @param {string} loadingText - Text to show while loading (optional)
 */
export function setButtonLoading(button, loading, loadingText = null) {
  if (!button) return;

  if (loading) {
    const originalText = button.textContent;
    button.dataset.originalText = originalText;
    button.disabled = true;
    button.classList.add('btn-loading');
    
    if (loadingText) {
      button.innerHTML = `
        <span class="btn-spinner"></span>
        <span>${loadingText}</span>
      `;
    } else {
      button.innerHTML = `
        <span class="btn-spinner"></span>
        <span>${originalText}</span>
      `;
    }
  } else {
    button.disabled = false;
    button.classList.remove('btn-loading');
    const originalText = button.dataset.originalText || button.textContent;
    button.textContent = originalText;
    delete button.dataset.originalText;
  }
}

/**
 * Wrap async function with button loading state
 * @param {HTMLElement} button - Button element
 * @param {Function} asyncFn - Async function to execute
 * @param {string} loadingText - Loading text (optional)
 * @returns {Promise} Promise from async function
 */
export async function withButtonLoading(button, asyncFn, loadingText = null) {
  setButtonLoading(button, true, loadingText);
  try {
    const result = await asyncFn();
    return result;
  } finally {
    setButtonLoading(button, false);
  }
}





