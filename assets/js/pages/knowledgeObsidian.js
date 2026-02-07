/* Knowledge Obsidian: Obsidian-inspired Knowledge Management System */

import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { getIcon } from '../components/icons.js';

// Oberkategorien (Ebene 0)
const OBERKATEGORIEN = [
  { id: 'bim-digital', label: 'BIM & Digitales Planen', icon: '📐' },
  { id: 'ki', label: 'Künstliche Intelligenz', icon: '🤖' },
  { id: 'prozesse', label: 'Prozesse & Organisation', icon: '⚙️' },
  { id: 'standards', label: 'Standards & Richtlinien', icon: '📋' },
  { id: 'tools-methoden', label: 'Tools & Methoden', icon: '🔧' },
  { id: 'community', label: 'Community & Netzwerk', icon: '🌐' }
];

// Types für Knowledge Items
const KNOWLEDGE_TYPES = [
  { id: 'method', label: 'Methode' },
  { id: 'tool', label: 'Tool' },
  { id: 'standard', label: 'Standard' },
  { id: 'concept', label: 'Konzept' },
  { id: 'prompt', label: 'Prompt' }
];

let state = {
  activeOberkategorie: null,
  activeItem: null,
  searchQuery: '',
  items: [],
  filteredItems: [],
  topics: []
};

/**
 * Initialize Knowledge Obsidian
 */
export async function init() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  await loadData();
  render();
}

/**
 * Load all knowledge data
 */
async function loadData() {
  try {
    state.items = await knowledgeRepository.findPublished();
    
    // Extract unique topics from all items
    const topicSet = new Set();
    state.items.forEach(item => {
      (item.topics || []).forEach(topic => topicSet.add(topic));
    });
    state.topics = Array.from(topicSet).sort();
    
    // Set default active Oberkategorie to first one
    if (!state.activeOberkategorie && OBERKATEGORIEN.length > 0) {
      state.activeOberkategorie = OBERKATEGORIEN[0].id;
    }
    
    applyFilters();
  } catch (error) {
    console.error('Error loading knowledge data:', error);
    toast.error('Fehler beim Laden der Daten');
  }
}

/**
 * Apply filters based on active Oberkategorie and search
 */
function applyFilters() {
  let filtered = [...state.items];
  
  // Filter by Oberkategorie
  if (state.activeOberkategorie) {
    filtered = filtered.filter(item => item.oberkategorie === state.activeOberkategorie);
  }
  
  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(item =>
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query)) ||
      (item.body && item.body.toLowerCase().includes(query)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // Sort by updated date
  filtered.sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB - dateA;
  });
  
  state.filteredItems = filtered;
}

/**
 * Get topics for active Oberkategorie
 */
function getTopicsForOberkategorie() {
  if (!state.activeOberkategorie) return [];
  
  const itemsInCategory = state.items.filter(item => item.oberkategorie === state.activeOberkategorie);
  const topicSet = new Set();
  itemsInCategory.forEach(item => {
    (item.topics || []).forEach(topic => topicSet.add(topic));
  });
  return Array.from(topicSet).sort();
}

/**
 * Format topic for display (remove "topic_" prefix, format nicely)
 */
function formatTopicForDisplay(topic) {
  if (!topic) return '';
  const displayTopic = topic.replace(/^topic_/, '').replace(/_/g, ' ');
  return displayTopic.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

/**
 * Format date for display
 */
function formatDate(dateString) {
  if (!dateString) return 'Unbekannt';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
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
 * Render complete 3-panel layout
 */
function render() {
  const container = document.querySelector('#knowledgeContainer') || document.querySelector('main');
  if (!container) return;
  
  container.innerHTML = `
    <div class="knowledge-obsidian">
      <!-- LEFT PANEL: Sidebar -->
      <aside class="knowledge-sidebar">
        <div class="knowledge-sidebar-header">
          <div class="knowledge-section-header">Wissensdatenbank</div>
          <div class="knowledge-search-wrapper">
            <input 
              type="text" 
              class="knowledge-search-input" 
              id="knowledgeSearch"
              placeholder="Q Search"
              value="${escapeHtml(state.searchQuery)}"
            />
          </div>
        </div>
        
        <div class="knowledge-divider"></div>
        
        <nav class="knowledge-nav">
          <div class="knowledge-nav-section">
            <div class="knowledge-nav-subtitle">Wissensbereiche</div>
            ${OBERKATEGORIEN.map(ok => `
              <button 
                class="knowledge-nav-item knowledge-nav-area ${state.activeOberkategorie === ok.id ? 'active' : ''}"
                data-oberkategorie="${ok.id}"
                aria-label="${ok.label}"
              >
                <span class="knowledge-nav-icon-small">${ok.icon}</span>
                <span class="knowledge-nav-label">${escapeHtml(ok.label)}</span>
              </button>
            `).join('')}
          </div>
          
          ${state.activeOberkategorie ? `
            <div class="knowledge-nav-section">
              <div class="knowledge-nav-subtitle">Filter</div>
              <div class="knowledge-nav-filter-label">Topics</div>
              ${getTopicsForOberkategorie().map(topic => {
                // Remove "topic_" prefix and format nicely
                const displayTopic = topic.replace(/^topic_/, '').replace(/_/g, ' ');
                const formattedTopic = displayTopic.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                return `
                  <button 
                    class="knowledge-nav-item knowledge-nav-topic"
                    data-topic="${topic}"
                  >
                    <span class="knowledge-nav-label">${escapeHtml(formattedTopic)}</span>
                  </button>
                `;
              }).join('')}
            </div>
          ` : ''}
        </nav>
      </aside>
      
      <!-- CENTER PANEL: Table -->
      <main class="knowledge-center">
        <div class="knowledge-center-header">
          <div class="knowledge-center-title">
            ${getIcon('book-open', 20)}
            <span>Themen</span>
          </div>
          <div class="knowledge-center-actions">
            <button class="btn secondary small" id="knowledgeFilterBtn">
              ${getIcon('filter', 16)} Filter
            </button>
            <button class="btn secondary small" id="knowledgeSortBtn">
              ${getIcon('arrow-up-down', 16)} Sortieren
            </button>
            <button class="btn primary small" id="knowledgeNewBtn">
              + Neuer Eintrag
            </button>
          </div>
        </div>
        
        <div class="knowledge-table-wrapper">
          <table class="knowledge-table">
            <thead>
              <tr>
                <th>Titel</th>
                <th>Typ</th>
                <th>Themen</th>
                <th>Quelle</th>
                <th>Aktualisiert</th>
              </tr>
            </thead>
            <tbody>
              ${state.filteredItems.length === 0 ? `
                <tr>
                  <td colspan="5" class="knowledge-table-empty">
                    <div>${getIcon('book-open', 48)}</div>
                    <p>Keine Einträge gefunden</p>
                  </td>
                </tr>
              ` : state.filteredItems.map(item => `
                <tr 
                  class="knowledge-table-row ${state.activeItem?.id === item.id ? 'active' : ''}"
                  data-item-id="${item.id}"
                >
                  <td class="knowledge-table-title">
                    <strong>${escapeHtml(item.title || 'Ohne Titel')}</strong>
                  </td>
                  <td class="knowledge-table-type">
                    <span class="knowledge-badge">${getTypeLabel(item.type)}</span>
                  </td>
                  <td class="knowledge-table-topics">
                    ${(item.topics || []).slice(0, 2).map(topic => 
                      `<span class="knowledge-chip">${escapeHtml(formatTopicForDisplay(topic))}</span>`
                    ).join('')}
                    ${(item.topics || []).length > 2 ? `<span class="knowledge-chip-more">+${(item.topics || []).length - 2}</span>` : ''}
                  </td>
                  <td class="knowledge-table-source">
                    ${escapeHtml(item.createdBy || '…undbauen')}
                  </td>
                  <td class="knowledge-table-updated">
                    ${formatDate(item.updatedAt || item.createdAt)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </main>
      
      <!-- RIGHT PANEL: Editor -->
      <aside class="knowledge-editor">
        ${state.activeItem ? renderEditor(state.activeItem) : renderEmptyEditor()}
      </aside>
    </div>
  `;
  
  wireEvents();
}

/**
 * Get type label
 */
function getTypeLabel(type) {
  const typeObj = KNOWLEDGE_TYPES.find(t => t.id === type);
  return typeObj ? typeObj.label : type || 'Unbekannt';
}

/**
 * Render empty editor (new entry mode)
 */
function renderEmptyEditor() {
  return `
    <div class="knowledge-editor-content">
      <div class="knowledge-editor-header">
        <h2 class="knowledge-editor-title">Neuer Wissenseintrag</h2>
      </div>
      
      <div class="knowledge-editor-form">
        <div class="knowledge-editor-field">
          <label class="label">Titel *</label>
          <input 
            type="text" 
            class="input" 
            id="editorTitle"
            placeholder="Titel des Eintrags"
          />
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Oberkategorie *</label>
          <select class="input" id="editorOberkategorie">
            <option value="">Bitte wählen...</option>
            ${OBERKATEGORIEN.map(ok => `
              <option value="${ok.id}" ${state.activeOberkategorie === ok.id ? 'selected' : ''}>
                ${escapeHtml(ok.label)}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Typ *</label>
          <select class="input" id="editorType">
            <option value="">Bitte wählen...</option>
            ${KNOWLEDGE_TYPES.map(t => `
              <option value="${t.id}">${escapeHtml(t.label)}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Inhalt</label>
          <textarea 
            class="input knowledge-editor-textarea" 
            id="editorBody"
            rows="15"
            placeholder="Schreibe hier deinen Inhalt...&#10;&#10;Du kannst @ verwenden, um andere Einträge zu verlinken."
          ></textarea>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Topics</label>
          <div class="knowledge-editor-chips" id="editorTopics">
            <!-- Topics will be added here -->
          </div>
          <input 
            type="text" 
            class="input" 
            id="editorTopicInput"
            placeholder="Topic hinzufügen..."
          />
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Tags</label>
          <div class="knowledge-editor-chips" id="editorTags">
            <!-- Tags will be added here -->
          </div>
          <input 
            type="text" 
            class="input" 
            id="editorTagInput"
            placeholder="Tag hinzufügen..."
          />
        </div>
        
        <div class="knowledge-editor-actions">
          <button class="btn secondary" id="editorCancelBtn">Abbrechen</button>
          <button class="btn primary" id="editorSaveBtn">Veröffentlichen</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render editor with item data
 */
function renderEditor(item) {
  const topics = item.topics || [];
  const tags = item.tags || [];
  
  return `
    <div class="knowledge-editor-content">
      <div class="knowledge-editor-header">
        <h2 class="knowledge-editor-title">${escapeHtml(item.title || 'Ohne Titel')}</h2>
        <button class="btn secondary small" id="editorCloseBtn">✕</button>
      </div>
      
      <div class="knowledge-editor-form">
        <div class="knowledge-editor-field">
          <label class="label">Titel *</label>
          <input 
            type="text" 
            class="input" 
            id="editorTitle"
            value="${escapeHtml(item.title || '')}"
          />
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Oberkategorie *</label>
          <select class="input" id="editorOberkategorie">
            <option value="">Bitte wählen...</option>
            ${OBERKATEGORIEN.map(ok => `
              <option value="${ok.id}" ${item.oberkategorie === ok.id ? 'selected' : ''}>
                ${escapeHtml(ok.label)}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Typ *</label>
          <select class="input" id="editorType">
            <option value="">Bitte wählen...</option>
            ${KNOWLEDGE_TYPES.map(t => `
              <option value="${t.id}" ${item.type === t.id ? 'selected' : ''}>
                ${escapeHtml(t.label)}
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Inhalt</label>
          <textarea 
            class="input knowledge-editor-textarea" 
            id="editorBody"
            rows="15"
            placeholder="Schreibe hier deinen Inhalt..."
          >${escapeHtml(item.body || '')}</textarea>
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Topics</label>
          <div class="knowledge-editor-chips" id="editorTopics">
            ${topics.map(topic => `
              <span class="knowledge-chip">
                ${escapeHtml(topic)}
                <button class="knowledge-chip-remove" data-topic="${topic}">×</button>
              </span>
            `).join('')}
          </div>
          <input 
            type="text" 
            class="input" 
            id="editorTopicInput"
            placeholder="Topic hinzufügen..."
          />
        </div>
        
        <div class="knowledge-editor-field">
          <label class="label">Tags</label>
          <div class="knowledge-editor-chips" id="editorTags">
            ${tags.map(tag => `
              <span class="knowledge-chip">
                ${escapeHtml(tag)}
                <button class="knowledge-chip-remove" data-tag="${tag}">×</button>
              </span>
            `).join('')}
          </div>
          <input 
            type="text" 
            class="input" 
            id="editorTagInput"
            placeholder="Tag hinzufügen..."
          />
        </div>
        
        <div class="knowledge-editor-actions">
          <button class="btn secondary" id="editorCancelBtn">Abbrechen</button>
          <button class="btn primary" id="editorSaveBtn">Speichern</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wire all event listeners
 */
function wireEvents() {
  // Oberkategorie navigation
  document.querySelectorAll('[data-oberkategorie]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeOberkategorie = btn.dataset.oberkategorie;
      state.activeItem = null; // Close editor when switching category
      applyFilters();
      render();
    });
  });
  
  // Search input
  const searchInput = document.getElementById('knowledgeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      applyFilters();
      render();
    });
  }
  
  // Table row clicks
  document.querySelectorAll('.knowledge-table-row[data-item-id]').forEach(row => {
    row.addEventListener('click', async () => {
      const itemId = row.dataset.itemId;
      const item = state.items.find(i => i.id === itemId);
      if (item) {
        state.activeItem = item;
        render();
      }
    });
  });
  
  // New entry button
  const newBtn = document.getElementById('knowledgeNewBtn');
  if (newBtn) {
    newBtn.addEventListener('click', () => {
      state.activeItem = null;
      render();
    });
  }
  
  // Editor close button
  const closeBtn = document.getElementById('editorCloseBtn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      state.activeItem = null;
      render();
    });
  }
  
  // Topic input
  const topicInput = document.getElementById('editorTopicInput');
  if (topicInput) {
    topicInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        addTopic(e.target.value.trim());
        e.target.value = '';
      }
    });
  }
  
  // Tag input
  const tagInput = document.getElementById('editorTagInput');
  if (tagInput) {
    tagInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        e.preventDefault();
        addTag(e.target.value.trim());
        e.target.value = '';
      }
    });
  }
  
  // Chip remove buttons
  document.querySelectorAll('.knowledge-chip-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.dataset.topic) {
        removeTopic(btn.dataset.topic);
      } else if (btn.dataset.tag) {
        removeTag(btn.dataset.tag);
      }
    });
  });
  
  // Save button
  const saveBtn = document.getElementById('editorSaveBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveItem();
    });
  }
  
  // Cancel button
  const cancelBtn = document.getElementById('editorCancelBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      state.activeItem = null;
      render();
    });
  }
}

/**
 * Add topic to editor
 */
function addTopic(topic) {
  if (!state.activeItem) {
    // For new items, we'd need to track state differently
    // For now, just re-render to show the chip
    render();
    return;
  }
  
  if (!state.activeItem.topics) {
    state.activeItem.topics = [];
  }
  if (!state.activeItem.topics.includes(topic)) {
    state.activeItem.topics.push(topic);
    render();
  }
}

/**
 * Remove topic from editor
 */
function removeTopic(topic) {
  if (!state.activeItem) return;
  
  if (state.activeItem.topics) {
    state.activeItem.topics = state.activeItem.topics.filter(t => t !== topic);
    render();
  }
}

/**
 * Add tag to editor
 */
function addTag(tag) {
  if (!state.activeItem) {
    render();
    return;
  }
  
  if (!state.activeItem.tags) {
    state.activeItem.tags = [];
  }
  if (!state.activeItem.tags.includes(tag)) {
    state.activeItem.tags.push(tag);
    render();
  }
}

/**
 * Remove tag from editor
 */
function removeTag(tag) {
  if (!state.activeItem) return;
  
  if (state.activeItem.tags) {
    state.activeItem.tags = state.activeItem.tags.filter(t => t !== tag);
    render();
  }
}

/**
 * Save knowledge item
 */
async function saveItem() {
  const titleInput = document.getElementById('editorTitle');
  const oberkategorieSelect = document.getElementById('editorOberkategorie');
  const typeSelect = document.getElementById('editorType');
  const bodyTextarea = document.getElementById('editorBody');
  
  if (!titleInput || !oberkategorieSelect || !typeSelect) {
    toast.error('Fehler beim Speichern');
    return;
  }
  
  const title = titleInput.value.trim();
  const oberkategorie = oberkategorieSelect.value;
  const type = typeSelect.value;
  const body = bodyTextarea?.value || '';
  
  if (!title || !oberkategorie || !type) {
    toast.error('Bitte fülle alle Pflichtfelder aus');
    return;
  }
  
  try {
    const user = api.me();
    if (!user) {
      toast.error('Nicht eingeloggt');
      return;
    }
    
    if (state.activeItem) {
      // Update existing item
      const updated = {
        ...state.activeItem,
        title,
        oberkategorie,
        type,
        body,
        updatedAt: new Date().toISOString()
      };
      
      const result = await knowledgeRepository.update(state.activeItem.id, updated);
      if (result) {
        toast.success('Eintrag gespeichert');
        await loadData();
        state.activeItem = updated;
        render();
      }
    } else {
      // Create new item
      const newItem = {
        title,
        oberkategorie,
        type,
        body,
        summary: body.substring(0, 200),
        topics: [],
        tags: [],
        status: 'published',
        createdBy: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const result = await knowledgeRepository.create(newItem);
      if (result) {
        toast.success('Eintrag erstellt');
        await loadData();
        state.activeItem = result;
        render();
      }
    }
  } catch (error) {
    console.error('Error saving knowledge item:', error);
    toast.error('Fehler beim Speichern');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
