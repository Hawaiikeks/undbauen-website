/**
 * Compose Message Page
 *
 * Handles composing and sending new messages to other members.
 * Supports rich text editing and recipient selection.
 *
 * @module pages/compose
 */

import { api } from '../services/apiClient.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { qs } from '../utils.js';

/**
 * Query selector shorthand
 * @type {function(string): HTMLElement|null}
 */
const $ = s => document.querySelector(s);

/**
 * Render compose message page
 * Initializes recipient selection and message composition form
 * @returns {void}
 */
export function renderCompose() {
  // Edge case: Check if user is logged in
  const u = api.me();
  if (!u || !u.email) {
    const main = document.querySelector('main');
    if (main) {
      main.innerHTML =
        '<div class="card pane"><div class="p">Bitte melden Sie sich an, um Nachrichten zu senden.</div></div>';
    }
    return;
  }

  // Edge case: Check if required DOM elements exist
  const toSelect = $('#toSelect');
  const sendBtn = $('#sendBtn');
  if (!toSelect || !sendBtn) {
    console.warn('Required DOM elements not found in compose page');
    return;
  }

  const list = api.listMembers('');
  // Edge case: Ensure list is an array
  if (!Array.isArray(list)) {
    toSelect.innerHTML = '<option value="">Keine Mitglieder verfügbar</option>';
    return;
  }

  const toParam = qs.get('to') || '';
  toSelect.innerHTML = list
    .filter(p => p && p.email && p.email.toLowerCase() !== u.email.toLowerCase())
    .filter(p => p.privacy?.allowDM)
    .map(
      p =>
        `<option value="${p.email}" ${p.email === toParam ? 'selected' : ''}>${p.name || p.email} (${p.email})</option>`
    )
    .join('');

  // Edge case: Add fallback if no members available
  if (toSelect.innerHTML === '') {
    toSelect.innerHTML = '<option value="">Keine Mitglieder verfügbar</option>';
  }

  sendBtn.addEventListener('click', () => {
    // Edge case: Check if error element exists
    const sendErr = $('#sendErr');
    if (sendErr) {
      sendErr.textContent = '';
    }

    const to = toSelect.value;
    const subjEl = $('#subj');
    const subject = (subjEl && subjEl.value ? subjEl.value : '').trim();

    const bodyEl = $('#body');
    let body = '';
    if (window.Quill && bodyEl && bodyEl.value) {
      body = bodyEl.value.trim();
      const textOnly = richTextEditor.getText('body');
      if (!textOnly || textOnly.trim().length === 0) {
        body = '';
      }
    } else if (bodyEl) {
      body = bodyEl.value.trim();
    }

    // Edge case: Validate inputs
    if (!to || to.trim() === '') {
      if (sendErr) {
        sendErr.textContent = 'Empfänger fehlt.';
      }
      return;
    }
    if (!body || body.trim() === '') {
      if (sendErr) {
        sendErr.textContent = 'Nachricht fehlt.';
      }
      return;
    }

    const { setButtonLoading } = await import('../utils/buttonHelpers.js');
    const sendBtn = document.querySelector('#sendBtn');
    
    setButtonLoading(sendBtn, true, 'Wird gesendet...');
    
    try {
      const res = api.sendMessage({ to, subject, body });
      if (!res || !res.ok) {
        if (sendErr) {
          sendErr.textContent = res?.error || 'Fehler beim Senden der Nachricht.';
          sendErr.classList.add('animate-subtle-shake');
          setTimeout(() => sendErr.classList.remove('animate-subtle-shake'), 300);
        }
        setButtonLoading(sendBtn, false);
        return;
      }

      // Edge case: Check if threadId exists before redirect
      if (res.threadId) {
        toast.success('Nachricht gesendet!');
        setTimeout(() => {
          window.location.href = `nachrichten.html?thread=${encodeURIComponent(res.threadId)}`;
        }, 500);
      } else {
        if (sendErr) {
          sendErr.textContent = 'Nachricht gesendet, aber Thread-ID fehlt.';
        }
        setButtonLoading(sendBtn, false);
      }
    } catch (error) {
      if (sendErr) {
        sendErr.textContent = 'Fehler beim Senden der Nachricht.';
        sendErr.classList.add('animate-subtle-shake');
        setTimeout(() => sendErr.classList.remove('animate-subtle-shake'), 300);
      }
      setButtonLoading(sendBtn, false);
    }
  });

  // Initialize Rich Text Editor for compose
  setTimeout(() => {
    if (window.Quill && $('#body') && !richTextEditor.editors.has('body')) {
      richTextEditor.createEditor($('#body'));
    }
  }, 100);
}
