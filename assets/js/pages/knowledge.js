/* Knowledge Page: Member view of knowledge base */

import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

let currentFilter = {
  search: '',
  tags: [],
  type: 'all'
};

/**
 * Render knowledge page
 */
export async function renderKnowledge() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  const container = document.querySelector('#knowledgeContainer') || document.querySelector('main');
  if (!container) return;

  const allItems = await knowledgeRepository.findPublished();
  const filteredItems = filterKnowledgeItems(allItems);
  const sortedItems = filteredItems.sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );

  const allTags = getAllTags(allItems);
  const collections = await getCollections(user.id);

  container.innerHTML = renderKnowledgePage(sortedItems, allTags, collections);
  wireKnowledgeEvents();
}

/**
 * Filter knowledge items
 */
function filterKnowledgeItems(items) {
  return items.filter(item => {
    if (currentFilter.search) {
      const searchLower = currentFilter.search.toLowerCase();
      const matchesSearch = 
        (item.title && item.title.toLowerCase().includes(searchLower)) ||
        (item.summary && item.summary.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (currentFilter.type !== 'all' && item.type !== currentFilter.type) {
      return false;
    }

    if (currentFilter.tags.length > 0) {
      const itemTags = item.tags || [];
      const hasTag = currentFilter.tags.some(tag => itemTags.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });
}

/**
 * Get all unique tags
 */
function getAllTags(items) {
  const tagSet = new Set();
  items.forEach(item => {
    (item.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Get collections for user
 */
async function getCollections(userId) {
  // Would come from collectionRepository
  return [];
}

/**
 * Render knowledge page
 */
function renderKnowledgePage(items, tags, collections) {
  return `
    <div class="container pageWrap">
      <div style="margin-bottom: 24px;">
        <h1 class="h2">Knowledge Base</h1>
        <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
          Zugriff auf alle veröffentlichten Wissensartikel und Ressourcen.
        </p>
      </div>

      <div class="card pane" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;">
          <div>
            <label class="label">Suche</label>
            <input class="input" id="knowledgeSearch" placeholder="Knowledge Base durchsuchen..." />
          </div>
          <div>
            <label class="label">Typ</label>
            <select class="input" id="knowledgeType">
              <option value="all">Alle Typen</option>
              <option value="article">Artikel</option>
              <option value="guide">Leitfaden</option>
              <option value="faq">FAQ</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
        </div>
        ${tags.length > 0 ? `
          <div style="margin-top: 16px;">
            <label class="label">Tags</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
              ${tags.map(tag => `
                <button class="btn small ${currentFilter.tags.includes(tag) ? 'primary' : ''}" 
                        data-tag="${tag}"
                        onclick="window.toggleKnowledgeTag('${tag}')">
                  ${tag}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      ${collections.length > 0 ? `
        <div class="card pane" style="margin-bottom: 24px;">
          <div style="font-weight: 600; margin-bottom: 12px;">Meine Sammlungen</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${collections.map(collection => `
              <button class="btn small" onclick="window.viewCollection('${collection.id}')">
                ${collection.title}
              </button>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${items.length} ${items.length === 1 ? 'Artikel' : 'Artikel'} gefunden
      </div>

      ${items.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📖</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Artikel gefunden</div>
          <div style="color: var(--text-secondary);">
            Es gibt keine Artikel, die den aktuellen Filtern entsprechen.
          </div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${items.map(item => renderKnowledgeItem(item)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render knowledge item
 */
function renderKnowledgeItem(item) {
  return `
    <div class="card pane" style="cursor: pointer;" onclick="window.viewKnowledgeItem('${item.id}')">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">
            ${item.title || 'Unbenannt'}
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
            ${item.summary || ''}
          </div>
          <div style="display: flex; gap: 8px; align-items: center;">
            <span class="badge" style="background: var(--primary); color: white; font-size: 11px;">
              ${item.type || 'article'}
            </span>
            ${(item.tags || []).map(tag => `
              <span class="badge" style="font-size: 11px;">${tag}</span>
            `).join('')}
          </div>
        </div>
      </div>
      ${(item.links || []).length > 0 ? `
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);">
          <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Links:</div>
          ${item.links.map(link => `
            <a href="${link.url}" target="_blank" rel="noopener" 
               style="color: var(--primary); text-decoration: underline; margin-right: 12px; font-size: 12px;">
              ${link.title || link.url}
            </a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Wire knowledge events
 */
function wireKnowledgeEvents() {
  const searchInput = document.querySelector('#knowledgeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value;
      renderKnowledge();
    });
  }

  const typeSelect = document.querySelector('#knowledgeType');
  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentFilter.type = e.target.value;
      renderKnowledge();
    });
  }

  window.toggleKnowledgeTag = (tag) => {
    const index = currentFilter.tags.indexOf(tag);
    if (index > -1) {
      currentFilter.tags.splice(index, 1);
    } else {
      currentFilter.tags.push(tag);
    }
    renderKnowledge();
  };

  window.viewKnowledgeItem = async (itemId) => {
    // Show knowledge item in modal
    try {
      const item = await knowledgeRepository.findById(itemId);
      if (!item) {
        toast.error('Artikel nicht gefunden');
        return;
      }
      
      showKnowledgeDetailModal(item);
    } catch (error) {
      console.error('Error loading knowledge item:', error);
      toast.error('Fehler beim Laden des Artikels');
    }
  };

  window.viewCollection = (collectionId) => {
    // Would show collection items
    toast.info('Sammlung wird geladen...');
  };
}

/**
 * Show knowledge detail modal
 */
function showKnowledgeDetailModal(item) {
  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
      <div class="modalHeader">
        <div class="modalTitle">${item.title || 'Unbenannt'}</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()">✕</button>
      </div>
      <div class="modalBody">
        ${item.type ? `
          <span class="badge" style="background: var(--primary); color: white; margin-bottom: 16px; display: inline-block;">
            ${item.type}
          </span>
        ` : ''}
        
        ${item.summary ? `
          <div style="font-size: 16px; color: var(--text-secondary); margin-bottom: 24px; line-height: 1.6;">
            ${item.summary}
          </div>
        ` : ''}
        
        ${item.content ? `
          <div style="line-height: 1.8; margin-bottom: 24px;">
            ${item.content.replace(/\n/g, '<br>')}
          </div>
        ` : ''}
        
        ${(item.tags || []).length > 0 ? `
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">
            <div style="font-weight: 600; margin-bottom: 12px;">Tags</div>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              ${item.tags.map(tag => `
                <span class="badge">${tag}</span>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${(item.links || []).length > 0 ? `
          <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border);">
            <div style="font-weight: 600; margin-bottom: 12px;">Weiterführende Links</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${item.links.map(link => `
                <a href="${link.url}" target="_blank" rel="noopener" 
                   style="color: var(--primary); text-decoration: none; display: flex; align-items: center; gap: 8px;">
                  <span>🔗</span>
                  <span style="text-decoration: underline;">${link.title || link.url}</span>
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--text-secondary);">
          Zuletzt aktualisiert: ${new Date(item.updatedAt || item.createdAt).toLocaleDateString('de-DE')}
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Close on Escape key
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}