// Global Search Component
class GlobalSearch {
  constructor() {
    this.results = [];
    this.isOpen = false;
    this.init();
  }

  init() {
    // Create search overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'search-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Globale Suche');
    this.overlay.innerHTML = `
      <div class="search-modal">
        <div class="search-header">
          <input 
            type="text" 
            class="search-input" 
            id="globalSearchInput"
            placeholder="Suche nach Mitgliedern, Events, Forum..."
            aria-label="Suchfeld"
            autocomplete="off"
          />
          <button class="search-close" aria-label="Suche schließen">×</button>
        </div>
        <div class="search-results" id="searchResults" role="listbox"></div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    // Event listeners
    this.input = this.overlay.querySelector('#globalSearchInput');
    this.resultsContainer = this.overlay.querySelector('#searchResults');
    this.closeBtn = this.overlay.querySelector('.search-close');

    this.input.addEventListener('input', (e) => this.handleSearch(e.target.value));
    this.closeBtn.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.open();
      }
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

  async handleSearch(query) {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      this.resultsContainer.innerHTML = '';
      return;
    }

    // Search members, events, forum
    const results = {
      members: [],
      events: [],
      forum: []
    };

    try {
      // Search members (use listMembersPublic for public search)
      if (window.api) {
        if (window.api.listMembersPublic) {
          const members = window.api.listMembersPublic(q);
          results.members = members.slice(0, 5);
        } else if (window.api.listMembers) {
          const members = window.api.listMembers(q);
          results.members = members.slice(0, 5);
        }
      }

      // Search events
      if (window.api && window.api.listEvents) {
        const events = window.api.listEvents().filter(e => 
          e.title.toLowerCase().includes(q) ||
          e.descriptionPublic?.toLowerCase().includes(q) ||
          e.tags?.some(t => t.toLowerCase().includes(q))
        );
        results.events = events.slice(0, 5);
      }

      // Search forum
      if (window.api && window.api.getForumThreads) {
        const threads = window.api.getForumThreads().filter(t =>
          t.title.toLowerCase().includes(q)
        );
        results.forum = threads.slice(0, 5);
      }
    } catch (e) {
      console.error('Search error:', e);
    }

    this.renderResults(results);
  }

  renderResults(results) {
    const hasResults = results.members.length > 0 || results.events.length > 0 || results.forum.length > 0;
    
    if (!hasResults) {
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

    if (results.members.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-title">Mitglieder</div>
          ${results.members.map(m => `
            <a href="app/member.html?email=${encodeURIComponent(m.email)}" class="search-result-item">
              <div class="search-result-avatar">${m.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}</div>
              <div class="search-result-content">
                <div class="search-result-title">${m.name}</div>
                <div class="search-result-subtitle">${m.headline || 'Mitglied'}</div>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    }

    if (results.events.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-title">Termine</div>
          ${results.events.map(e => `
            <a href="app/termine.html" class="search-result-item">
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

    if (results.forum.length > 0) {
      html += `
        <div class="search-section">
          <div class="search-section-title">Forum</div>
          ${results.forum.map(t => `
            <a href="app/forum-thread.html?id=${t.id}" class="search-result-item">
              <div class="search-result-icon">💬</div>
              <div class="search-result-content">
                <div class="search-result-title">${t.title}</div>
                <div class="search-result-subtitle">${t.replyCount || 0} Antworten</div>
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

