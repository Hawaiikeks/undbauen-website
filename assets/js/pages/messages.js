/**
 * Messages Page
 *
 * Handles message threads, inbox, system messages, and message composition.
 * Supports filtering, searching, and real-time message display.
 *
 * @module pages/messages
 */

import { api } from '../services/apiClient.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { handleError } from '../services/errorHandler.js';
import { renderErrorState } from '../components/emptyStates.js';
import { toast } from '../components/toast.js';
import { createSkeleton } from '../components/skeleton.js';
import { qs } from '../utils.js';

/**
 * Query selector shorthand
 * @type {function(string): HTMLElement|null}
 */
const $ = s => document.querySelector(s);

/**
 * Render messages page with inbox and system messages
 * Handles thread list, message display, filtering, and replies
 * @returns {void}
 */
export function renderMessages() {
  try {
    const u = api.me();
    let tab = 'inbox';
    let activeThread = qs.get('thread') || null;

    // Filter State (aus LocalStorage laden)
    let currentFilter = localStorage.getItem('msgFilter') || 'all';

    // Filter Toggle
    $('#msgFilterToggle')?.addEventListener('click', () => {
      const filters = $('#msgFilters');
      if (filters) {
        filters.style.display = filters.style.display === 'none' ? 'block' : 'none';
      }
    });

    // Filter Chips Event Listeners
    $('#msgFilterChips')
      ?.querySelectorAll('.filter-chip')
      .forEach(chip => {
        chip.addEventListener('click', () => {
          // Update active state
          $('#msgFilterChips')
            .querySelectorAll('.filter-chip')
            .forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          currentFilter = chip.dataset.filter;
          localStorage.setItem('msgFilter', currentFilter);
          renderThreadList();
        });
      });

    // Set initial active filter
    setTimeout(() => {
      $('#msgFilterChips')
        ?.querySelectorAll('.filter-chip')
        .forEach(chip => {
          if (chip.dataset.filter === currentFilter) {
            chip.classList.add('active');
          }
        });
    }, 100);

    /**
     * Render thread list with filtering and search
     * @param {boolean} [showLoading=false] - Show loading skeleton
     */
    const renderThreadList = (showLoading = false) => {
      // Edge case: Check if required DOM elements exist
      const threadListEl = $('#threadList');
      if (!threadListEl) {
        console.warn('threadList element not found');
        return;
      }

      if (showLoading && tab === 'inbox') {
        threadListEl.innerHTML = createSkeleton('list', 5);
        setTimeout(() => {
          renderThreadList(false);
        }, 300);
        return;
      }

      // Edge case: Safe access to search input
      const searchInput = $('#msgSearch');
      const q = (searchInput && searchInput.value ? searchInput.value : '').toLowerCase().trim();

      // Edge case: Ensure user email exists
      if (!u || !u.email) {
        threadListEl.innerHTML = '<div class="p">Bitte melden Sie sich an.</div>';
        return;
      }

      let threads = api.getThreads(u.email);

      // Edge case: Ensure threads is an array
      if (!Array.isArray(threads)) {
        threads = [];
      }

      // Apply filter
      if (tab === 'inbox' && currentFilter !== 'all') {
        if (currentFilter === 'unread') {
          threads = threads.filter(t => t.unreadCount > 0);
        } else if (currentFilter === 'relevant') {
          // Relevant = threads with unread or recent activity
          threads = threads.filter(
            t =>
              t.unreadCount > 0 ||
              (t.lastMessageAt &&
                new Date(t.lastMessageAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
          );
        } else if (currentFilter === 'contacts') {
          // Contacts = threads with known users (simplified: all for now)
          threads = threads;
        } else if (currentFilter === 'favorites') {
          // Favorites = threads marked as favorite (would need favorite field)
          threads = threads.filter(t => t.favorite === true);
        }
      }

      // Apply search
      threads = threads
        .filter(t => !q || (t.otherEmail + t.subject + t.lastSnippet).toLowerCase().includes(q))
        .sort((a, b) => (b.lastMessageAt || '').localeCompare(a.lastMessageAt || ''));

      threadListEl.innerHTML =
        tab === 'inbox'
          ? threads
            .map(t => {
              const isUnread = t.unreadCount > 0;
              const profile = api.getProfileByEmail(t.otherEmail);
              const otherName = profile?.name || t.otherEmail.split('@')[0];
              const lastDate = t.lastMessageAt
                ? new Date(t.lastMessageAt).toLocaleDateString('de-DE', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
                : '';
              return `
        <div class="threadItem ${t.id === activeThread ? 'active' : ''} ${isUnread ? 'thread-unread' : ''}" data-thread="${t.id}">
          <div class="threadTop">
            <div class="threadName" style="${isUnread ? 'font-weight:600; color:var(--text-primary)' : ''}">${otherName}</div>
            ${isUnread ? `<div class="badge blue" style="background:var(--primary); color:white">${t.unreadCount} neu</div>` : ''}
          </div>
          <div class="threadSnippet" style="${isUnread ? 'font-weight:500' : ''}">
            <b>${t.subject || '—'}</b><br/>
            <span style="color:var(--text-secondary); font-size:13px">${t.lastSnippet || ''}</span>
            ${lastDate ? `<span style="color:var(--text-muted); font-size:12px; margin-left:8px">${lastDate}</span>` : ''}
          </div>
        </div>
      `;
            })
            .join('')
          : api
            .listSystemMessages()
            .map(
              m => `
        <div class="threadItem" data-system="${m.id}">
          <div class="threadTop">
            <div class="threadName">SYSTEM</div>
            <div class="badge ${m.read ? '' : 'blue'}">${m.read ? '' : 'neu'}</div>
          </div>
          <div class="threadSnippet"><b>${m.title}</b><br/>${(m.body || '').slice(0, 90)}</div>
        </div>
      `
            )
            .join('');

      threadListEl.querySelectorAll('[data-thread]').forEach(el => {
        el.addEventListener('click', () => {
          activeThread = el.dataset.thread;
          api.markThreadRead(activeThread);
          openThread(activeThread);
          renderThreadList();
        });
      });

      threadListEl.querySelectorAll('[data-system]').forEach(el => {
        el.addEventListener('click', () => {
          openSystem(el.dataset.system);
        });
      });
    };

    /**
     * Open and display a message thread
     * @param {string} threadId - Thread ID to open
     */
    const openThread = threadId => {
      const msgs = api.getMessages(threadId);
      const right = $('#rightPane');
      right.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center; margin-bottom:16px">
        <div style="font-weight:900">Unterhaltung</div>
        <a class="btn" href="neue-nachricht.html">Neue</a>
      </div>
      <div id="msgList" style="flex:1; overflow-y:auto; margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); min-height:200px; max-height:400px"></div>
      <div style="flex-shrink:0">
        <label class="label">Antwort</label>
        <div style="position:relative">
          <textarea class="textarea" id="replyMsg" data-rich-text placeholder="Schreibe deine Nachricht..." style="min-height:100px; max-height:200px; resize:vertical"></textarea>
        </div>
        <div id="attachmentList" style="margin-top:8px"></div>
        <div class="err" id="msgErr"></div>
        <div style="margin-top:10px; display:flex; align-items:center; gap:8px">
          <button class="btn small" id="attachBtn">📎 Anhang</button>
          <button class="btn primary" id="sendReply">Senden</button>
          <div id="typingIndicator" style="display:none; font-size:13px; color:var(--text-secondary); font-style:italic">
            ${api.getProfileByEmail(api.getThreads(u.email).find(t => t.id === threadId)?.otherEmail)?.name || 'Jemand'} schreibt...
          </div>
        </div>
      </div>
    `;
      right.querySelector('#msgList').innerHTML = msgs
        .map(m => {
          const hasAttachments = m.attachments && m.attachments.length > 0;
          return `
      <div class="msgBlock ${m.from === u.email ? 'msgBlock-own' : ''}" style="margin-bottom:16px">
        <div class="msgMeta">
          <span><b>${m.from === u.email ? 'Du' : m.from}</b> → ${m.to === u.email ? 'Du' : m.to}</span>
          <span>${new Date(m.createdAt).toLocaleString()}</span>
        </div>
        <div class="p message-content">${m.body || ''}</div>
        ${
  hasAttachments
    ? `
          <div class="message-attachments" style="margin-top:8px">
            ${m.attachments
    .map(
      (att, idx) => `
              <div class="attachment-item" style="margin-top:4px">
                <span style="flex:1">📎 ${att.name} (${(att.size / 1024).toFixed(1)} KB)</span>
                <button class="btn small" onclick="downloadAttachment('${att.url}', '${att.name}')" title="Download">⬇️ Download</button>
              </div>
            `
    )
    .join('')}
          </div>
        `
    : ''
}
      </div>
    `;
        })
        .join('');

      // Typing indicator
      let typingTimeout;
      right.querySelector('#replyMsg')?.addEventListener('input', () => {
        // Simulate typing indicator (in real app, would send to server)
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          // Stop typing indicator
        }, 1000);
      });

      // File attachment
      const attachmentInput = document.createElement('input');
      attachmentInput.type = 'file';
      attachmentInput.multiple = true;
      attachmentInput.style.display = 'none';
      document.body.appendChild(attachmentInput);

      let selectedAttachments = [];
      attachmentInput.addEventListener('change', e => {
        Array.from(e.target.files).forEach(file => {
          if (file.size > 10 * 1024 * 1024) {
            toast.error(`Datei ${file.name} ist zu groß. Maximal 10MB erlaubt.`);
            return;
          }
          const reader = new FileReader();
          reader.onload = event => {
            selectedAttachments.push({
              name: file.name,
              size: file.size,
              type: file.type,
              url: event.target.result
            });
            updateAttachmentList();
          };
          reader.readAsDataURL(file);
        });
        // Reset input so same file can be selected again
        attachmentInput.value = '';
      });

      function updateAttachmentList() {
        const list = right.querySelector('#attachmentList');
        if (list) {
          if (selectedAttachments.length > 0) {
            list.innerHTML = `
            <div style="padding:8px; background:var(--bg); border-radius:6px; border:1px solid var(--border)">
              <div style="font-size:13px; font-weight:600; margin-bottom:8px">Anhänge:</div>
              ${selectedAttachments
    .map(
      (att, idx) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:6px; margin-bottom:4px; background:var(--surface); border-radius:4px">
                  <span style="font-size:12px; flex:1">📎 ${att.name} (${(att.size / 1024).toFixed(1)} KB)</span>
                  <button class="btn small" style="margin-left:8px" onclick="removeAttachment(${idx})" title="Entfernen">✕</button>
                </div>
              `
    )
    .join('')}
            </div>
          `;
          } else {
            list.innerHTML = '';
          }
        }
      }

      // Make removeAttachment accessible
      window.removeAttachment = function (idx) {
        selectedAttachments.splice(idx, 1);
        updateAttachmentList();
      };

      // Make downloadAttachment accessible
      window.downloadAttachment = function (url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      right.querySelector('#attachBtn').addEventListener('click', () => attachmentInput.click());

      right.querySelector('#sendReply').addEventListener('click', () => {
        let body = '';
        if (window.Quill && $('#replyMsg').value) {
          body = $('#replyMsg').value.trim();
          const textOnly = richTextEditor.getText('replyMsg');
          if (!textOnly || textOnly.trim().length === 0) {
            body = '';
          }
        } else {
          body = right.querySelector('#replyMsg').value.trim();
        }
        if (!body && selectedAttachments.length === 0) {
          right.querySelector('#msgErr').textContent = 'Text oder Anhang erforderlich.';
          return;
        }
        const other = api.getThreads(u.email).find(t => t.id === threadId)?.otherEmail;
        api.sendMessage({
          to: other,
          subject: 'Re: ' + (api.getThreads(u.email).find(t => t.id === threadId)?.subject || ''),
          body,
          attachments: selectedAttachments
        });
        selectedAttachments = [];
        location.href = `nachrichten.html?thread=${encodeURIComponent(threadId)}`;
      });

      // Initialize Rich Text Editor for reply
      setTimeout(() => {
        if (window.Quill && $('#replyMsg') && !richTextEditor.editors.has('replyMsg')) {
          richTextEditor.createEditor($('#replyMsg'));
        }
      }, 100);
    };

    /**
     * Open and display a system message
     * @param {string} id - System message ID
     */
    const openSystem = id => {
      const msg = api.listSystemMessages().find(x => x.id === id);
      if (!msg) {
        return;
      }
      $('#rightPane').innerHTML = `
      <div style="font-weight:900">Systemnachricht</div>
      <div class="hr"></div>
      <div class="msgBlock">
        <div class="msgMeta"><span><b>${msg.title}</b></span><span>${new Date(msg.createdAt).toLocaleString()}</span></div>
        <div class="p">${(msg.body || '').replace(/\n/g, '<br/>')}</div>
      </div>
    `;
    };

    document.querySelectorAll('[data-msgtab]').forEach(t => {
      t.addEventListener('click', () => {
        document
          .querySelectorAll('[data-msgtab]')
          .forEach(x => x.classList.toggle('active', x === t));
        tab = t.dataset.msgtab;
        $('#rightPane').innerHTML =
          '<div class="p">Wähle links eine Unterhaltung oder Systemnachricht.</div>';
        renderThreadList();
      });
    });
    $('#msgSearch').addEventListener('input', renderThreadList);

    renderThreadList();
    if (activeThread) {
      api.markThreadRead(activeThread);
      openThread(activeThread);
    }
  } catch (error) {
    handleError(error, { context: 'renderMessages' });
    const main = document.querySelector('main');
    if (main) {
      const container = $('#threadList') || main;
      container.innerHTML = renderErrorState({
        title: 'Fehler beim Laden der Nachrichten',
        message: 'Die Nachrichten konnten nicht geladen werden. Bitte versuchen Sie es erneut.',
        retryLabel: 'Erneut versuchen',
        retryCallback: () => window.location.reload()
      });
    }
  }
}
