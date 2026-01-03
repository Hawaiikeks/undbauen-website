/* Success Modal Component - Shows success messages with OK button */

import { trapFocus } from './focusTrap.js';

let successModalInstance = null;

/**
 * Show success modal
 * @param {string} message - Success message
 * @param {string} title - Modal title (default: "Erfolgreich")
 */
export function showSuccessModal(message, title = 'Erfolgreich') {
  // Remove existing modal if any
  if (successModalInstance) {
    successModalInstance.remove();
  }

  const overlay = document.createElement('div');
  overlay.className = 'modalOverlay';
  overlay.id = 'successModalOverlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.cssText = `
    max-width: 320px;
    width: 90%;
    margin: 20px;
  `;

  modal.innerHTML = `
    <div class="modalHeader">
      <div class="modalTitle">${title}</div>
      <button class="btn" onclick="this.closest('.modalOverlay').remove()" aria-label="Schließen" style="font-size: 24px; padding: 8px 16px;">✕</button>
    </div>
    <div class="modalBody">
      <div style="text-align: center; padding: 16px 0;">
        <div style="color: var(--text-primary); font-size: 15px; line-height: 1.6;">${message}</div>
      </div>
      <div style="display: flex; justify-content: center; margin-top: 20px;">
        <button class="btn primary" id="successModalOk" style="min-width: 100px;">OK</button>
      </div>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  successModalInstance = overlay;

  // Trap focus
  const cleanupFocusTrap = trapFocus(modal);

  // Wire events
  const okBtn = modal.querySelector('#successModalOk');
  const closeBtn = modal.querySelector('[aria-label="Schließen"]');

  const close = () => {
    if (cleanupFocusTrap) cleanupFocusTrap();
    overlay.remove();
    successModalInstance = null;
  };

  okBtn.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Close on Escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escapeHandler);
      close();
    }
  };
  document.addEventListener('keydown', escapeHandler);

  // Focus on OK button
  setTimeout(() => okBtn.focus(), 100);
}

