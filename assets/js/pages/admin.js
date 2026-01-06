import { api } from '../services/apiClient.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { toast } from '../components/toast.js';
import { parseTags } from '../utils.js';

const $ = s => document.querySelector(s);

/**
 * Generates HTML for the update form.
 * @param {Object} upd - The update object
 * @returns {string} HTML string
 */
function updateFormHTML(upd) {
  // Normalize highlights structure
  let highlights = upd.highlights || [];
  if (highlights.length === 0) {
    highlights = [{ title: '', memberText: '', downloadUrl: '' }];
  }
  highlights = highlights.map(h =>
    typeof h === 'string' ? { title: h, memberText: '', downloadUrl: '' } : h
  );

  return `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:24px; max-height:80vh; overflow:hidden">
      <!-- Editor links -->
      <div style="overflow-y:auto; padding-right:12px">
        <label class="label">Monat (YYYY-MM)</label>
        <input class="input" id="uMonth" value="${upd.month || ''}" placeholder="2026-02"/>
        <label class="label" style="margin-top:10px">Titel</label>
        <input class="input" id="uTitle" value="${upd.title || ''}" placeholder="Monatsupdate Februar 2026"/>
        <label class="label" style="margin-top:10px">Teaser/Intro</label>
        <textarea class="textarea" id="uIntro" style="min-height:80px;">${upd.intro || ''}</textarea>
        <div class="hr" style="margin:20px 0"></div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <label class="label" style="margin:0">Highlights</label>
          <div>
            <button class="btn small" id="uHighlightPrev" style="margin-right:4px">←</button>
            <span id="uHighlightCounter" style="font-weight:600">1 / ${highlights.length}</span>
            <button class="btn small" id="uHighlightNext" style="margin-left:4px">→</button>
            <button class="btn small primary" id="uHighlightAdd" style="margin-left:8px">+ Highlight</button>
          </div>
        </div>
        <div id="uHighlightContainer">
          <label class="label">Highlight-Titel</label>
          <input class="input" id="uHighlightTitle" placeholder="Highlight Titel" style="font-weight:700; font-size:16px"/>
          <label class="label" style="margin-top:10px">Member-Text (Rich Text)</label>
          <textarea class="textarea" id="uHighlightMemberText" data-rich-text placeholder="Schreibe den Member-Text für dieses Highlight..." style="min-height:250px;"></textarea>
          <label class="label" style="margin-top:10px">Download-URL (optional)</label>
          <input class="input" id="uHighlightDownload" placeholder="https://... oder Datei hochladen"/>
          <input type="file" id="uHighlightFile" style="display:none" accept="*/*"/>
          <button class="btn small" id="uHighlightFileBtn" style="margin-top:4px">📎 Datei hochladen</button>
        </div>
        <div class="err" id="uErr"></div>
        <div style="margin-top:12px">
          <button class="btn primary" id="uSave">Speichern</button>
          <button class="btn danger small" id="uHighlightDelete" style="margin-left:8px">Highlight löschen</button>
        </div>
      </div>
      
      <!-- Vorschau rechts -->
      <div style="overflow-y:auto; padding-left:12px; border-left:2px solid var(--border)">
        <div style="font-weight:900; margin-bottom:16px; font-size:18px">📄 Vorschau</div>
        <div id="uPreview" style="background:var(--bg); padding:20px; border-radius:8px; min-height:400px">
          <div class="p" style="color:var(--text-secondary)">Vorschau wird hier angezeigt...</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Wires up the update form with event listeners and Rich Text Editor.
 * @param {string|null} id - The update ID if editing, null if creating new
 * @param {Function} close - Function to close the modal
 */
function wireUpdateForm(id, close) {
  let currentHighlights = [];
  let currentHighlightIndex = 0;

  // Load highlights from existing update or initialize
  if (id) {
    const ups = api.listUpdatesMember();
    const upd = ups.find(u => u.id === id);
    if (upd && upd.highlights) {
      currentHighlights = upd.highlights.map(h =>
        typeof h === 'string' ? { title: h, memberText: '', downloadUrl: '' } : h
      );
    }
  }
  if (currentHighlights.length === 0) {
    currentHighlights = [{ title: '', memberText: '', downloadUrl: '' }];
  }

  // Initialize editor only once - don't recreate on highlight switch
  let highlightEditor = null;
  const initEditorOnce = () => {
    const textarea = $('#uHighlightMemberText');
    if (!textarea) {
      setTimeout(initEditorOnce, 100);
      return;
    }

    // Check if editor already exists
    if (richTextEditor.editors.has('uHighlightMemberText')) {
      highlightEditor = richTextEditor.editors.get('uHighlightMemberText');
      if (highlightEditor && highlightEditor.quill) {
        highlightEditor.quill.off('text-change');
        highlightEditor.quill.on('text-change', updatePreview);
      }
      return;
    }

    // Wait for Quill to be available
    const tryInit = (attempts = 0) => {
      if (attempts > 20) {
        console.warn('Rich Text Editor could not be initialized');
        return;
      }

      if (window.Quill && textarea) {
        try {
          richTextEditor.createEditor(textarea);
          highlightEditor = richTextEditor.editors.get('uHighlightMemberText');
          if (highlightEditor && highlightEditor.quill) {
            highlightEditor.quill.on('text-change', updatePreview);
          }
        } catch (e) {
          console.warn('Could not create Rich Text Editor:', e);
          setTimeout(() => tryInit(attempts + 1), 200);
        }
      } else {
        if (!window.Quill && richTextEditor) {
          richTextEditor.init();
        }
        setTimeout(() => tryInit(attempts + 1), 200);
      }
    };

    setTimeout(() => tryInit(), 300);
  };

  const updatePreview = () => {
    const month = $('#uMonth')?.value || '';
    const title = $('#uTitle')?.value || '';
    const intro = $('#uIntro')?.value || '';
    const highlightTitle = $('#uHighlightTitle')?.value || '';
    let memberText = '';

    // Get content from editor
    if (highlightEditor && highlightEditor.quill) {
      memberText = highlightEditor.quill.root.innerHTML;
    } else {
      const textarea = $('#uHighlightMemberText');
      if (textarea) {
        memberText = textarea.value || '';
      }
    }

    // Build preview HTML
    const [year, monthNum] = month.split('-');
    const monthNames = [
      'Januar',
      'Februar',
      'März',
      'April',
      'Mai',
      'Juni',
      'Juli',
      'August',
      'September',
      'Oktober',
      'November',
      'Dezember'
    ];
    const monthName = monthNames[parseInt(monthNum) - 1] || monthNum;

    let previewHTML = '';
    if (month) {
      previewHTML += `<div style="font-size:12px; color:var(--text-secondary); margin-bottom:8px; text-transform:uppercase">${monthName} ${year}</div>`;
    }
    if (title) {
      previewHTML += `<div style="font-weight:900; font-size:24px; margin-bottom:12px">${title}</div>`;
    }
    if (intro) {
      previewHTML += `<div style="font-size:15px; line-height:1.6; color:var(--text-secondary); margin-bottom:24px; padding:16px; background:var(--bg); border-radius:6px">${intro}</div>`;
    }
    if (highlightTitle || memberText) {
      previewHTML += '<div style="margin-bottom:24px; padding:16px; background:var(--bg); border-radius:6px; border-left:4px solid var(--primary)">';
      if (highlightTitle) {
        previewHTML += `<div style="font-weight:700; font-size:18px; margin-bottom:12px; color:var(--primary)">${highlightTitle}</div>`;
      }
      if (memberText) {
        previewHTML += `<div style="line-height:1.8; font-size:15px">${memberText}</div>`;
      }
      previewHTML += '</div>';
    }

    if (!previewHTML) {
      previewHTML =
        '<div class="p" style="color:var(--text-secondary)">Vorschau wird hier angezeigt...</div>';
    }

    $('#uPreview').innerHTML = previewHTML;
  };

  const renderHighlight = index => {
    const hl = currentHighlights[index] || { title: '', memberText: '', downloadUrl: '' };
    $('#uHighlightTitle').value = hl.title || '';
    $('#uHighlightDownload').value = hl.downloadUrl || '';
    $('#uHighlightCounter').textContent = `${index + 1} / ${currentHighlights.length}`;

    // Update editor content (don't recreate editor!)
    setTimeout(() => {
      if (highlightEditor && highlightEditor.quill) {
        highlightEditor.quill.root.innerHTML = hl.memberText || '';
        highlightEditor.textarea.value = hl.memberText || '';
      } else {
        // Fallback: set textarea value directly
        const textarea = $('#uHighlightMemberText');
        if (textarea) {
          textarea.value = hl.memberText || '';
        }
        // Try to initialize editor if not exists
        if (!highlightEditor) {
          initEditorOnce();
        }
      }
      updatePreview();
    }, 100);
  };

  // Initialize editor once
  initEditorOnce();

  // Set up preview update listeners
  $('#uMonth')?.addEventListener('input', updatePreview);
  $('#uTitle')?.addEventListener('input', updatePreview);
  $('#uIntro')?.addEventListener('input', updatePreview);
  $('#uHighlightTitle')?.addEventListener('input', updatePreview);

  // Initial render
  setTimeout(() => {
    renderHighlight(0);
    updatePreview();
  }, 500);

  const saveCurrentHighlight = () => {
    if (currentHighlightIndex >= 0 && currentHighlightIndex < currentHighlights.length) {
      const title = $('#uHighlightTitle').value.trim();
      let memberText = '';
      // Try to get content from Rich Text Editor
      if (highlightEditor && highlightEditor.quill) {
        memberText = highlightEditor.quill.root.innerHTML;
      } else {
        // Try to get editor again
        highlightEditor = richTextEditor.editors.get('uHighlightMemberText');
        if (highlightEditor && highlightEditor.quill) {
          memberText = highlightEditor.quill.root.innerHTML;
        } else {
          // Fallback to textarea value
          const textarea = $('#uHighlightMemberText');
          if (textarea) {
            memberText = textarea.value || '';
          }
        }
      }
      const downloadUrl = $('#uHighlightDownload').value.trim();
      currentHighlights[currentHighlightIndex] = { title, memberText, downloadUrl };
    }
  };

  // Navigation
  $('#uHighlightPrev')?.addEventListener('click', () => {
    saveCurrentHighlight();
    if (currentHighlightIndex > 0) {
      currentHighlightIndex--;
      renderHighlight(currentHighlightIndex);
    }
  });

  $('#uHighlightNext')?.addEventListener('click', () => {
    saveCurrentHighlight();
    if (currentHighlightIndex < currentHighlights.length - 1) {
      currentHighlightIndex++;
      renderHighlight(currentHighlightIndex);
    }
  });

  // Add highlight
  $('#uHighlightAdd')?.addEventListener('click', () => {
    saveCurrentHighlight();
    currentHighlights.push({ title: '', memberText: '', downloadUrl: '' });
    currentHighlightIndex = currentHighlights.length - 1;
    renderHighlight(currentHighlightIndex);
  });

  // Delete highlight
  $('#uHighlightDelete')?.addEventListener('click', () => {
    if (currentHighlights.length > 1) {
      saveCurrentHighlight();
      currentHighlights.splice(currentHighlightIndex, 1);
      if (currentHighlightIndex >= currentHighlights.length) {
        currentHighlightIndex = currentHighlights.length - 1;
      }
      renderHighlight(currentHighlightIndex);
      updatePreview();
    } else {
      toast.error('Mindestens ein Highlight ist erforderlich.');
    }
  });

  // File upload
  $('#uHighlightFileBtn')?.addEventListener('click', () => {
    $('#uHighlightFile').click();
  });
  $('#uHighlightFile')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) {
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Datei ist zu groß. Maximal 50MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = event => {
      $('#uHighlightDownload').value = event.target.result;
      toast.success('Datei hochgeladen.');
    };
    reader.readAsDataURL(file);
  });

  // Save
  $('#uSave').addEventListener('click', () => {
    saveCurrentHighlight();
    $('#uErr').textContent = '';
    const month = $('#uMonth').value.trim();
    const title = $('#uTitle').value.trim();
    if (!month || !title) {
      $('#uErr').textContent = 'Monat und Titel erforderlich.';
      return;
    }

    // Filter empty highlights
    const validHighlights = currentHighlights.filter(h => h.title.trim() || h.memberText.trim());
    if (validHighlights.length === 0) {
      $('#uErr').textContent = 'Mindestens ein Highlight mit Titel oder Text ist erforderlich.';
      return;
    }

    const payload = {
      month,
      title,
      intro: $('#uIntro').value.trim(),
      highlights: validHighlights,
      memberBody: '' // Deprecated, using highlights with memberText instead
    };

    if (id) {
      const res = api.adminUpdateUpdate(id, payload);
      if (res.ok) {
        toast.success('Update aktualisiert.');
        close();
        location.reload();
      } else {
        toast.error(res.error || 'Fehler beim Aktualisieren.');
      }
    } else {
      const res = api.adminCreateUpdate(payload);
      if (res.ok) {
        toast.success('Update erstellt.');
        close();
        location.reload();
      } else {
        $('#uErr').textContent = res.error || 'Fehler beim Erstellen.';
        return;
      }
    }
  });
}

/**
 * Generates HTML for the event form.
 * @param {Object} ev - The event object
 * @returns {string} HTML string
 */
function evFormHTML(ev) {
  return `
    <label class="label">Titel</label><input class="input" id="fTitle" value="${ev.title || ''}"/>
    <div class="row" style="margin-top:10px">
      <div style="flex:1"><label class="label">Datum</label><input class="input" id="fDate" value="${ev.date ? ev.date.split('-').reverse().join('.') : ''}" placeholder="DD.MM.YYYY"/></div>
      <div style="flex:1"><label class="label">Zeit</label><input class="input" id="fTime" value="${ev.time || ''}" placeholder="18:00"/></div>
    </div>
    <div class="row" style="margin-top:10px">
      <div style="flex:1"><label class="label">Dauer (Min)</label><input class="input" id="fDur" value="${ev.durationMinutes || 90}"/></div>
      <div style="flex:1"><label class="label">Kapazität</label><input class="input" id="fCap" value="${ev.capacity || 40}"/></div>
    </div>
    <label class="label" style="margin-top:10px">Location</label><input class="input" id="fLoc" value="${ev.location || ''}"/>
    <label class="label" style="margin-top:10px">Format</label><input class="input" id="fFmt" value="${ev.format || 'Innovationsabend'}"/>
    <label class="label" style="margin-top:10px">Tags (Komma)</label><input class="input" id="fTags" value="${(ev.tags || []).join(', ')}"/>
    <label class="label" style="margin-top:10px">Public Desc</label><textarea class="textarea" id="fPub">${ev.descriptionPublic || ''}</textarea>
    <label class="label" style="margin-top:10px">Member Desc</label><textarea class="textarea" id="fMem" style="min-height:120px;">${ev.descriptionMember || ''}</textarea>
    <label class="label" style="margin-top:10px">Weitere Erklärung</label><textarea class="textarea" id="fExplanation" style="min-height:100px;" placeholder="Zusätzliche Informationen zu diesem Termin...">${ev.explanation || ''}</textarea>
    <div class="err" id="fErr"></div>
    <div style="margin-top:12px"><button class="btn primary" id="fSave">Speichern</button></div>
  `;
}

/**
 * Wires up the event form with event listeners.
 * @param {string|null} id - The event ID if editing, null if creating new
 */
function wireEvForm(id) {
  $('#fSave').addEventListener('click', () => {
    $('#fErr').textContent = '';
    // Convert DD.MM.YYYY to YYYY-MM-DD
    let dateValue = $('#fDate').value.trim();
    if (dateValue.includes('.')) {
      const parts = dateValue.split('.');
      if (parts.length === 3) {
        dateValue = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    const payload = {
      title: $('#fTitle').value.trim(),
      date: dateValue,
      time: $('#fTime').value.trim(),
      durationMinutes: Number($('#fDur').value || 90),
      capacity: Number($('#fCap').value || 40),
      location: $('#fLoc').value.trim(),
      format: $('#fFmt').value.trim(),
      tags: parseTags($('#fTags').value),
      descriptionPublic: $('#fPub').value.trim(),
      descriptionMember: $('#fMem').value.trim(),
      explanation: $('#fExplanation').value.trim()
    };
    if (!payload.title || !payload.date || !payload.time) {
      $('#fErr').textContent = 'Titel/Datum/Zeit erforderlich.';
      return;
    }
    if (id) {
      api.adminUpdateEvent(id, payload);
    } else {
      api.adminCreateEvent(payload);
    }
    location.reload();
  });
}

/**
 * Renders the admin panels based on the current tab.
 * @param {string} tab - The current tab ('users', 'events', 'content')
 */
function renderAdminPanels(tab) {
  try {
    if (tab === 'users') {
      const users = api.adminListUsers();
      $('#adminLeft').innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Mitglieder</div>
          <button class="btn primary" id="addUser">+ Neues Mitglied</button>
        </div>
        <div class="hr"></div>
        <table class="table" style="width:100%">
          <thead><tr><th style="padding:12px 16px">Name</th><th style="padding:12px 16px">Email</th><th style="padding:12px 16px">Role</th><th style="padding:12px 16px">Status</th><th style="padding:12px 16px">Aktion</th></tr></thead>
          <tbody>
            ${users
    .map(u => {
      const isBlocked = u.status === 'blocked' || u.status === 'inactive';
      return `
              <tr style="${isBlocked ? 'opacity:0.5; color:var(--text-muted)' : ''}">
                <td style="padding:12px 16px">${u.name}</td>
                <td style="padding:12px 16px">${u.email}</td>
                <td style="padding:12px 16px">
                  <select class="input" style="width:100%; padding:6px 8px; font-size:14px" data-role-select="${u.id}">
                    <option value="member" ${u.role === 'member' ? 'selected' : ''}>Member</option>
                    <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="moderator" ${u.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                    <option value="editor" ${u.role === 'editor' ? 'selected' : ''}>Editor</option>
                    <option value="author" ${u.role === 'author' ? 'selected' : ''}>Author</option>
                  </select>
                </td>
                <td style="padding:12px 16px; ${isBlocked ? 'color:var(--text-muted)' : ''}">${isBlocked ? 'inaktiv' : u.status}</td>
                <td style="padding:12px 16px; white-space: nowrap;">
                  <button class="btn small ${isBlocked ? 'primary' : ''}" data-status="${u.id}" style="margin-right:8px">${isBlocked ? 'Entsperren' : 'Sperren'}</button>
                  <button class="btn danger small" data-delete="${u.id}">Entfernen</button>
                </td>
              </tr>
            `;
    })
    .join('')}
          </tbody>
        </table>
      `;
      $('#adminRight').innerHTML = '';

      $('#adminLeft')
        .querySelectorAll('[data-role-select]')
        .forEach(select => {
          select.addEventListener('change', async () => {
            const id = select.dataset.roleSelect;
            const newRole = select.value;
            const u = users.find(x => x.id === id);

            // Use confirm modal
            const { confirmModal } = await import('../components/confirmModal.js');
            const confirmed = await confirmModal.show(
              `Möchten Sie die Rolle von ${u.name} zu "${newRole}" ändern?`,
              'Rolle ändern',
              'Ändern',
              'Abbrechen'
            );

            if (confirmed) {
              const res = api.adminSetUserRole(id, newRole);
              if (res.ok) {
                // Show success modal
                const { showSuccessModal } = await import('../components/successModal.js');
                showSuccessModal(
                  `Die Rolle von ${u.name} wurde erfolgreich zu "${newRole}" geändert.`,
                  'Rolle geändert'
                );
                setTimeout(() => location.reload(), 1500);
              } else {
                toast.error(res.error || 'Fehler beim Ändern der Rolle');
                select.value = u.role;
              }
            } else {
              // Reset to original value
              select.value = u.role;
            }
          });
        });
      $('#adminLeft')
        .querySelectorAll('[data-status]')
        .forEach(b => {
          b.addEventListener('click', async () => {
            const id = b.dataset.status;
            const u = users.find(x => x.id === id);
            const isBlocked = u.status === 'blocked' || u.status === 'inactive';
            if (isBlocked) {
              // Entsperren
              const res = api.adminSetUserStatus(id, 'active');
              if (res && res.ok) {
                const { showSuccessModal } = await import('../components/successModal.js');
                showSuccessModal(
                  `Der Benutzer "${u.name}" wurde erfolgreich entsperrt.`,
                  'Benutzer entsperrt'
                );
                setTimeout(() => location.reload(), 1500);
              } else {
                toast.error(res?.error || 'Fehler beim Entsperren.');
              }
            } else {
              // Sperren
              const { confirmModal } = await import('../components/confirmModal.js');
              const confirmed = await confirmModal.show(
                `User ${u.name} sperren?`,
                'User sperren',
                'Sperren',
                'Abbrechen'
              );

              if (confirmed) {
                api.adminSetUserStatus(id, 'inactive');
                // Systemnachricht senden
                api.addSystemMessage(u.email, {
                  type: 'account_blocked',
                  title: 'Account gesperrt',
                  body: 'Ihr Account wurde von einem Administrator gesperrt. Bei Fragen kontaktieren Sie bitte den Support.'
                });

                const { showSuccessModal } = await import('../components/successModal.js');
                showSuccessModal(
                  `Der Benutzer "${u.name}" wurde erfolgreich gesperrt.`,
                  'Benutzer gesperrt'
                );
                setTimeout(() => location.reload(), 1500);
              }
            }
          });
        });
      $('#adminLeft')
        .querySelectorAll('[data-delete]')
        .forEach(b => {
          b.addEventListener('click', async () => {
            const id = b.dataset.delete;
            const u = users.find(x => x.id === id);
            if (!u) {
              return;
            }

            const { confirmModal } = await import('../components/confirmModal.js');
            const confirmed = await confirmModal.show(
              `Wollen Sie wirklich den User ${u.name} entfernen? Diese Aktion kann nicht rückgängig gemacht werden!`,
              'User entfernen',
              'Entfernen',
              'Abbrechen'
            );

            if (confirmed) {
              const res = api.adminDeleteUser(id);
              if (res && res.success) {
                const { showSuccessModal } = await import('../components/successModal.js');
                showSuccessModal(
                  `Der Benutzer "${u.name}" wurde erfolgreich entfernt.`,
                  'Benutzer entfernt'
                );
                setTimeout(() => location.reload(), 1500);
              } else {
                toast.error(res?.error || 'Fehler beim Entfernen.');
              }
            }
          });
        });

      // Neues Mitglied hinzufügen
      const openUserModal = () => {
        $('#admUserOverlay').style.display = 'flex';
        $('#newUserName').value = '';
        $('#newUserEmail').value = '';
        $('#newUserPassword').value = '';
        $('#newUserRole').value = 'member';
        $('#newUserErr').textContent = '';
      };
      const closeUserModal = () => {
        $('#admUserOverlay').style.display = 'none';
      };
      $('#addUser')?.addEventListener('click', openUserModal);
      $('#admUserClose')?.addEventListener('click', closeUserModal);
      $('#newUserCancel')?.addEventListener('click', closeUserModal);
      $('#admUserOverlay')?.addEventListener('click', e => {
        if (e.target.id === 'admUserOverlay') {
          closeUserModal();
        }
      });
      $('#newUserSave')?.addEventListener('click', async () => {
        $('#newUserErr').textContent = '';
        const name = $('#newUserName').value.trim();
        const email = $('#newUserEmail').value.trim();
        const password = $('#newUserPassword').value.trim();
        const role = $('#newUserRole').value;
        if (!name || !email || !password) {
          $('#newUserErr').textContent = 'Alle Felder sind erforderlich.';
          return;
        }
        const res = await api.register(email, password, name);
        if (res.success) {
          // Set role if not member
          if (role !== 'member') {
            const users = api.adminListUsers();
            const newUser = users.find(u => u.email === email);
            if (newUser) {
              api.adminSetUserRole(newUser.id, role);
            }
          }
          toast.success('Mitglied hinzugefügt.');
          closeUserModal();
          location.reload();
        } else {
          $('#newUserErr').textContent = res.error;
        }
      });
    }

    if (tab === 'events') {
      const evs = api
        .listEvents()
        .filter(e => !e.deleted)
        .slice()
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
      $('#adminLeft').innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:center">
          <div style="font-weight:900">Termine (CRUD)</div>
          <button class="btn primary" id="newEv">+ Neu</button>
        </div>
        <div class="hr"></div>
        <table class="table" style="width:100%">
          <thead><tr><th style="padding:12px 16px">Titel</th><th style="padding:12px 16px">Datum</th><th style="padding:12px 16px">Cap</th><th style="padding:12px 16px">Buchungen</th><th style="padding:12px 16px">Aktion</th></tr></thead>
          <tbody>
            ${evs
    .map(
      e => `
              <tr>
                <td style="padding:12px 16px">${e.title}</td>
                <td style="padding:12px 16px">${e.date} ${e.time}</td>
                <td style="padding:12px 16px">${e.capacity}</td>
                <td style="padding:12px 16px">${api.bookingsCount(e.id)}</td>
                <td style="padding:12px 16px; white-space: nowrap;">
                  <button class="btn small" data-edit="${e.id}">Edit</button>
                  <button class="btn danger small" data-del="${e.id}">Entfernen</button>
                </td>
              </tr>
            `
    )
    .join('')}
          </tbody>
        </table>
      `;
      $('#adminRight').innerHTML = '';

      const open = () => ($('#admEvOverlay').style.display = 'flex');
      const closeEv = () => ($('#admEvOverlay').style.display = 'none');

      $('#newEv').addEventListener('click', () => {
        $('#admEvTitle').textContent = 'Neues Event';
        $('#admEvBody').innerHTML = evFormHTML({});
        open();
        wireEvForm(null);
      });
      $('#adminLeft')
        .querySelectorAll('[data-edit]')
        .forEach(b => {
          b.addEventListener('click', () => {
            const ev = api.getEvent(b.dataset.edit);
            $('#admEvTitle').textContent = 'Event bearbeiten';
            $('#admEvBody').innerHTML = evFormHTML(ev);
            open();
            wireEvForm(ev.id);
          });
        });
      $('#adminLeft')
        .querySelectorAll('[data-del]')
        .forEach(b => {
          b.addEventListener('click', async () => {
            const eventId = b.dataset.del;
            const ev = api.getEvent(eventId);
            if (!ev) {
              console.error('Event nicht gefunden:', eventId);
              return;
            }

            try {
              const { confirmModal } = await import('../components/confirmModal.js');
              const confirmed = await confirmModal.show(
                `Wollen Sie wirklich den Termin "${ev.title}" entfernen?`,
                'Termin entfernen',
                'Entfernen',
                'Abbrechen'
              );

              if (confirmed) {
                const res = api.adminDeleteEvent(eventId);
                console.log('Delete result:', res);

                if (res && res.ok) {
                  const { showSuccessModal } = await import('../components/successModal.js');
                  showSuccessModal('Der Termin wurde erfolgreich entfernt.', 'Termin entfernt');
                  // Reload after a short delay to show the success message
                  setTimeout(() => {
                    // Ensure we're still on the events tab
                    if (tab === 'events') {
                      renderAdminPanels(tab);
                    }
                  }, 1500);
                } else {
                  toast.error(res?.error || 'Fehler beim Entfernen.');
                }
              }
            } catch (error) {
              console.error('Fehler beim Löschen des Termins:', error);
              toast.error('Fehler beim Löschen des Termins: ' + error.message);
            }
          });
        });
    }

    if (tab === 'content') {
      // Get all updates (including drafts) from localStorage
      // Both storageAdapter and wizard use "cms:updates" key
      let ups = [];
      try {
        ups = api.getAllUpdatesRaw();
      } catch (e) {
        console.error('Fehler beim Laden der Updates:', e);
        ups = [];
      }

      // Sort by date (newest first)
      ups = ups.sort((a, b) => {
        const dateA = a.issueDate || a.month || a.createdAt || '';
        const dateB = b.issueDate || b.month || b.createdAt || '';
        return dateB.localeCompare(dateA);
      });

      const pubs = api.listPublicationsMember();
      $('#adminLeft').innerHTML = `
        <div style="font-weight:900">Monatsupdates</div>
        <div class="hr"></div>
        ${
  ups.length === 0
    ? `
          <div style="padding:20px; text-align:center; color:var(--text-secondary)">
            Noch keine Monatsupdates vorhanden
          </div>
        `
    : ups
      .map(
        u => `
          <div class="listItem"><div><b>${u.title || 'Unbenannt'}</b><div class="small">${u.issueDate || u.month || 'Kein Datum'} ${u.status === 'draft' ? ' (Entwurf)' : ''}</div></div>
            <button class="btn danger" data-delupd="${u.id}">Entfernen</button>
          </div>
        `
      )
      .join('')
}
        <div style="margin-top:12px"><button class="btn primary" id="addUpd">+ Update</button></div>
      `;
      $('#adminRight').innerHTML = `
        <div style="font-weight:900">Publikationen</div>
        <div class="hr"></div>
        ${pubs
    .map(
      p => `
          <div class="listItem"><div><b>${p.title}</b><div class="small">${(p.tags || []).join(', ')}</div></div>
            <button class="btn danger" data-delpub="${p.id}">Del</button>
          </div>
        `
    )
    .join('')}
        <div style="margin-top:12px"><button class="btn primary" id="addPub">+ Publikation</button></div>
      `;

      $('#adminLeft')
        .querySelectorAll('[data-delupd]')
        .forEach(b => {
          b.addEventListener('click', async e => {
            e.stopPropagation();
            const updateId = b.dataset.delupd;
            const upd = ups.find(u => u.id === updateId);
            if (!upd) {
              console.error('Update nicht gefunden:', updateId);
              toast.error('Update nicht gefunden.');
              return;
            }

            try {
              const { confirmModal } = await import('../components/confirmModal.js');
              const confirmed = await confirmModal.show(
                `Wollen Sie wirklich das Monatsupdate "${upd.title || 'Unbenannt'}" entfernen? Diese Aktion kann nicht rückgängig gemacht werden.`,
                'Monatsupdate entfernen',
                'Entfernen',
                'Abbrechen'
              );

              if (confirmed) {
                const res = api.adminDeleteUpdate(updateId);
                console.log('Delete update result:', res);

                if (res && res.ok) {
                  const { showSuccessModal } = await import('../components/successModal.js');
                  showSuccessModal(
                    'Das Monatsupdate wurde erfolgreich entfernt.',
                    'Monatsupdate entfernt'
                  );
                  // Reload after a short delay to show the success message
                  setTimeout(() => {
                    // Ensure we're still on the content tab
                    if (tab === 'content') {
                      renderAdminPanels(tab);
                    }
                  }, 1500);
                } else {
                  toast.error(
                    res?.error || 'Fehler beim Entfernen. Bitte versuchen Sie es erneut.'
                  );
                }
              }
            } catch (err) {
              console.error('Fehler beim Löschen des Monatsupdates:', err);
              toast.error('Fehler beim Löschen des Monatsupdates: ' + err.message);
            }
          });
        });
      $('#adminRight')
        .querySelectorAll('[data-delpub]')
        .forEach(b =>
          b.addEventListener('click', async () => {
            const { confirmModal } = await import('../components/confirmModal.js');
            const confirmed = await confirmModal.show(
              'Publikation löschen?',
              'Publikation löschen',
              'Löschen',
              'Abbrechen'
            );

            if (confirmed) {
              try {
                const res = api.adminDeletePublication(b.dataset.delpub);
                console.log('Delete publication result:', res);

                if (res && res.ok) {
                  const { showSuccessModal } = await import('../components/successModal.js');
                  showSuccessModal(
                    'Die Publikation wurde erfolgreich gelöscht.',
                    'Publikation gelöscht'
                  );
                  // Reload after a short delay to show the success message
                  setTimeout(() => {
                    // Ensure we're still on the content tab
                    if (tab === 'content') {
                      renderAdminPanels(tab);
                    }
                  }, 1500);
                } else {
                  toast.error(res?.error || 'Fehler beim Löschen.');
                }
              } catch (error) {
                console.error('Fehler beim Löschen der Publikation:', error);
                toast.error('Fehler beim Löschen der Publikation: ' + error.message);
              }
            }
          })
        );

      $('#addUpd').addEventListener('click', () => {
        window.location.href = 'admin-update-wizard.html';
        return;
      });

      // Old update creation (keep for backward compatibility)
      const oldAddUpd = document.getElementById('oldAddUpd');
      if (oldAddUpd) {
        oldAddUpd.addEventListener('click', () => {
          $('#admEvTitle').textContent = 'Neues Monatsupdate';
          $('#admEvBody').innerHTML = updateFormHTML({});
          const open = () => ($('#admEvOverlay').style.display = 'flex');
          const close = () => ($('#admEvOverlay').style.display = 'none');
          open();
          // Initialize Rich Text Editor after modal is opened
          setTimeout(() => {
            wireUpdateForm(null, close);
            // Force Rich Text Editor initialization
            if (window.Quill && richTextEditor) {
              const textarea = $('#uHighlightMemberText');
              if (textarea && !richTextEditor.editors.has('uHighlightMemberText')) {
                try {
                  richTextEditor.createEditor(textarea);
                } catch (e) {
                  console.warn('Could not initialize Rich Text Editor:', e);
                }
              }
            }
          }, 100);
        });
      }
      $('#addPub').addEventListener('click', () => {
        const title = prompt('Titel:', 'Publikation');
        if (!title) {
          return;
        }
        api.adminCreatePublication({
          title,
          abstract: 'Abstract',
          tags: ['Tag'],
          memberBody: 'Member-Body',
          downloadUrl: ''
        });
        location.reload();
      });
    }
  } catch (error) {
    console.error('Error in renderAdminPanels:', error);
    if ($('#adminLeft')) {
      $('#adminLeft').innerHTML =
        '<div class="card pane"><div class="p">Fehler beim Laden der Admin-Bereiche. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>';
    }
  }
}

/**
 * Renders the admin page.
 */
export function renderAdmin() {
  if (!api.isAdmin()) {
    window.location.href = 'dashboard.html';
    return;
  }

  let tab = 'users';
  const setTab = t => {
    tab = t;
    document
      .querySelectorAll('[data-admtab]')
      .forEach(x => x.classList.toggle('active', x.dataset.admtab === t));
    renderAdminPanels(tab);
  };
  document
    .querySelectorAll('[data-admtab]')
    .forEach(x => x.addEventListener('click', () => setTab(x.dataset.admtab)));

  const open = () => ($('#admEvOverlay').style.display = 'flex');
  const close = () => ($('#admEvOverlay').style.display = 'none');
  $('#admEvClose').addEventListener('click', close);
  $('#admEvOverlay').addEventListener('click', e => {
    if (e.target.id === 'admEvOverlay') {
      close();
    }
  });

  // Expose updateFormHTML and wireUpdateForm for use in renderAdminPanels
  window.updateFormHTML = updateFormHTML;
  window.wireUpdateForm = id => wireUpdateForm(id, close);

  renderAdminPanels(tab);
}
