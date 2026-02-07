/**
 * Events Page Module
 * Handles rendering of public events
 */

import { api } from "../services/apiClient.js";
import { getIcon } from "../components/icons.js";

const $ = (s) => document.querySelector(s);

/**
 * Sanitizes a string to prevent XSS attacks
 * @param {string} str - String to sanitize
 * @returns {string} - Sanitized string
 */
const sanitizeHTML = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Opens event details modal
 * @param {string} eventId - Event ID
 */
const openEventDetails = (eventId) => {
  const ev = api.getEvent(eventId);
  if (!ev) {
    console.warn('Event not found:', eventId);
    return;
  }

  const overlay = $("#eventDetailsOverlay");
  const titleEl = $("#eventDetailsTitle");
  const contentEl = $("#eventDetailsContent");
  
  if (!overlay || !titleEl || !contentEl) return;

  // Format date
  const dateParts = ev.date ? ev.date.split('-') : [];
  const formattedDate = dateParts.length === 3 
    ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` 
    : ev.date || '';

  // Calculate end time if duration is available
  let timeInfo = ev.time || '';
  if (ev.durationMinutes) {
    const [hours, minutes] = (ev.time || '18:00').split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + ev.durationMinutes * 60000);
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    timeInfo = `${ev.time} - ${endTime} (${ev.durationMinutes} Min.)`;
  }

  titleEl.textContent = sanitizeHTML(ev.title || 'Event Details');
  
  contentEl.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${ev.format ? `<span class="badge blue">${sanitizeHTML(ev.format)}</span>` : ''}
        ${formattedDate ? `<span class="badge">📅 ${formattedDate}</span>` : ''}
        ${timeInfo ? `<span class="badge">⏰ ${timeInfo}</span>` : ''}
        ${ev.location ? `<span class="badge">📍 ${sanitizeHTML(ev.location)}</span>` : ''}
      </div>
      ${ev.capacity ? `<div style="margin-bottom: 0.5rem; font-size: 14px; color: var(--text-secondary);">Kapazität: ${ev.capacity} Teilnehmer</div>` : ''}
    </div>
    <div class="hr"></div>
    <div style="margin-bottom: 1rem;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Beschreibung</h3>
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word; line-height: 1.6;">
        ${sanitizeHTML(ev.descriptionPublic || ev.description || 'Keine Beschreibung verfügbar.')}
      </div>
    </div>
    ${ev.tags && ev.tags.length > 0 ? `
      <div class="hr"></div>
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Tags</h3>
        <div class="chips">
          ${ev.tags.map(tag => `<span class="chip">${sanitizeHTML(tag)}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    <div class="hr"></div>
    <div style="margin-top: 1rem; padding: 0.75rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);">
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
        💡 <strong>Hinweis:</strong> Die Mitgliedschaft ist aktuell in Vorbereitung. Bei Interesse kontaktieren Sie uns bitte.
      </p>
    </div>
    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button class="btn secondary" onclick="navigator.clipboard.writeText(window.location.href + '#termine')">Link kopieren</button>
    </div>
  `;

  // Login entfernt - Frontpage ist nur zur Ansicht

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
};

/**
 * Closes event details modal
 */
const closeEventDetails = () => {
  const overlay = $("#eventDetailsOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
  document.body.style.overflow = "";
};

/**
 * Renders public events in the events section
 * @returns {void}
 */
export const renderPublicEvents = () => {
  const wrap = $("#publicEvents");
  if (!wrap) {
    console.warn('Public events container not found');
    return;
  }

  try {
    const evs = api.listEvents()
      .slice()
      .sort((a, b) => {
        const dateA = a.date + a.time;
        const dateB = b.date + b.time;
        return dateA.localeCompare(dateB);
      })
      .slice(0, 4);

    // Bilder für Events je nach Kategorie/Format
    const getEventImage = (ev, index = 0) => {
      const format = (ev.format || "").toLowerCase();
      
      if (format.includes("innovationsabend") || format.includes("innovation")) {
        const innovationImages = [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
        ];
        return innovationImages[index % innovationImages.length];
      } else if (format.includes("panel") || format.includes("diskussion")) {
        const panelImages = [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop'
        ];
        return panelImages[index % panelImages.length];
      } else if (format.includes("workshop")) {
        return 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop';
      } else {
        return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop';
      }
    };

    if (evs.length === 0) {
      wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Termine verfügbar.</div>';
      return;
    }

    wrap.innerHTML = evs.map((ev, index) => {
      const imageUrl = getEventImage(ev, index);
      const title = sanitizeHTML(ev.title || '');
      const format = sanitizeHTML(ev.format || '');
      const date = sanitizeHTML(ev.date || '');
      const time = sanitizeHTML(ev.time || '');
      const isBlurred = index >= 2;
      
      return `
      <div class="event-card-compact-small ${isBlurred ? 'event-card-blurred' : ''}">
        <div class="event-card-image-small">
          <img src="${imageUrl}" alt="${title}" loading="lazy" class="event-image" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';" />
          <span class="event-badge">${format}</span>
        </div>
        <div class="event-card-content-small">
          <h3 class="event-card-title-small">${title}</h3>
          <div class="event-card-meta-small">
            <span class="event-meta-item">${getIcon('calendar', 14)} ${date}</span>
            <span class="event-meta-item">${getIcon('clock', 14)} ${time}</span>
          </div>
          <div class="event-card-footer-small" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn secondary small" data-open-event-details="${ev.id}" aria-label="Details anzeigen">Details</button>
          </div>
        </div>
        ${isBlurred ? '<div class="event-card-blur-overlay"><span>Nur für Mitglieder sichtbar</span></div>' : ''}
      </div>
    `;
    }).join("");

    wrap.querySelectorAll("[data-open-event-details]").forEach(b => {
      b.addEventListener("click", (e) => {
        const eventId = e.currentTarget.getAttribute("data-open-event-details");
        if (eventId) {
          openEventDetails(eventId);
        }
      });
    });

    // Make closeEventDetails available globally
    window.closeEventDetails = closeEventDetails;
  } catch (error) {
    console.error("Error rendering public events:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Termine.</div>';
  }
};
