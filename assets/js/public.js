import { api } from "./services/apiClient.js";
import { toast } from "./components/toast.js";
import { hoverCard } from "./components/hoverCard.js";
import { scrollNavigation } from "./components/scrollNavigation.js";
import { globalSearch } from "./components/search.js";
import { lazyLoader } from "./components/lazyLoad.js";
import { getIcon } from "./components/icons.js";
import { memberModal } from "./components/memberModal.js";
import { heroAnimation } from "./components/heroAnimation.js";

const $ = (s)=>document.querySelector(s);

// Make api available globally for search component
window.api = api;

// Lazy-load Parallax (nur wenn Hero-Section vorhanden)
let parallaxHero = null;
if (document.querySelector('.hero-network-visual')) {
  import('./components/parallax.js').then(module => {
    parallaxHero = module.parallaxHero;
  });
}

/**
 * Opens the authentication modal
 * @returns {void}
 */
const openAuth = () => {
  const overlay = $("#authOverlay");
  const authErr = $("#authErr");
  const regErr = $("#regErr");
  
  if (overlay) overlay.style.display = "flex";
  if (authErr) authErr.textContent = "";
  if (regErr) regErr.textContent = "";
};

/**
 * Closes the authentication modal
 * @returns {void}
 */
const closeAuth = () => {
  const overlay = $("#authOverlay");
  if (overlay) overlay.style.display = "none";
};

/**
 * Opens event details modal
 * @param {string} eventId - Event ID
 */
const openEventDetails = (eventId) => {
  const ev = api.getEvent(eventId);
  if (!ev) {
    console.warn('Event not found:', eventId);
    return;
  }

  const overlay = $("#eventDetailsOverlay");
  const titleEl = $("#eventDetailsTitle");
  const contentEl = $("#eventDetailsContent");
  
  if (!overlay || !titleEl || !contentEl) return;

  // Format date
  const dateParts = ev.date ? ev.date.split('-') : [];
  const formattedDate = dateParts.length === 3 
    ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` 
    : ev.date || '';

  // Calculate end time if duration is available
  let timeInfo = ev.time || '';
  if (ev.durationMinutes) {
    const [hours, minutes] = (ev.time || '18:00').split(':').map(Number);
    const start = new Date();
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + ev.durationMinutes * 60000);
    const endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`;
    timeInfo = `${ev.time} - ${endTime} (${ev.durationMinutes} Min.)`;
  }

  titleEl.textContent = sanitizeHTML(ev.title || 'Event Details');
  
  contentEl.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        ${ev.format ? `<span class="badge blue">${sanitizeHTML(ev.format)}</span>` : ''}
        ${formattedDate ? `<span class="badge">📅 ${formattedDate}</span>` : ''}
        ${timeInfo ? `<span class="badge">⏰ ${timeInfo}</span>` : ''}
        ${ev.location ? `<span class="badge">📍 ${sanitizeHTML(ev.location)}</span>` : ''}
      </div>
      ${ev.capacity ? `<div style="margin-bottom: 0.5rem; font-size: 14px; color: var(--text-secondary);">Kapazität: ${ev.capacity} Teilnehmer</div>` : ''}
    </div>
    <div class="hr"></div>
    <div style="margin-bottom: 1rem;">
      <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Beschreibung</h3>
      <div class="p" style="white-space: pre-wrap; word-wrap: break-word; line-height: 1.6;">
        ${sanitizeHTML(ev.descriptionPublic || ev.description || 'Keine Beschreibung verfügbar.')}
      </div>
    </div>
    ${ev.tags && ev.tags.length > 0 ? `
      <div class="hr"></div>
      <div style="margin-bottom: 1rem;">
        <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-primary);">Tags</h3>
        <div class="chips">
          ${ev.tags.map(tag => `<span class="chip">${sanitizeHTML(tag)}</span>`).join('')}
        </div>
      </div>
    ` : ''}
    <div class="hr"></div>
    <div style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button class="btn primary" data-open-auth aria-label="Einloggen zum Buchen">Einloggen zum Buchen</button>
      <button class="btn secondary" onclick="navigator.clipboard.writeText(window.location.href + '#termine')">Link kopieren</button>
    </div>
    <div style="margin-top: 1rem; padding: 0.75rem; background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border);">
      <p style="font-size: 13px; color: var(--text-secondary); margin: 0;">
        💡 <strong>Hinweis:</strong> Für weitere Details, Buchung und Teilnahme am Event-Thread müssen Sie sich einloggen.
      </p>
    </div>
  `;

  // Add event listener for login button in modal
  contentEl.querySelectorAll("[data-open-auth]").forEach(btn => {
    btn.addEventListener("click", () => {
      closeEventDetails();
      setTimeout(() => openAuth(), 100);
    });
  });

  overlay.style.display = "flex";
  document.body.style.overflow = "hidden";
};

/**
 * Closes event details modal
 */
const closeEventDetails = () => {
  const overlay = $("#eventDetailsOverlay");
  if (!overlay) return;
  overlay.style.display = "none";
  document.body.style.overflow = "";
};

/**
 * Sets the active tab in the authentication modal
 * @param {string} t - Tab name ('login', 'register', 'forgot')
 * @returns {void}
 */
const setTab = (t) => {
  if (!t) return;

  const tabs = document.querySelectorAll(".tab");
  tabs.forEach(x => {
    const isActive = x.dataset.tab === t;
    x.classList.toggle("active", isActive);
    if (x.hasAttribute("role") && x.getAttribute("role") === "tab") {
      x.setAttribute("aria-selected", isActive ? "true" : "false");
    }
  });

  const loginPanel = $("#panel-login");
  const registerPanel = $("#panel-register");
  const forgotPanel = $("#panel-forgot");
  const authTitle = $("#authTitle");

  // Update login panel
  if (loginPanel) {
    if (t === "login") {
      loginPanel.classList.remove("tab-panel-hidden");
      loginPanel.setAttribute("aria-hidden", "false");
    } else {
      loginPanel.classList.add("tab-panel-hidden");
      loginPanel.setAttribute("aria-hidden", "true");
    }
  }

  // Update register panel
  if (registerPanel) {
    if (t === "register") {
      registerPanel.classList.remove("tab-panel-hidden");
      registerPanel.setAttribute("aria-hidden", "false");
    } else {
      registerPanel.classList.add("tab-panel-hidden");
      registerPanel.setAttribute("aria-hidden", "true");
    }
  }

  // Update forgot panel
  if (forgotPanel) {
    if (t === "forgot") {
      forgotPanel.classList.remove("tab-panel-hidden");
      forgotPanel.setAttribute("aria-hidden", "false");
    } else {
      forgotPanel.classList.add("tab-panel-hidden");
      forgotPanel.setAttribute("aria-hidden", "true");
    }
  }

  // Update title
  if (authTitle) {
    const titles = {
      login: "Login",
      register: "Registrieren",
      forgot: "Passwort vergessen"
    };
    authTitle.textContent = titles[t] || "Login";
  }
};

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
 * Renders public events in the events section
 * @returns {void}
 */
const renderPublicEvents = () => {
  const wrap = $("#publicEvents");
  if (!wrap) {
    console.warn('Public events container not found');
    return;
  }

  try {
    const evs = api.listEvents()
      .slice()
      .sort((a, b) => {
        const dateA = a.date + a.time;
        const dateB = b.date + b.time;
        return dateA.localeCompare(dateB);
      })
      .slice(0, 4);

    // Bilder für Events je nach Kategorie/Format - verschiedene Bilder für Abwechslung
    const getEventImage = (ev, index = 0) => {
      const format = (ev.format || "").toLowerCase();
      const title = (ev.title || "").toLowerCase();
      
      // Innovationsabend Bilder
      if (format.includes("innovationsabend") || format.includes("innovation")) {
        const innovationImages = [
          'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'
        ];
        return innovationImages[index % innovationImages.length];
      } 
      // Panel Bilder
      else if (format.includes("panel") || format.includes("diskussion")) {
        const panelImages = [
          'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop'
        ];
        return panelImages[index % panelImages.length];
      } 
      // Workshop Bilder
      else if (format.includes("workshop")) {
        return 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop';
      } 
      // Fallback
      else {
        return 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop';
      }
    };

    if (evs.length === 0) {
      wrap.innerHTML = '<div class="p-xl text-center text-muted">Keine Termine verfügbar.</div>';
      return;
    }

    wrap.innerHTML = evs.map((ev, index) => {
      const imageUrl = getEventImage(ev, index);
      const title = sanitizeHTML(ev.title || '');
      const format = sanitizeHTML(ev.format || '');
      const date = sanitizeHTML(ev.date || '');
      const time = sanitizeHTML(ev.time || '');
      const isBlurred = index >= 2; // Ab Index 2 (3. und 4. Card) blurred
      
      return `
      <div class="event-card-compact-small ${isBlurred ? 'event-card-blurred' : ''}">
        <div class="event-card-image-small">
          <img src="${imageUrl}" alt="${title}" loading="lazy" class="event-image" onerror="this.style.display='none'; this.parentElement.style.background='linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)';" />
          <span class="event-badge">${format}</span>
        </div>
        <div class="event-card-content-small">
          <h3 class="event-card-title-small">${title}</h3>
          <div class="event-card-meta-small">
            <span class="event-meta-item">${getIcon('calendar', 14)} ${date}</span>
            <span class="event-meta-item">${getIcon('clock', 14)} ${time}</span>
          </div>
          <div class="event-card-footer-small" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button class="btn secondary small" data-open-event-details="${ev.id}" aria-label="Details anzeigen">Details</button>
            <button class="btn primary small" data-open-auth aria-label="Einloggen zum Buchen">Einloggen</button>
          </div>
        </div>
        ${isBlurred ? '<div class="event-card-blur-overlay"><span>Nur für Mitglieder sichtbar</span></div>' : ''}
      </div>
    `;
    }).join("");

    wrap.querySelectorAll("[data-open-auth]").forEach(b => {
      b.addEventListener("click", openAuth);
    });

    wrap.querySelectorAll("[data-open-event-details]").forEach(b => {
      b.addEventListener("click", (e) => {
        const eventId = e.currentTarget.getAttribute("data-open-event-details");
        if (eventId) {
          openEventDetails(eventId);
        }
      });
    });
  } catch (error) {
    console.error("Error rendering public events:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Termine.</div>';
  }
};

/**
 * Renders public updates in timeline format
 * @returns {void}
 */
const renderPublicUpdates = () => {
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
    }).slice(0, 6); // Show up to 6 updates
    
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
          <button class="btn secondary small" data-open-auth aria-label="Als Mitglied lesen">Als Mitglied lesen</button>
        </div>
      </div>
    `;
    }).join("");

    wrap.querySelectorAll("[data-open-auth]").forEach(b => {
      b.addEventListener("click", openAuth);
    });
  } catch (error) {
    console.error("Error rendering public updates:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Updates.</div>';
  }
};

/**
 * Renders public publications
 * @returns {void}
 */
const renderPublicPubs = () => {
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
    }).slice(0, 3); // Show only 3 publications
    
    // Sort by date (newest first)
    items.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return dateB - dateA;
    });
    
    // Bilder für Publikationen (architektur/bau-bezogen)
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

    wrap.querySelectorAll("[data-open-auth]").forEach(b => {
      b.addEventListener("click", openAuth);
    });
  } catch (error) {
    console.error("Error rendering public publications:", error);
    wrap.innerHTML = '<div class="p-xl text-center text-muted">Fehler beim Laden der Publikationen.</div>';
  }
};

/**
 * Debounce utility function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Gets the number of cards per view based on screen width
 * @returns {number} - Number of cards visible
 */
const getCardsPerView = () => {
  if (window.innerWidth <= 480) return 1;
  if (window.innerWidth <= 768) return 2;
  if (window.innerWidth <= 1024) return 3;
  return 5;
};

/**
 * Renders social proof statistics
 * @returns {void}
 */
const renderSocialProof = () => {
  const statsContainer = $("#socialProofStats");
  if (!statsContainer) {
    console.warn('Social proof stats container not found');
    return;
  }
  
  try {
    // Versuche verschiedene Methoden, um Mitglieder zu bekommen
    let members = [];
    if(api.listMembersPublic){
      members = api.listMembersPublic("");
    } else if(api.listMembers){
      members = api.listMembers("");
    } else {
      // Fallback: Hole alle Profile manuell
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        for(const user of users){
          const profileKey = `profile:${user.email.toLowerCase()}`;
          const profile = JSON.parse(localStorage.getItem(profileKey) || "null");
          if(profile && (profile.privacy?.visibleInDirectory !== false)){
            members.push(profile);
          }
        }
      } catch(e){
        console.error("Error loading members for social proof:", e);
      }
    }
    
    const totalMembers = members.length;
    
    // Berechne "Neue Mitglieder diese Woche" (vereinfacht: letzte 7 Tage)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newMembers = members.filter(m => {
      if(!m.updatedAt) return false;
      const updated = new Date(m.updatedAt);
      return updated >= oneWeekAgo;
    }).length;
    
    // Berechne aktive Mitglieder (vereinfacht: haben Profil vervollständigt)
    const activeMembers = members.filter(m => 
      m.bio && m.bio.length > 20 && (m.skills?.length > 0 || m.interests?.length > 0)
    ).length;
    
    statsContainer.innerHTML = `
      <div class="stat-card">
        <div class="stat-number" id="statTotalMembers">${totalMembers}</div>
        <div class="stat-label">Mitglieder</div>
      </div>
      ${activeMembers > 0 ? `
        <div class="stat-card">
          <div class="stat-number">${activeMembers}</div>
          <div class="stat-label">Aktive Mitglieder</div>
        </div>
      ` : ''}
      ${newMembers > 0 ? `
        <div class="stat-card">
          <div class="stat-number">${newMembers}</div>
          <div class="stat-label">Neu diese Woche</div>
        </div>
      ` : ''}
    `;
    
    // Animation für Zahlen
    const animateNumber = (element, target) => {
      const duration = 1000;
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;
      const timer = setInterval(() => {
        current += increment;
        if(current >= target){
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    };
    
    setTimeout(() => {
      const totalEl = statsContainer.querySelector('#statTotalMembers');
      if(totalEl) animateNumber(totalEl, totalMembers);
    }, 300);
  } catch(e){
    console.error("Error rendering social proof:", e);
  }
}

// Filter & Sort State
let currentFilter = "all";
let currentSort = "newest";
let allMembers = [];

function setupNetworkFilters(){
  const filterChips = $("#filterChips");
  const sortSelect = $("#sortSelect");
  
  if(!filterChips || !sortSelect) return;
  
  // Lade alle verfügbaren Skills für Filter
  const skills = new Set();
  allMembers.forEach(m => {
    if(m.skills && Array.isArray(m.skills)){
      m.skills.forEach(s => skills.add(s));
    }
  });
  
  // Erstelle Filter-Chips für Skills
  Array.from(skills).sort().slice(0, 10).forEach(skill => {
    const chip = document.createElement("button");
    chip.className = "filter-chip";
    chip.textContent = skill;
    chip.setAttribute("data-filter", skill);
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      currentFilter = skill;
      updateNetworkSlider();
    });
    filterChips.appendChild(chip);
  });
  
  // Sortierung
  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    updateNetworkSlider();
  });
  
  // "Alle" Filter
  filterChips.querySelector('[data-filter="all"]')?.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach(c => c.classList.remove("active"));
    filterChips.querySelector('[data-filter="all"]').classList.add("active");
    currentFilter = "all";
    updateNetworkSlider();
  });
}

function filterAndSortMembers(members){
  let filtered = [...members];
  
  // Filter
  if(currentFilter !== "all"){
    filtered = filtered.filter(m => 
      m.skills && m.skills.includes(currentFilter)
    );
  }
  
  // Sortierung
  switch(currentSort){
    case "alphabetical":
      filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
    case "activity":
      filtered.sort((a, b) => {
        const aActive = (a.bio?.length > 20 ? 1 : 0) + (a.skills?.length || 0) + (a.interests?.length || 0);
        const bActive = (b.bio?.length > 20 ? 1 : 0) + (b.skills?.length || 0) + (b.interests?.length || 0);
        return bActive - aActive;
      });
      break;
    case "newest":
    default:
      filtered.sort((a, b) => {
        const aDate = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const bDate = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return bDate - aDate;
      });
      break;
  }
  
  return filtered;
}

function renderNetworkSlider(){
  const slider = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pagination = $("#pagination");
  const notice = $("#networkGuestNotice");
  
  if(!slider) return;
  
  // Show skeleton while loading
  slider.innerHTML = Array(5).fill(0).map(() => `
    <div class="person-card skeleton-card">
      <div class="person-image-container">
        <div class="skeleton skeleton-avatar"></div>
      </div>
      <div class="person-card-content">
        <div class="skeleton skeleton-text" style="width: 60%;"></div>
        <div class="skeleton skeleton-text" style="width: 40%; margin-top: 8px;"></div>
        <div class="skeleton skeleton-text" style="width: 80%; margin-top: 12px;"></div>
        <div class="skeleton skeleton-text" style="width: 70%; margin-top: 8px;"></div>
      </div>
    </div>
  `).join("");
  
  const isLoggedIn = api.isLoggedIn();
  // Verwende listMembersPublic für öffentliche Ansicht, listMembers für eingeloggte
  let members = [];
  if(isLoggedIn){
    members = api.listMembers("");
  } else {
    // Versuche listMembersPublic, falls nicht verfügbar, hole alle Profile manuell
    if(api.listMembersPublic){
      members = api.listMembersPublic("");
    } else {
      // Fallback: Hole alle User und filtere nach sichtbaren Profilen
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        for(const user of users){
          const profileKey = `profile:${user.email.toLowerCase()}`;
          const profile = JSON.parse(localStorage.getItem(profileKey) || "null");
          if(profile && profile.privacy?.visibleInDirectory){
            members.push(profile);
          }
        }
      } catch(e){
        console.error("Error loading public members:", e);
      }
    }
  }
  
  // Speichere alle Mitglieder für Filter
  allMembers = members;
  
  // Setup Filter & Sortierung
  setupNetworkFilters();
  
  // Notice ausblenden, da Daten jetzt öffentlich sichtbar sind
  if(notice){
    notice.style.display = "none";
  }
  
  updateNetworkSlider();
}

function updateNetworkSlider(){
  const slider = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pagination = $("#pagination");
  
  if(!slider) return;
  
  // Filtere und sortiere Mitglieder
  const members = filterAndSortMembers(allMembers);
  
  if(members.length === 0){
    slider.innerHTML = `<div class="p-xl text-center text-muted">Noch keine Mitglieder im Netzwerk.</div>`;
    if(prevBtn) prevBtn.classList.add("hidden");
    if(nextBtn) nextBtn.classList.add("hidden");
    if(pagination) pagination.innerHTML = "";
    return;
  }
  
  // Buttons wieder anzeigen wenn Mitglieder vorhanden
  if(prevBtn) prevBtn.classList.remove("hidden");
  if(nextBtn) nextBtn.classList.remove("hidden");
  
  slider.innerHTML = members.map(p => {
    const skills = [...(p.skills||[]), ...(p.interests||[])].slice(0,4);
    const bio = (p.bio||"").slice(0,80) + ((p.bio||"").length > 80 ? "..." : "");
    const linkedin = p.links?.linkedin || "";
    const website = p.links?.website || "";
    const location = p.location || "";
    // Erweiterte Liste von professionellen Portraits (Unsplash) - diverse Gesichter
    const defaultPortraits = [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces'
    ];
    
    // Verwende Hash des Namens/E-Mails für konsistente Bildzuordnung
    const nameHash = (p.name || p.email).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const portraitIndex = nameHash % defaultPortraits.length;
    const avatarUrl = defaultPortraits[portraitIndex];
    
    const initials = (p.name || p.email).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
    
    return `
      <div class="person-card" data-email="${p.email}" role="listitem" tabindex="0" aria-label="Profil von ${p.name}, ${p.headline || 'Mitglied'}">
        <div class="person-image-container">
          <img src="${avatarUrl}" alt="Profilbild von ${p.name}, ${p.headline || 'Mitglied'}" class="person-image" loading="lazy" style="display: block; opacity: 1 !important;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(p.name || p.email)}&size=400&background=random&color=fff&bold=true&format=png'; this.style.opacity='1';" />
          <div class="person-image-placeholder" style="display: none;" aria-hidden="true">${initials}</div>
        </div>
        <div class="person-card-content">
          <div class="person-name">${p.name}</div>
          <div class="person-role">${p.headline || "Mitglied"}</div>
          ${location ? `<div class="person-location">${getIcon('mapPin', 12)} ${location}</div>` : ""}
          ${skills.length ? `<div class="chips mt-sm">${skills.slice(0,3).map(s=>`<span class="chip">${s}</span>`).join("")}</div>` : ""}
        </div>
      </div>
    `;
  }).join("");
  
  // Click handler und Hover-Card für Person Cards
  slider.querySelectorAll(".person-card").forEach(card => {
    const email = card.dataset.email;
    const person = members.find(p => p.email === email);
    
    // Stelle sicher, dass Bilder sichtbar sind
    const img = card.querySelector(".person-image");
    if(img) {
      img.style.opacity = "1";
      img.classList.add("loaded");
      img.addEventListener("load", () => {
        img.style.opacity = "1";
        img.classList.add("loaded");
      });
      img.addEventListener("error", () => {
        // Fallback zu ui-avatars wenn Unsplash nicht lädt
        const name = person?.name || email;
        img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true&format=png`;
        img.style.opacity = "1";
      });
    }
    
    // Hover-Card on hover
    let hoverTimeout;
    card.addEventListener("mouseenter", () => {
      if(!person) return;
      hoverTimeout = setTimeout(() => {
        hoverCard.show(person, card);
      }, 500); // Show after 500ms hover
    });
    
    card.addEventListener("mouseleave", () => {
      if(hoverTimeout) clearTimeout(hoverTimeout);
      hoverCard.hide();
    });
    
    // Click handler - öffne Modal für alle (auch Gäste)
    card.addEventListener("click", () => {
      if(person) {
        memberModal.show(person);
      }
    });
  });
  
  // Karussell-Logik: Immer 5 sichtbar (responsive), verschiebt sich um 2
  function getCardsVisible(){
    if(window.innerWidth <= 480) return 1;
    if(window.innerWidth <= 768) return 2;
    if(window.innerWidth <= 1024) return 3;
    return 5;
  }
  
  const CARDS_SHIFT = 2;
  let currentIndex = 0;
  
  function updateSlider(){
    if(members.length === 0) return;
    
    const cardsVisible = getCardsVisible();
    
    // Berechne welche Cards sichtbar sein sollen
    const visibleCards = [];
    for(let i = 0; i < cardsVisible; i++){
      const index = (currentIndex + i) % members.length;
      visibleCards.push(members[index]);
    }
    
    // Render nur die sichtbaren Cards
    slider.innerHTML = visibleCards.map((p) => {
      const name = sanitizeHTML(p.name || '');
      const headline = sanitizeHTML(p.headline || 'Mitglied');
      const skills = [...(p.skills || []), ...(p.interests || [])].slice(0, 3).map(s => sanitizeHTML(s));
      const location = sanitizeHTML(p.location || "");
      const email = sanitizeHTML(p.email || "");
      
      // Erweiterte Liste von professionellen Portraits (Unsplash) - diverse Gesichter
      const defaultPortraits = [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=faces'
      ];
      
      // Verwende Hash des Namens/E-Mails für konsistente Bildzuordnung
      const nameHash = (name || email).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const portraitIndex = nameHash % defaultPortraits.length;
      const avatarUrl = defaultPortraits[portraitIndex];
      
      const initials = (name || email).split(" ").map(n=>n[0]).join("").toUpperCase().slice(0,2);
      
      return `
        <div class="person-card" data-email="${email}" role="listitem" tabindex="0" aria-label="Profil von ${name}, ${headline}">
          <div class="person-image-container">
            <img src="${avatarUrl}" alt="Profilbild von ${name}, ${headline}" class="person-image" loading="lazy" style="display: block; opacity: 1 !important;" onerror="this.onerror=null; this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&size=400&background=random&color=fff&bold=true&format=png'; this.style.opacity='1';" />
            <div class="person-image-placeholder" style="display: none;" aria-hidden="true">${initials}</div>
          </div>
          <div class="person-card-content">
            <div class="person-name">${name}</div>
            <div class="person-role">${headline}</div>
            ${location ? `<div class="person-location">${getIcon('mapPin', 12)} ${location}</div>` : ""}
            ${skills.length ? `<div class="chips mt-sm">${skills.map(s => `<span class="chip">${s}</span>`).join("")}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");
    
    // Click handler für neue Cards
    slider.querySelectorAll(".person-card").forEach(card => {
      const email = card.dataset.email;
      const person = members.find(p => p.email === email);
      
      card.addEventListener("click", () => {
        if(person) {
          memberModal.show(person);
        }
      });
      
      // Stelle sicher, dass Bilder sichtbar sind, sobald sie geladen sind
      const img = card.querySelector(".person-image");
      if(img) {
        img.addEventListener("load", () => {
          img.style.opacity = "1";
          img.classList.add("loaded");
        });
        img.addEventListener("error", () => {
          // Fallback zu ui-avatars wenn Unsplash nicht lädt
          const name = person?.name || email;
          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true&format=png`;
        });
      }
    });
    
    // Buttons immer aktiv (unendliches Karussell)
    if(prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.opacity = '1';
    }
    if(nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
    }
    
    // Smooth transition
    slider.style.transition = 'transform 0.5s ease-in-out';
  }
  
  if(prevBtn) prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - CARDS_SHIFT + members.length) % members.length;
    updateSlider();
  });
  
  if(nextBtn) nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + CARDS_SHIFT) % members.length;
    updateSlider();
  });
  
  // Keyboard navigation
  slider.addEventListener('keydown', (e) => {
    if(e.key === 'ArrowLeft') {
      currentIndex = (currentIndex - CARDS_SHIFT + members.length) % members.length;
      updateSlider();
    } else if(e.key === 'ArrowRight') {
      currentIndex = (currentIndex + CARDS_SHIFT) % members.length;
      updateSlider();
    }
  });
  
  // Debounced resize handler
  const handleResize = debounce(() => {
    updateSlider();
  }, 250);
  
  window.addEventListener("resize", handleResize);
  
  updateSlider();
}

/**
 * Initializes theme based on saved preference or system preference
 * @returns {void}
 */
const initTheme = () => {
  try {
    const savedTheme = localStorage.getItem('theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } catch (error) {
    console.error('Error initializing theme:', error);
    // Fallback to light theme
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

/**
 * Updates the theme icon based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 * @returns {void}
 */
const updateThemeIcon = (theme) => {
  const btn = $("#themeToggle");
  if (!btn) return;

  try {
    let icon = btn.querySelector('.icon-theme');
    // Falls Icon noch nicht existiert, erstelle es
    if (!icon) {
      icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.setAttribute('class', 'icon icon-theme');
      icon.setAttribute('width', '20');
      icon.setAttribute('height', '20');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('fill', 'none');
      icon.setAttribute('stroke', 'currentColor');
      icon.setAttribute('stroke-width', '1.5');
      icon.setAttribute('stroke-linecap', 'round');
      icon.setAttribute('stroke-linejoin', 'round');
      icon.setAttribute('aria-hidden', 'true');
      btn.appendChild(icon);
    }
    
    if (theme === 'dark') {
      // Sun icon (weil wir zu light wechseln wollen)
      icon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
    } else {
      // Moon icon (weil wir zu dark wechseln wollen)
      icon.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>';
    }
    btn.setAttribute("aria-pressed", theme === 'dark' ? "true" : "false");
    btn.setAttribute("aria-label", theme === 'dark' ? "Zu hellem Theme wechseln" : "Zu dunklem Theme wechseln");
  } catch (error) {
    console.error('Error updating theme icon:', error);
  }
};

/**
 * Toggles between light and dark theme
 * @returns {void}
 */
const toggleTheme = () => {
  try {
    const current = document.documentElement.getAttribute('data-theme') || 
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  } catch (error) {
    console.error('Error toggling theme:', error);
  }
};

/**
 * Toggles the mobile menu
 * @returns {void}
 */
const toggleMobileMenu = () => {
  const toggle = $("#mobileMenuToggle");
  const nav = $("#navLinks");
  if (!toggle || !nav) return;
  
  try {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", !isExpanded ? "true" : "false");
    nav.setAttribute("aria-hidden", isExpanded ? "true" : "false");
    
    // Body scroll lock
    if (!isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  } catch (error) {
    console.error('Error toggling mobile menu:', error);
  }
};

/**
 * Closes the mobile menu
 * @returns {void}
 */
const closeMobileMenu = () => {
  const toggle = $("#mobileMenuToggle");
  const nav = $("#navLinks");
  
  try {
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (nav) nav.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  } catch (error) {
    console.error('Error closing mobile menu:', error);
  }
};

function renderTestimonials(){
  const wrap = $("#testimonialsGrid");
  if(!wrap) return;
  
  const testimonials = [
    {
      name: "Dr. Sarah Müller",
      role: "Architektin & BIM-Expertin",
      company: "Müller Architekten",
      quote: "…undbauen hat mir geholfen, wertvolle Kontakte in der Branche zu knüpfen. Die Veranstaltungen sind immer inspirierend und der Austausch auf Augenhöhe ist genau das, was ich gesucht habe.",
      avatar: null
    },
    {
      name: "Thomas Weber",
      role: "Projektleiter Digitalisierung",
      company: "BauTech GmbH",
      quote: "Die Plattform verbindet Theorie und Praxis auf eine Weise, die ich sonst nirgendwo finde. Besonders die Diskussionen im Forum sind sehr bereichernd.",
      avatar: null
    },
    {
      name: "Lisa Schneider",
      role: "Nachhaltigkeitsberaterin",
      company: "GreenBuild Consulting",
      quote: "Als Quereinsteigerin in die Baubranche habe ich durch …undbauen schnell Anschluss gefunden. Das Netzwerk ist offen, hilfsbereit und fachlich auf hohem Niveau.",
      avatar: null
    },
    {
      name: "Michael Hoffmann",
      role: "Geschäftsführer",
      company: "Hoffmann Ingenieure",
      quote: "Die Innovationsabende sind ein fester Bestandteil meines Kalenders geworden. Hier treffe ich regelmäßig auf neue Perspektiven und Impulse für meine Arbeit.",
      avatar: null
    }
  ];
  
  wrap.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-quote">
        <svg class="quote-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.391 9.065-9.391v3.609c-1.76 0-3.219.992-3.219 3.521v2.261h4.435v7.391h-10.281zm-14.017 0v-7.391c0-5.704 3.748-9.391 9.082-9.391v3.609c-1.76 0-3.219.992-3.219 3.521v2.261h4.436v7.391h-10.28z" fill="currentColor" opacity="0.3"/>
        </svg>
        <p class="testimonial-text">${t.quote}</p>
      </div>
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          ${t.avatar ? `<img src="${t.avatar}" alt="${t.name}" loading="lazy" />` : `<div class="avatar-placeholder">${t.name.split(' ').map(n => n[0]).join('')}</div>`}
        </div>
        <div class="testimonial-info">
          <div class="testimonial-name">${t.name}</div>
          <div class="testimonial-meta">${t.role}<br>${t.company}</div>
        </div>
      </div>
    </div>
  `).join("");
}

function renderPartners(){
  const wrap = $("#partnersGrid");
  if(!wrap) return;
  
  const partners = [
    { name: "Partner 1", logo: null, url: "#" },
    { name: "Partner 2", logo: null, url: "#" },
    { name: "Partner 3", logo: null, url: "#" },
    { name: "Partner 4", logo: null, url: "#" },
    { name: "Partner 5", logo: null, url: "#" },
    { name: "Partner 6", logo: null, url: "#" }
  ];
  
  wrap.innerHTML = partners.map(p => `
    <div class="partner-logo">
      ${p.logo ? 
        `<a href="${p.url}" target="_blank" rel="noopener noreferrer" aria-label="${p.name} Website">
          <img src="${p.logo}" alt="${p.name}" loading="lazy" />
        </a>` :
        `<div class="partner-placeholder" aria-label="${p.name}">
          <span>${p.name}</span>
        </div>`
      }
    </div>
  `).join("");
}

function renderFAQ(){
  const wrap = $("#faqContainer");
  if(!wrap) return;
  
  const faqs = [
    {
      question: "Wie kann ich Mitglied werden?",
      answer: "Sie können sich über den 'Mitglied werden'-Button registrieren. Nach der Registrierung erhalten Sie Zugang zum geschützten Memberbereich mit allen Funktionen des Netzwerks."
    },
    {
      question: "Was kostet die Mitgliedschaft?",
      answer: "Die Mitgliedschaft ist aktuell kostenlos. …undbauen ist ein unabhängiges Netzwerk-Format, das sich über Partner und Unterstützer finanziert."
    },
    {
      question: "Wie funktionieren die Innovationsabende?",
      answer: "Die monatlichen Innovationsabende finden regelmäßig statt. Mitglieder können Termine einsehen, vormerken und buchen. Die Veranstaltungen kombinieren Impulsvorträge mit moderierten Diskussionen."
    },
    {
      question: "Kann ich auch ohne Mitgliedschaft teilnehmen?",
      answer: "Die öffentlichen Informationen auf der Website sind für alle zugänglich. Für die Teilnahme an Veranstaltungen, den Zugang zum Forum und die Nutzung aller Netzwerk-Funktionen ist eine Mitgliedschaft erforderlich."
    },
    {
      question: "Wie funktioniert das Forum?",
      answer: "Das Forum ist der inhaltliche Kern des Netzwerks. Mitglieder können Themen diskutieren, Fragen stellen und Erfahrungen teilen. Das Forum ist moderiert und auf einen konstruktiven, sachlichen Austausch ausgelegt."
    },
    {
      question: "Wer kann Mitglied werden?",
      answer: "Das Netzwerk richtet sich an Fachleute aus Architektur, Ingenieurwesen, Bauwesen und digitaler Planung. Wir freuen uns über Praktiker:innen, Entscheider:innen, Forschende und Gestalter:innen, die sich aktiv mit der Weiterentwicklung der gebauten Umwelt beschäftigen."
    },
    {
      question: "Wie kann ich Kontakt zu anderen Mitgliedern aufnehmen?",
      answer: "Im geschützten Memberbereich können Sie Profile anderer Mitglieder einsehen und über das Nachrichtensystem direkt Kontakt aufnehmen. Zusätzlich bietet das Forum Möglichkeiten für den fachlichen Austausch."
    },
    {
      question: "Werden die Veranstaltungen auch online angeboten?",
      answer: "Die Innovationsabende finden primär als Präsenzveranstaltungen statt. Bei Bedarf können einzelne Formate auch hybrid oder online durchgeführt werden. Details finden Sie in den jeweiligen Veranstaltungsbeschreibungen."
    }
  ];
  
  wrap.innerHTML = faqs.map((faq, index) => `
    <div class="faq-item">
      <button 
        class="faq-question" 
        id="faq-question-${index}"
        aria-expanded="false"
        aria-controls="faq-answer-${index}"
        type="button">
        <span>${faq.question}</span>
        <span class="faq-icon" aria-hidden="true">+</span>
      </button>
      <div 
        class="faq-answer" 
        id="faq-answer-${index}"
        role="region"
        aria-labelledby="faq-question-${index}">
        <div class="faq-answer-content">
          <p class="p">${faq.answer}</p>
        </div>
      </div>
    </div>
  `).join("");
  
  // FAQ Accordion Functionality
  wrap.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
      const isExpanded = button.getAttribute('aria-expanded') === 'true';
      const answer = document.getElementById(button.getAttribute('aria-controls'));
      const icon = button.querySelector('.faq-icon');
      
      // Close all other items
      wrap.querySelectorAll('.faq-question').forEach(otherBtn => {
        if(otherBtn !== button) {
          otherBtn.setAttribute('aria-expanded', 'false');
          const otherAnswer = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if(otherAnswer) {
            otherAnswer.classList.remove('faq-answer-open');
            otherAnswer.style.maxHeight = null;
          }
          const otherIcon = otherBtn.querySelector('.faq-icon');
          if(otherIcon) otherIcon.textContent = '+';
        }
      });
      
      // Toggle current item
      button.setAttribute('aria-expanded', !isExpanded);
      if(answer) {
        if(!isExpanded) {
          answer.classList.add('faq-answer-open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
          if(icon) icon.textContent = '−';
        } else {
          answer.classList.remove('faq-answer-open');
          answer.style.maxHeight = null;
          if(icon) icon.textContent = '+';
        }
      }
    });
    
    // Keyboard navigation
    button.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });
}

// Code-Splitting: Lade Komponenten dynamisch
async function loadComponents() {
  try {
    // Lazy-load components only when needed
    if (document.querySelector('#searchTrigger')) {
      // Search is already imported, but we can lazy-load other features
    }
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  try {
    initTheme();
  } catch (error) {
    console.error('Error initializing theme:', error);
  }
  
  // Initialize hero animation
  try {
    if (heroAnimation && heroAnimation.init) {
      heroAnimation.init();
    }
  } catch (error) {
    console.error('Error initializing hero animation:', error);
  }
  
  // Initialize member modal
  try {
    if (memberModal && memberModal.init) {
      memberModal.init();
    }
  } catch (error) {
    console.error('Error initializing member modal:', error);
  }
  
  // Load components dynamically
  try {
    await loadComponents();
  } catch (error) {
    console.error('Error loading components:', error);
  }
  
  // Render functions with error handling
  try {
    renderPublicEvents();
  } catch (error) {
    console.error('Error rendering events:', error);
  }
  
  try {
    renderPublicUpdates();
  } catch (error) {
    console.error('Error rendering updates:', error);
  }
  
  try {
    renderPublicPubs();
  } catch (error) {
    console.error('Error rendering publications:', error);
  }
  
  try {
    renderSocialProof();
  } catch (error) {
    console.error('Error rendering social proof:', error);
  }
  
  try {
    renderNetworkSlider();
  } catch (error) {
    console.error('Error rendering network slider:', error);
  }
  
  try {
    renderTestimonials();
  } catch (error) {
    console.error('Error rendering testimonials:', error);
  }
  
  try {
    renderPartners();
  } catch (error) {
    console.error('Error rendering partners:', error);
  }
  
  try {
    renderFAQ();
  } catch (error) {
    console.error('Error rendering FAQ:', error);
  }
  
  // Global Search
  try {
    if($("#searchTrigger") && globalSearch && globalSearch.open){
      $("#searchTrigger").addEventListener("click", () => globalSearch.open());
    }
  } catch (error) {
    console.error('Error setting up global search:', error);
  }

  // Mobile Menu
  if($("#mobileMenuToggle")){
    $("#mobileMenuToggle").addEventListener("click", toggleMobileMenu);
  }
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll(".navLinks a").forEach(link => {
    link.addEventListener("click", () => {
      if(window.innerWidth <= 768){
        closeMobileMenu();
      }
    });
  });
  
  // Close mobile menu on escape
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape"){
      closeMobileMenu();
    }
  });

  try {
    if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
    if($("#openAuth")) $("#openAuth").addEventListener("click", openAuth);
    if($("#openAuth2")) $("#openAuth2").addEventListener("click", openAuth);
    if($("#closeAuth")) $("#closeAuth").addEventListener("click", closeAuth);
    if($("#authOverlay")) $("#authOverlay").addEventListener("click", (e)=>{ if(e.target.id==="authOverlay") closeAuth(); });
    if($("#closeEventDetails")) $("#closeEventDetails").addEventListener("click", closeEventDetails);
    if($("#eventDetailsOverlay")) $("#eventDetailsOverlay").addEventListener("click", (e)=>{ if(e.target.id==="eventDetailsOverlay") closeEventDetails(); });
    document.addEventListener("keydown",(e)=>{ 
      if(e.key==="Escape") {
        closeAuth();
        closeEventDetails();
      }
    });
  } catch (error) {
    console.error('Error setting up auth handlers:', error);
  }

  document.querySelectorAll(".tab").forEach(t=>{
    t.addEventListener("click", ()=>setTab(t.dataset.tab));
    // Keyboard-Navigation für Tabs
    t.addEventListener("keydown", (e)=>{
      if(e.key === "Enter" || e.key === " "){
        e.preventDefault();
        setTab(t.dataset.tab);
      }
    });
  });
  
  // Modal-Trap für Keyboard-Navigation
  const authModal = $("#authOverlay");
  if(authModal){
    const trapFocus = (e) => {
      if(e.key !== "Tab") return;
      const focusableElements = authModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if(focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if(e.shiftKey && document.activeElement === firstElement){
        e.preventDefault();
        lastElement.focus();
      } else if(!e.shiftKey && document.activeElement === lastElement){
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    authModal.addEventListener("keydown", trapFocus);
  }

  if($("#doLogin")) $("#doLogin").addEventListener("click", async ()=>{
    const btn = $("#doLogin");
    const originalText = btn.textContent;
    btn.classList.add("loading");
    btn.disabled = true;
    
    try {
      console.log('🔵 Login button clicked');
      const email = $("#loginEmail").value;
      const password = $("#loginPass").value;
      console.log('🔵 Email:', email);
      const res = api.login(email, password);
      console.log('🔵 Login result:', res);
      if($("#authErr")) $("#authErr").textContent = res.success ? "" : res.error;
      if(res.success) {
        console.log('✅ Login successful, redirecting to dashboard...');
        toast.success("Erfolgreich eingeloggt!");
        closeAuth(); // Modal schließen
        setTimeout(() => {
          // Absoluter Pfad für korrekten Redirect
          const basePath = window.location.pathname.includes('/app/') ? '../' : '';
          const redirectUrl = basePath + 'app/dashboard.html';
          console.log('🔵 Redirecting to:', redirectUrl);
          window.location.href = redirectUrl;
        }, 500);
      } else {
        console.error('❌ Login failed:', res.error);
        toast.error(res.error || "Login fehlgeschlagen");
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    } catch(e) {
      const { handleError } = await import('./services/errorHandler.js');
      handleError(e, { context: 'login', email: $("#loginEmail")?.value });
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });

  if($("#doRegister")) $("#doRegister").addEventListener("click", async ()=>{
    const btn = $("#doRegister");
    btn.classList.add("loading");
    btn.disabled = true;
    
    try {
      const res = await api.register($("#regName").value, $("#regEmail").value, $("#regPass").value);
      if($("#regErr")) $("#regErr").textContent = res.success ? "" : res.error;
      if(res.success) {
        toast.success("Konto erfolgreich erstellt!");
        setTimeout(() => window.location.href = "app/dashboard.html", 500);
      } else {
        // Spezifische Fehlermeldungen
        let errorMsg = "Registrierung fehlgeschlagen.";
        if(res.error){
          if(res.error.includes("bereits") || res.error.includes("existiert")){
            errorMsg = "Diese E-Mail-Adresse ist bereits registriert. Bitte loggen Sie sich ein oder nutzen Sie 'Passwort vergessen'.";
          } else {
            errorMsg = res.error;
          }
        }
        toast.error(errorMsg);
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    } catch(e) {
      const { handleError } = await import('./services/errorHandler.js');
      handleError(e, { context: 'register', email: $("#regEmail")?.value });
      btn.classList.remove("loading");
      btn.disabled = false;
    }
  });

  if($("#doForgot")) $("#doForgot").addEventListener("click", ()=>{
    if($("#fpOk")) $("#fpOk").textContent = "Wenn ein Konto existiert, senden wir einen Link (MVP: kein Versand).";
  });

});

