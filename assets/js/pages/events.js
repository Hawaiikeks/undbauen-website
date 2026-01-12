/**
 * Events Page
 * Renders events list and handles event booking, cancellation, and modal display
 */

import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

const $ = s => document.querySelector(s);

/**
 * Format date from YYYY-MM-DD to DD.MM.YYYY
 * @param {Object} ev - Event object with date property
 * @returns {string} Formatted date string
 */
function fmtDate(ev) {
  const dateParts = ev.date.split('-');
  const formattedDate =
    dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : ev.date;
  return `${formattedDate} ${ev.time}`;
}

/**
 * Extract Teams link from location string
 * @param {string} location - Location string that may contain a Teams link
 * @returns {string|null} Extracted Teams link or null
 */
function extractTeamsLink(location) {
  // Try to extract Teams link from location string
  // This is a simple implementation - can be enhanced
  const match = location.match(/(https?:\/\/[^\s]+)/);
  return match ? match[1] : null;
}

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
export function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const start = new Date();
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
}

/**
 * Open event modal with details
 * @param {string} eventId - Event ID
 */
export function openEventModal(eventId) {
  const ev = api.getEvent(eventId);
  if (!ev) {
    return;
  }
  const parts = api.getParticipants(eventId).slice(0, 12);
  const threadId = ev.eventThreadId || null;
  $('#evTitle').textContent = ev.title;
  $('#evBody').innerHTML = `
    <div class="metaLine">
      <span class="badge blue">${ev.format}</span>
      <span class="badge">📅 ${ev.date}</span>
      <span class="badge">⏰ ${ev.time}</span>
      <span class="badge">${ev.location}</span>
    </div>
    <div class="hr"></div>
    <div class="p">${ev.descriptionMember || ''}</div>
    ${
  ev.explanation
    ? `
    <div class="hr"></div>
    <div style="font-weight:900; margin-bottom:8px">Weitere Erklärung</div>
    <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.explanation}</div>
    `
    : ''
}
    <div class="hr"></div>
    <div style="font-weight:900">Teilnehmer (Preview)</div>
    <div class="small">Nur sichtbar für eingeloggte Nutzer (MVP). Später: nur für gebuchte.</div>
    <div style="margin-top:10px">
      ${parts.length ? parts.map(p => `<div class="listItem"><div><b>${p.email}</b></div><span class="badge">participant</span></div>`).join('') : '<div class="p">Noch keine Teilnehmer.</div>'}
    </div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      ${threadId ? `<a class="btn primary" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>` : ''}
      <button class="btn" onclick="navigator.clipboard.writeText(location.href)">Link kopieren</button>
    </div>
  `;
  $('#evOverlay').style.display = 'flex';
}

/**
 * Open booked event modal with details
 * @param {string} eventId - Event ID
 */
export function openBookedEventModal(eventId) {
  const ev = api.getEvent(eventId);
  if (!ev) {
    return;
  }
  const u = api.me();
  const isBooked = api
    .getParticipants(eventId)
    .some(p => p.email.toLowerCase() === u.email.toLowerCase());
  if (!isBooked) {
    return;
  }

  const parts = api.getParticipants(eventId);
  const threadId = ev.eventThreadId || null;
  const count = parts.length;

  // Extract Teams link from location or use teamsLink field if available
  const teamsLink =
    ev.teamsLink ||
    (ev.location && ev.location.includes('Teams') ? extractTeamsLink(ev.location) : null);

  // Format time with duration
  const endTime = ev.durationMinutes ? calculateEndTime(ev.time, ev.durationMinutes) : null;

  $('#bookedEventTitle').textContent = ev.title;
  $('#bookedEventBody').innerHTML = `
    <div class="metaLine">
      <span class="badge blue">${ev.format}</span>
    </div>
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">📅 Datum & Uhrzeit</div>
      <div class="p">${fmtDate(ev)}</div>
      <div class="p">${ev.time}${endTime ? ` - ${endTime}` : ''}${ev.durationMinutes ? ` (${ev.durationMinutes} Min.)` : ''}</div>
    </div>
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">📍 Ort</div>
      <div class="p">${ev.location || 'Nicht angegeben'}</div>
    </div>
    ${
  teamsLink
    ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">🔗 Teams-Link</div>
      <div style="margin-bottom:8px">
        <a href="${teamsLink}" target="_blank" rel="noopener noreferrer" class="btn primary">Zu Teams beitreten</a>
      </div>
      <div class="small">${teamsLink}</div>
    </div>
    `
    : ''
}
    ${
  ev.descriptionMember
    ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Beschreibung</div>
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.descriptionMember}</div>
    </div>
    `
    : ''
}
    ${
  ev.explanation
    ? `
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Weitere Erklärung</div>
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word;">${ev.explanation}</div>
    </div>
    `
    : ''
}
    <div class="hr"></div>
    <div style="margin-bottom:12px">
      <div style="font-weight:600; margin-bottom:8px">Teilnehmer</div>
      <div class="p">${count}/${ev.capacity || '∞'}</div>
    </div>
    <div class="hr"></div>
    <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap">
      <button class="btn primary" data-ics-export="${eventId}">ICS Export</button>
      ${threadId ? `<a class="btn" href="forum-thread.html?thread=${encodeURIComponent(threadId)}">Zum Event-Thread</a>` : ''}
      <button class="btn danger" data-cancel-booking="${eventId}">Buchung stornieren</button>
    </div>
  `;

  // Wire up buttons
  const overlay = $('#bookedEventOverlay');
  overlay.querySelector(`[data-ics-export="${eventId}"]`)?.addEventListener('click', () => {
    api.exportICSForEvent(eventId);
  });

  overlay
    .querySelector(`[data-cancel-booking="${eventId}"]`)
    ?.addEventListener('click', async () => {
      if (confirm(`Möchtest du die Buchung für "${ev.title}" wirklich stornieren?`)) {
        const res = api.cancelBooking(eventId);
        if (res.ok) {
          alert('Buchung erfolgreich storniert.');
          overlay.style.display = 'none';
          // Reload dashboard if on dashboard page
          if (document.body.dataset.page === 'dashboard') {
            const { renderDashboard } = await import('./dashboard.js');
            renderDashboard();
          }
        } else {
          alert(res.error || 'Fehler beim Stornieren.');
        }
      }
    });

  overlay.style.display = 'flex';
}

/**
 * Render events list
 * @returns {void}
 */
export function renderEvents() {
  const wrap = $('#eventsGrid');
  const u = api.me();
  const events = api
    .listEvents()
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  // Sicherstellen dass Event-Modal geschlossen ist beim Laden
  if ($('#evOverlay')) {
    $('#evOverlay').style.display = 'none';
  }

  const isBooked = ev =>
    api.getParticipants(ev.id).some(p => p.email.toLowerCase() === u.email.toLowerCase());
  wrap.innerHTML = events
    .map(ev => {
      const count = api.bookingsCount(ev.id);
      const full = count >= ev.capacity;
      return `
      <div class="card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div>
            <div style="font-weight:900">${ev.title}</div>
            <div class="metaLine" style="margin-top:6px">
              <span>📅 ${fmtDate(ev).split(' ')[0]}</span><span>⏰ ${ev.time}</span>
              <span class="badge">${ev.location}</span>
            </div>
            <div class="chips" style="margin-top:10px">${(ev.tags || [])
    .slice(0, 6)
    .map(t => `<span class="chip">${t}</span>`)
    .join('')}</div>
          </div>
          <span class="badge blue">${ev.format}</span>
        </div>
        <div class="hr"></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn primary" data-book="${ev.id}" ${full || isBooked(ev) ? 'disabled' : ''}>${isBooked(ev) ? 'Gebucht' : full ? 'Ausgebucht' : 'Buchen'}</button>
          ${
  isBooked(ev)
    ? `
            <button class="btn" data-ics="${ev.id}">ICS</button>
            <button class="btn" data-open="${ev.id}">Details</button>
          `
    : ''
}
        </div>
        <div class="small" style="margin-top:10px">Teilnehmer: ${count}/${ev.capacity}</div>
      </div>
    `;
    })
    .join('');

  wrap.querySelectorAll('[data-book]').forEach(b =>
    b.addEventListener('click', () => {
      const id = b.dataset.book;
      const res = api.bookEvent(id);
      if (!res.ok) {
        toast.error(res.error);
      }
      renderEvents();
    })
  );
  wrap
    .querySelectorAll('[data-ics]')
    .forEach(b => b.addEventListener('click', () => api.exportICSForEvent(b.dataset.ics)));
  wrap
    .querySelectorAll('[data-open]')
    .forEach(b => b.addEventListener('click', () => openEventModal(b.dataset.open)));

  $('#exportBooked').addEventListener('click', () => api.exportICSForBooked());

  // modal wiring
  $('#evClose').addEventListener('click', () => ($('#evOverlay').style.display = 'none'));
  $('#evOverlay').addEventListener('click', e => {
    if (e.target.id === 'evOverlay') {
      $('#evOverlay').style.display = 'none';
    }
  });
}
