// Confirm Modal Component
import { trapFocus } from './focusTrap.js';

class ConfirmModal {
  constructor() {
    this.overlay = null;
    this.modal = null;
    this.init();
  }

  init() {
    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'confirm-modal-overlay';
      this.overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(4px);
      `;
      
      this.modal = document.createElement('div');
      this.modal.className = 'confirm-modal';
      this.modal.style.cssText = `
        background: var(--surface);
        border-radius: var(--radius);
        padding: 24px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      `;
      
      this.overlay.appendChild(this.modal);
      document.body.appendChild(this.overlay);
      
      // Close on overlay click
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      });
    }
  }

  show(message, title = 'Bestätigung', confirmText = 'Bestätigen', cancelText = 'Abbrechen') {
    return new Promise((resolve) => {
      this.modal.innerHTML = `
        <div style="margin-bottom: 16px">
          <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px; color: var(--text-primary)">${title}</div>
          <div style="color: var(--text-secondary); line-height: 1.6">${message}</div>
        </div>
        <div style="display: flex; gap: 12px; justify-content: flex-end">
          <button class="btn" id="confirmCancel" style="background: var(--bg); border: 1px solid var(--border)">${cancelText}</button>
          <button class="btn primary" id="confirmOk">${confirmText}</button>
        </div>
      `;
      
      const cancelBtn = this.modal.querySelector('#confirmCancel');
      const okBtn = this.modal.querySelector('#confirmOk');
      
      const cleanup = () => {
        cancelBtn.removeEventListener('click', onCancel);
        okBtn.removeEventListener('click', onOk);
        this.hide();
      };
      
      const onCancel = () => {
        cleanup();
        resolve(false);
      };
      
      const onOk = () => {
        cleanup();
        resolve(true);
      };
      
      cancelBtn.addEventListener('click', onCancel);
      okBtn.addEventListener('click', onOk);
      
      // Close on Escape
      const escapeHandler = (e) => {
        if (e.key === 'Escape') {
          document.removeEventListener('keydown', escapeHandler);
          onCancel();
        }
      };
      document.addEventListener('keydown', escapeHandler);
      
      this.overlay.style.display = 'flex';
      
      // Focus on OK button
      setTimeout(() => okBtn.focus(), 100);
    });
  }

  hide() {
    if (this.overlay) {
      this.overlay.style.display = 'none';
      // Cleanup focus trap
      if (this.cleanupFocusTrap) {
        this.cleanupFocusTrap();
        this.cleanupFocusTrap = null;
      }
    }
  }
}

// Export singleton instance
export const confirmModal = new ConfirmModal();









