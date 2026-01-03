/* Resources Page: Member view of resources */

import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

let currentFilter = {
  search: '',
  category: 'all',
  tags: []
};

/**
 * Render resources page
 */
export async function renderResources() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  const container = document.querySelector('#resourcesContainer') || document.querySelector('main');
  if (!container) return;

  // Get all resources visible to members (member or public visibility)
  const allResources = await resourceRepository.findAll();
  const memberVisibleResources = allResources.filter(r => 
    r.visibility === 'member' || r.visibility === 'public'
  );
  const filteredResources = filterResources(memberVisibleResources);
  const sortedResources = filteredResources.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Get all categories and tags
  const categories = await getCategories();
  const allTags = getAllTags(allResources);

  container.innerHTML = renderResourcesPage(sortedResources, categories, allTags);
  wireResourcesEvents();
}

/**
 * Filter resources
 */
function filterResources(resources) {
  return resources.filter(resource => {
    if (currentFilter.search) {
      const searchLower = currentFilter.search.toLowerCase();
      const matchesSearch = 
        (resource.title && resource.title.toLowerCase().includes(searchLower)) ||
        (resource.description && resource.description.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    if (currentFilter.category !== 'all' && resource.categoryId !== currentFilter.category) {
      return false;
    }

    if (currentFilter.tags.length > 0) {
      const resourceTags = resource.tags || [];
      const hasTag = currentFilter.tags.some(tag => resourceTags.includes(tag));
      if (!hasTag) return false;
    }

    return true;
  });
}

/**
 * Get categories
 */
async function getCategories() {
  // For now, return empty array - categories would come from resourceCategoryRepository
  return [];
}

/**
 * Get all unique tags
 */
function getAllTags(resources) {
  const tagSet = new Set();
  resources.forEach(resource => {
    (resource.tags || []).forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
}

/**
 * Render resources page
 */
function renderResourcesPage(resources, categories, tags) {
  return `
    <div class="container pageWrap">
      <div style="margin-bottom: 24px;">
        <h1 class="h2">Resources</h1>
        <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
          Zugriff auf alle verfügbaren Ressourcen und Materialien.
        </p>
      </div>

      <div class="card pane" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: end;">
          <div>
            <label class="label">Suche</label>
            <input class="input" id="resourceSearch" placeholder="Ressourcen durchsuchen..." />
          </div>
          <div>
            <label class="label">Kategorie</label>
            <select class="input" id="resourceCategory">
              <option value="all">Alle Kategorien</option>
              ${categories.map(cat => `
                <option value="${cat.id}" ${currentFilter.category === cat.id ? 'selected' : ''}>
                  ${cat.name}
                </option>
              `).join('')}
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
                        onclick="window.toggleResourceTag('${tag}')">
                  ${tag}
                </button>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${resources.length} ${resources.length === 1 ? 'Ressource' : 'Ressourcen'} gefunden
      </div>

      ${resources.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📚</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Ressourcen gefunden</div>
          <div style="color: var(--text-secondary);">
            Es gibt keine Ressourcen, die den aktuellen Filtern entsprechen.
          </div>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
          ${resources.map(resource => renderResourceCard(resource)).join('')}
        </div>
      `}
    </div>
  `;
}

/**
 * Render resource card
 */
function renderResourceCard(resource) {
  const latestVersion = resource.versions && resource.versions.length > 0 
    ? resource.versions[resource.versions.length - 1] 
    : null;

  return `
    <div class="card pane">
      <div style="font-weight: 600; font-size: 18px; margin-bottom: 8px;">
        ${resource.title || 'Unbenannt'}
      </div>
      <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 12px; line-height: 1.5;">
        ${resource.description || ''}
      </div>
      
      ${(resource.tags || []).length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
          ${resource.tags.map(tag => `
            <span class="badge" style="font-size: 11px;">${tag}</span>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 16px;">
        <div style="color: var(--text-secondary); font-size: 12px;">
          ${latestVersion ? `v${latestVersion.versionLabel || '1.0'}` : ''}
        </div>
        ${latestVersion ? `
          <button class="btn small primary" onclick="window.downloadResource('${resource.id}')">
            Download
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Wire resources events
 */
function wireResourcesEvents() {
  const searchInput = document.querySelector('#resourceSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentFilter.search = e.target.value;
      renderResources();
    });
  }

  const categorySelect = document.querySelector('#resourceCategory');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      currentFilter.category = e.target.value;
      renderResources();
    });
  }

  window.toggleResourceTag = (tag) => {
    const index = currentFilter.tags.indexOf(tag);
    if (index > -1) {
      currentFilter.tags.splice(index, 1);
    } else {
      currentFilter.tags.push(tag);
    }
    renderResources();
  };

  window.downloadResource = async (resourceId) => {
    try {
      const resource = await resourceRepository.findById(resourceId);
      if (resource && resource.versions && resource.versions.length > 0) {
        const latestVersion = resource.versions[resource.versions.length - 1];
        if (latestVersion.fileKeyOrUrl) {
          // If it's a base64 data URL, create download link
          if (latestVersion.fileKeyOrUrl.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = latestVersion.fileKeyOrUrl;
            link.download = resource.title || 'resource';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } else {
            window.open(latestVersion.fileKeyOrUrl, '_blank');
          }
        } else {
          toast.info('Download-Link nicht verfügbar');
        }
      }
    } catch (error) {
      console.error('Error downloading resource:', error);
      toast.error('Fehler beim Download');
    }
  };
}

