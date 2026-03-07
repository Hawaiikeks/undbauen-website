// Modal für Mitglieder-Details
import { getIcon } from './icons.js';

export const memberModal = {
  overlay: null,
  modal: null,

  init() {
    if (!document.getElementById('memberModalOverlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'memberModalOverlay';
      overlay.className = 'modal-overlay member-modal-overlay';
      overlay.innerHTML = `
        <div class="modal member-modal" role="dialog" aria-modal="true" aria-labelledby="memberModalTitle">
          <button class="btn icon-btn modal-close member-modal-close" id="closeMemberModal" aria-label="Modal schließen">
            <svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div class="modal-body member-modal-body" id="memberModalBody"></div>
        </div>
      `;
      document.body.appendChild(overlay);

      this.overlay = overlay;
      this.modal = overlay.querySelector('.member-modal');

      overlay.querySelector('#closeMemberModal').addEventListener('click', () => this.hide());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) this.hide(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.style.display === 'flex') this.hide();
      });
    } else {
      this.overlay = document.getElementById('memberModalOverlay');
      this.modal = this.overlay.querySelector('.member-modal');
    }
  },

  show(person) {
    if (!this.overlay) this.init();

    const body = document.getElementById('memberModalBody');
    if (!body) return;

    const skills   = person.stichwoerter || [];
    const contacts = (person.links || []).filter(l => l.url);

    const initials  = (person.name || '??').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    body.innerHTML = `
      <div class="member-modal-content">

        <div class="member-modal-header">
          <div class="member-modal-avatar">
            ${person.photo
              ? `<img src="${person.photo}" alt="${person.name}" class="member-avatar-img" loading="lazy"
                  onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />`
              : ''}
            <div class="member-avatar-placeholder" style="${person.photo ? 'display:none;' : ''}">${initials}</div>
          </div>
          <div class="member-modal-info">
            <h3 class="member-modal-name">${person.name || 'Unbekannt'}</h3>
            <p class="member-modal-role">${person.taetigkeit || 'Mitglied'}</p>
            ${person.catchphrase ? `<p class="member-modal-bio">„${person.catchphrase}"</p>` : ''}
          </div>
        </div>

        ${skills.length > 0 ? `
          <div class="member-modal-section">
            <h4 class="member-modal-section-title">Stichwörter</h4>
            <div class="chips">${skills.map(s => `<span class="chip">${s}</span>`).join('')}</div>
          </div>
        ` : ''}

        ${contacts.length > 0 ? `
          <div class="member-modal-section">
            <h4 class="member-modal-section-title">Kontakt</h4>
            <div class="chips">
              ${contacts.map(l =>
                `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="chip chip-link" aria-label="${l.label}">${l.label}</a>`
              ).join('')}
            </div>
          </div>
        ` : ''}

      </div>
    `;

    this.overlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Badge-Breite nach dem Rendern neu berechnen
    const chips = body.querySelectorAll('.chip');
    const adjustments = Array.from(chips).map(chip => {
      chip.style.width = '';
      const range = document.createRange();
      range.selectNodeContents(chip);
      const rects = Array.from(range.getClientRects());
      if (rects.length <= 1) return { chip, width: null };
      const cs = getComputedStyle(chip);
      const padH = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
      const maxLineWidth = Math.max(...rects.map(r => r.width));
      return { chip, width: Math.ceil(maxLineWidth + padH) };
    });
    adjustments.forEach(({ chip, width }) => {
      if (width !== null) chip.style.width = width + 'px';
    });

    const focusable = this.modal.querySelectorAll('button, [href]');
    if (focusable.length > 0) focusable[0].focus();
  },

  hide() {
    if (!this.overlay) return;
    this.overlay.style.display = 'none';
    document.body.style.overflow = '';
  }
};
