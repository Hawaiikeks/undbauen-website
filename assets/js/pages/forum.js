/**
 * Forum Page
 *
 * Renders the main forum page with categories and search functionality.
 * Displays forum categories with thread counts and last activity.
 *
 * @module pages/forum
 */

import { api } from '../services/apiClient.js';
import { handleError } from '../services/errorHandler.js';
import { renderErrorState } from '../components/emptyStates.js';
import { $ } from '../utils.js';

/**
 * Render main forum page with categories
 * Displays all forum categories with statistics and search functionality
 * @returns {void}
 */
export function renderForum() {
  try {
    const catGrid = $('#catGrid');
    if (!catGrid) {
      return;
    }

    catGrid.innerHTML = '<div class="p-xl text-center text-muted">Lade Forum...</div>';

    setTimeout(() => {
      const cats = api.listForumCategories();
      $('#catGrid').innerHTML = cats
        .map(c => {
          const lastThreadInfo = c.lastThread
            ? `
          <div class="small" style="margin-top:8px; color:var(--text-secondary)">
            <div>Letzter Thread: <strong>${c.lastThread.title.length > 40 ? c.lastThread.title.substring(0, 40) + '...' : c.lastThread.title}</strong></div>
            <div style="margin-top:4px">${new Date(c.lastThread.lastActivityAt).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
          </div>
        `
            : '<div class="small" style="margin-top:8px; color:var(--text-muted)">Noch keine Threads</div>';

          const isLightMode = document.documentElement.getAttribute('data-theme') !== 'dark';
          const badgeStyle = isLightMode
            ? 'background: rgba(255, 107, 53, 0.15); color: #C2410C; border: 1px solid rgba(255, 107, 53, 0.3); font-weight: 600;'
            : 'background: var(--primary); color: white;';

          return `
          <div class="card" style="padding:20px; cursor:pointer; transition:transform 0.2s, box-shadow 0.2s;" 
               onclick="window.location.href='forum-kategorie.html?cat=${encodeURIComponent(c.id)}'"
               onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
               onmouseout="this.style.transform=''; this.style.boxShadow=''">
            <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px">
              <div style="font-size:32px">${c.icon}</div>
              <div style="flex:1">
                <div class="h3" style="margin:0">${c.title}</div>
                <div class="small" style="color:var(--text-secondary); margin-top:4px">${c.desc}</div>
              </div>
              <span class="badge" style="${badgeStyle}">${c.topicCount || 0} Threads</span>
            </div>
            ${lastThreadInfo}
          </div>
        `;
        })
        .join('');

      // Search functionality
      const searchInput = $('#forumSearch');
      const searchBtn = $('#forumSearchBtn');
      const searchResults = $('#forumSearchResults');
      const searchResultsList = $('#forumSearchResultsList');

      if (searchInput && searchBtn) {
        const performSearch = () => {
          const query = searchInput.value.trim();
          if (!query) {
            searchResults.style.display = 'none';
            return;
          }

          const results = performForumSearch(query);
          if (results.length === 0) {
            searchResultsList.innerHTML = '<div class="p">Keine Ergebnisse gefunden.</div>';
          } else {
            searchResultsList.innerHTML = results
              .map(
                r => `
              <div class="card" style="padding:16px; margin-bottom:12px; cursor:pointer" 
                   onclick="window.location.href='forum-thread.html?thread=${encodeURIComponent(r.threadId)}'">
                <div style="font-weight:600; margin-bottom:8px">${r.threadTitle}</div>
                <div class="small" style="color:var(--text-secondary); margin-bottom:8px">${r.categoryTitle}</div>
                <div class="p" style="font-size:14px">${r.snippet}</div>
              </div>
            `
              )
              .join('');
          }
          searchResults.style.display = 'block';
        };

        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', e => {
          if (e.key === 'Enter') {
            performSearch();
          }
        });
      }
    }, 100);
  } catch (error) {
    handleError(error, { context: 'renderForum' });
    const catGrid = $('#catGrid');
    if (catGrid) {
      catGrid.innerHTML = renderErrorState({
        title: 'Fehler beim Laden des Forums',
        message: 'Das Forum konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
        retryLabel: 'Erneut versuchen',
        retryCallback: () => window.location.reload()
      });
    }
  }
}

/**
 * Performs a forum search across threads and posts
 * @param {string} query - Search query
 * @returns {Array} Array of search results
 */
export function performForumSearch(query) {
  const searchLower = query.toLowerCase();
  const threads = api.getForumThreads();
  const categories = api.listForumCategories();
  const results = [];

  threads.forEach(thread => {
    if (thread.deleted || thread.archived) {
      return;
    }

    const category = categories.find(c => c.id === thread.categoryId);
    const posts = api.getForumPosts(thread.id) || [];

    // Search in thread title
    if (thread.title.toLowerCase().includes(searchLower)) {
      const firstPost = posts.find(p => !p.deleted);
      results.push({
        threadId: thread.id,
        threadTitle: thread.title,
        categoryTitle: category?.title || 'Unbekannt',
        snippet: firstPost ? (firstPost.body || '').substring(0, 150) + '...' : ''
      });
      return;
    }

    // Search in posts
    const matchingPost = posts.find(
      p =>
        !p.deleted &&
        (p.body?.toLowerCase().includes(searchLower) ||
          p.authorEmail?.toLowerCase().includes(searchLower))
    );

    if (matchingPost) {
      results.push({
        threadId: thread.id,
        threadTitle: thread.title,
        categoryTitle: category?.title || 'Unbekannt',
        snippet: (matchingPost.body || '').substring(0, 150) + '...'
      });
    }
  });

  return results;
}
