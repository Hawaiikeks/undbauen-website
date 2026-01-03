/* Ticket Wizard: Multi-step form for creating tickets */

import { ticketRepository } from '../services/repositories/ticketRepository.js';
import { notificationRepository } from '../services/repositories/notificationRepository.js';
import { logTicketStatusChange } from '../services/auditLogger.js';
import { api } from '../services/apiClient.js';
import { toast } from './toast.js';
import { trapFocus } from './focusTrap.js';

const ticketCategories = [
  { id: 'feature', label: 'Feature-Vorschlag', icon: '💡' },
  { id: 'improvement', label: 'Verbesserung', icon: '✨' },
  { id: 'bug', label: 'Fehler/Bug', icon: '🐛' },
  { id: 'content', label: 'Content-Anfrage', icon: '📝' },
  { id: 'event', label: 'Event-Idee', icon: '📅' },
  { id: 'other', label: 'Sonstiges', icon: '💬' }
];

let currentStep = 1;
let wizardData = {
  category: null,
  title: '',
  description: '',
  links: [],
  attachments: [],
  visibilityPublicCandidate: false
};

/**
 * Show ticket wizard modal
 */
export function showTicketWizard() {
  currentStep = 1;
  wizardData = {
    category: null,
    title: '',
    description: '',
    links: [],
    attachments: [],
    visibilityPublicCandidate: false
  };

  const modal = document.createElement('div');
  modal.className = 'modalOverlay';
  modal.id = 'ticketWizardModal';
  modal.innerHTML = renderWizard();
  document.body.appendChild(modal);

  wireWizardEvents(modal);
}

/**
 * Render wizard HTML
 */
function renderWizard() {
  // Wider modal for review step
  const isReviewStep = currentStep === 2;
  const modalWidth = isReviewStep ? '900px' : '600px';
  return `
    <div class="modal" style="max-width: ${modalWidth}; width: 90%;">
      <div class="modalHeader">
        <div class="modalTitle" id="ticketWizardTitle">Idee einreichen</div>
        <button class="btn" onclick="this.closest('.modalOverlay').remove()" aria-label="Schließen" style="font-size: 24px; padding: 8px 16px;">✕</button>
      </div>
      <div class="modalBody">
        ${renderStep()}
      </div>
    </div>
  `;
}

/**
 * Render current step
 */
function renderStep() {
  if (currentStep === 1) {
    return renderCategoryStep();
  } else if (currentStep === 2) {
    return renderReviewStep();
  }
  return '';
}

/**
 * Render category selection step
 */
function renderCategoryStep() {
  return `
    <div>
      <div style="margin-bottom: 24px;">
        <h3 style="font-weight: 600; margin-bottom: 8px;">Wählen Sie eine Kategorie</h3>
        <p class="small" style="color: var(--text-secondary);">Wählen Sie die passende Kategorie für Ihre Idee.</p>
      </div>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
        ${ticketCategories.map(cat => `
          <button class="btn" 
                  data-category="${cat.id}"
                  style="padding: 20px; text-align: center; flex-direction: column; gap: 8px; border: 2px solid var(--border);"
                  onclick="window.selectTicketCategory('${cat.id}')">
            <span style="font-size: 32px;">${cat.icon}</span>
            <span style="font-weight: 500;">${cat.label}</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Render form step
 */
function renderFormStep() {
  return `
    <div>
      <div style="margin-bottom: 24px;">
        <h3 style="font-weight: 600; margin-bottom: 8px;">Details</h3>
        <p class="small" style="color: var(--text-secondary);">Beschreiben Sie Ihre Idee im Detail.</p>
      </div>
      
      <label class="label">Titel *</label>
      <input class="input" id="ticketTitle" placeholder="Kurzer, prägnanter Titel" value="${wizardData.title || ''}" />
      
      <label class="label" style="margin-top: 16px;">Beschreibung *</label>
      <textarea class="textarea" id="ticketDescription" rows="6" placeholder="Beschreiben Sie Ihre Idee ausführlich...">${wizardData.description || ''}</textarea>
      
      <label class="label" style="margin-top: 16px;">Links (optional)</label>
      <div id="ticketLinks" style="margin-bottom: 8px;">
        ${(wizardData.links || []).map((link, idx) => `
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
            <input class="input" type="url" value="${link}" placeholder="https://..." data-link-idx="${idx}" />
            <button class="btn danger small" onclick="window.removeTicketLink(${idx})">✕</button>
          </div>
        `).join('')}
      </div>
      <button class="btn small" onclick="window.addTicketLink()">+ Link hinzufügen</button>
      
      <label class="label" style="margin-top: 16px;">
        <input type="checkbox" id="ticketVisibility" ${wizardData.visibilityPublicCandidate ? 'checked' : ''} />
        Als öffentlicher Kandidat markieren
      </label>
      <p class="small" style="color: var(--text-secondary); margin-top: 4px;">
        Diese Idee kann öffentlich diskutiert werden.
      </p>
      
      <div style="display: flex; gap: 12px; margin-top: 24px;">
        <button class="btn" onclick="window.ticketWizardPrevious()">← Zurück</button>
        <button class="btn primary" onclick="window.ticketWizardNext()" style="flex: 1;">Weiter →</button>
      </div>
    </div>
  `;
}

/**
 * Render review step
 */
function renderReviewStep() {
  const category = ticketCategories.find(c => c.id === wizardData.category);
  return `
    <div>
      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 24px;">
        <div>
          <h3 style="font-weight: 600; margin-bottom: 8px; font-size: 20px; color: var(--primary);">${category ? `${category.icon} ${category.label}` : 'Kategorie'}</h3>
        </div>
        <div class="small" style="color: var(--text-secondary);">Schritt 2 von 2 - Überprüfung</div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <label class="label" style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px;">TITEL</label>
        <input class="input" id="reviewTitle" value="${wizardData.title || ''}" placeholder="Kurzer, prägnanter Titel" />
      </div>
      
      <div style="margin-bottom: 24px;">
        <label class="label" style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px;">BESCHREIBUNG</label>
        <textarea class="textarea" id="reviewDescription" placeholder="Beschreiben Sie Ihre Idee ausführlich..." style="min-height: 150px; max-height: 300px; overflow-y: auto; resize: vertical;">${wizardData.description || ''}</textarea>
      </div>
      
      <label class="label" style="margin-top: 16px;">
        <input type="checkbox" id="reviewVisibility" ${wizardData.visibilityPublicCandidate ? 'checked' : ''} />
        Als öffentlicher Kandidat markieren
      </label>
      <p class="small" style="color: var(--text-secondary); margin-top: 4px;">
        Diese Idee kann öffentlich diskutiert werden.
      </p>
      
      ${(wizardData.links || []).length > 0 ? `
        <div style="margin-bottom: 24px; margin-top: 16px;">
          <label class="label" style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px;">LINKS</label>
          <div id="reviewLinks" style="margin-bottom: 8px;">
            ${(wizardData.links || []).map((link, idx) => `
              <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input class="input" type="url" value="${link}" placeholder="https://..." data-link-idx="${idx}" />
                <button class="btn danger small" onclick="window.removeTicketLink(${idx})">✕</button>
              </div>
            `).join('')}
          </div>
          <button class="btn small" onclick="window.addTicketLink()">+ Link hinzufügen</button>
        </div>
      ` : `
        <div style="margin-top: 16px; margin-bottom: 16px;">
          <label class="label" style="text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: var(--text-secondary); margin-bottom: 8px;">LINKS (optional)</label>
          <div id="reviewLinks" style="margin-bottom: 8px;"></div>
          <button class="btn small" onclick="window.addTicketLink()">+ Link hinzufügen</button>
        </div>
      `}
      
      <div style="display: flex; gap: 12px; margin-top: 24px; margin-bottom: 12px;">
        <button class="btn" onclick="window.ticketWizardPrevious()" style="flex: 0 0 auto;">← Zurück</button>
        <button class="btn primary" onclick="window.ticketWizardSubmit()" style="flex: 1;">Vorschlag einreichen</button>
      </div>
      <p class="small" style="color: var(--text-secondary); text-align: center; margin-top: 8px;">Ihr Vorschlag wird vom Team geprüft und priorisiert.</p>
    </div>
  `;
}

/**
 * Wire wizard events
 */
function wireWizardEvents(modal) {
  // Category selection
  window.selectTicketCategory = (categoryId) => {
    wizardData.category = categoryId;
    const buttons = modal.querySelectorAll('[data-category]');
    buttons.forEach(btn => {
      if (btn.dataset.category === categoryId) {
        btn.style.borderColor = 'var(--primary)';
        btn.style.background = 'var(--bg-hover, rgba(0,0,0,0.05))';
      } else {
        btn.style.borderColor = 'var(--border)';
        btn.style.background = 'transparent';
      }
    });
    
    setTimeout(() => {
      currentStep = 2;
      // Update modal width for review step
      const modalElement = modal.querySelector('.modal');
      modalElement.style.maxWidth = '900px';
      modalElement.style.width = '90%';
      modal.querySelector('.modalBody').innerHTML = renderStep();
      wireWizardEvents(modal);
    }, 300);
  };

  // Add link
  window.addTicketLink = () => {
    if (!wizardData.links) wizardData.links = [];
    wizardData.links.push('');
    modal.querySelector('.modalBody').innerHTML = renderStep();
    wireWizardEvents(modal);
  };

  // Remove link
  window.removeTicketLink = (idx) => {
    wizardData.links.splice(idx, 1);
    modal.querySelector('.modalBody').innerHTML = renderStep();
    wireWizardEvents(modal);
  };

  // Next step (not used anymore, but kept for compatibility)
  window.ticketWizardNext = () => {
    // This function is no longer needed as we go directly from step 1 to step 2
  };

  // Previous step
  window.ticketWizardPrevious = () => {
    if (currentStep > 1) {
      currentStep--;
      // Update modal width when leaving review step
      const modalElement = modal.querySelector('.modal');
      if (currentStep !== 3) {
        modalElement.style.maxWidth = '600px';
        modalElement.style.width = 'auto';
      }
      modal.querySelector('.modalBody').innerHTML = renderStep();
      wireWizardEvents(modal);
    }
  };

  // Edit field in review step
  window.ticketWizardEditField = (field) => {
    if (field === 'title') {
      currentStep = 2;
      const modalElement = modal.querySelector('.modal');
      modalElement.style.maxWidth = '600px';
      modalElement.style.width = 'auto';
      modal.querySelector('.modalBody').innerHTML = renderStep();
      wireWizardEvents(modal);
      // Focus on title field
      setTimeout(() => {
        const titleInput = modal.querySelector('#ticketTitle');
        if (titleInput) {
          titleInput.focus();
          titleInput.select();
        }
      }, 100);
    } else if (field === 'description') {
      currentStep = 2;
      const modalElement = modal.querySelector('.modal');
      modalElement.style.maxWidth = '600px';
      modalElement.style.width = 'auto';
      modal.querySelector('.modalBody').innerHTML = renderStep();
      wireWizardEvents(modal);
      // Focus on description field
      setTimeout(() => {
        const descInput = modal.querySelector('#ticketDescription');
        if (descInput) {
          descInput.focus();
        }
      }, 100);
    }
  };

  // Submit
  window.ticketWizardSubmit = async () => {
    const user = api.me();
    if (!user) {
      toast.error('Sie müssen eingeloggt sein.');
      return;
    }

    // Collect data from review step
    const title = modal.querySelector('#reviewTitle')?.value?.trim();
    const description = modal.querySelector('#reviewDescription')?.value?.trim();
    const visibility = modal.querySelector('#reviewVisibility')?.checked || false;
    
    if (!title || !description) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus.');
      return;
    }
    
    wizardData.title = title;
    wizardData.description = description;
    wizardData.visibilityPublicCandidate = visibility;
    
    // Collect links
    const linkInputs = modal.querySelectorAll('[data-link-idx]');
    wizardData.links = Array.from(linkInputs).map(input => input.value.trim()).filter(Boolean);

    try {
      const ticket = await ticketRepository.create({
        createdByUserId: user.id,
        category: wizardData.category,
        title: wizardData.title,
        description: wizardData.description,
        links: wizardData.links || [],
        attachments: wizardData.attachments || [],
        visibilityPublicCandidate: wizardData.visibilityPublicCandidate,
        status: 'open',
        assignedToUserId: null
      });

      // Log audit event
      await logTicketStatusChange(ticket.id, null, 'open');

      // Create notification for user
      const { notificationRepository } = await import('../services/repositories/notificationRepository.js');
      await notificationRepository.create({
        userId: user.id,
        type: 'ticket_created',
        entityType: 'ticket',
        entityId: ticket.id,
        title: 'Ihre Idee wurde eingereicht',
        body: `Ihre Idee "${ticket.title}" wurde erfolgreich eingereicht. Sie können den Status unter "Meine Ideen" verfolgen.`,
        isRead: false,
        actionUrl: 'tickets.html'
      });

      toast.success('Ihre Idee wurde erfolgreich eingereicht!');
      modal.remove();
      
      // Show success modal and redirect
      const { showSuccessModal } = await import('./successModal.js');
      showSuccessModal('Ihre Idee wurde erfolgreich eingereicht. Sie können den Status unter "Meine Ideen" verfolgen.', 'Erfolgreich eingereicht');
      
      // Redirect to tickets page after modal closes
      setTimeout(() => {
        window.location.href = 'tickets.html';
      }, 2000);
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Fehler beim Erstellen der Idee. Bitte versuchen Sie es erneut.');
    }
  };
}

