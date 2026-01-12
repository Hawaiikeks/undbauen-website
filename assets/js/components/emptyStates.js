/* Empty States: Reusable empty/loading/error state components */

/**
 * Render empty state
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderEmptyState(options = {}) {
  const {
    icon = '📭',
    title = 'Keine Daten',
    description = 'Es sind noch keine Daten vorhanden.',
    actionLabel = null,
    actionCallback = null
  } = options;

  return `
    <div class="empty-state" style="text-align: center; padding: 48px 24px;">
      <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">${icon}</div>
      <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: var(--text-primary);">
        ${title}
      </div>
      <div style="color: var(--text-secondary); margin-bottom: ${actionLabel ? '24px' : '0'};">
        ${description}
      </div>
      ${actionLabel ? `
        <button class="btn primary" id="emptyStateAction">
          ${actionLabel}
        </button>
      ` : ''}
    </div>
  `;
}

/**
 * Render loading state
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderLoadingState(options = {}) {
  const {
    message = 'Wird geladen...',
    skeleton = false,
    skeletonCount = 3
  } = options;

  if (skeleton) {
    return `
      <div class="loading-state">
        ${Array(skeletonCount).fill(0).map(() => `
          <div class="skeleton-item" style="
            background: var(--bg);
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 12px;
            animation: pulse 1.5s ease-in-out infinite;
          ">
            <div style="height: 20px; background: var(--border); border-radius: 4px; margin-bottom: 8px; width: 60%;"></div>
            <div style="height: 16px; background: var(--border); border-radius: 4px; width: 80%;"></div>
          </div>
        `).join('')}
      </div>
    `;
  }

  return `
    <div class="loading-state" style="text-align: center; padding: 48px 24px;">
      <div style="font-size: 32px; margin-bottom: 16px; animation: spin 1s linear infinite;">⏳</div>
      <div style="color: var(--text-secondary);">${message}</div>
    </div>
  `;
}

/**
 * Render error state
 * @param {Object} options
 * @returns {string} HTML
 */
export function renderErrorState(options = {}) {
  const {
    title = 'Fehler',
    message = 'Ein Fehler ist aufgetreten.',
    retryLabel = 'Erneut versuchen',
    retryCallback = null,
    showDetails = false,
    errorDetails = null
  } = options;

  return `
    <div class="error-state" style="text-align: center; padding: 48px 24px;">
      <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">⚠️</div>
      <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: var(--danger);">
        ${title}
      </div>
      <div style="color: var(--text-secondary); margin-bottom: ${retryLabel ? '24px' : '0'}; max-width: 600px; margin-left: auto; margin-right: auto;">
        ${message}
      </div>
      ${retryLabel ? `
        <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
          <button class="btn primary" id="errorStateRetry">
            ${retryLabel}
          </button>
          <button class="btn" id="errorStateReload" onclick="window.location.reload()">
            Seite neu laden
          </button>
        </div>
      ` : ''}
      ${showDetails && errorDetails ? `
        <details style="margin-top: 24px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
          <summary style="cursor: pointer; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px;">
            Fehlerdetails anzeigen
          </summary>
          <pre style="font-size: 12px; overflow: auto; max-height: 200px; padding: 12px; background: var(--bg); border-radius: 6px; margin-top: 8px;">
${typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails, null, 2)}
          </pre>
        </details>
      ` : ''}
    </div>
  `;
}

/**
 * Add CSS animations if not already present
 */
export function ensureAnimations() {
  if (document.getElementById('emptyStatesStyles')) return;

  const style = document.createElement('style');
  style.id = 'emptyStatesStyles';
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

// Initialize animations on load
if (typeof document !== 'undefined') {
  ensureAnimations();
}




