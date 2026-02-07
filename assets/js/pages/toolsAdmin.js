/* Tools Admin Page: Backoffice tool management */

import { toolRepository } from '../services/repositories/toolRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { getIcon } from '../components/icons.js';

let tools = [];
let draggedElement = null;

/**
 * Get tool icon preview
 */
function getToolIconPreview(toolKey) {
  const key = (toolKey || '').toLowerCase();
  const icons = {
    onedrive: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0078D4 0%, #005A9E 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 120, 212, 0.3);">OD</div>`,
    miro: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #FFD02F 0%, #FFC107 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #050038; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(255, 208, 47, 0.3);">M</div>`,
    notion: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);">N</div>`,
    canva: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #00C4CC 0%, #00A8B0 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 196, 204, 0.3);">C</div>`,
    github: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #181717 0%, #24292e 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(24, 23, 23, 0.3);">GH</div>`,
    linkedin: `<div style="width: 48px; height: 48px; background: linear-gradient(135deg, #0077B5 0%, #005885 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px; box-shadow: 0 2px 8px rgba(0, 119, 181, 0.3);">in</div>`
  };
  return icons[key] || `<div style="width: 48px; height: 48px; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-primary);">${key[0]?.toUpperCase() || '?'}</div>`;
}

/**
 * Render tools admin page
 */
export async function renderToolsAdmin() {
  const user = api.me();
  if (!user || !api.hasAnyRole(['admin', 'editor', 'moderator'])) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#resourcesAdminContainer') || document.querySelector('main');
  if (!container) return;

  try {
    tools = await toolRepository.findAll();
    tools.sort((a, b) => (a.order || 0) - (b.order || 0));

    container.innerHTML = renderAdminPage();
    wireAdminEvents();
  } catch (error) {
    console.error('Error loading tools:', error);
    container.innerHTML = `
      <div class="card pane" style="text-align: center; padding: 48px 24px;">
        <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">⚠️</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Fehler beim Laden</div>
        <div style="color: var(--text-secondary); margin-bottom: 24px;">
          Die Tools konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
        </div>
        <button class="btn primary" onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }
}

/**
 * Render admin page
 */
function renderAdminPage() {
  return `
    <div style="max-width: 1400px; margin: 0 auto; padding: 2rem 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
        <div>
          <h1 class="h2">Ressourcen & Tools</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Verwalten Sie die Tool Cards für den Tool Hub.
          </p>
        </div>
      </div>

      <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 2rem;">
        <p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
          💡 <strong>Hinweis:</strong> Tool-Namen und Icons sind vordefiniert. Sie können Beschreibungen, URLs und die Reihenfolge ändern.
        </p>
      </div>

      ${tools.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">🔧</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Tools vorhanden</div>
          <div style="color: var(--text-secondary);">
            Die Seed-Daten werden beim ersten Laden automatisch erstellt.
          </div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 1rem;" id="toolsList">
          ${tools.map((tool, index) => renderToolAdminCard(tool, index)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render tool admin card
 */
function renderToolAdminCard(tool, index) {
  const iconKey = tool.key || '';
  const isVisible = tool.visibility === 'member' || tool.visibility === 'public';
  
  return `
    <div class="tool-admin-card" 
         data-tool-id="${tool.id}"
         draggable="true"
         style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; cursor: move;">
      <div style="display: flex; gap: 1rem; align-items: flex-start;">
        <div style="flex-shrink: 0; padding-top: 0.25rem; cursor: grab; color: var(--text-secondary); user-select: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="12" r="1"></circle>
            <circle cx="9" cy="5" r="1"></circle>
            <circle cx="9" cy="19" r="1"></circle>
            <circle cx="15" cy="12" r="1"></circle>
            <circle cx="15" cy="5" r="1"></circle>
            <circle cx="15" cy="19" r="1"></circle>
          </svg>
        </div>
        
        <div style="flex: 1;">
          <div style="display: flex; gap: 1rem; align-items: flex-start; margin-bottom: 1rem;">
            <div style="flex-shrink: 0;">
              ${getToolIconPreview(iconKey)}
            </div>
            
            <div style="flex: 1;">
              <div style="display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.5rem;">
                <h3 style="font-size: 1.125rem; font-weight: 600; margin: 0; color: var(--text-primary);">${escapeHtml(tool.name)}</h3>
                <span style="font-size: 0.75rem; color: var(--text-secondary);">(${iconKey})</span>
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label class="label" style="font-size: 0.875rem; margin-bottom: 0.25rem;">Beschreibung</label>
                <textarea 
                  class="input" 
                  data-field="description"
                  data-tool-id="${tool.id}"
                  rows="3"
                  style="width: 100%; font-size: 0.875rem; resize: vertical;"
                >${escapeHtml(tool.description || '')}</textarea>
              </div>
              
              <div style="margin-bottom: 1rem;">
                <label class="label" style="font-size: 0.875rem; margin-bottom: 0.25rem;">URL</label>
                <input 
                  class="input" 
                  type="url"
                  data-field="url"
                  data-tool-id="${tool.id}"
                  value="${escapeHtml(tool.url || '')}"
                  placeholder="https://..."
                  style="width: 100%; font-size: 0.875rem;"
                />
              </div>
              
              <div style="display: flex; gap: 1rem; align-items: center;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input 
                    type="checkbox"
                    data-field="visibility"
                    data-tool-id="${tool.id}"
                    ${isVisible ? 'checked' : ''}
                  />
                  <span style="font-size: 0.875rem;">Sichtbar</span>
                </label>
                
                <span style="color: var(--text-secondary); font-size: 0.75rem;">Reihenfolge: ${index + 1}</span>
              </div>
            </div>
            
            <div style="flex-shrink: 0;">
              <button 
                class="btn secondary small" 
                data-action="save"
                data-tool-id="${tool.id}"
                style="margin-bottom: 0.5rem;"
              >
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Wire admin events
 */
function wireAdminEvents() {
  // Save buttons
  document.querySelectorAll('[data-action="save"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const toolId = btn.dataset.toolId;
      await saveTool(toolId);
    });
  });

  // Auto-save on blur for inputs
  document.querySelectorAll('[data-field][data-tool-id]').forEach(input => {
    input.addEventListener('blur', async () => {
      const toolId = input.dataset.toolId;
      await saveTool(toolId);
    });
  });

  // Drag and drop for reordering
  const toolsList = document.getElementById('toolsList');
  if (toolsList) {
    toolsList.addEventListener('dragstart', (e) => {
      if (e.target.closest('.tool-admin-card')) {
        draggedElement = e.target.closest('.tool-admin-card');
        draggedElement.style.opacity = '0.5';
      }
    });

    toolsList.addEventListener('dragend', (e) => {
      if (draggedElement) {
        draggedElement.style.opacity = '1';
        draggedElement = null;
      }
    });

    toolsList.addEventListener('dragover', (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(toolsList, e.clientY);
      const dragging = document.querySelector('.tool-admin-card[draggable="true"]');
      if (dragging && afterElement == null) {
        toolsList.appendChild(dragging);
      } else if (dragging && afterElement) {
        toolsList.insertBefore(dragging, afterElement);
      }
    });

    toolsList.addEventListener('drop', async (e) => {
      e.preventDefault();
      if (draggedElement) {
        await updateToolOrder();
        draggedElement = null;
      }
    });
  }
}

/**
 * Get drag after element
 */
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.tool-admin-card:not([style*="opacity: 0.5"])')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/**
 * Update tool order based on DOM position
 */
async function updateToolOrder() {
  const cards = document.querySelectorAll('.tool-admin-card');
  const orderUpdates = Array.from(cards).map((card, index) => ({
    id: card.dataset.toolId,
    order: index
  }));

  try {
    const result = await toolRepository.updateOrder(orderUpdates);
    if (result.success) {
      toast.success('Reihenfolge gespeichert');
      // Reload to reflect changes
      await renderToolsAdmin();
    } else {
      toast.error('Fehler beim Speichern der Reihenfolge');
    }
  } catch (error) {
    console.error('Error updating tool order:', error);
    toast.error('Fehler beim Speichern der Reihenfolge');
  }
}

/**
 * Save tool
 */
async function saveTool(toolId) {
  const tool = tools.find(t => t.id === toolId);
  if (!tool) return;

  const descriptionInput = document.querySelector(`[data-field="description"][data-tool-id="${toolId}"]`);
  const urlInput = document.querySelector(`[data-field="url"][data-tool-id="${toolId}"]`);
  const visibilityInput = document.querySelector(`[data-field="visibility"][data-tool-id="${toolId}"]`);

  const updates = {
    description: descriptionInput?.value || '',
    url: urlInput?.value || '',
    visibility: visibilityInput?.checked ? 'member' : 'hidden'
  };

  try {
    const result = await toolRepository.update(toolId, updates);
    if (result.success) {
      toast.success(`${tool.name} gespeichert`);
      // Update local state
      Object.assign(tool, updates);
    } else {
      toast.error('Fehler beim Speichern');
    }
  } catch (error) {
    console.error('Error saving tool:', error);
    toast.error('Fehler beim Speichern');
  }
}
