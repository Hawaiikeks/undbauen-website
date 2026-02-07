/**
 * Members Page Module
 * Handles rendering of network members, social proof, and member slider
 */

import { api } from "../services/apiClient.js";
import { hoverCard } from "../components/hoverCard.js";
import { memberModal } from "../components/memberModal.js";
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

// Filter & Sort State
let currentFilter = "all";
let currentSort = "newest";
let allMembers = [];

/**
 * Sets up network filters
 */
function setupNetworkFilters() {
  const filterChips = $("#filterChips");
  const sortSelect = $("#sortSelect");
  
  if (!filterChips || !sortSelect) return;
  
  // Lade alle verfügbaren Skills für Filter
  const skills = new Set();
  allMembers.forEach(m => {
    if (m.skills && Array.isArray(m.skills)) {
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

/**
 * Filters and sorts members
 * @param {Array} members - Array of member profiles
 * @returns {Array} - Filtered and sorted members
 */
function filterAndSortMembers(members) {
  let filtered = [...members];
  
  // Filter
  if (currentFilter !== "all") {
    filtered = filtered.filter(m => 
      m.skills && m.skills.includes(currentFilter)
    );
  }
  
  // Sortierung
  switch (currentSort) {
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

/**
 * Gets number of cards visible based on screen width
 * @returns {number} - Number of cards visible
 */
function getCardsVisible() {
  if (window.innerWidth <= 480) return 1;
  if (window.innerWidth <= 768) return 2;
  if (window.innerWidth <= 1024) return 3;
  return 5;
}

// Default portraits for member avatars
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
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=faces'
];

/**
 * Gets avatar URL for a member
 * @param {Object} person - Member profile
 * @returns {string} - Avatar URL
 */
function getAvatarUrl(person) {
  const nameHash = (person.name || person.email).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const portraitIndex = nameHash % defaultPortraits.length;
  return defaultPortraits[portraitIndex];
}

/**
 * Renders a member card
 * @param {Object} p - Member profile
 * @returns {string} - HTML string
 */
function renderMemberCard(p) {
  const name = sanitizeHTML(p.name || '');
  const headline = sanitizeHTML(p.headline || 'Mitglied');
  const skills = [...(p.skills || []), ...(p.interests || [])].slice(0, 3).map(s => sanitizeHTML(s));
  const location = sanitizeHTML(p.location || "");
  const email = sanitizeHTML(p.email || "");
  const avatarUrl = getAvatarUrl(p);
  const initials = (name || email).split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  
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
}

// Slider state
let sliderCurrentIndex = 0;
const CARDS_SHIFT = 2;

/**
 * Updates the network slider (internal function)
 */
function updateNetworkSlider() {
  const slider = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pagination = $("#pagination");
  
  if (!slider) return;
  
  // Filtere und sortiere Mitglieder
  const members = filterAndSortMembers(allMembers);
  
  if (members.length === 0) {
    slider.innerHTML = `<div class="p-xl text-center text-muted">Noch keine Mitglieder im Netzwerk.</div>`;
    if (prevBtn) prevBtn.classList.add("hidden");
    if (nextBtn) nextBtn.classList.add("hidden");
    if (pagination) pagination.innerHTML = "";
    return;
  }
  
  // Buttons wieder anzeigen wenn Mitglieder vorhanden
  if (prevBtn) prevBtn.classList.remove("hidden");
  if (nextBtn) nextBtn.classList.remove("hidden");
  
  function updateSlider() {
    if (members.length === 0) return;
    
    const cardsVisible = getCardsVisible();
    
    // Berechne welche Cards sichtbar sein sollen
    const visibleCards = [];
    for (let i = 0; i < cardsVisible; i++) {
      const index = (sliderCurrentIndex + i) % members.length;
      visibleCards.push(members[index]);
    }
    
    // Render nur die sichtbaren Cards
    slider.innerHTML = visibleCards.map(renderMemberCard).join("");
    
    // Click handler für neue Cards
    slider.querySelectorAll(".person-card").forEach(card => {
      const email = card.dataset.email;
      const person = members.find(p => p.email === email);
      
      card.addEventListener("click", () => {
        if (person) {
          memberModal.show(person);
        }
      });
      
      // Stelle sicher, dass Bilder sichtbar sind
      const img = card.querySelector(".person-image");
      if (img) {
        img.addEventListener("load", () => {
          img.style.opacity = "1";
          img.classList.add("loaded");
        });
        img.addEventListener("error", () => {
          const name = person?.name || email;
          img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=random&color=fff&bold=true&format=png`;
        });
      }
      
      // Hover-Card on hover
      let hoverTimeout;
      card.addEventListener("mouseenter", () => {
        if (!person) return;
        hoverTimeout = setTimeout(() => {
          hoverCard.show(person, card);
        }, 500);
      });
      
      card.addEventListener("mouseleave", () => {
        if (hoverTimeout) clearTimeout(hoverTimeout);
        hoverCard.hide();
      });
    });
    
    // Buttons immer aktiv (unendliches Karussell)
    if (prevBtn) {
      prevBtn.disabled = false;
      prevBtn.style.opacity = '1';
    }
    if (nextBtn) {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
    }
    
    // Smooth transition
    slider.style.transition = 'transform 0.5s ease-in-out';
  }
  
  // Event listeners (nur einmal setzen)
  if (prevBtn && !prevBtn.dataset.listenerAdded) {
    prevBtn.dataset.listenerAdded = 'true';
    prevBtn.addEventListener("click", () => {
      sliderCurrentIndex = (sliderCurrentIndex - CARDS_SHIFT + members.length) % members.length;
      updateSlider();
    });
  }
  
  if (nextBtn && !nextBtn.dataset.listenerAdded) {
    nextBtn.dataset.listenerAdded = 'true';
    nextBtn.addEventListener("click", () => {
      sliderCurrentIndex = (sliderCurrentIndex + CARDS_SHIFT) % members.length;
      updateSlider();
    });
  }
  
  // Keyboard navigation (nur einmal setzen)
  if (!slider.dataset.listenerAdded) {
    slider.dataset.listenerAdded = 'true';
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        sliderCurrentIndex = (sliderCurrentIndex - CARDS_SHIFT + members.length) % members.length;
        updateSlider();
      } else if (e.key === 'ArrowRight') {
        sliderCurrentIndex = (sliderCurrentIndex + CARDS_SHIFT) % members.length;
        updateSlider();
      }
    });
  }
  
  // Debounced resize handler (nur einmal setzen)
  if (!window.membersResizeHandler) {
    window.membersResizeHandler = debounce(() => {
      updateSlider();
    }, 250);
    window.addEventListener("resize", window.membersResizeHandler);
  }
  
  updateSlider();
}

/**
 * Renders network slider with members
 */
export const renderNetworkSlider = () => {
  const slider = $("#peopleSlider");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const pagination = $("#pagination");
  const notice = $("#networkGuestNotice");
  
  if (!slider) return;
  
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
  let members = [];
  
  if (isLoggedIn) {
    members = api.listMembers("");
  } else {
    if (api.listMembersPublic) {
      members = api.listMembersPublic("");
    } else {
      // Fallback: Hole alle User und filtere nach sichtbaren Profilen
      try {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        for (const user of users) {
          const profileKey = `profile:${user.email.toLowerCase()}`;
          const profile = JSON.parse(localStorage.getItem(profileKey) || "null");
          if (profile && profile.privacy?.visibleInDirectory) {
            members.push(profile);
          }
        }
      } catch (e) {
        console.error("Error loading public members:", e);
      }
    }
  }
  
  // Speichere alle Mitglieder für Filter
  allMembers = members;
  
  // Setup Filter & Sortierung
  setupNetworkFilters();
  
  // Notice ausblenden, da Daten jetzt öffentlich sichtbar sind
  if (notice) {
    notice.style.display = "none";
  }
  
  updateNetworkSlider();
};

/**
 * Renders social proof statistics
 */
export const renderSocialProof = () => {
  const statsContainer = $("#socialProofStats");
  if (!statsContainer) {
    console.warn('Social proof stats container not found');
    return;
  }
  
  try {
    let members = [];
    if (api.listMembersPublic) {
      members = api.listMembersPublic("");
    } else if (api.listMembers) {
      members = api.listMembers("");
    }
    
    const totalMembers = members.length;
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newMembers = members.filter(m => {
      if (!m.updatedAt) return false;
      const updated = new Date(m.updatedAt);
      return updated >= oneWeekAgo;
    }).length;
    
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
        if (current >= target) {
          element.textContent = target;
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current);
        }
      }, 16);
    };
    
    setTimeout(() => {
      const totalEl = statsContainer.querySelector('#statTotalMembers');
      if (totalEl) animateNumber(totalEl, totalMembers);
    }, 300);
  } catch (e) {
    console.error("Error rendering social proof:", e);
  }
};
