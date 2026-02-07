/**
 * Publications Page Module
 * Handles rendering of public publications
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
 * Renders public publications
 * @returns {void}
 */
export const renderPublicPubs = () => {
  const wrap = $("#publicPubs");
  if (!wrap) {
    console.warn('Public publications container not found');
    return;
  }

  try {
    let items = api.listPublicationsPublic();
    
    // Get last 3 months of publications
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    items = items.filter(x => {
      const pubDate = new Date(x.createdAt || x.date || Date.now());
      return pubDate >= threeMonthsAgo;
    }).slice(0, 3);
    
    // Sort by date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
    
    // Bilder für Publikationen
    const pubImages = [
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=200&h=150&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=150&fit=crop'
    ];

    if (items.length === 0) {
      wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Publikationen verfügbar.</div>';
      return;
    }
    
    wrap.innerHTML = items.map((x, idx) => {
      const imageUrl = pubImages[idx % pubImages.length];
      const title = sanitizeHTML(x.title || '');
      const abstract = sanitizeHTML(x.abstract || '');
      const abstractShort = abstract.length > 100 ? abstract.substring(0, 100) + '...' : abstract;
      const tags = (x.tags || []).slice(0, 4).map(t => sanitizeHTML(t));
      
      // Bestimme Icon basierend auf Titel oder Tags
      const titleLower = title.toLowerCase();
      const hasPDF = titleLower.includes('pdf') || titleLower.includes('download') || x.downloadUrl;
      const pubIcon = hasPDF ? getIcon('fileText', 24) : getIcon('book', 24);
      
      return `
      <div class="pub-card-compact">
        <div class="pub-image-compact">
          <img src="${imageUrl}" alt="${title}" loading="lazy" />
          <div class="pub-icon-overlay">
            ${pubIcon}
          </div>
        </div>
        <div class="pub-content-compact">
          <div class="font-bold" style="font-size:14px;">${title}</div>
          <p class="p mt-sm" style="font-size:13px;line-height:1.5;">${abstractShort}</p>
          ${tags.length > 0 ? `<div class="chips mt-sm" style="font-size:11px;">${tags.map(t => `<span class="chip">${t}</span>`).join("")}</div>` : ''}
        </div>
      </div>
    `;
    }).join("");
  } catch (error) {
    console.error("Error rendering public publications:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Publikationen.</div>';
  }
};
