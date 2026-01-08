/* Skeleton: Standardized loading state components */

/**
 * Create skeleton screen
 * @param {string} type - Skeleton type
 * @param {number} count - Number of skeletons
 * @param {Object} options - Options
 * @returns {string} HTML string
 */
export function createSkeleton(type = 'card', count = 1, options = {}) {
  const {
    animated = true,
    className = ''
  } = options;

  const animationClass = animated ? 'skeleton-animated' : '';
  const skeletons = {
    card: `
      <div class="skeleton-card ${animationClass} ${className}" style="
        background: var(--bg);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div class="skeleton-line" style="height: 20px; background: var(--border); border-radius: 4px; margin-bottom: 12px; width: 60%;"></div>
        <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; width: 80%; margin-bottom: 8px;"></div>
        <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; width: 70%;"></div>
      </div>
    `,
    list: `
      <div class="skeleton-list-item ${animationClass} ${className}" style="
        background: var(--bg);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 8px;
      ">
        <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; width: 100%;"></div>
      </div>
    `,
    avatar: `
      <div class="skeleton-avatar ${animationClass} ${className}" style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--border);
        margin-bottom: 8px;
      "></div>
    `,
    text: `
      <div class="skeleton-text ${animationClass} ${className}" style="
        height: 16px;
        background: var(--border);
        border-radius: 4px;
        margin-bottom: 8px;
        width: 100%;
      "></div>
    `,
    image: `
      <div class="skeleton-image ${animationClass} ${className}" style="
        width: 100%;
        aspect-ratio: 16 / 9;
        background: var(--border);
        border-radius: 8px;
        margin-bottom: 12px;
      "></div>
    `,
    button: `
      <div class="skeleton-button ${animationClass} ${className}" style="
        height: 40px;
        width: 120px;
        background: var(--border);
        border-radius: 6px;
        margin-bottom: 8px;
      "></div>
    `,
    table: `
      <div class="skeleton-table ${animationClass} ${className}" style="
        background: var(--bg);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
      ">
        <div class="skeleton-line" style="height: 20px; background: var(--border); border-radius: 4px; margin-bottom: 16px; width: 40%;"></div>
        ${Array(5).fill(0).map(() => `
          <div style="display: flex; gap: 12px; margin-bottom: 12px;">
            <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; flex: 1;"></div>
            <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; flex: 1;"></div>
            <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; flex: 1;"></div>
          </div>
        `).join('')}
      </div>
    `,
    dashboard: `
      <div class="skeleton-dashboard ${animationClass} ${className}" style="
        background: var(--bg);
        border-radius: 8px;
        padding: 24px;
        margin-bottom: 16px;
      ">
        <div class="skeleton-line" style="height: 24px; background: var(--border); border-radius: 4px; margin-bottom: 16px; width: 50%;"></div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
          ${Array(4).fill(0).map(() => `
            <div style="padding: 16px; background: var(--surface); border-radius: 8px;">
              <div class="skeleton-line" style="height: 16px; background: var(--border); border-radius: 4px; margin-bottom: 8px; width: 60%;"></div>
              <div class="skeleton-line" style="height: 24px; background: var(--border); border-radius: 4px; width: 80%;"></div>
            </div>
          `).join('')}
        </div>
        <div class="skeleton-line" style="height: 200px; background: var(--border); border-radius: 8px; width: 100%;"></div>
      </div>
    `
  };

  const skeletonHTML = skeletons[type] || skeletons.card;
  
  return Array(count).fill(0).map(() => skeletonHTML).join('');
}

/**
 * Create skeleton element
 * @param {string} type - Skeleton type
 * @param {number} count - Number of skeletons
 * @param {Object} options - Options
 * @returns {HTMLElement}
 */
export function createSkeletonElement(type = 'card', count = 1, options = {}) {
  const container = document.createElement('div');
  container.className = 'skeleton-container';
  container.innerHTML = createSkeleton(type, count, options);
  return container;
}

/**
 * Ensure skeleton animations CSS is loaded
 */
export function ensureSkeletonStyles() {
  if (document.getElementById('skeletonStyles')) return;

  const style = document.createElement('style');
  style.id = 'skeletonStyles';
  style.textContent = `
    @keyframes skeleton-pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }

    .skeleton-animated {
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }

    .skeleton-line {
      animation: skeleton-pulse 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

// Initialize styles on load
if (typeof document !== 'undefined') {
  ensureSkeletonStyles();
}
