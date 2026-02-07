/**
 * Public Page - Main Entry Point
 * Simplified version with page modules
 */

import { api } from "./services/apiClient.js";
import { toast } from "./components/toast.js";
import { hoverCard } from "./components/hoverCard.js";
import { scrollNavigation } from "./components/scrollNavigation.js";
import { globalSearch } from "./components/search.js";
import { lazyLoader } from "./components/lazyLoad.js";
import { getIcon } from "./components/icons.js";
import { memberModal } from "./components/memberModal.js";
import { heroAnimation } from "./components/heroAnimation.js";

// Page modules
import { renderPublicEvents } from "./pages/events.js";
import { renderPublicUpdates } from "./pages/updates.js";
import { renderPublicPubs } from "./pages/publications.js";
import { renderTestimonials, renderPartners, renderFAQ } from "./pages/misc.js";

const $ = (s) => document.querySelector(s);

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

// Make openAuth available globally
window.openAuth = openAuth;

/**
 * Closes the authentication modal
 * @returns {void}
 */
const closeAuth = () => {
  const overlay = $("#authOverlay");
  if (overlay) overlay.style.display = "none";
};

/**
 * Sets the active tab in the authentication modal
 * @param {string} t - Tab name ('login', 'register', 'forgot')
 * @returns {void}
 */
const setTab = (t) => {
  if (!t) return;
  const tabs = document.querySelectorAll(".tab");
  const panels = document.querySelectorAll("[role='tabpanel']");
  const authTitle = $("#authTitle");
  
  tabs.forEach(tab => {
    tab.classList.toggle("active", tab.dataset.tab === t);
    tab.setAttribute("aria-selected", tab.dataset.tab === t ? "true" : "false");
  });
  
  panels.forEach(panel => {
    const isActive = panel.id === `panel-${t}`;
    panel.classList.toggle("tab-panel-hidden", !isActive);
    panel.setAttribute("aria-hidden", isActive ? "false" : "true");
  });
  
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
      icon.innerHTML = '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>';
    } else {
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

/**
 * Renders network slider (simplified - full implementation in members.js)
 * @returns {void}
 */
const renderNetworkSlider = async () => {
  try {
    const { renderNetworkSlider: renderMembers } = await import('./pages/members.js');
    renderMembers();
  } catch (error) {
    console.error('Error loading members module:', error);
  }
};

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
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
  
  // Initialize lazy loader
  try {
    if (lazyLoader && lazyLoader.init) {
      lazyLoader.init();
    }
  } catch (error) {
    console.error('Error initializing lazy loader:', error);
  }
  
  // Initialize scroll navigation
  try {
    if (scrollNavigation && scrollNavigation.init) {
      scrollNavigation.init();
    }
  } catch (error) {
    console.error('Error initializing scroll navigation:', error);
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
    await renderNetworkSlider();
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
    if ($("#searchTrigger") && globalSearch && globalSearch.open) {
      $("#searchTrigger").addEventListener("click", () => globalSearch.open());
    }
  } catch (error) {
    console.error('Error setting up global search:', error);
  }

  // Mobile Menu
  if ($("#mobileMenuToggle")) {
    $("#mobileMenuToggle").addEventListener("click", toggleMobileMenu);
  }
  
  // Close mobile menu when clicking on a link
  document.querySelectorAll(".navLinks a").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        closeMobileMenu();
      }
    });
  });
  
  // Close mobile menu on escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
    }
  });

  // Theme toggle
  try {
    if ($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
    if ($("#openAuth")) $("#openAuth").addEventListener("click", openAuth);
    if ($("#openAuth2")) $("#openAuth2").addEventListener("click", openAuth);
    if ($("#closeAuth")) $("#closeAuth").addEventListener("click", closeAuth);
    if ($("#authOverlay")) $("#authOverlay").addEventListener("click", (e) => { 
      if (e.target.id === "authOverlay") closeAuth(); 
    });
  } catch (error) {
    console.error('Error setting up auth handlers:', error);
  }

  // Tab navigation
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => setTab(t.dataset.tab));
    t.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setTab(t.dataset.tab);
      }
    });
  });
  
  // Modal focus trap
  const authModal = $("#authOverlay");
  if (authModal) {
    const trapFocus = (e) => {
      if (e.key !== "Tab") return;
      const focusableElements = authModal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements.length === 0) return;
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };
    
    authModal.addEventListener("keydown", trapFocus);
  }

  // Login handler
  if ($("#doLogin")) {
    $("#doLogin").addEventListener("click", async () => {
      const btn = $("#doLogin");
      btn.classList.add("loading");
      btn.disabled = true;
      
      try {
        const email = $("#loginEmail").value;
        const password = $("#loginPass").value;
        const res = api.login(email, password);
        if ($("#authErr")) $("#authErr").textContent = res.success ? "" : res.error;
        if (res.success) {
          toast.success("Erfolgreich eingeloggt!");
          closeAuth();
          setTimeout(() => {
            window.location.href = "app/dashboard.html";
          }, 500);
        } else {
          toast.error(res.error || "Login fehlgeschlagen");
          btn.classList.remove("loading");
          btn.disabled = false;
        }
      } catch (e) {
        const { handleError } = await import('./services/errorHandler.js');
        handleError(e, { context: 'login', email: $("#loginEmail")?.value });
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    });
  }

  // Register handler
  if ($("#doRegister")) {
    $("#doRegister").addEventListener("click", async () => {
      const btn = $("#doRegister");
      btn.classList.add("loading");
      btn.disabled = true;
      
      try {
        const res = await api.register($("#regName").value, $("#regEmail").value, $("#regPass").value);
        if ($("#regErr")) $("#regErr").textContent = res.success ? "" : res.error;
        if (res.success) {
          toast.success("Konto erfolgreich erstellt!");
          setTimeout(() => window.location.href = "app/dashboard.html", 500);
        } else {
          let errorMsg = "Registrierung fehlgeschlagen.";
          if (res.error) {
            if (res.error.includes("bereits") || res.error.includes("existiert")) {
              errorMsg = "Diese E-Mail-Adresse ist bereits registriert. Bitte loggen Sie sich ein oder nutzen Sie 'Passwort vergessen'.";
            } else {
              errorMsg = res.error;
            }
          }
          toast.error(errorMsg);
          btn.classList.remove("loading");
          btn.disabled = false;
        }
      } catch (e) {
        const { handleError } = await import('./services/errorHandler.js');
        handleError(e, { context: 'register', email: $("#regEmail")?.value });
        btn.classList.remove("loading");
        btn.disabled = false;
      }
    });
  }

  // Forgot password handler
  if ($("#doForgot")) {
    $("#doForgot").addEventListener("click", () => {
      if ($("#fpOk")) $("#fpOk").textContent = "Wenn ein Konto existiert, senden wir einen Link (MVP: kein Versand).";
    });
  }
});
