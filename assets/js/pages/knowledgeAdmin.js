/* Knowledge Admin Page: Backoffice knowledge management */

import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { logPublishAction } from '../services/auditLogger.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

/**
 * Render knowledge admin page
 */
export async function renderKnowledgeAdmin() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#knowledgeAdminContainer') || document.querySelector('main');
  if (!container) return;

  const allItems = await knowledgeRepository.findAll();
  const sortedItems = allItems.sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );

  container.innerHTML = renderAdminPage(sortedItems);
  wireAdminEvents();
}

/**
 * Render admin page
 */
function renderAdminPage(items) {
  const statusCounts = {
    draft: items.filter(i => i.status === 'draft').length,
    reviewed: items.filter(i => i.status === 'reviewed').length,
    published: items.filter(i => i.status === 'published').length
  };

  return `
    <div class="container pageWrap">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="h2">Knowledge Management</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Verwalten Sie alle Wissensartikel.
          </p>
        </div>
        <button class="btn primary" id="createKnowledgeBtn">+ Neuer Artikel</button>
      </div>

      <div class="card pane" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
          <div>
            <div style="font-size: 32px; font-weight: 600; color: var(--text-secondary);">${statusCounts.draft}</div>
            <div style="color: var(--text-secondary);">Entwürfe</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: 600; color: var(--accent);">${statusCounts.reviewed}</div>
            <div style="color: var(--text-secondary);">Zur Review</div>
          </div>
          <div>
            <div style="font-size: 32px; font-weight: 600; color: var(--success);">${statusCounts.published}</div>
            <div style="color: var(--text-secondary);">Veröffentlicht</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${items.length} ${items.length === 1 ? 'Artikel' : 'Artikel'}
      </div>

      ${items.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📖</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Artikel vorhanden</div>
          <div style="color: var(--text-secondary); margin-bottom: 24px;">
            Erstellen Sie Ihren ersten Artikel.
          </div>
          <button class="btn primary" id="createKnowledgeBtnEmpty">+ Ersten Artikel erstellen</button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${items.map(item => renderKnowledgeAdminCard(item)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render knowledge admin card
 */
function renderKnowledgeAdminCard(item) {
  const statusColors = {
    draft: 'var(--text-secondary)',
    reviewed: 'var(--accent)',
    published: 'var(--success)'
  };

  const statusLabels = {
    draft: 'Entwurf',
    reviewed: 'Zur Review',
    published: 'Veröffentlicht'
  };

  return `
    <div class="card pane">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <div style="font-weight: 600; font-size: 18px;">
              ${item.title || 'Unbenannt'}
            </div>
            <span class="badge" style="background: ${statusColors[item.status]}; color: white; font-size: 11px;">
              ${statusLabels[item.status]}
            </span>
            <span class="badge" style="font-size: 11px;">${item.type || 'article'}</span>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">
            ${item.summary || ''}
          </div>
          ${(item.tags || []).length > 0 ? `
            <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;">
              ${item.tags.map(tag => `
                <span class="badge" style="font-size: 11px;">${tag}</span>
              `).join('')}
            </div>
          ` : ''}
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn small" onclick="window.editKnowledgeItem('${item.id}')">Bearbeiten</button>
          ${item.status === 'draft' ? `
            <button class="btn small" onclick="window.reviewKnowledgeItem('${item.id}')">Zur Review</button>
          ` : ''}
          ${item.status === 'reviewed' ? `
            <button class="btn small primary" onclick="window.publishKnowledgeItem('${item.id}')">Veröffentlichen</button>
          ` : ''}
          <button class="btn small danger" onclick="window.deleteKnowledgeItem('${item.id}')">Löschen</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wire admin events
 */
function wireAdminEvents() {
  document.querySelectorAll('#createKnowledgeBtn, #createKnowledgeBtnEmpty').forEach(btn => {
    btn.addEventListener('click', () => {
      showKnowledgeModal();
    });
  });

  window.editKnowledgeItem = (itemId) => {
    showKnowledgeModal(itemId);
  };

  window.reviewKnowledgeItem = async (itemId) => {
    const user = api.me();
    try {
      await knowledgeRepository.update(itemId, {
        status: 'reviewed',
        reviewedByUserId: user.id,
        updatedAt: new Date().toISOString()
      });
      const { showSuccessModal } = await import('../components/successModal.js');
      showSuccessModal('Der Artikel wurde erfolgreich zur Review gesetzt.', 'Zur Review gesetzt');
      setTimeout(() => renderKnowledgeAdmin(), 1500);
    } catch (error) {
      console.error('Error reviewing item:', error);
      toast.error('Fehler beim Setzen des Status');
    }
  };

  window.publishKnowledgeItem = async (itemId) => {
    const user = api.me();
    try {
      await knowledgeRepository.update(itemId, {
        status: 'published',
        reviewedByUserId: user.id,
        updatedAt: new Date().toISOString()
      });

      // Log audit event
      await logPublishAction('knowledge', itemId);

      const { showSuccessModal } = await import('../components/successModal.js');
      showSuccessModal('Der Artikel wurde erfolgreich veröffentlicht.', 'Artikel veröffentlicht');
      setTimeout(() => renderKnowledgeAdmin(), 1500);
    } catch (error) {
      console.error('Error publishing item:', error);
      toast.error('Fehler beim Veröffentlichen');
    }
  };

  window.deleteKnowledgeItem = async (itemId) => {
    const { confirmModal } = await import('../components/confirmModal.js');
    const confirmed = await confirmModal.show(
      'Möchten Sie diesen Artikel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      'Artikel löschen',
      'Löschen',
      'Abbrechen'
    );
    
    if (!confirmed) return;

    try {
      await knowledgeRepository.delete(itemId);
      const { showSuccessModal } = await import('../components/successModal.js');
      showSuccessModal('Der Artikel wurde erfolgreich gelöscht.', 'Artikel gelöscht');
      setTimeout(() => renderKnowledgeAdmin(), 1500);
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Fehler beim Löschen');
    }
  };
}

/**
 * Show knowledge modal
 */
async function showKnowledgeModal(itemId = null) {
  const item = itemId ? await knowledgeRepository.findById(itemId) : null;

  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.innerHTML = `
    <div class="modal" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">
      <div class="modalHeader">
        <div class="modalTitle">${item ? 'Artikel bearbeiten' : 'Neuer Artikel'}</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()">✕</button>
      </div>
      <div class="modalBody">
        <label class="label">Titel *</label>
        <input class="input" id="knowledgeTitle" value="${item?.title || ''}" />
        
        <label class="label" style="margin-top: 16px;">Zusammenfassung</label>
        <textarea class="textarea" id="knowledgeSummary" rows="3">${item?.summary || ''}</textarea>
        
        <label class="label" style="margin-top: 16px;">Typ</label>
        <select class="input" id="knowledgeType">
          <option value="article" ${item?.type === 'article' ? 'selected' : ''}>Artikel</option>
          <option value="guide" ${item?.type === 'guide' ? 'selected' : ''}>Leitfaden</option>
          <option value="faq" ${item?.type === 'faq' ? 'selected' : ''}>FAQ</option>
          <option value="tutorial" ${item?.type === 'tutorial' ? 'selected' : ''}>Tutorial</option>
        </select>
        
        <label class="label" style="margin-top: 16px;">Tags (Komma-getrennt)</label>
        <input class="input" id="knowledgeTags" value="${(item?.tags || []).join(', ')}" />
        
        <label class="label" style="margin-top: 16px;">Links (JSON Array, optional)</label>
        <textarea class="textarea" id="knowledgeLinks" rows="4" placeholder='[{"title":"Link Titel","url":"https://..."}]'>${JSON.stringify(item?.links || [], null, 2)}</textarea>
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn" onclick="this.closest('.modalOverlay').remove()" style="flex: 1;">Abbrechen</button>
          <button class="btn primary" id="saveKnowledgeBtn" style="flex: 1;">Speichern</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#saveKnowledgeBtn').addEventListener('click', async () => {
    const user = api.me();
    const title = modal.querySelector('#knowledgeTitle').value.trim();
    if (!title) {
      toast.error('Titel ist erforderlich');
      return;
    }

    const tags = modal.querySelector('#knowledgeTags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    let links = [];
    try {
      const linksText = modal.querySelector('#knowledgeLinks').value.trim();
      if (linksText) {
        links = JSON.parse(linksText);
      }
    } catch (e) {
      toast.error('Ungültiges JSON-Format für Links');
      return;
    }

    const data = {
      title,
      summary: modal.querySelector('#knowledgeSummary').value.trim(),
      type: modal.querySelector('#knowledgeType').value,
      tags,
      links,
      status: item?.status || 'draft',
      createdByUserId: item?.createdByUserId || user.id,
      updatedAt: new Date().toISOString()
    };

    try {
      if (item) {
        await knowledgeRepository.update(itemId, data);
        const { showSuccessModal } = await import('../components/successModal.js');
        showSuccessModal('Der Artikel wurde erfolgreich aktualisiert.', 'Artikel aktualisiert');
      } else {
        await knowledgeRepository.create(data);
        const { showSuccessModal } = await import('../components/successModal.js');
        showSuccessModal('Der Artikel wurde erfolgreich erstellt.', 'Artikel erstellt');
      }
      modal.remove();
      setTimeout(() => renderKnowledgeAdmin(), 1500);
    } catch (error) {
      console.error('Error saving knowledge item:', error);
      toast.error('Fehler beim Speichern');
    }
  });
}


