/* Audit Log Page: Admin view of audit logs */

import { auditLogRepository } from '../services/repositories/auditLogRepository.js';
import { api } from '../services/apiClient.js';

/**
 * Render audit log page
 */
export async function renderAudit() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#auditContainer') || document.querySelector('main');
  if (!container) return;

  const logs = await auditLogRepository.findRecent(200);
  const sortedLogs = logs.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  container.innerHTML = `
    <div class="container pageWrap">
      <div style="margin-bottom: 24px;">
        <h1 class="h2">Audit Log</h1>
        <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
          Übersicht aller kritischen Aktionen im System.
        </p>
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${sortedLogs.length} ${sortedLogs.length === 1 ? 'Eintrag' : 'Einträge'}
      </div>

      ${sortedLogs.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📋</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Audit-Logs vorhanden</div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${sortedLogs.map(log => renderAuditLogItem(log)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render audit log item
 */
function renderAuditLogItem(log) {
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const actor = users.find(u => u.id === log.actorUserId);

  return `
    <div class="card pane" style="padding: 16px;">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 4px;">${log.actionType}</div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            ${actor?.name || 'Unbekannt'} • ${log.entityType}: ${log.entityId}
          </div>
        </div>
        <div style="color: var(--text-secondary); font-size: 12px;">
          ${new Date(log.createdAt).toLocaleString('de-DE')}
        </div>
      </div>
      ${log.metaJson && Object.keys(log.metaJson).length > 0 ? `
        <div style="margin-top: 12px; padding: 12px; background: var(--bg); border-radius: 6px; font-size: 13px; color: var(--text-secondary);">
          ${JSON.stringify(log.metaJson, null, 2)}
        </div>
      ` : ''}
    </div>
  `;
}


