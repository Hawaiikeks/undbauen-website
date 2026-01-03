/* Resources Admin Page: Backoffice resource management */

import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { fileStorage } from '../services/fileStorage.js';
import { validateFile } from '../services/validation.js';

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

  const allResources = await resourceRepository.findAll();
  const sortedResources = allResources.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  container.innerHTML = renderAdminPage(sortedResources);
  wireAdminEvents();
}

/**
 * Render admin page
 */
function renderAdminPage(resources) {
  return `
    <div class="container pageWrap">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="h2">Resources Management</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Verwalten Sie alle Ressourcen und Materialien.
          </p>
        </div>
        <button class="btn primary" id="createResourceBtn">+ Neue Ressource</button>
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${resources.length} ${resources.length === 1 ? 'Ressource' : 'Ressourcen'}
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
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${resources.map(resource => renderResourceAdminCard(resource)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render resource admin card
 */
function renderResourceAdminCard(resource) {
  const latestVersion = resource.versions && resource.versions.length > 0 
    ? resource.versions[resource.versions.length - 1] 
    : null;

  return `
    <div class="card pane">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">
            ${resource.title || 'Unbenannt'}
          </div>
          <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">
            ${resource.description || ''}
          </div>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 8px;">
            <span class="badge" style="background: ${resource.visibility === 'public' ? 'var(--success)' : 'var(--primary)'}; color: white;">
              ${resource.visibility === 'public' ? 'Öffentlich' : 'Mitglieder'}
            </span>
            ${resource.isFeatured ? `
              <span class="badge" style="background: var(--accent); color: white;">Featured</span>
            ` : ''}
            ${latestVersion ? `
              <span style="color: var(--text-secondary); font-size: 12px;">
                v${latestVersion.versionLabel || '1.0'}
              </span>
            ` : ''}
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn small" onclick="window.editResource('${resource.id}')">Bearbeiten</button>
          <button class="btn small" onclick="window.uploadResourceVersion('${resource.id}')">Version hochladen</button>
          <button class="btn small danger" onclick="window.deleteResource('${resource.id}')">Löschen</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wire admin events
 */
function wireAdminEvents() {
  document.querySelectorAll('#createResourceBtn, #createResourceBtnEmpty').forEach(btn => {
    btn.addEventListener('click', () => {
      showResourceModal();
    });
  });

  window.editResource = (resourceId) => {
    showResourceModal(resourceId);
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

