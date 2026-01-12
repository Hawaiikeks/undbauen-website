/* Report Modal: Dialog for reporting posts, comments, or users */

import { reportRepository } from '../services/repositories/reportRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from './toast.js';
import { trapFocus } from './focusTrap.js';

const reportReasons = [
  { id: 'spam', label: 'Spam' },
  { id: 'harassment', label: 'Belästigung' },
  { id: 'hate_speech', label: 'Hassrede' },
  { id: 'inappropriate', label: 'Unangemessener Inhalt' },
  { id: 'misinformation', label: 'Falschinformationen' },
  { id: 'other', label: 'Sonstiges' }
];

/**
 * Show report modal
 * @param {string} targetType - 'post', 'comment', 'user'
 * @param {string} targetId - ID of the target entity
 * @param {Object} context - Additional context (e.g., post title, user name)
 */
export function showReportModal(targetType, targetId, context = {}) {
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.id = 'reportModal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'reportModalTitle');
  modal.innerHTML = renderReportModal(targetType, targetId, context);
  document.body.appendChild(modal);

  // Trap focus
  const cleanupFocusTrap = trapFocus(modal.querySelector('.modal'));

  // Cleanup on close
  const originalRemove = modal.remove;
  modal.remove = function() {
    if (cleanupFocusTrap) cleanupFocusTrap();
    originalRemove.call(this);
  };

  wireReportEvents(modal, targetType, targetId);
}

/**
 * Render report modal HTML
 */
function renderReportModal(targetType, targetId, context) {
  const targetLabel = {
    post: 'Beitrag',
    comment: 'Kommentar',
    user: 'Benutzer'
  }[targetType] || 'Inhalt';

  return `
    <div class="modal" style="max-width: 500px;">
      <div class="modalHeader">
        <div class="modalTitle" id="reportModalTitle">${targetLabel} melden</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()" aria-label="Schließen" style="font-size: 24px; padding: 8px 16px;">✕</button>
      </div>
      <div class="modalBody">
        ${context.title || context.name ? `
          <div style="margin-bottom: 16px; padding: 12px; background: var(--bg); border-radius: 6px;">
            <div style="font-weight: 600; margin-bottom: 4px;">${targetLabel}:</div>
            <div style="color: var(--text-secondary);">${context.title || context.name}</div>
          </div>
        ` : ''}
        
        <label class="label">Grund *</label>
        <select class="input" id="reportReason">
          <option value="">Bitte wählen...</option>
          ${reportReasons.map(reason => `
            <option value="${reason.id}">${reason.label}</option>
          `).join('')}
        </select>
        
        <label class="label" style="margin-top: 16px;">Zusätzliche Informationen (optional)</label>
        <textarea class="textarea" id="reportNote" rows="4" placeholder="Bitte beschreiben Sie das Problem im Detail..."></textarea>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn" onclick="this.closest('.modalOverlay').remove()" style="flex: 1;">Abbrechen</button>
          <button class="btn primary" id="submitReportBtn" style="flex: 1;">Melden</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wire report modal events
 */
function wireReportEvents(modal, targetType, targetId) {
  const submitBtn = modal.querySelector('#submitReportBtn');
  
  submitBtn.addEventListener('click', async () => {
    const reason = modal.querySelector('#reportReason').value;
    const note = modal.querySelector('#reportNote').value.trim();

    if (!reason) {
      toast.error('Bitte wählen Sie einen Grund aus.');
      return;
    }

    const user = api.me();
    if (!user) {
      toast.error('Sie müssen eingeloggt sein.');
      return;
    }

    try {
      await reportRepository.create({
        reporterUserId: user.id,
        targetType,
        targetId,
        reason,
        note: note || null,
        status: 'pending',
        resolutionAction: null,
        resolvedByUserId: null
      });

      toast.success('Meldung wurde erfolgreich eingereicht. Vielen Dank!');
      modal.remove();
    } catch (error) {
      console.error('Error creating report:', error);
      toast.error('Fehler beim Erstellen der Meldung. Bitte versuchen Sie es erneut.');
    }
  });
}

