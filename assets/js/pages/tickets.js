/* Tickets Page: Member view of their tickets */

import { ticketRepository } from '../services/repositories/ticketRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

const statusLabels = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
  rejected: 'Abgelehnt'
};

const statusColors = {
  open: 'var(--primary)',
  in_progress: 'var(--accent)',
  resolved: 'var(--success)',
  closed: 'var(--text-secondary)',
  rejected: 'var(--danger)'
};

// Light mode colors for badges (with better contrast - darker text for readability)
const statusColorsLight = {
  open: { bg: 'rgba(255, 107, 53, 0.2)', text: '#C2410C', border: 'rgba(255, 107, 53, 0.3)' },
  in_progress: { bg: 'rgba(32, 178, 170, 0.2)', text: '#0D9488', border: 'rgba(32, 178, 170, 0.3)' },
  resolved: { bg: 'rgba(16, 185, 129, 0.2)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)' },
  closed: { bg: 'rgba(107, 114, 128, 0.2)', text: '#374151', border: 'rgba(107, 114, 128, 0.3)' },
  rejected: { bg: 'rgba(220, 38, 38, 0.2)', text: '#991B1B', border: 'rgba(220, 38, 38, 0.3)' }
};

// Dark mode colors for badges
const statusColorsDark = {
  open: { bg: 'var(--primary)', text: '#FFFFFF' },
  in_progress: { bg: 'var(--accent)', text: '#FFFFFF' },
  resolved: { bg: 'var(--success)', text: '#FFFFFF' },
  closed: { bg: 'var(--text-secondary)', text: '#FFFFFF' },
  rejected: { bg: 'var(--danger)', text: '#FFFFFF' }
};

const categoryData = {
  feature: { icon: '💡', label: 'Feature-Vorschlag' },
  improvement: { icon: '✨', label: 'Verbesserung' },
  bug: { icon: '🐛', label: 'Fehler/Bug' },
  content: { icon: '📝', label: 'Content-Anfrage' },
  event: { icon: '📅', label: 'Event-Idee' },
  other: { icon: '💬', label: 'Sonstiges' }
};

/**
 * Render tickets page
 */
export async function renderTickets() {
  const user = api.me();
  if (!user) {
    window.location.href = '../index.html';
    return;
  }

  const tickets = await ticketRepository.findByUserId(user.id);
  const sortedTickets = tickets.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  const container = document.querySelector('#ticketsContainer') || document.querySelector('main');
  if (!container) return;

  container.innerHTML = `
    <div class="container pageWrap">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 class="h2">Meine Ideen</h1>
          <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
            Hier sehen Sie alle Ihre eingereichten Ideen und deren Status.
          </p>
        </div>
        <button class="btn primary" id="createTicketBtn">+ Neue Idee</button>
      </div>

      ${sortedTickets.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">💡</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Noch keine Ideen eingereicht</div>
          <div style="color: var(--text-secondary); margin-bottom: 24px;">
            Teilen Sie Ihre Ideen und Vorschläge mit der Community.
          </div>
          <button class="btn primary" id="createTicketBtnEmpty">+ Erste Idee einreichen</button>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${sortedTickets.map((ticket, index) => renderTicketCard(ticket, index)).join('')}
        </div>
      `}
    </div>
  `;

  // Wire events
  const createBtns = container.querySelectorAll('#createTicketBtn, #createTicketBtnEmpty');
  createBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      import('../components/ticketWizard.js').then(module => {
        module.showTicketWizard();
      });
    });
  });

  // Wire ticket click events
  container.querySelectorAll('[data-ticket-id]').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on status badge
      if (e.target.closest('.ticket-status-badge')) return;
      const ticketId = card.dataset.ticketId;
      const ticket = sortedTickets.find(t => t.id === ticketId);
      if (ticket) {
        showTicketDetailModal(ticket);
      }
    });
  });
}

/**
 * Get status badge HTML with proper light/dark mode support
 */
function getStatusBadgeHTML(status, label) {
  // Check if dark mode is explicitly set, otherwise assume light mode
  const theme = document.documentElement.getAttribute('data-theme');
  const isLightMode = theme !== 'dark';
  const colorScheme = isLightMode ? statusColorsLight[status] : statusColorsDark[status];
  
  if (!colorScheme) {
    // Fallback
    const fallback = isLightMode 
      ? { bg: 'rgba(107, 114, 128, 0.2)', text: '#374151', border: 'rgba(107, 114, 128, 0.3)' }
      : { bg: 'var(--text-secondary)', text: '#FFFFFF', border: 'transparent' };
    return `<span class="badge ticket-status-badge" style="background: ${fallback.bg}; color: ${fallback.text} !important; font-size: 12px; padding: 4px 12px; font-weight: 600; border: 1px solid ${fallback.border};">
      ${label}
    </span>`;
  }
  
  return `<span class="badge ticket-status-badge" style="background: ${colorScheme.bg}; color: ${colorScheme.text} !important; font-size: 12px; padding: 4px 12px; font-weight: 600; border: 1px solid ${colorScheme.border || (isLightMode ? 'rgba(0, 0, 0, 0.15)' : 'transparent')};">
    ${label}
  </span>`;
}

/**
 * Render ticket card (compact, like forum threads)
 */
function renderTicketCard(ticket, index) {
  const statusLabel = statusLabels[ticket.status] || ticket.status;
  const category = categoryData[ticket.category] || { icon: '💬', label: ticket.category };
  
  const createdDate = new Date(ticket.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Shorten description for preview
  const descriptionPreview = ticket.description 
    ? (ticket.description.length > 150 ? ticket.description.substring(0, 150) + '...' : ticket.description)
    : '';
  
  // Border color alternating
  const borderColor = index % 2 === 0 ? 'var(--primary)' : 'var(--accent)';
  
  return `
    <div class="listItem forum-thread-item" data-ticket-id="${ticket.id}" style="padding: 16px; cursor: pointer; border: 2px solid ${borderColor}; border-radius: var(--radius); background: var(--surface); transition: all 0.2s ease;">
      <div style="flex: 1;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 18px;">${category.icon}</span>
          <span style="font-size: 14px; color: var(--text-secondary);">${category.label}</span>
        </div>
        <div style="font-weight: 600; font-size: 16px; margin-bottom: 6px; color: var(--text-primary);">
          ${ticket.title || 'Unbenannt'}
        </div>
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">
          ${createdDate}
        </div>
        ${descriptionPreview ? `
          <div style="margin-top: 8px;">
            <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px; color: var(--text-secondary);">Beschreibung:</div>
            <div style="font-size: 14px; color: var(--text-primary); line-height: 1.5;">${descriptionPreview}</div>
          </div>
        ` : ''}
      </div>
      <div style="display: flex; gap: 8px; align-items: center; margin-left: 12px;">
        ${getStatusBadgeHTML(ticket.status, statusLabel)}
      </div>
    </div>
  `;
}

/**
 * Show ticket detail modal
 */
function showTicketDetailModal(ticket) {
  const category = categoryData[ticket.category] || { icon: '💬', label: ticket.category };
  const statusLabel = statusLabels[ticket.status] || ticket.status;
  const statusColor = statusColors[ticket.status] || 'var(--text-secondary)';
  
  const createdDate = new Date(ticket.createdAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const updatedDate = ticket.updatedAt 
    ? new Date(ticket.updatedAt).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : null;

  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    backdrop-filter: blur(4px);
  `;

  modal.innerHTML = `
    <div class="modal" style="max-width: 800px; width: 90%; max-height: 90vh; overflow-y: auto;">
      <div class="modalHeader">
        <div class="modalTitle">Ideen-Details</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()" aria-label="Schließen" style="font-size: 24px; padding: 8px 16px;">✕</button>
      </div>
      <div class="modalBody">
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 20px;">${category.icon}</span>
            <span style="font-size: 16px; color: var(--text-secondary);">${category.label}</span>
          </div>
          <h2 style="font-weight: 600; font-size: 24px; margin-bottom: 8px; color: var(--text-primary);">
            ${ticket.title || 'Unbenannt'}
          </h2>
          <div style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
            Erstellt am: ${createdDate}
            ${updatedDate ? ` · Aktualisiert: ${updatedDate}` : ''}
          </div>
          <div style="margin-bottom: 16px;">
            ${getStatusBadgeHTML(ticket.status, statusLabel)}
            ${ticket.visibilityPublicCandidate ? `
              <span class="badge" style="background: var(--accent); color: white; font-size: 13px; padding: 6px 14px; margin-left: 8px;">
                Öffentlicher Kandidat
              </span>
            ` : ''}
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Beschreibung:</div>
          <div style="color: var(--text-primary); line-height: 1.6; white-space: pre-wrap; padding: 16px; background: var(--bg); border-radius: 8px; border: 1px solid var(--border);">
            ${ticket.description || 'Keine Beschreibung vorhanden.'}
          </div>
        </div>
        
        ${(ticket.links || []).length > 0 ? `
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Links:</div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${ticket.links.map(link => `
                <a href="${link}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: underline; word-break: break-all;">
                  ${link}
                </a>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${ticket.assignedToUserId ? `
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;">Zugewiesen an:</div>
            <div style="color: var(--text-primary);">
              ${ticket.assignedToUserId}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  // Close on Escape
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      document.removeEventListener('keydown', escapeHandler);
      modal.remove();
    }
  };
  document.addEventListener('keydown', escapeHandler);
}


