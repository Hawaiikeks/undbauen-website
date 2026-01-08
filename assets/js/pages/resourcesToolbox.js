/* Resources Toolbox: 2-Level Category System with Grid/Table View */

import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { categoriesRepository } from '../services/repositories/categoriesRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { renderCategoryCard, renderResourceCard, renderResourceTable } from '../components/resourceCards.js';
import { getIcon } from '../components/icons.js';

let state = {
  view: 'landing', // 'landing' | 'category'
  currentCategoryId: null,
  currentCategory: null,
  categories: [],
  resources: [],
  filteredResources: [],
  filters: {
    type: 'all',
    tags: [],
    search: ''
  },
  viewMode: 'grid', // 'grid' | 'table'
  featuredResources: []
};

export async function init() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  await loadData();
  render();
}

async function loadData() {
  try {
    [state.categories, state.featuredResources] = await Promise.all([
      categoriesRepository.findAllWithCounts(),
      resourceRepository.findFeatured()
    ]);
  } catch (error) {
    console.error('Error loading resources data:', error);
    toast.error('Fehler beim Laden der Daten');
  }
}

function render() {
  const container = document.querySelector('#resourcesContainer');
  if (!container) return;

  if (state.view === 'landing') {
    renderLanding(container);
  } else if (state.view === 'category') {
    renderCategoryView(container);
  }

  wireEvents();
}

function renderLanding(container) {
  const topLevelCategories = state.categories.filter(c => !c.parentId);

  container.innerHTML = `
    <div class="resources-landing">
      <div class="resources-header">
        <h1>Toolbox & Library</h1>
        <p>Kuratierte Ressourcen für die Community</p>
      </div>

      ${state.featuredResources.length > 0 ? `
        <div class="resources-featured">
          <h2>Featured Resources</h2>
          <div class="resources-grid">
            ${state.featuredResources.slice(0, 3).map(res => renderResourceCard(res)).join('')}
          </div>
        </div>
      ` : ''}

      <div class="resources-categories">
        <h2>Kategorien</h2>
        <div class="categories-grid">
          ${topLevelCategories.map(cat => 
            renderCategoryCard(cat, cat.resourceCount, null)
          ).join('')}
        </div>
      </div>
    </div>
  `;
}

async function renderCategoryView(container) {
  container.innerHTML = `
    <div class="resources-category-view">
      <div class="category-header">
        <button class="btn" data-action="back-to-landing">${getIcon('arrow-left')} Zurück</button>
        <div>
          <h1>${state.currentCategory?.title || 'Kategorie'}</h1>
          <p>${state.currentCategory?.description || ''}</p>
        </div>
      </div>

      <div class="category-controls">
        <div class="category-filters">
          <input class="input" id="resourceSearch" placeholder="Suche..." value="${state.filters.search}" />
          <select class="input" id="resourceTypeFilter">
            <option value="all">Alle Typen</option>
            <option value="file">Dateien</option>
            <option value="link">Links</option>
            <option value="tool">Tools</option>
            <option value="template">Templates</option>
            <option value="video">Videos</option>
          </select>
        </div>
        <div class="view-toggle">
          <button class="btn ${state.viewMode === 'grid' ? 'primary' : ''}" data-action="toggle-view" data-view="grid">
            ${getIcon('grid')}
          </button>
          <button class="btn ${state.viewMode === 'table' ? 'primary' : ''}" data-action="toggle-view" data-view="table">
            ${getIcon('list')}
          </button>
        </div>
      </div>

      <div class="category-content">
        ${state.filteredResources.length === 0 ? `
          <div class="resources-empty">
            <div>${getIcon('folder')}</div>
            <p>Keine Ressourcen gefunden</p>
          </div>
        ` : state.viewMode === 'grid' ? `
          <div class="resources-grid">
            ${state.filteredResources.map(res => renderResourceCard(res)).join('')}
          </div>
        ` : renderResourceTable(state.filteredResources)}
      </div>
    </div>
  `;
}

function wireEvents() {
  document.querySelectorAll('[data-action="open-category"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const categoryId = btn.dataset.categoryId;
      await openCategory(categoryId);
    });
  });

  const backBtn = document.querySelector('[data-action="back-to-landing"]');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      state.view = 'landing';
      state.currentCategoryId = null;
      state.currentCategory = null;
      render();
    });
  }

  const searchInput = document.querySelector('#resourceSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      applyFilters();
      render();
    });
  }

  const typeFilter = document.querySelector('#resourceTypeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      applyFilters();
      render();
    });
  }

  document.querySelectorAll('[data-action="toggle-view"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.viewMode = btn.dataset.view;
      render();
    });
  });

  document.querySelectorAll('[data-action="download-resource"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const resourceId = btn.dataset.resourceId;
      downloadResource(resourceId);
    });
  });

  document.querySelectorAll('[data-action="open-resource"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const resourceId = btn.dataset.resourceId;
      openResource(resourceId);
    });
  });
}

async function openCategory(categoryId) {
  state.view = 'category';
  state.currentCategoryId = categoryId;
  state.currentCategory = await categoriesRepository.findById(categoryId);
  state.resources = await resourceRepository.findByCategory(categoryId);
  applyFilters();
  render();
}

function applyFilters() {
  let filtered = [...state.resources];

  if (state.filters.type !== 'all') {
    filtered = filtered.filter(r => r.type === state.filters.type);
  }

  if (state.filters.search) {
    const query = state.filters.search.toLowerCase();
    filtered = filtered.filter(r =>
      r.title?.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      r.tags?.some(t => t.toLowerCase().includes(query))
    );
  }

  state.filteredResources = filtered;
}

function downloadResource(resourceId) {
  const resource = state.resources.find(r => r.id === resourceId);
  if (!resource) return;
  
  toast.info(`Download: ${resource.title}`);
  // In real app: window.open(resource.fileKey, '_blank');
}

function openResource(resourceId) {
  const resource = state.resources.find(r => r.id === resourceId);
  if (!resource) return;
  
  const url = resource.url || resource.templateUrl || resource.embedUrl;
  if (url) {
    window.open(url, '_blank', 'noopener');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


