import { members, events } from "../data.js";

class GlobalSearch {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'search-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Globale Suche');
    this.overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-header">
          <input type="text" class="search-input" id="globalSearchInput"
            placeholder="Suche nach Mitgliedern oder Events …"
            aria-label="Suchfeld" autocomplete="off" />
          <button class="search-close" aria-label="Suche schließen">×</button>
        </div>
        <div class="search-results" id="searchResults" role="listbox"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.input = this.overlay.querySelector('#globalSearchInput');
    this.resultsContainer = this.overlay.querySelector('#searchResults');

    this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.overlay.querySelector('.search-close').addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => { if (e.target === this.overlay) this.close(); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); this.open(); }
    });
  }

  open() {
    this.isOpen = true;
    this.overlay.style.display = 'flex';
    this.input.focus();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen = false;
    this.overlay.style.display = 'none';
    this.input.value = '';
    this.resultsContainer.innerHTML = '';
    document.body.style.overflow = '';
  }

  handleSearch(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) { this.resultsContainer.innerHTML = ''; return; }

    const matchedMembers = members.filter(m =>
      m.name?.toLowerCase().includes(q) ||
      m.taetigkeit?.toLowerCase().includes(q) ||
      m.stichwoerter?.some(s => s.toLowerCase().includes(q))
    ).slice(0, 5);

    const matchedEvents = events.filter(e =>
      e.title?.toLowerCase().includes(q) ||
      e.descriptionPublic?.toLowerCase().includes(q) ||
      e.tags?.some(t => t.toLowerCase().includes(q))
    ).slice(0, 5);

    this.renderResults(matchedMembers, matchedEvents);
  }

  renderResults(matchedMembers, matchedEvents) {
    if (matchedMembers.length === 0 && matchedEvents.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-empty">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-title">Keine Ergebnisse gefunden</div>
          <div class="empty-state-description">Versuche andere Suchbegriffe</div>
        </div>
      `;
      return;
    }

    let html = '';

    if (matchedMembers.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-title">Mitglieder</div>
          ${matchedMembers.map(m => `
            <a href="#netzwerk" class="search-result-item">
              <div class="search-result-avatar">${m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
              <div class="search-result-content">
                <div class="search-result-title">${m.name}</div>
                <div class="search-result-subtitle">${m.taetigkeit || 'Mitglied'}</div>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    if (matchedEvents.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-title">Termine</div>
          ${matchedEvents.map(e => `
            <a href="#termine" class="search-result-item">
              <div class="search-result-icon">📅</div>
              <div class="search-result-content">
                <div class="search-result-title">${e.title}</div>
                <div class="search-result-subtitle">${e.date} ${e.time}</div>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    this.resultsContainer.innerHTML = html;
  }
}

export const globalSearch = new GlobalSearch();
