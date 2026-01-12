/**
 * Forum Category Page
 * Renders threads for a specific forum category
 */

import { api } from '../services/apiClient.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { handleError } from '../services/errorHandler.js';
import { renderErrorState } from '../components/emptyStates.js';
import { toast } from '../components/toast.js';
import { qs } from '../utils.js';

const $ = s => document.querySelector(s);

/**
 * Renders the forum category page with threads
 */
export function renderForumCategory() {
  try {
    const catTitle = $('#catTitle');
    const catDesc = $('#catDesc');
    const threadList = $('#threadList');
    const newThreadBtn = $('#newThreadBtn');

    if (!catTitle || !threadList) {
      console.warn('Forum category elements not found');
      return;
    }

    const categoryId = qs.get('cat');
    if (!categoryId) {
      handleError(new Error('Category ID missing'), { context: 'renderForumCategory' });
      return;
    }

    const categories = api.listForumCategories();
    const category = categories.find(c => c.id === categoryId);

    if (!category) {
      handleError(new Error('Category not found'), { context: 'renderForumCategory' });
      return;
    }

    catTitle.textContent = category.title;
    if (catDesc) {
      catDesc.textContent = category.desc;
    }

    const threads = api
      .getForumThreads()
      .filter(t => t.categoryId === categoryId && !t.deleted && !t.archived)
      .sort((a, b) => {
        // Pinned threads first, then by last activity
        if (a.pinned && !b.pinned) {
          return -1;
        }
        if (!a.pinned && b.pinned) {
          return 1;
        }
        return (b.lastActivityAt || '').localeCompare(a.lastActivityAt || '');
      });

    threadList.innerHTML =
      threads.length === 0
        ? '<div class="p" style="text-align:center; padding:40px; color:var(--text-secondary)">Noch keine Threads in dieser Kategorie.</div>'
        : threads
          .map(t => {
            const posts = api.getForumPosts(t.id) || [];
            const firstPost = posts.find(p => !p.deleted && p.type === 'op');
            const lastPost = posts
              .filter(p => !p.deleted)
              .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];

            const lastActivity = lastPost?.createdAt || t.lastActivityAt || t.createdAt;
            const lastDate = lastActivity
              ? new Date(lastActivity).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })
              : '';

            return `
            <div class="listItem" style="padding:16px; cursor:pointer; ${t.pinned ? 'border-left:4px solid var(--primary);' : ''}" 
                 onclick="window.location.href='forum-thread.html?thread=${encodeURIComponent(t.id)}'">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px">
                <div style="flex:1">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
                    ${t.pinned ? '<span class="badge" style="background:var(--primary); color:white">📌 Gepinnt</span>' : ''}
                    ${t.locked ? '<span class="badge">🔒 Geschlossen</span>' : ''}
                    <div style="font-weight:600; font-size:16px">${t.title}</div>
                  </div>
                  <div class="small" style="color:var(--text-secondary); margin-bottom:8px">
                    ${firstPost ? (firstPost.body || '').substring(0, 120) + (firstPost.body?.length > 120 ? '...' : '') : ''}
                  </div>
                  <div class="metaLine" style="margin-top:8px">
                    <span>Von ${t.createdBy?.split('@')[0] || 'Unbekannt'}</span>
                    <span>${t.replyCount || 0} Antworten</span>
                    <span>${t.views || 0} Aufrufe</span>
                    ${lastDate ? `<span>Letzte Aktivität: ${lastDate}</span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
          })
          .join('');

    // New thread modal
    if (newThreadBtn) {
      newThreadBtn.addEventListener('click', () => {
        $('#thrOverlay').style.display = 'flex';
        $('#thrTitle').value = '';
        const bodyTextarea = $('#thrBody');
        if (bodyTextarea) {
          bodyTextarea.value = '';
          // Initialize rich text editor if not already initialized
          if (window.Quill && !richTextEditor.editors.has('thrBody')) {
            setTimeout(() => {
              try {
                richTextEditor.createEditor(bodyTextarea);
              } catch (e) {
                console.warn('Could not initialize Rich Text Editor:', e);
              }
            }, 100);
          }
        }
      });
    }

    // Modal close handlers
    $('#thrClose')?.addEventListener('click', () => {
      $('#thrOverlay').style.display = 'none';
    });
    $('#thrOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'thrOverlay') {
        $('#thrOverlay').style.display = 'none';
      }
    });

    // Create thread handler
    $('#thrSave')?.addEventListener('click', () => {
      const title = $('#thrTitle')?.value.trim();
      let body = '';

      // Get content from rich text editor if available
      const editor = richTextEditor.editors.get('thrBody');
      if (editor && editor.quill) {
        body = editor.quill.root.innerHTML;
      } else {
        body = $('#thrBody')?.value.trim() || '';
      }

      if (!title || !body) {
        toast.error('Titel und Inhalt sind erforderlich.');
        return;
      }

      const res = api.createForumThread(categoryId, title, body);
      if (res.ok) {
        toast.success('Thread erstellt.');
        $('#thrOverlay').style.display = 'none';
        window.location.href = `forum-thread.html?thread=${encodeURIComponent(res.threadId)}`;
      } else {
        toast.error(res.error || 'Fehler beim Erstellen des Threads.');
      }
    });
  } catch (error) {
    handleError(error, { context: 'renderForumCategory' });
    const threadList = $('#threadList');
    if (threadList) {
      threadList.innerHTML = renderErrorState({
        title: 'Fehler beim Laden der Kategorie',
        message: 'Die Kategorie konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
        retryLabel: 'Erneut versuchen',
        retryCallback: () => window.location.reload()
      });
    }
  }
}








