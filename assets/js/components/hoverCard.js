// Hover Card Component for Person Profiles
class HoverCard {
  constructor() {
    this.card = null;
    this.timeout = null;
  }

  show(person, triggerElement) {
    // Clear any existing timeout
    if (this.timeout) {
      clearTimeout(this.timeout);
    }

    // Remove existing card
    this.hide();

    // Create card element
    this.card = document.createElement('div');
    this.card.className = 'hover-card';
    this.card.setAttribute('role', 'tooltip');
    this.card.setAttribute('aria-live', 'polite');

    const skills = [...(person.skills || []), ...(person.interests || [])].slice(0, 6);
    const linkedin = person.links?.linkedin || '';
    const website = person.links?.website || '';
    const location = person.location || '';

    this.card.innerHTML = `
      <div class="hover-card-header">
        <div class="hover-card-avatar">
          ${person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div class="hover-card-info">
          <div class="hover-card-name">${person.name}</div>
          <div class="hover-card-role">${person.headline || 'Mitglied'}</div>
          ${location ? `<div class="hover-card-location">📍 ${location}</div>` : ''}
        </div>
      </div>
      ${person.bio ? `<div class="hover-card-bio">${(person.bio || '').slice(0, 120)}${person.bio.length > 120 ? '...' : ''}</div>` : ''}
      ${skills.length > 0 ? `
        <div class="hover-card-skills">
          ${skills.map(s => `<span class="chip">${s}</span>`).join('')}
        </div>
      ` : ''}
      <div class="hover-card-actions">
        ${linkedin ? `<a href="${linkedin}" target="_blank" rel="noopener noreferrer" class="btn ghost" aria-label="LinkedIn Profil von ${person.name}">LinkedIn</a>` : ''}
        ${website ? `<a href="${website}" target="_blank" rel="noopener noreferrer" class="btn ghost" aria-label="Website von ${person.name}">Website</a>` : ''}
        <button class="btn primary" onclick="window.location.href='app/member.html?email=${encodeURIComponent(person.email)}'" aria-label="Profil von ${person.name} ansehen">Profil ansehen</button>
      </div>
    `;

    document.body.appendChild(this.card);

    // Position card
    this.positionCard(triggerElement);

    // Show with animation
    requestAnimationFrame(() => {
      this.card.classList.add('hover-card-show');
    });

    // Hide on mouse leave
    const hideOnLeave = () => {
      this.timeout = setTimeout(() => this.hide(), 200);
    };
    
    triggerElement.addEventListener('mouseleave', hideOnLeave, { once: true });
    this.card.addEventListener('mouseenter', () => {
      if (this.timeout) clearTimeout(this.timeout);
    });
    this.card.addEventListener('mouseleave', hideOnLeave);
  }

  positionCard(triggerElement) {
    const rect = triggerElement.getBoundingClientRect();
    const cardRect = this.card.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top = rect.bottom + 12;
    let left = rect.left + (rect.width / 2) - (cardRect.width / 2);

    // Adjust if card would go off screen
    if (left < 12) left = 12;
    if (left + cardRect.width > viewportWidth - 12) {
      left = viewportWidth - cardRect.width - 12;
    }

    // If card would go below viewport, show above instead
    if (top + cardRect.height > viewportHeight - 12) {
      top = rect.top - cardRect.height - 12;
    }

    this.card.style.top = `${top}px`;
    this.card.style.left = `${left}px`;
  }

  hide() {
    if (this.card) {
      this.card.classList.remove('hover-card-show');
      setTimeout(() => {
        if (this.card && this.card.parentNode) {
          this.card.parentNode.removeChild(this.card);
        }
        this.card = null;
      }, 200);
    }
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }
}

export const hoverCard = new HoverCard();














