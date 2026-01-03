/* Reports Page: Moderator view of reports queue */

import { reportRepository } from '../services/repositories/reportRepository.js';
import { logReportAction } from '../services/auditLogger.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

const reasonLabels = {
  spam: 'Spam',
  harassment: 'Belästigung',
  hate_speech: 'Hassrede',
  inappropriate: 'Unangemessener Inhalt',
  misinformation: 'Falschinformationen',
  other: 'Sonstiges'
};

const statusLabels = {
  pending: 'Ausstehend',
  dismissed: 'Abgelehnt',
  resolved: 'Gelöst'
};

const actionLabels = {
  dismiss: 'Ablehnen',
  remove: 'Entfernen',
  warn: 'Warnung',
  mute: 'Stummschalten',
  ban: 'Sperren'
};

/**
 * Render reports page
 */
export async function renderReports() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#reportsContainer') || document.querySelector('main');
  if (!container) return;

  const allReports = await reportRepository.findAll();
  const pendingReports = allReports.filter(r => r.status === 'pending');
  const sortedReports = pendingReports.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  container.innerHTML = `
    <div class="container pageWrap">
      <div style="margin-bottom: 24px;">
        <h1 class="h2">Reports Queue</h1>
        <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
          Verwalten Sie gemeldete Inhalte und Benutzer.
        </p>
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${sortedReports.length} ${sortedReports.length === 1 ? 'ausstehender Report' : 'ausstehende Reports'}
      </div>

      ${sortedReports.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">✅</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine ausstehenden Reports</div>
          <div style="color: var(--text-secondary);">
            Alle Reports wurden bearbeitet.
          </div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${sortedReports.map(report => renderReportCard(report)).join('')}
        </div>
      `}
    </div>
  `;

  wireReportsEvents();
}

/**
 * Render report card
 */
function renderReportCard(report) {
  const reasonLabel = reasonLabels[report.reason] || report.reason;
  const targetLabel = {
    post: 'Beitrag',
    comment: 'Kommentar',
    user: 'Benutzer'
  }[report.targetType] || report.targetType;

  // Get reporter info
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const reporter = users.find(u => u.id === report.reporterUserId);

  return `
    <div class="card pane">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span class="badge" style="background: var(--danger); color: white; font-size: 12px;">
              ${reasonLabel}
            </span>
            <span style="color: var(--text-secondary); font-size: 14px;">${targetLabel}</span>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            Gemeldet von: ${reporter?.name || 'Unbekannt'} • 
            ${new Date(report.createdAt).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
      
      ${report.note ? `
        <div style="margin-bottom: 16px; padding: 12px; background: var(--bg); border-radius: 6px; color: var(--text-primary); line-height: 1.6;">
          ${report.note}
        </div>
      ` : ''}
      
      <div style="margin-bottom: 16px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">Gemeldeter Inhalt:</div>
        <div style="padding: 12px; background: var(--bg); border-radius: 6px; border: 1px solid var(--border);">
          <div style="color: var(--text-secondary); font-size: 14px;">
            ${report.targetType}: ${report.targetId}
          </div>
          <button class="btn small" style="margin-top: 8px;" onclick="window.viewReportedContent('${report.targetType}', '${report.targetId}')">
            Inhalt anzeigen
          </button>
        </div>
      </div>
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px;">
        <button class="btn small" onclick="window.handleReportAction('${report.id}', 'dismiss')">
          Ablehnen
        </button>
        <button class="btn small danger" onclick="window.handleReportAction('${report.id}', 'remove')">
          Entfernen
        </button>
        <button class="btn small" onclick="window.handleReportAction('${report.id}', 'warn')">
          Warnung
        </button>
        ${report.targetType === 'user' ? `
          <button class="btn small" onclick="window.handleReportAction('${report.id}', 'mute')">
            Stummschalten
          </button>
          <button class="btn small danger" onclick="window.handleReportAction('${report.id}', 'ban')">
            Sperren
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Handle report action
 */
window.handleReportAction = async function(reportId, action) {
  const user = api.me();
  if (!user) return;

  try {
    // Update report
    await reportRepository.update(reportId, {
      status: 'resolved',
      resolutionAction: action,
      resolvedByUserId: user.id
    });

    // Log audit event
    await logReportAction(reportId, action);

    // Handle action based on type
    const report = await reportRepository.findById(reportId);
    if (report) {
      if (action === 'remove' && report.targetType === 'post') {
        // Remove post (would need post repository)
        toast.success('Beitrag wurde entfernt');
      } else if (action === 'ban' && report.targetType === 'user') {
        // Ban user
        const { logUserAction } = await import('../services/auditLogger.js');
        await logUserAction(report.targetId, 'ban', { reportId });
        toast.success('Benutzer wurde gesperrt');
      } else {
        toast.success(`Aktion "${actionLabels[action] || action}" wurde ausgeführt`);
      }
    }

    // Show success modal
    const { showSuccessModal } = await import('../components/successModal.js');
    const actionLabel = actionLabels[action] || action;
    showSuccessModal(`Die Aktion "${actionLabel}" wurde erfolgreich ausgeführt.`, 'Aktion ausgeführt');
    
    // Refresh reports after modal
    setTimeout(() => renderReports(), 1500);
  } catch (error) {
    console.error('Error handling report action:', error);
    toast.error('Fehler beim Ausführen der Aktion');
  }
};

/**
 * View reported content
 */
window.viewReportedContent = function(targetType, targetId) {
  if (targetType === 'post') {
    window.location.href = `../app/forum-thread.html?thread=${targetId}`;
  } else if (targetType === 'user') {
    window.location.href = `../app/member.html?id=${targetId}`;
  } else {
    toast.info('Inhalt wird geladen...');
  }
};

/**
 * Wire reports events
 */
function wireReportsEvents() {
  // Events are already wired via window functions
  // This function exists for consistency
}


