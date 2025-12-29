// Modal für Mitglieder-Details
import { getIcon } from './icons.js';

export const memberModal = {
  overlay: null,
  modal: null,
  
  init() {
    // Erstelle Modal-Struktur falls nicht vorhanden
    if (!document.getElementById('memberModalOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'memberModalOverlay';
      overlay.className = 'modal-overlay member-modal-overlay';
      overlay.innerHTML = `
        <div class="modal member-modal" role="dialog" aria-modal="true" aria-labelledby="memberModalTitle">
          <div class="modal-header">
            <h2 class="modal-title" id="memberModalTitle">Mitgliedsprofil</h2>
            <button class="btn icon-btn modal-close" id="closeMemberModal" aria-label="Modal schließen">
              <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <div class="modal-body member-modal-body" id="memberModalBody">
            <!-- Wird dynamisch befüllt -->
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      
      this.overlay = overlay;
      this.modal = overlay.querySelector('.member-modal');
      
      // Close handlers
      overlay.querySelector('#closeMemberModal').addEventListener('click', () => this.hide());
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.hide();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') {
          this.hide();
        }
      });
    } else {
      this.overlay = document.getElementById('memberModalOverlay');
      this.modal = this.overlay.querySelector('.member-modal');
    }
  },
  
  show(person) {
    if (!this.overlay) this.init();
    
    const body = document.getElementById('memberModalBody');
    const title = document.getElementById('memberModalTitle');
    if (!body || !title) return;
    
    title.textContent = person.name || 'Mitgliedsprofil';
    
    const initials = person.name?.split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2) || "??";
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(person.name || 'user')}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    const skills = [...(person.skills||[]), ...(person.interests||[])] || [];
    const linkedin = person.links?.linkedin || "";
    const website = person.links?.website || "";
    const location = person.location || "";
    
    body.innerHTML = `
      <div class="member-modal-content">
        <div class="member-modal-header">
          <div class="member-modal-avatar">
            <img src="${avatarUrl}" alt="${person.name}" class="member-avatar-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
            <div class="member-avatar-placeholder" style="display: none;">${initials}</div>
          </div>
          <div class="member-modal-info">
            <h3 class="member-modal-name">${person.name || 'Unbekannt'}</h3>
            <p class="member-modal-role">${person.headline || 'Mitglied'}</p>
            ${location ? `<p class="member-modal-location">${getIcon('mapPin', 16)} ${location}</p>` : ''}
          </div>
        </div>
        
        ${person.bio ? `
          <div class="member-modal-section">
            <h4 class="member-modal-section-title">Über</h4>
            <p class="member-modal-bio">${person.bio}</p>
          </div>
        ` : ''}
        
        ${skills.length > 0 ? `
          <div class="member-modal-section">
            <h4 class="member-modal-section-title">Kompetenzen</h4>
            <div class="chips">${skills.map(s => `<span class="chip">${s}</span>`).join('')}</div>
          </div>
        ` : ''}
        
        ${linkedin || website ? `
          <div class="member-modal-section">
            <h4 class="member-modal-section-title">Links</h4>
            <div class="member-modal-links">
              ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noopener noreferrer" class="btn secondary">
                ${getIcon('link', 18)} LinkedIn
              </a>` : ''}
              ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" class="btn secondary">
                ${getIcon('globe', 18)} Website
              </a>` : ''}
            </div>
          </div>
        ` : ''}
      </div>
    `;
    
    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus trap
    const focusableElements = this.modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  },
  
  hide() {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
};

