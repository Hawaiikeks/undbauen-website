/* Inbox Page: Moderator view of all tickets */

import { ticketRepository } from '../services/repositories/ticketRepository.js';
import { notificationRepository } from '../services/repositories/notificationRepository.js';
import { logTicketStatusChange } from '../services/auditLogger.js';
import { api } from '../services/apiClient.js';
import { toast } from '../components/toast.js';

const statusLabels = {
  open: 'Offen',
  in_progress: 'In Bearbeitung',
  resolved: 'Gelöst',
  closed: 'Geschlossen',
  rejected: 'Abgelehnt'
};

const statusOptions = [
  { value: 'open', label: 'Offen' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'resolved', label: 'Gelöst' },
  { value: 'closed', label: 'Geschlossen' },
  { value: 'rejected', label: 'Abgelehnt' }
];

const categoryLabels = {
  feature: '💡 Feature',
  improvement: '✨ Verbesserung',
  bug: '🐛 Bug',
  content: '📝 Content',
  event: '📅 Event',
  other: '💬 Sonstiges'
};

let currentFilter = {
  status: 'all',
  category: 'all',
  assigned: 'all'
};

/**
 * Render inbox page
 */
export async function renderInbox() {
  const user = api.me();
  if (!user) {
    window.location.href = '../../index.html';
    return;
  }

  const container = document.querySelector('#inboxContainer') || document.querySelector('main');
  if (!container) return;

  const allTickets = await ticketRepository.findAll();
  const filteredTickets = filterTickets(allTickets);
  const sortedTickets = filteredTickets.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  container.innerHTML = `
    <div class="container pageWrap">
      <div style="margin-bottom: 24px;">
        <h1 class="h2">Ticket-Inbox</h1>
        <p class="p" style="color: var(--text-secondary); margin-top: 8px;">
          Verwalten Sie alle eingereichten Ideen und Tickets.
        </p>
      </div>

      <div class="card pane" style="margin-bottom: 24px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div>
            <label class="label">Status</label>
            <select class="input" id="filterStatus">
              <option value="all">Alle</option>
              ${statusOptions.map(opt => `
                <option value="${opt.value}" ${currentFilter.status === opt.value ? 'selected' : ''}>
                  ${opt.label}
                </option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="label">Kategorie</label>
            <select class="input" id="filterCategory">
              <option value="all">Alle</option>
              ${Object.keys(categoryLabels).map(cat => `
                <option value="${cat}" ${currentFilter.category === cat ? 'selected' : ''}>
                  ${categoryLabels[cat]}
                </option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="label">Zugewiesen</label>
            <select class="input" id="filterAssigned">
              <option value="all">Alle</option>
              <option value="me" ${currentFilter.assigned === 'me' ? 'selected' : ''}>Mir zugewiesen</option>
              <option value="unassigned" ${currentFilter.assigned === 'unassigned' ? 'selected' : ''}>Nicht zugewiesen</option>
            </select>
          </div>
        </div>
      </div>

      <div style="margin-bottom: 16px; color: var(--text-secondary);">
        ${sortedTickets.length} ${sortedTickets.length === 1 ? 'Ticket' : 'Tickets'} gefunden
      </div>

      ${sortedTickets.length === 0 ? `
        <div class="card pane" style="text-align: center; padding: 48px 24px;">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📭</div>
          <div style="font-weight: 600; margin-bottom: 8px;">Keine Tickets gefunden</div>
          <div style="color: var(--text-secondary);">
            Es gibt keine Tickets, die den aktuellen Filtern entsprechen.
          </div>
        </div>
      ` : `
        <div style="display: flex; flex-direction: column; gap: 16px;">
          ${sortedTickets.map(ticket => renderTicketCard(ticket, user)).join('')}
        </div>
      `}
    </div>
  `;

  // Wire filter events
  container.querySelector('#filterStatus')?.addEventListener('change', (e) => {
    currentFilter.status = e.target.value;
    renderInbox();
  });

  container.querySelector('#filterCategory')?.addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    renderInbox();
  });

  container.querySelector('#filterAssigned')?.addEventListener('change', (e) => {
    currentFilter.assigned = e.target.value;
    renderInbox();
  });
}

/**
 * Filter tickets
 */
function filterTickets(tickets) {
  return tickets.filter(ticket => {
    if (currentFilter.status !== 'all' && ticket.status !== currentFilter.status) {
      return false;
    }
    if (currentFilter.category !== 'all' && ticket.category !== currentFilter.category) {
      return false;
    }
    if (currentFilter.assigned === 'me') {
      const user = api.me();
      if (ticket.assignedToUserId !== user?.id) {
        return false;
      }
    } else if (currentFilter.assigned === 'unassigned' && ticket.assignedToUserId) {
      return false;
    }
    return true;
  });
}

/**
 * Render ticket card for inbox
 */
function renderTicketCard(ticket, currentUser) {
  const statusLabel = statusLabels[ticket.status] || ticket.status;
  const categoryLabel = categoryLabels[ticket.category] || ticket.category;
  
  // Get creator info
  const creator = api.getProfileByEmail ? 
    (() => {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.id === ticket.createdByUserId);
      return user ? { name: user.name, email: user.email } : null;
    })() : null;

  return `
    <div class="card pane">
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <span style="font-size: 20px;">${categoryLabel.split(' ')[0]}</span>
            <h3 style="font-weight: 600; font-size: 18px; margin: 0;">${ticket.title || 'Unbenannt'}</h3>
          </div>
          <div style="color: var(--text-secondary); font-size: 14px;">
            Von: ${creator?.name || 'Unbekannt'} • 
            ${new Date(ticket.createdAt).toLocaleDateString('de-DE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <select class="input" style="width: auto; min-width: 150px;" 
                  data-ticket-id="${ticket.id}" 
                  data-current-status="${ticket.status}"
                  onchange="window.changeTicketStatus('${ticket.id}', this.value, '${ticket.status}')">
            ${statusOptions.map(opt => `
              <option value="${opt.value}" ${ticket.status === opt.value ? 'selected' : ''}>
                ${opt.label}
              </option>
            `).join('')}
          </select>
        </div>
      </div>
      
      <div style="margin-bottom: 16px; color: var(--text-primary); line-height: 1.6;">
        ${ticket.description || ''}
      </div>
      
      ${(ticket.links || []).length > 0 ? `
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px;">Links:</div>
          ${ticket.links.map(link => `
            <a href="${link}" target="_blank" rel="noopener" style="color: var(--primary); text-decoration: underline; margin-right: 12px;">
              ${link}
            </a>
          `).join('')}
        </div>
      ` : ''}
      
      <div style="display: flex; gap: 8px; margin-top: 16px;">
        <button class="btn small" onclick="window.assignTicket('${ticket.id}')">
          ${ticket.assignedToUserId === currentUser.id ? 'Zuweisung entfernen' : 'Mir zuweisen'}
        </button>
        ${ticket.visibilityPublicCandidate ? `
          <span class="badge" style="background: var(--accent); color: white; font-size: 12px;">
            Öffentlicher Kandidat
          </span>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Change ticket status
 */
window.changeTicketStatus = async function(ticketId, newStatus, oldStatus) {
  try {
    await ticketRepository.update(ticketId, { status: newStatus });
    
    // Log audit event
    await logTicketStatusChange(ticketId, oldStatus, newStatus);
    
    // Create notification for ticket creator
    const ticket = await ticketRepository.findById(ticketId);
    if (ticket && ticket.createdByUserId) {
      await notificationRepository.create({
        userId: ticket.createdByUserId,
        type: 'ticket_status_change',
        entityType: 'ticket',
        entityId: ticketId,
        title: 'Ticket-Status geändert',
        body: `Ihr Ticket "${ticket.title}" wurde auf "${statusLabels[newStatus]}" gesetzt.`,
        isRead: false
      });
    }
    
    toast.success('Status aktualisiert');
    renderInbox();
  } catch (error) {
    console.error('Error updating ticket status:', error);
    toast.error('Fehler beim Aktualisieren des Status');
  }
};

/**
 * Assign ticket to current user
 */
window.assignTicket = async function(ticketId) {
  const user = api.me();
  if (!user) return;

  try {
    const ticket = await ticketRepository.findById(ticketId);
    const newAssigned = ticket.assignedToUserId === user.id ? null : user.id;
    
    await ticketRepository.update(ticketId, { assignedToUserId: newAssigned });
    toast.success(newAssigned ? 'Ticket zugewiesen' : 'Zuweisung entfernt');
    renderInbox();
  } catch (error) {
    console.error('Error assigning ticket:', error);
    toast.error('Fehler beim Zuweisen');
  }
};












