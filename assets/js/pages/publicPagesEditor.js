/* Public Pages Editor: Section-based editor for landing page */

import { pageRepository } from '../services/repositories/pageRepository.js';
import { logPublishAction } from '../services/auditLogger.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { renderSectionEditor, collectSectionData } from '../components/sectionEditor.js';

let currentPage = null;
let currentSections = [];
let isPreviewMode = false;

/**
 * Render public pages editor
 */
export async function renderPublicPagesEditor() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#publicPagesContainer') || document.querySelector('main');
  if (!container) return;

  // Load or create page
  currentPage = await pageRepository.findBySlug('landing') || await createDefaultPage();
  currentSections = currentPage.sections || [];

  container.innerHTML = renderEditor();
  wireEditorEvents();
  renderSections();
}

/**
 * Create default landing page
 */
async function createDefaultPage() {
  return await pageRepository.create({
    slug: 'landing',
    status: 'draft',
    publishedVersionId: null,
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Hero Section',
        heroText: 'Willkommen bei …undbauen',
        heroImage: '',
        visibility: 'public',
        order: 0
      }
    ],
    updatedAt: new Date().toISOString()
  });
}

/**
 * Render editor HTML
 */
function renderEditor() {
  return `
    <div class="container pageWrap">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="h2">Public Pages Editor</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Bearbeiten Sie die Landing Page Sektionen.
          </p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn" id="previewBtn">Vorschau</button>
          <button class="btn" id="saveVersionBtn">Version speichern</button>
          <button class="btn primary" id="publishBtn">Veröffentlichen</button>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: ${isPreviewMode ? '1fr 1fr' : '1fr'}; gap: 24px;">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-weight: 600;">Sektionen</div>
            <button class="btn small" id="addSectionBtn">+ Sektion hinzufügen</button>
          </div>
          <div id="sectionsContainer"></div>
        </div>

        ${isPreviewMode ? `
          <div>
            <div style="font-weight: 600; margin-bottom: 16px;">Vorschau</div>
            <div id="previewContainer" style="border: 1px solid var(--border); border-radius: 8px; padding: 24px; background: var(--bg);">
              <!-- Preview will be rendered here -->
            </div>
          </div>
        ` : ''}
      </div>

      <div id="versionHistory" style="margin-top: 32px;">
        <div style="font-weight: 600; margin-bottom: 16px;">Versionshistorie</div>
        <div id="versionsList"></div>
      </div>
    </div>
  `;
}

/**
 * Render sections
 */
function renderSections() {
  const container = document.querySelector('#sectionsContainer');
  if (!container) return;

  if (currentSections.length === 0) {
    container.innerHTML = `
      <div class="card pane" style="text-align: center; padding: 48px 24px;">
        <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📄</div>
        <div style="font-weight: 600; margin-bottom: 8px;">Keine Sektionen</div>
        <div style="color: var(--text-secondary); margin-bottom: 24px;">
          Fügen Sie Ihre erste Sektion hinzu.
        </div>
        <button class="btn primary" id="addSectionBtnEmpty">+ Erste Sektion hinzufügen</button>
      </div>
    `;
    return;
  }

  // Sort by order
  const sorted = [...currentSections].sort((a, b) => (a.order || 0) - (b.order || 0));
  
  container.innerHTML = sorted.map((section, idx) => {
    const actualIndex = currentSections.indexOf(section);
    return renderSectionEditor(section, actualIndex);
  }).join('');

  wireSectionEvents();
}

/**
 * Wire editor events
 */
function wireEditorEvents() {
  // Add section
  document.querySelectorAll('#addSectionBtn, #addSectionBtnEmpty').forEach(btn => {
    btn.addEventListener('click', () => {
      const newSection = {
        id: `section_${Date.now()}`,
        type: 'hero',
        title: '',
        subtitle: '',
        content: '',
        visibility: 'public',
        order: currentSections.length
      };
      currentSections.push(newSection);
      renderSections();
    });
  });

  // Preview toggle
  const previewBtn = document.querySelector('#previewBtn');
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      isPreviewMode = !isPreviewMode;
      saveCurrentSections();
      const container = document.querySelector('#publicPagesContainer') || document.querySelector('main');
      container.innerHTML = renderEditor();
      wireEditorEvents();
      renderSections();
      if (isPreviewMode) {
        renderPreview();
      }
    });
  }

  // Save version
  const saveVersionBtn = document.querySelector('#saveVersionBtn');
  if (saveVersionBtn) {
    saveVersionBtn.addEventListener('click', async () => {
      await saveVersion();
    });
  }

  // Publish
  const publishBtn = document.querySelector('#publishBtn');
  if (publishBtn) {
    publishBtn.addEventListener('click', async () => {
      await publishPage();
    });
  }
}

/**
 * Wire section events
 */
function wireSectionEvents() {
  // Field changes
  document.querySelectorAll('[data-section-field]').forEach(input => {
    input.addEventListener('change', () => {
      saveCurrentSections();
    });
  });

  // Move section
  window.moveSection = (index, direction) => {
    if (direction === 'up' && index > 0) {
      [currentSections[index], currentSections[index - 1]] = 
        [currentSections[index - 1], currentSections[index]];
      saveCurrentSections();
      renderSections();
    } else if (direction === 'down' && index < currentSections.length - 1) {
      [currentSections[index], currentSections[index + 1]] = 
        [currentSections[index + 1], currentSections[index]];
      saveCurrentSections();
      renderSections();
    }
  };

  // Delete section
  window.deleteSection = (index) => {
    if (confirm('Sektion wirklich löschen?')) {
      currentSections.splice(index, 1);
      saveCurrentSections();
      renderSections();
    }
  };
}

/**
 * Save current sections
 */
function saveCurrentSections() {
  currentSections = currentSections.map((section, index) => {
    const data = collectSectionData(index);
    return data ? { ...section, ...data } : section;
  });
}

/**
 * Save version
 */
async function saveVersion() {
  saveCurrentSections();
  
  try {
    const user = api.me();
    const version = {
      pageId: currentPage.id,
      versionNumber: (currentPage.versions?.length || 0) + 1,
      createdByUserId: user.id,
      snapshotJson: JSON.stringify(currentSections),
      createdAt: new Date().toISOString()
    };

    if (!currentPage.versions) {
      currentPage.versions = [];
    }
    currentPage.versions.push(version);

    await pageRepository.update(currentPage.id, {
      sections: currentSections,
      versions: currentPage.versions,
      updatedAt: new Date().toISOString()
    });

    toast.success('Version gespeichert');
    renderVersionHistory();
  } catch (error) {
    console.error('Error saving version:', error);
    toast.error('Fehler beim Speichern der Version');
  }
}

/**
 * Publish page
 */
async function publishPage() {
  saveCurrentSections();

  try {
    const user = api.me();
    const version = {
      pageId: currentPage.id,
      versionNumber: (currentPage.versions?.length || 0) + 1,
      createdByUserId: user.id,
      snapshotJson: JSON.stringify(currentSections),
      createdAt: new Date().toISOString()
    };

    if (!currentPage.versions) {
      currentPage.versions = [];
    }
    currentPage.versions.push(version);

    await pageRepository.update(currentPage.id, {
      sections: currentSections,
      status: 'published',
      publishedVersionId: version.id || version.versionNumber,
      versions: currentPage.versions,
      updatedAt: new Date().toISOString()
    });

    // Log audit event
    await logPublishAction('page', currentPage.id, { version: version.versionNumber });

    toast.success('Seite wurde veröffentlicht!');
    renderVersionHistory();
  } catch (error) {
    console.error('Error publishing page:', error);
    toast.error('Fehler beim Veröffentlichen');
  }
}

/**
 * Render preview
 */
function renderPreview() {
  const container = document.querySelector('#previewContainer');
  if (!container) return;

  container.innerHTML = currentSections
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map(section => renderPreviewSection(section))
    .join('');
}

/**
 * Render preview section
 */
function renderPreviewSection(section) {
  return `
    <div style="margin-bottom: 24px; padding: 16px; border: 1px solid var(--border); border-radius: 8px;">
      <div style="font-weight: 600; margin-bottom: 8px; color: var(--primary);">
        ${section.type.toUpperCase()}
      </div>
      ${section.title ? `<h3 style="margin-bottom: 8px;">${section.title}</h3>` : ''}
      ${section.subtitle ? `<p style="color: var(--text-secondary); margin-bottom: 8px;">${section.subtitle}</p>` : ''}
      ${section.content ? `<div style="margin-bottom: 8px;">${section.content}</div>` : ''}
      ${section.heroText ? `<div style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">${section.heroText}</div>` : ''}
      ${section.heroImage ? `<img src="${section.heroImage}" style="max-width: 100%; border-radius: 8px; margin-top: 8px;" />` : ''}
    </div>
  `;
}

/**
 * Render version history
 */
async function renderVersionHistory() {
  const container = document.querySelector('#versionsList');
  if (!container) return;

  const page = await pageRepository.findById(currentPage.id);
  const versions = page.versions || [];

  if (versions.length === 0) {
    container.innerHTML = '<div class="p" style="color: var(--text-secondary);">Noch keine Versionen gespeichert.</div>';
    return;
  }

  container.innerHTML = versions
    .sort((a, b) => b.versionNumber - a.versionNumber)
    .map(version => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const creator = users.find(u => u.id === version.createdByUserId);
      const isPublished = currentPage.publishedVersionId === (version.id || version.versionNumber);

      return `
        <div class="card pane" style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600;">
                Version ${version.versionNumber}
                ${isPublished ? '<span class="badge" style="background: var(--success); color: white; margin-left: 8px;">Veröffentlicht</span>' : ''}
              </div>
              <div style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
                ${creator?.name || 'Unbekannt'} • 
                ${new Date(version.createdAt).toLocaleString('de-DE')}
              </div>
            </div>
            ${!isPublished ? `
              <button class="btn small" onclick="window.restoreVersion(${version.versionNumber})">
                Wiederherstellen
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

  window.restoreVersion = async (versionNumber) => {
    const page = await pageRepository.findById(currentPage.id);
    const version = page.versions.find(v => v.versionNumber === versionNumber);
    if (version) {
      currentSections = JSON.parse(version.snapshotJson);
      renderSections();
      toast.success('Version wiederhergestellt');
    }
  };
}












