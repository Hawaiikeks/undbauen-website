/**
 * Forum Thread Page
 * Renders a single forum thread with posts and reply functionality
 */

import { api } from '../services/apiClient.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { handleError } from '../services/errorHandler.js';
import { renderErrorState } from '../components/emptyStates.js';
import { toast } from '../components/toast.js';
import { avatarGenerator } from '../components/avatarGenerator.js';
import { qs } from '../utils.js';

const $ = s => document.querySelector(s);

/**
 * Renders the forum thread page
 */
export function renderForumThread() {
  try {
    const threadTitle = $('#threadTitle');
    const threadMeta = $('#threadMeta');
    const postsWrap = $('#postsWrap');
    const replyBody = $('#replyBody');
    const replyBtn = $('#replyBtn');
    const replyErr = $('#replyErr');

    if (!threadTitle || !postsWrap) {
      console.warn('Forum thread elements not found');
      return;
    }

    const threadId = qs.get('thread');
    if (!threadId) {
      handleError(new Error('Thread ID missing'), { context: 'renderForumThread' });
      return;
    }

    const thread = api.getForumThread(threadId);
    if (!thread) {
      handleError(new Error('Thread not found'), { context: 'renderForumThread' });
      return;
    }

    if (thread.deleted) {
      postsWrap.innerHTML =
        '<div class="p" style="text-align:center; padding:40px; color:var(--text-secondary)">Dieser Thread wurde gelöscht.</div>';
      return;
    }

    // Update title and meta
    threadTitle.textContent = thread.title;
    if (threadMeta) {
      const categories = api.listForumCategories();
      const category = categories.find(c => c.id === thread.categoryId);
      threadMeta.innerHTML = `
        <span class="badge">${category?.title || 'Unbekannt'}</span>
        ${thread.pinned ? '<span class="badge" style="background:var(--primary); color:white">📌 Gepinnt</span>' : ''}
        ${thread.locked ? '<span class="badge">🔒 Geschlossen</span>' : ''}
        <span>${thread.replyCount || 0} Antworten</span>
        <span>${thread.views || 0} Aufrufe</span>
      `;
    }

    // Load posts
    const posts = api
      .getForumPosts(threadId)
      .filter(p => !p.deleted)
      .sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    // Render posts
    postsWrap.innerHTML =
      posts.length === 0
        ? '<div class="p" style="text-align:center; padding:40px; color:var(--text-secondary)">Noch keine Beiträge.</div>'
        : posts
          .map((post, index) => {
            const profile = api.getProfileByEmail(post.authorEmail);
            const authorName = profile?.name || post.authorEmail.split('@')[0];
            const isOP = post.type === 'op';
            const date = post.createdAt
              ? new Date(post.createdAt).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
              : '';

            return `
            <div class="post" style="padding:20px; ${index > 0 ? 'border-top:1px solid var(--border);' : ''}">
              <div style="display:flex; gap:16px">
                <div style="flex-shrink:0">
                  ${avatarGenerator.generateInitialsAvatar(authorName, 48)}
                </div>
                <div style="flex:1">
                  <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px">
                    <div style="font-weight:600">${authorName}</div>
                    ${isOP ? '<span class="badge blue">OP</span>' : ''}
                    <span class="small" style="color:var(--text-secondary)">${date}</span>
                  </div>
                  <div class="p" style="line-height:1.6; white-space:pre-wrap; word-wrap:break-word">
                    ${post.body || ''}
                  </div>
                </div>
              </div>
            </div>
          `;
          })
          .join('');

    // Admin tools
    const u = api.me();
    const adminTools = $('#adminThreadTools');
    if (adminTools && api.isAdmin()) {
      adminTools.style.display = 'flex';

      $('#pinBtn')?.addEventListener('click', () => {
        const res = api.adminPinThread(threadId, !thread.pinned);
        if (res.ok) {
          toast.success(thread.pinned ? 'Thread entpinnt.' : 'Thread gepinnt.');
          window.location.reload();
        } else {
          toast.error(res.error || 'Fehler.');
        }
      });

      $('#lockBtn')?.addEventListener('click', () => {
        const res = api.adminLockThread(threadId, !thread.locked);
        if (res.ok) {
          toast.success(thread.locked ? 'Thread entsperrt.' : 'Thread gesperrt.');
          window.location.reload();
        } else {
          toast.error(res.error || 'Fehler.');
        }
      });

      $('#delBtn')?.addEventListener('click', async () => {
        if (!confirm('Thread wirklich löschen?')) {
          return;
        }
        const res = api.adminDeleteThread(threadId);
        if (res.ok) {
          toast.success('Thread gelöscht.');
          window.location.href = 'forum.html';
        } else {
          toast.error(res.error || 'Fehler.');
        }
      });
    }

    // Reply functionality
    if (replyBody && replyBtn && !thread.locked) {
      // Initialize rich text editor
      if (window.Quill && !richTextEditor.editors.has('replyBody')) {
        setTimeout(() => {
          try {
            richTextEditor.createEditor(replyBody);
          } catch (e) {
            console.warn('Could not initialize Rich Text Editor:', e);
          }
        }, 100);
      }

      replyBtn.addEventListener('click', async () => {
        let body = '';

        // Get content from rich text editor if available
        const editor = richTextEditor.editors.get('replyBody');
        if (editor && editor.quill) {
          body = editor.quill.root.innerHTML;
        } else {
          body = replyBody.value.trim() || '';
        }

        if (!body) {
          if (replyErr) {
            replyErr.textContent = 'Bitte geben Sie eine Antwort ein.';
            replyErr.classList.add('animate-subtle-shake');
            setTimeout(() => replyErr.classList.remove('animate-subtle-shake'), 300);
          }
          return;
        }

        if (replyErr) {
          replyErr.textContent = '';
        }

        const { setButtonLoading } = await import('../utils/buttonHelpers.js');
        setButtonLoading(replyBtn, true, 'Wird gepostet...');

        try {
          const res = api.replyForumThread(threadId, body);
          if (res.ok) {
            toast.success('Antwort gepostet.');
            if (replyBody) {
              replyBody.value = '';
            }
            if (editor && editor.quill) {
              editor.quill.root.innerHTML = '';
            }
            window.location.reload();
          } else {
            if (replyErr) {
              replyErr.textContent = res.error || 'Fehler beim Posten.';
              replyErr.classList.add('animate-subtle-shake');
              setTimeout(() => replyErr.classList.remove('animate-subtle-shake'), 300);
            }
            toast.error(res.error || 'Fehler beim Posten.');
            setButtonLoading(replyBtn, false);
          }
        } catch (error) {
          toast.error('Fehler beim Posten.');
          setButtonLoading(replyBtn, false);
        }
      });
    } else if (thread.locked) {
      if (replyBody) {
        replyBody.disabled = true;
      }
      if (replyBtn) {
        replyBtn.disabled = true;
        replyBtn.textContent = 'Thread ist geschlossen';
      }
    }
  } catch (error) {
    handleError(error, { context: 'renderForumThread' });
    const postsWrap = $('#postsWrap');
    if (postsWrap) {
      postsWrap.innerHTML = renderErrorState({
        title: 'Fehler beim Laden des Threads',
        message: 'Der Thread konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
        retryLabel: 'Erneut versuchen',
        retryCallback: () => window.location.reload()
      });
    }
  }
}
