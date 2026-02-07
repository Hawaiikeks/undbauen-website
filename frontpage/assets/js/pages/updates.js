/**
 * Updates Page Module
 * Handles rendering of public updates in timeline format
 */

import { api } from "../services/apiClient.js";

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
 * Renders public updates in timeline format
 * @returns {void}
 */
export const renderPublicUpdates = () => {
  const wrap = $("#publicUpdates");
  if (!wrap) {
    console.warn('Public updates container not found');
    return;
  }

  try {
    let items = api.listUpdatesPublic();
    
    // Get last 3 months of updates
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    items = items.filter(x => {
      const updateDate = new Date(x.createdAt || x.date || Date.now());
      return updateDate >= threeMonthsAgo;
    }).slice(0, 6);
    
    // Sort by date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });

    if (items.length === 0) {
      wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Updates verfügbar.</div>';
      return;
    }
    
    wrap.innerHTML = items.map((x) => {
      const date = new Date(x.createdAt || x.date || Date.now());
      const monthYear = date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
      const title = sanitizeHTML(x.title || '');
      const intro = sanitizeHTML(x.intro || '');
      const highlights = (x.highlights || []).slice(0, 3).map(h => sanitizeHTML(h));
      
      return `
      <div class="timeline-item">
        <div class="timeline-dot" aria-hidden="true"></div>
        <div class="timeline-content">
          <div class="timeline-date">${monthYear}</div>
          <h3 class="timeline-title">${title}</h3>
          <p class="timeline-intro">${intro}</p>
          ${highlights.length > 0 ? `<div class="timeline-highlights">${highlights.map(h => `<span class="chip">${h}</span>`).join("")}</div>` : ''}
          <p class="p mt-sm text-muted" style="font-size: 13px;">Die Mitgliedschaft ist aktuell in Vorbereitung.</p>
        </div>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Error rendering public updates:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Updates.</div>';
  }
};
