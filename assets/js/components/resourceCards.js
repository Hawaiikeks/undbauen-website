/* Resource Cards: UI components for Resources Toolbox */

import { getIcon } from './icons.js';

/**
 * Get icon for file type
 */
function getTypeIcon(type, mimeType, platform) {
  if (type === 'file') {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📊';
    if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📈';
    if (mimeType?.includes('zip') || mimeType?.includes('compressed')) return '🗜️';
    return '📄';
  }
  if (type === 'link') return '🔗';
  if (type === 'tool') {
    if (platform === 'miro') return '🎨';
    if (platform === 'onedrive') return '☁️';
    if (platform === 'notion') return '📋';
    if (platform === 'canva') return '🖼️';
    return '🔧';
  }
  if (type === 'template') return '📋';
  if (type === 'video') return '📹';
  if (type === 'collection') return '📦';
  return '📄';
}

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format relative date
 */
function formatRelativeDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Heute';
  if (diffDays === 1) return 'Gestern';
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  return date.toLocaleDateString('de-DE', { year: 'numeric', month: 'short' });
}

/**
 * Render Category Card (Ebene 1)
 */
export function renderCategoryCard(category, count, lastUpdated) {
  return `
    <div class="resource-category-card" data-action="open-category" data-category-id="${category.id}">
      <div class="category-card-icon">
        ${getIcon(category.iconKey || 'folder')}
      </div>
      <div class="category-card-content">
        <h3 class="category-card-title">${category.title}</h3>
        <p class="category-card-description">${category.description || ''}</p>
        <div class="category-card-meta">
          <span class="category-card-count">${count || 0} ${count === 1 ? 'Ressource' : 'Ressourcen'}</span>
          ${lastUpdated ? `<span class="category-card-updated">Aktualisiert ${formatRelativeDate(lastUpdated)}</span>` : ''}
        </div>
      </div>
      <div class="category-card-arrow">
        ${getIcon('chevron-right')}
      </div>
    </div>
  `;
}

/**
 * Render Resource Card (Grid View)
 */
export function renderResourceCard(resource) {
  const typeIcon = getTypeIcon(resource.type, resource.mimeType, resource.platform);
  
  return `
    <div class="resource-card" data-resource-id="${resource.id}">
      <div class="resource-card-header">
        <div class="resource-card-icon">${typeIcon}</div>
        ${resource.isFeatured ? '<span class="resource-featured-badge">Featured</span>' : ''}
      </div>
      <div class="resource-card-content">
        <h4 class="resource-card-title">${resource.title}</h4>
        <p class="resource-card-description">${resource.description || ''}</p>
        ${resource.tags && resource.tags.length > 0 ? `
          <div class="resource-card-tags">
            ${resource.tags.slice(0, 3).map(tag => `<span class="resource-tag">${tag}</span>`).join('')}
            ${resource.tags.length > 3 ? `<span class="resource-tag">+${resource.tags.length - 3}</span>` : ''}
          </div>
        ` : ''}
      </div>
      <div class="resource-card-footer">
        ${resource.type === 'file' && resource.sizeBytes ? `
          <span class="resource-meta">${formatBytes(resource.sizeBytes)}</span>
        ` : ''}
        ${resource.updatedAt ? `
          <span class="resource-meta">${formatRelativeDate(resource.updatedAt)}</span>
        ` : ''}
      </div>
      <div class="resource-card-actions">
        ${resource.type === 'file' ? `
          <button class="btn primary" data-action="download-resource" data-resource-id="${resource.id}">
            ${getIcon('download')} Download
          </button>
        ` : resource.type === 'link' || resource.type === 'tool' || resource.type === 'template' ? `
          <button class="btn primary" data-action="open-resource" data-resource-id="${resource.id}">
            ${getIcon('external-link')} Öffnen
          </button>
        ` : resource.type === 'video' ? `
          <button class="btn primary" data-action="play-resource" data-resource-id="${resource.id}">
            ${getIcon('play')} Abspielen
          </button>
        ` : `
          <button class="btn" data-action="view-resource" data-resource-id="${resource.id}">
            ${getIcon('eye')} Details
          </button>
        `}
        <button class="btn" data-action="view-resource" data-resource-id="${resource.id}" title="Details">
          ${getIcon('info')}
        </button>
      </div>
    </div>
  `;
}

/**
 * Render Resource Table Row (Table View)
 */
export function renderResourceTableRow(resource) {
  const typeIcon = getTypeIcon(resource.type, resource.mimeType, resource.platform);
  
  return `
    <tr class="resource-table-row" data-resource-id="${resource.id}">
      <td class="resource-table-icon">${typeIcon}</td>
      <td class="resource-table-title">
        <div class="resource-table-title-text">${resource.title}</div>
        ${resource.isFeatured ? '<span class="resource-featured-badge small">Featured</span>' : ''}
      </td>
      <td class="resource-table-type">${resource.type}</td>
      <td class="resource-table-tags">
        ${resource.tags && resource.tags.length > 0 ? 
          resource.tags.slice(0, 2).map(tag => `<span class="resource-tag small">${tag}</span>`).join('') : 
          '-'}
      </td>
      <td class="resource-table-date">${formatRelativeDate(resource.updatedAt || resource.createdAt)}</td>
      <td class="resource-table-actions">
        ${resource.type === 'file' ? `
          <button class="btn small" data-action="download-resource" data-resource-id="${resource.id}" title="Download">
            ${getIcon('download')}
          </button>
        ` : `
          <button class="btn small" data-action="open-resource" data-resource-id="${resource.id}" title="Öffnen">
            ${getIcon('external-link')}
          </button>
        `}
        <button class="btn small" data-action="view-resource" data-resource-id="${resource.id}" title="Details">
          ${getIcon('info')}
        </button>
      </td>
    </tr>
  `;
}

/**
 * Render Resource Table (Table View)
 */
export function renderResourceTable(resources) {
  return `
    <div class="resource-table-container">
      <table class="resource-table">
        <thead>
          <tr>
            <th style="width: 40px;"></th>
            <th>Titel</th>
            <th style="width: 100px;">Typ</th>
            <th style="width: 200px;">Tags</th>
            <th style="width: 120px;">Aktualisiert</th>
            <th style="width: 120px;">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          ${resources.map(res => renderResourceTableRow(res)).join('')}
        </tbody>
      </table>
    </div>
  `;
}


