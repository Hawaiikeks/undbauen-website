/* Knowledge Obsidian: 3-Panel Obsidian-Style Knowledge Base */

import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { relationsRepository } from '../services/repositories/relationsRepository.js';
import { topicsRepository } from '../services/repositories/topicsRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';
import { renderLeftPanel, renderCenterList, renderRightDetail } from '../components/knowledgePanels.js';

// Global state
let state = {
  items: [],
  topics: [],
  allTags: [],
  filters: {
    search: '',
    topics: [],
    tags: [],
    type: 'all'
  },
  sort: 'updated', // 'updated' | 'alpha' | 'created'
  selectedItemId: null,
  selectedItem: null,
  relations: [],
  backlinks: []
};

/**
 * Initialize Knowledge Base
 */
export async function init() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  // Check for deep link /:id in URL
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  if (itemId) {
    state.selectedItemId = itemId;
  }

  // Listen for keyboard shortcuts
  setupKeyboardShortcuts();

  // Load and render
  await loadData();
  render();
}

/**
 * Load all data
 */
async function loadData() {
  try {
    // Load all data in parallel
    const [items, topics, allTags] = await Promise.all([
      knowledgeRepository.findPublished(),
      topicsRepository.findAllSorted(),
      knowledgeRepository.getAllTags()
    ]);

    state.items = items;
    state.topics = topics;
    state.allTags = allTags;

    // If there's a selected item, load its details
    if (state.selectedItemId) {
      await loadItemDetail(state.selectedItemId);
    }
  } catch (error) {
    console.error('Error loading knowledge data:', error);
    toast.error('Fehler beim Laden der Daten');
  }
}

/**
 * Load item detail with relations
 */
async function loadItemDetail(itemId) {
  try {
    const item = await knowledgeRepository.findById(itemId);
    if (!item) {
      toast.error('Artikel nicht gefunden');
      state.selectedItemId = null;
      state.selectedItem = null;
      return;
    }

    state.selectedItem = item;

    // Load relations
    const { outgoing, incoming } = await relationsRepository.findForItem(itemId);
    
    // Enrich relations with actual item data
    state.relations = await Promise.all(
      outgoing.map(async (rel) => {
        const relatedItem = await knowledgeRepository.findById(rel.toItemId);
        return { relation: rel, item: relatedItem };
      })
    );

    state.backlinks = await Promise.all(
      incoming.map(async (rel) => {
        const relatedItem = await knowledgeRepository.findById(rel.fromItemId);
        return { relation: rel, item: relatedItem };
      })
    );

    // Update URL
    const url = new URL(window.location);
    url.searchParams.set('id', itemId);
    window.history.pushState({}, '', url);
  } catch (error) {
    console.error('Error loading item detail:', error);
    toast.error('Fehler beim Laden des Artikels');
  }
}

/**
 * Filter and sort items
 */
function getFilteredItems() {
  let filtered = [...state.items];

  // Filter by topics
  if (state.filters.topics && state.filters.topics.length > 0) {
    filtered = filtered.filter(item =>
      item.topics && item.topics.some(topicId => state.filters.topics.includes(topicId))
    );
  }

  // Filter by tags
  if (state.filters.tags && state.filters.tags.length > 0) {
    const tagsLower = state.filters.tags.map(t => t.toLowerCase());
    filtered = filtered.filter(item =>
      item.tags && item.tags.some(tag => tagsLower.includes(tag.toLowerCase()))
    );
  }

  // Filter by type
  if (state.filters.type && state.filters.type !== 'all') {
    filtered = filtered.filter(item => item.type === state.filters.type);
  }

  // Filter by search
  if (state.filters.search) {
    const queryLower = state.filters.search.toLowerCase();
    filtered = filtered.filter(item =>
      (item.title && item.title.toLowerCase().includes(queryLower)) ||
      (item.summary && item.summary.toLowerCase().includes(queryLower)) ||
      (item.body && item.body.toLowerCase().includes(queryLower)) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(queryLower)))
    );
  }

  // Sort
  switch (state.sort) {
    case 'alpha':
      filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      break;
    case 'created':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'updated':
    default:
      filtered.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      break;
  }

  return filtered;
}

/**
 * Render all panels
 */
function render() {
  const container = document.querySelector('#knowledgeContainer');
  if (!container) return;

  const filteredItems = getFilteredItems();

  container.innerHTML = `
    <div class="knowledge-3panel-layout">
      ${renderLeftPanel({
        topics: state.topics,
        allTags: state.allTags,
        filters: state.filters,
        itemCount: state.items.length
      })}
      ${renderCenterList({
        items: filteredItems,
        filters: state.filters,
        sort: state.sort
      })}
      ${renderRightDetail({
        item: state.selectedItem,
        topics: state.topics,
        relations: state.relations,
        backlinks: state.backlinks
      })}
    </div>
  `;

  wireEvents();
}

/**
 * Wire all event listeners
 */
function wireEvents() {
  // Search input
  const searchInput = document.querySelector('#knowledgeSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.filters.search = e.target.value;
      render();
    });
  }

  // Filter by topic
  document.querySelectorAll('[data-action="filter-topic"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const topicId = btn.dataset.topic;
      if (topicId === 'all') {
        state.filters.topics = [];
      } else {
        // Toggle topic
        if (state.filters.topics.includes(topicId)) {
          state.filters.topics = state.filters.topics.filter(t => t !== topicId);
        } else {
          state.filters.topics = [topicId]; // Single topic selection
        }
      }
      render();
    });
  });

  // Toggle tag
  document.querySelectorAll('[data-action="toggle-tag"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.dataset.tag;
      if (state.filters.tags.includes(tag)) {
        state.filters.tags = state.filters.tags.filter(t => t !== tag);
      } else {
        state.filters.tags.push(tag);
      }
      render();
    });
  });

  // Show all tags
  const showAllTagsBtn = document.querySelector('[data-action="show-all-tags"]');
  if (showAllTagsBtn) {
    showAllTagsBtn.addEventListener('click', () => {
      // TODO: Show modal with all tags
      toast.info('Alle Tags anzeigen - coming soon');
    });
  }

  // Reset filters
  const resetBtn = document.querySelector('[data-action="reset-filters"]');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.filters = {
        search: '',
        topics: [],
        tags: [],
        type: 'all'
      };
      render();
    });
  }

  // Type filter
  const typeFilter = document.querySelector('#knowledgeTypeFilter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      state.filters.type = e.target.value;
      render();
    });
  }

  // Sort
  const sortSelect = document.querySelector('#knowledgeSortBy');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      render();
    });
  }

  // View item
  document.querySelectorAll('[data-action="view-item"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const itemId = btn.dataset.itemId;
      state.selectedItemId = itemId;
      await loadItemDetail(itemId);
      render();
      
      // Scroll right panel to top
      const rightPanel = document.querySelector('.knowledge-right-panel');
      if (rightPanel) {
        rightPanel.scrollTop = 0;
      }
    });
  });

  // Close detail
  const closeBtn = document.querySelector('[data-action="close-detail"]');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      state.selectedItemId = null;
      state.selectedItem = null;
      state.relations = [];
      state.backlinks = [];
      
      // Remove id from URL
      const url = new URL(window.location);
      url.searchParams.delete('id');
      window.history.pushState({}, '', url);
      
      render();
    });
  }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+K or Cmd+K: Focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('#knowledgeSearch');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }

    // Escape: Clear search or close detail
    if (e.key === 'Escape') {
      if (state.filters.search) {
        state.filters.search = '';
        render();
      } else if (state.selectedItem) {
        state.selectedItemId = null;
        state.selectedItem = null;
        state.relations = [];
        state.backlinks = [];
        const url = new URL(window.location);
        url.searchParams.delete('id');
        window.history.pushState({}, '', url);
        render();
      }
    }
  });
}

/**
 * Handle browser back/forward
 */
window.addEventListener('popstate', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  if (itemId && itemId !== state.selectedItemId) {
    state.selectedItemId = itemId;
    loadItemDetail(itemId).then(() => render());
  } else if (!itemId && state.selectedItemId) {
    state.selectedItemId = null;
    state.selectedItem = null;
    state.relations = [];
    state.backlinks = [];
    render();
  }
});

// Auto-init when module loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}




