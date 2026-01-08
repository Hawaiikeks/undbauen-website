/* Knowledge Panels: Obsidian-style 3-panel UI components */

import { getIcon } from './icons.js';

/**
 * Render Left Panel (Navigation)
 * @param {Object} data - { topics, allTags, filters, itemCount }
 * @returns {string} HTML
 */
export function renderLeftPanel({ topics, allTags, filters, itemCount }) {
  return `
    <div class="knowledge-left-panel">
      <!-- Search -->
      <div class="knowledge-search">
        <div class="input-with-icon">
          <span class="input-icon">${getIcon('search')}</span>
          <input 
            type="text" 
            class="input knowledge-search-input" 
            id="knowledgeSearch"
            placeholder="Suche... (Strg+K)"
            value="${filters.search || ''}"
          />
        </div>
      </div>

      <!-- Topics Section -->
      <div class="knowledge-nav-section">
        <div class="knowledge-nav-header">
          <span>${getIcon('layers')}</span>
          <span>Topics</span>
        </div>
        <div class="knowledge-nav-items">
          <button 
            class="knowledge-nav-item ${(!filters.topics || filters.topics.length === 0) ? 'active' : ''}" 
            data-action="filter-topic"
            data-topic="all"
          >
            <span class="knowledge-nav-icon">${getIcon('grid')}</span>
            <span class="knowledge-nav-label">Alle</span>
            <span class="knowledge-nav-count">${itemCount}</span>
          </button>
          ${topics.map(topic => `
            <button 
              class="knowledge-nav-item ${filters.topics && filters.topics.includes(topic.id) ? 'active' : ''}" 
              data-action="filter-topic"
              data-topic="${topic.id}"
              title="${topic.description || topic.label}"
            >
              <span class="knowledge-nav-icon" style="color: ${topic.color || 'var(--primary)'}">
                ${getIcon(topic.icon || 'circle')}
              </span>
              <span class="knowledge-nav-label">${topic.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Tags Section -->
      ${allTags.length > 0 ? `
        <div class="knowledge-nav-section">
          <div class="knowledge-nav-header">
            <span>${getIcon('tag')}</span>
            <span>Tags</span>
          </div>
          <div class="knowledge-tags">
            ${allTags.slice(0, 15).map(tag => `
              <button 
                class="knowledge-tag ${filters.tags && filters.tags.includes(tag) ? 'active' : ''}"
                data-action="toggle-tag"
                data-tag="${tag}"
              >
                ${tag}
              </button>
            `).join('')}
            ${allTags.length > 15 ? `
              <button class="knowledge-tag knowledge-tag-more" data-action="show-all-tags">
                +${allTags.length - 15} mehr
              </button>
            ` : ''}
          </div>
        </div>
      ` : ''}

      <!-- Filter Reset -->
      ${(filters.search || filters.topics?.length > 0 || filters.tags?.length > 0 || (filters.type && filters.type !== 'all')) ? `
        <div class="knowledge-nav-section">
          <button class="btn secondary" data-action="reset-filters" style="width: 100%;">
            ${getIcon('x')} Filter zurücksetzen
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render Center Panel (List)
 * @param {Object} data - { items, filters, sort }
 * @returns {string} HTML
 */
export function renderCenterList({ items, filters, sort }) {
  return `
    <div class="knowledge-center-panel">
      <!-- Header with controls -->
      <div class="knowledge-list-header">
        <div class="knowledge-list-title">
          <h2>Knowledge Base</h2>
          <span class="knowledge-list-count">${items.length} ${items.length === 1 ? 'Artikel' : 'Artikel'}</span>
        </div>
        <div class="knowledge-list-controls">
          <!-- Type Filter -->
          <select class="input" id="knowledgeTypeFilter" data-action="filter-type">
            <option value="all" ${(!filters.type || filters.type === 'all') ? 'selected' : ''}>Alle Typen</option>
            <option value="tool" ${filters.type === 'tool' ? 'selected' : ''}>Tool</option>
            <option value="method" ${filters.type === 'method' ? 'selected' : ''}>Methode</option>
            <option value="standard" ${filters.type === 'standard' ? 'selected' : ''}>Standard</option>
            <option value="concept" ${filters.type === 'concept' ? 'selected' : ''}>Konzept</option>
            <option value="glossary" ${filters.type === 'glossary' ? 'selected' : ''}>Glossar</option>
            <option value="prompt" ${filters.type === 'prompt' ? 'selected' : ''}>Prompt</option>
            <option value="link" ${filters.type === 'link' ? 'selected' : ''}>Link</option>
          </select>
          
          <!-- Sort -->
          <select class="input" id="knowledgeSortBy" data-action="change-sort">
            <option value="updated" ${sort === 'updated' ? 'selected' : ''}>Zuletzt aktualisiert</option>
            <option value="alpha" ${sort === 'alpha' ? 'selected' : ''}>Alphabetisch</option>
            <option value="created" ${sort === 'created' ? 'selected' : ''}>Zuletzt erstellt</option>
          </select>
        </div>
      </div>

      <!-- Items List -->
      <div class="knowledge-list">
        ${items.length === 0 ? `
          <div class="knowledge-empty">
            <div class="knowledge-empty-icon">${getIcon('book-open')}</div>
            <div class="knowledge-empty-title">Keine Artikel gefunden</div>
            <div class="knowledge-empty-text">
              Versuche eine andere Filterkombination oder Suchbegriff.
            </div>
          </div>
        ` : items.map(item => renderKnowledgeListItem(item)).join('')}
      </div>
    </div>
  `;
}

/**
 * Render a single knowledge list item
 * @param {Object} item - Knowledge item
 * @returns {string} HTML
 */
function renderKnowledgeListItem(item) {
  const typeColors = {
    tool: '#3B82F6',
    method: '#10B981',
    standard: '#F59E0B',
    concept: '#8B5CF6',
    glossary: '#EF4444',
    prompt: '#06B6D4',
    link: '#EC4899'
  };

  const typeIcons = {
    tool: 'wrench',
    method: 'workflow',
    standard: 'book-open',
    concept: 'lightbulb',
    glossary: 'file-text',
    prompt: 'code',
    link: 'link'
  };

  return `
    <button 
      class="knowledge-list-item" 
      data-action="view-item"
      data-item-id="${item.id}"
    >
      <div class="knowledge-list-item-header">
        <span class="knowledge-type-badge" style="background: ${typeColors[item.type] || '#6B7280'}15; color: ${typeColors[item.type] || '#6B7280'}">
          ${getIcon(typeIcons[item.type] || 'circle')}
          <span>${item.type || 'item'}</span>
        </span>
        <span class="knowledge-list-item-date">
          ${formatRelativeDate(item.updatedAt || item.createdAt)}
        </span>
      </div>
      <div class="knowledge-list-item-title">${item.title || 'Unbenannt'}</div>
      <div class="knowledge-list-item-summary">${item.summary || ''}</div>
      ${(item.topics && item.topics.length > 0) || (item.tags && item.tags.length > 0) ? `
        <div class="knowledge-list-item-tags">
          ${(item.tags || []).slice(0, 3).map(tag => `
            <span class="knowledge-list-item-tag">${tag}</span>
          `).join('')}
          ${item.tags && item.tags.length > 3 ? `
            <span class="knowledge-list-item-tag">+${item.tags.length - 3}</span>
          ` : ''}
        </div>
      ` : ''}
    </button>
  `;
}

/**
 * Render Right Panel (Detail)
 * @param {Object} data - { item, topics, relations, backlinks }
 * @returns {string} HTML
 */
export function renderRightDetail({ item, topics, relations, backlinks }) {
  if (!item) {
    return `
      <div class="knowledge-right-panel">
        <div class="knowledge-detail-empty">
          <div class="knowledge-detail-empty-icon">${getIcon('book-open')}</div>
          <div class="knowledge-detail-empty-title">Kein Artikel ausgewählt</div>
          <div class="knowledge-detail-empty-text">
            Wähle einen Artikel aus der Liste, um Details anzuzeigen.
          </div>
        </div>
      </div>
    `;
  }

  const typeColors = {
    tool: '#3B82F6',
    method: '#10B981',
    standard: '#F59E0B',
    concept: '#8B5CF6',
    glossary: '#EF4444',
    prompt: '#06B6D4',
    link: '#EC4899'
  };

  const typeIcons = {
    tool: 'wrench',
    method: 'workflow',
    standard: 'book-open',
    concept: 'lightbulb',
    glossary: 'file-text',
    prompt: 'code',
    link: 'link'
  };

  return `
    <div class="knowledge-right-panel">
      <div class="knowledge-detail">
        <!-- Header -->
        <div class="knowledge-detail-header">
          <div class="knowledge-detail-title-row">
            <h2 class="knowledge-detail-title">${item.title || 'Unbenannt'}</h2>
            <button class="btn" data-action="close-detail" title="Detail schließen">
              ${getIcon('x')}
            </button>
          </div>
          <div class="knowledge-detail-meta-row">
            <span class="knowledge-type-badge" style="background: ${typeColors[item.type] || '#6B7280'}15; color: ${typeColors[item.type] || '#6B7280'}">
              ${getIcon(typeIcons[item.type] || 'circle')}
              <span>${item.type || 'item'}</span>
            </span>
          </div>
        </div>

        <!-- Summary -->
        ${item.summary ? `
          <div class="knowledge-detail-summary">
            ${item.summary}
          </div>
        ` : ''}

        <!-- Body -->
        ${item.body ? `
          <div class="knowledge-detail-body">
            ${formatBody(item.body)}
          </div>
        ` : ''}

        <!-- Metadata Box -->
        <div class="knowledge-detail-metadata">
          <div class="knowledge-metadata-title">Metadata</div>
          
          <!-- Topics -->
          ${item.topics && item.topics.length > 0 ? `
            <div class="knowledge-metadata-item">
              <div class="knowledge-metadata-label">${getIcon('layers')} Topics</div>
              <div class="knowledge-metadata-value">
                ${item.topics.map(topicId => {
                  const topic = topics.find(t => t.id === topicId);
                  return topic ? `
                    <span class="knowledge-topic-pill" style="background: ${topic.color || '#6B7280'}15; color: ${topic.color || '#6B7280'}">
                      ${topic.label}
                    </span>
                  ` : '';
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Tags -->
          ${item.tags && item.tags.length > 0 ? `
            <div class="knowledge-metadata-item">
              <div class="knowledge-metadata-label">${getIcon('tag')} Tags</div>
              <div class="knowledge-metadata-value">
                ${item.tags.map(tag => `
                  <span class="knowledge-tag">${tag}</span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Sources -->
          ${item.sources && item.sources.length > 0 ? `
            <div class="knowledge-metadata-item">
              <div class="knowledge-metadata-label">${getIcon('link')} Quellen</div>
              <div class="knowledge-metadata-value">
                ${item.sources.map(source => `
                  <div class="knowledge-source">
                    ${source.sourceType === 'external' ? `
                      <a href="${source.reference}" target="_blank" rel="noopener" class="knowledge-source-link">
                        ${source.note || source.reference}
                        ${getIcon('external-link')}
                      </a>
                    ` : `
                      <span>${source.note || source.reference}</span>
                    `}
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Updated -->
          <div class="knowledge-metadata-item">
            <div class="knowledge-metadata-label">${getIcon('calendar')} Aktualisiert</div>
            <div class="knowledge-metadata-value">
              ${formatDate(item.updatedAt || item.createdAt)}
            </div>
          </div>
        </div>

        <!-- Relations -->
        ${relations && relations.length > 0 ? `
          <div class="knowledge-detail-section">
            <div class="knowledge-section-title">
              ${getIcon('git-branch')} Verwandte Artikel
            </div>
            <div class="knowledge-relations">
              ${relations.map(rel => renderRelationItem(rel)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Backlinks -->
        ${backlinks && backlinks.length > 0 ? `
          <div class="knowledge-detail-section">
            <div class="knowledge-section-title">
              ${getIcon('arrow-left')} Verweise (Backlinks)
            </div>
            <div class="knowledge-relations">
              ${backlinks.map(rel => renderRelationItem(rel, true)).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render a relation item
 * @param {Object} rel - { relation, item }
 * @param {boolean} isBacklink - Is this a backlink?
 * @returns {string} HTML
 */
function renderRelationItem(rel, isBacklink = false) {
  const item = rel.item;
  if (!item) return '';

  const relationTypeLabels = {
    related: 'Verwandt',
    depends_on: 'Benötigt',
    alternative_to: 'Alternative zu',
    example_of: 'Beispiel für'
  };

  return `
    <button 
      class="knowledge-relation-item"
      data-action="view-item"
      data-item-id="${item.id}"
    >
      <div class="knowledge-relation-icon">
        ${getIcon(isBacklink ? 'arrow-left' : 'arrow-right')}
      </div>
      <div class="knowledge-relation-content">
        <div class="knowledge-relation-title">${item.title || 'Unbenannt'}</div>
        <div class="knowledge-relation-meta">
          <span class="knowledge-relation-type">${relationTypeLabels[rel.relation.relationType] || rel.relation.relationType}</span>
          ${item.type ? `<span class="knowledge-relation-type-badge">${item.type}</span>` : ''}
        </div>
      </div>
    </button>
  `;
}

/**
 * Helper: Format relative date
 */
function formatRelativeDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  if (diffDays < 365) return `vor ${Math.floor(diffDays / 30)} Monaten`;
  return `vor ${Math.floor(diffDays / 365)} Jahren`;
}

/**
 * Helper: Format absolute date
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Helper: Format body text (convert line breaks to paragraphs)
 */
function formatBody(body) {
  if (!body) return '';
  // Split by double line breaks for paragraphs
  const paragraphs = body.split(/\n\n+/);
  return paragraphs.map(p => {
    // Replace single line breaks with <br>
    const formatted = p.trim().replace(/\n/g, '<br>');
    return `<p>${formatted}</p>`;
  }).join('');
}


