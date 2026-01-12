/* Resources Admin Page: Backoffice resource management */

import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { fileStorage } from '../services/fileStorage.js';
import { validateFile } from '../services/validation.js';

// State for filtering
let currentFilters = {
  search: '',
  type: 'all',
  visibility: 'all'
};

/**
 * Render resources admin page
 */
export async function renderResourcesAdmin() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#resourcesAdminContainer') || document.querySelector('main');
  if (!container) return;

  try {
    const allResources = await resourceRepository.findAll();
    const sortedResources = allResources.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    container.innerHTML = renderAdminPage(sortedResources, allResources);
    wireAdminEvents(allResources);
  } catch (error) {
    console.error('Error loading resources:', error);
    container.innerHTML = `
      <div class="card pane" style="text-align: center; padding: 48px 24px;">
        <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">⚠️</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Fehler beim Laden</div>
        <div style="color: var(--text-secondary); margin-bottom: 24px;">
          Die Ressourcen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.
        </div>
        <button class="btn primary" onclick="location.reload()">Neu laden</button>
      </div>
    `;
  }
}

/**
 * Get resource statistics
 */
function getResourceStats(resources) {
  const stats = {
    total: resources.length,
    public: resources.filter(r => r.visibility === 'public').length,
    featured: resources.filter(r => r.isFeatured).length,
    totalSize: 0
  };
  
  resources.forEach(r => {
    const version = r.versions?.[r.versions.length - 1];
    stats.totalSize += version?.sizeBytes || 0;
  });
  
  return stats;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Render admin page
 */
function renderAdminPage(resources, allResources) {
  const stats = getResourceStats(allResources);
  
  return `
    <div style="max-width: 1400px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="h2">Mediathek</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Verwalten Sie alle Ressourcen und Materialien.
          </p>
        </div>
        <button class="btn primary" id="createResourceBtn">+ Neue Ressource</button>
      </div>

      <!-- Statistics Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="card pane" style="padding: 16px;">
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 4px;">Gesamt</div>
          <div style="font-size: 28px; font-weight: 600;">${stats.total}</div>
          <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Ressourcen</div>
        </div>
        <div class="card pane" style="padding: 16px;">
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 4px;">Öffentlich</div>
          <div style="font-size: 28px; font-weight: 600;">${stats.public}</div>
          <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Für alle sichtbar</div>
        </div>
        <div class="card pane" style="padding: 16px;">
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 4px;">Featured</div>
          <div style="font-size: 28px; font-weight: 600;">${stats.featured}</div>
          <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Hervorgehoben</div>
        </div>
        <div class="card pane" style="padding: 16px;">
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 4px;">Speicher</div>
          <div style="font-size: 28px; font-weight: 600;">${formatFileSize(stats.totalSize)}</div>
          <div style="color: var(--text-secondary); font-size: 12px; margin-top: 4px;">Gesamtgröße</div>
        </div>
      </div>

      <!-- Filters -->
      <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap;">
        <input 
          class="input" 
          style="flex: 1; min-width: 250px;"
          placeholder="🔍 Ressourcen durchsuchen..." 
          id="searchResources" 
          value="${currentFilters.search}"
        />
        <select class="input" id="filterType" style="min-width: 150px;">
          <option value="all" ${currentFilters.type === 'all' ? 'selected' : ''}>Alle Typen</option>
          <option value="file" ${currentFilters.type === 'file' ? 'selected' : ''}>Dateien</option>
          <option value="link" ${currentFilters.type === 'link' ? 'selected' : ''}>Links</option>
        </select>
        <select class="input" id="filterVisibility" style="min-width: 150px;">
          <option value="all" ${currentFilters.visibility === 'all' ? 'selected' : ''}>Alle</option>
          <option value="public" ${currentFilters.visibility === 'public' ? 'selected' : ''}>Öffentlich</option>
          <option value="member" ${currentFilters.visibility === 'member' ? 'selected' : ''}>Nur Mitglieder</option>
        </select>
      </div>

      ${resources.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📚</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Ressourcen vorhanden</div>
          <div style="color: var(--text-secondary); margin-bottom: 24px;">
            Erstellen Sie Ihre erste Ressource.
          </div>
          <button class="btn primary" id="createResourceBtnEmpty">+ Erste Ressource erstellen</button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;" id="resourcesList">
          ${resources.map(resource => renderResourceAdminCard(resource)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Get file icon based on resource type
 */
function getFileIcon(resource) {
  const latestVersion = resource.versions?.[resource.versions.length - 1];
  const mimeType = latestVersion?.mimeType || '';
  
  if (resource.type === 'link') return '🔗';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('zip') || mimeType.includes('compressed')) return '📦';
  if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
  if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return '📊';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎥';
  return '📁';
}

/**
 * Format date
 */
function formatDate(dateString) {
  if (!dateString) return 'Unbekannt';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/**
 * Render resource admin card
 */
function renderResourceAdminCard(resource) {
  const latestVersion = resource.versions && resource.versions.length > 0 
    ? resource.versions[resource.versions.length - 1] 
    : null;
  
  const icon = getFileIcon(resource);
  const fileSize = latestVersion?.sizeBytes ? formatFileSize(latestVersion.sizeBytes) : null;
  const updatedDate = latestVersion?.createdAt || resource.createdAt;

  return `
    <div class="card pane" style="transition: all 0.2s; cursor: pointer;" onmouseover="this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow=''">
      <div style="display: flex; gap: 16px;">
        <!-- Icon -->
        <div style="font-size: 48px; flex-shrink: 0;">
          ${icon}
        </div>
        
        <!-- Content -->
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
            <div style="flex: 1; min-width: 0;">
              <h3 style="font-weight: 600; font-size: 18px; margin: 0 0 4px 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${resource.title || 'Unbenannt'}
              </h3>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 0; line-height: 1.4;">
                ${resource.description || 'Keine Beschreibung'}
              </p>
            </div>
            
            <!-- Badges -->
            <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-end; margin-left: 16px;">
              <span class="badge" style="background: ${resource.visibility === 'public' ? 'var(--success)' : 'var(--primary)'}; color: white; font-size: 11px;">
                ${resource.visibility === 'public' ? 'Öffentlich' : 'Mitglieder'}
              </span>
              ${resource.isFeatured ? `
                <span class="badge" style="background: var(--accent); color: white; font-size: 11px;">Featured</span>
              ` : ''}
              ${latestVersion ? `
                <span style="color: var(--text-secondary); font-size: 11px; font-weight: 500;">
                  ${latestVersion.versionLabel || 'v1.0'}
                </span>
              ` : ''}
            </div>
          </div>
          
          <!-- Meta Info -->
          <div style="display: flex; gap: 16px; margin-top: 12px; flex-wrap: wrap; color: var(--text-secondary); font-size: 13px;">
            ${fileSize ? `<span>📦 ${fileSize}</span>` : ''}
            <span>📅 ${formatDate(updatedDate)}</span>
            ${resource.versions?.length > 1 ? `<span>🔄 ${resource.versions.length} Versionen</span>` : ''}
          </div>
          
          <!-- Actions -->
          <div style="display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            <button class="btn small" onclick="window.editResource('${resource.id}'); event.stopPropagation();">
              ✏️ Bearbeiten
            </button>
            <button class="btn small" onclick="window.uploadResourceVersion('${resource.id}'); event.stopPropagation();">
              📤 Version
            </button>
            <button class="btn small" onclick="window.viewResource('${resource.id}'); event.stopPropagation();">
              👁️ Vorschau
            </button>
            <button class="btn small danger" onclick="window.deleteResource('${resource.id}'); event.stopPropagation();">
              🗑️ Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Filter resources based on current filters
 */
function filterResources(resources) {
  return resources.filter(resource => {
    // Search filter
    if (currentFilters.search) {
      const searchLower = currentFilters.search.toLowerCase();
      const matchesTitle = resource.title?.toLowerCase().includes(searchLower);
      const matchesDescription = resource.description?.toLowerCase().includes(searchLower);
      const matchesTags = resource.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesTitle && !matchesDescription && !matchesTags) return false;
    }
    
    // Type filter
    if (currentFilters.type !== 'all' && resource.type !== currentFilters.type) {
      return false;
    }
    
    // Visibility filter
    if (currentFilters.visibility !== 'all' && resource.visibility !== currentFilters.visibility) {
      return false;
    }
    
    return true;
  });
}

/**
 * Wire admin events
 */
function wireAdminEvents(allResources) {
  document.querySelectorAll('#createResourceBtn, #createResourceBtnEmpty').forEach(btn => {
    btn.addEventListener('click', () => {
      showResourceModal();
    });
  });

  // Search filter
  const searchInput = document.getElementById('searchResources');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilters.search = e.target.value;
      updateResourcesList(allResources);
    });
  }

  // Type filter
  const typeFilter = document.getElementById('filterType');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      currentFilters.type = e.target.value;
      updateResourcesList(allResources);
    });
  }

  // Visibility filter
  const visibilityFilter = document.getElementById('filterVisibility');
  if (visibilityFilter) {
    visibilityFilter.addEventListener('change', (e) => {
      currentFilters.visibility = e.target.value;
      updateResourcesList(allResources);
    });
  }

  window.editResource = (resourceId) => {
    showResourceModal(resourceId);
  };

  window.viewResource = async (resourceId) => {
    const resource = await resourceRepository.findById(resourceId);
    if (!resource) return;
    
    const latestVersion = resource.versions?.[resource.versions.length - 1];
    if (latestVersion?.fileKeyOrUrl) {
      window.open(latestVersion.fileKeyOrUrl, '_blank');
    } else {
      toast.error('Keine Datei verfügbar');
    }
  };

  window.uploadResourceVersion = async (resourceId) => {
    const resource = await resourceRepository.findById(resourceId);
    if (!resource) return;

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '*/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file
      const validation = validateFile(file, {
        maxSize: 50 * 1024 * 1024, // 50MB
        allowedExtensions: ['pdf', 'zip', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'txt', 'md']
      });

      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }

      try {
        // Upload using fileStorage service
        const uploadResult = await fileStorage.upload(file, {
          folder: 'resources'
        });

        const changelog = prompt('Changelog (optional):') || '';
        
        const version = {
          versionLabel: `v${(resource.versions?.length || 0) + 1}`,
          changelog,
          fileKeyOrUrl: uploadResult.url, // In production: S3 key, here: base64 URL
          mimeType: file.type,
          sizeBytes: file.size,
          createdAt: new Date().toISOString()
        };

        if (!resource.versions) {
          resource.versions = [];
        }
        resource.versions.push(version);

        await resourceRepository.update(resourceId, {
          versions: resource.versions
        });

        const { showSuccessModal } = await import('../components/successModal.js');
        showSuccessModal('Die neue Version wurde erfolgreich hochgeladen.', 'Version hochgeladen');
        setTimeout(() => renderResourcesAdmin(), 1500);
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Fehler beim Hochladen der Datei');
      }
    };
    fileInput.click();
  };

  window.deleteResource = async (resourceId) => {
    const { confirmModal } = await import('../components/confirmModal.js');
    const confirmed = await confirmModal.show(
      'Möchten Sie diese Ressource wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      'Ressource löschen',
      'Löschen',
      'Abbrechen'
    );
    
    if (!confirmed) return;

    try {
      await resourceRepository.delete(resourceId);
      const { showSuccessModal } = await import('../components/successModal.js');
      showSuccessModal('Die Ressource wurde erfolgreich gelöscht.', 'Ressource gelöscht');
      setTimeout(() => renderResourcesAdmin(), 1500);
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Fehler beim Löschen');
    }
  };
}

/**
 * Update resources list based on filters
 */
function updateResourcesList(allResources) {
  const filtered = filterResources(allResources);
  const sorted = filtered.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  
  const listContainer = document.getElementById('resourcesList');
  if (listContainer) {
    listContainer.innerHTML = sorted.map(resource => renderResourceAdminCard(resource)).join('');
  }
}

/**
 * Show resource modal
 */
async function showResourceModal(resourceId = null) {
  const resource = resourceId ? await resourceRepository.findById(resourceId) : null;

  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.innerHTML = `
    <div class="modal" style="max-width: 600px;">
      <div class="modalHeader">
        <div class="modalTitle">${resource ? 'Ressource bearbeiten' : 'Neue Ressource'}</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()">✕</button>
      </div>
      <div class="modalBody">
        <label class="label">Titel *</label>
        <input class="input" id="resourceTitle" value="${resource?.title || ''}" />
        
        <label class="label" style="margin-top: 16px;">Beschreibung</label>
        <textarea class="textarea" id="resourceDescription" rows="4">${resource?.description || ''}</textarea>
        
        <label class="label" style="margin-top: 16px;">Typ</label>
        <select class="input" id="resourceType">
          <option value="file" ${resource?.type === 'file' ? 'selected' : ''}>Datei</option>
          <option value="link" ${resource?.type === 'link' ? 'selected' : ''}>Link</option>
        </select>
        
        <label class="label" style="margin-top: 16px;">Sichtbarkeit</label>
        <select class="input" id="resourceVisibility">
          <option value="member" ${resource?.visibility === 'member' ? 'selected' : ''}>Nur Mitglieder</option>
          <option value="public" ${resource?.visibility === 'public' ? 'selected' : ''}>Öffentlich</option>
        </select>
        
        <label class="label" style="margin-top: 16px;">
          <input type="checkbox" id="resourceFeatured" ${resource?.isFeatured ? 'checked' : ''} />
          Featured (auf Dashboard anzeigen)
        </label>
        
        <label class="label" style="margin-top: 16px;">Tags (Komma-getrennt)</label>
        <input class="input" id="resourceTags" value="${(resource?.tags || []).join(', ')}" />
        
        <div style="display: flex; gap: 12px; margin-top: 24px;">
          <button class="btn" onclick="this.closest('.modalOverlay').remove()" style="flex: 1;">Abbrechen</button>
          <button class="btn primary" id="saveResourceBtn" style="flex: 1;">Speichern</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#saveResourceBtn').addEventListener('click', async () => {
    const user = api.me();
    const title = modal.querySelector('#resourceTitle').value.trim();
    if (!title) {
      toast.error('Titel ist erforderlich');
      return;
    }

    const tags = modal.querySelector('#resourceTags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const data = {
      title,
      description: modal.querySelector('#resourceDescription').value.trim(),
      type: modal.querySelector('#resourceType').value,
      categoryId: null, // Would come from category selection
      tags,
      visibility: modal.querySelector('#resourceVisibility').value,
      isFeatured: modal.querySelector('#resourceFeatured').checked,
      createdByUserId: user.id
    };

    try {
      if (resource) {
        await resourceRepository.update(resourceId, data);
        const { showSuccessModal } = await import('../components/successModal.js');
        showSuccessModal('Die Ressource wurde erfolgreich aktualisiert.', 'Ressource aktualisiert');
      } else {
        await resourceRepository.create(data);
        const { showSuccessModal } = await import('../components/successModal.js');
        showSuccessModal('Die Ressource wurde erfolgreich erstellt.', 'Ressource erstellt');
      }
      modal.remove();
      setTimeout(() => renderResourcesAdmin(), 1500);
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Fehler beim Speichern');
    }
  });
}

