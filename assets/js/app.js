/**
 * Main Application Entry Point
 * 
 * Handles:
 * - Authentication & Authorization (guard)
 * - Shell initialization (theme, sidebar, user info)
 * - Page routing based on data-page attribute or route definitions
 * - Component initialization (breadcrumbs, rich text editor)
 * 
 * All page-specific rendering logic is in assets/js/pages/
 * 
 * @module app
 */

import { api } from "./services/apiClient.js";
import { breadcrumbs } from "./components/breadcrumbs.js";
import { richTextEditor } from "./components/richTextEditor.js";
import { chartRenderer } from "./components/chartRenderer.js";
import { avatarGenerator } from "./components/avatarGenerator.js";
import { initSidebar, updateBadges } from "./components/sidebar.js";

const $ = (s)=>document.querySelector(s);
const qs = new URLSearchParams(location.search);

/**
 * Debounce utility for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
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

// Import router and auth guard
import { guardRoute, canAccessRoute } from './services/authGuard.js';
import { getCurrentPath, getCurrentRoute, getPageFromPath } from './services/router.js';
import { handleError } from './services/errorHandler.js';

/**
 * Route guard - checks authentication and authorization
 * Redirects to login if not authenticated or to appropriate page if not authorized
 * @returns {boolean} True if access is allowed, false otherwise
 */
function guard(){
  console.log('🔵 guard() called');
  const isLoggedIn = api.isLoggedIn();
  console.log('🔵 isLoggedIn:', isLoggedIn);
  if(!isLoggedIn){
    console.log('❌ Not logged in, redirecting...');
    // Determine correct redirect path based on current location
    const isInApp = window.location.pathname.includes('/app/');
    const redirectPath = isInApp ? '../index.html' : 'index.html';
    window.location.href = redirectPath;
    return false;
  }
  
  // Check route access
  const path = getCurrentPath();
  const guardResult = guardRoute(path);
  
  if (!guardResult.allowed) {
    if (guardResult.redirect) {
      window.location.href = guardResult.redirect;
    } else {
      const isInApp = window.location.pathname.includes('/app/');
      const redirectPath = isInApp ? '../index.html' : 'index.html';
      window.location.href = redirectPath;
    }
    return false;
  }
  
  return true;
}

/**
 * Initialize theme (light/dark mode)
 * Reads from localStorage or system preference
 */
function initTheme(){
  const savedTheme = localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

/**
 * Update theme toggle icon based on current theme
 * @param {string} theme - Current theme ('light' or 'dark')
 */
function updateThemeIcon(theme){
  const btn = $("#themeToggle");
  if(btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

/**
 * Toggle between light and dark theme
 * Updates DOM attribute and localStorage
 */
function toggleTheme(){
  const current = document.documentElement.getAttribute('data-theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

/**
 * Initialize application shell
 * Sets up theme, user info, sidebar navigation, and mobile menu
 */
async function setShell(){
  console.log('🔵 setShell() STARTED');
  initTheme();
  if($("#themeToggle")) $("#themeToggle").addEventListener("click", toggleTheme);
  
  const u = await api.me();
  console.log('🔵 setShell() user:', u);
  if($("#userLabel")) $("#userLabel").textContent = u?.name || "Member";
  if($("#logoutBtn")) $("#logoutBtn").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });
  if($("#logoutBtn2")) $("#logoutBtn2").addEventListener("click", ()=>{ api.logout(); window.location.href="../index.html"; });

  // Initialize Sidebar Navigation
  if (document.getElementById('sidebarContainer')) {
    console.log('🔵 Sidebar container found, initializing...');
    const userRole = u?.role || 'member';
    const currentPath = window.location.pathname;
    console.log('🔵 User role:', userRole, 'Path:', currentPath);
    initSidebar(userRole, currentPath);
    console.log('✅ Sidebar initialized');
    
    // Show mobile menu button on mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      const checkMobile = () => {
        mobileMenuBtn.style.display = window.innerWidth < 768 ? 'block' : 'none';
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }
  } else {
    console.warn('⚠️ No sidebar container found');
  }
}


/* ========== ROUTER ========== */
console.log('🟢 app.js: Script loaded, setting up DOMContentLoaded listener...');
console.log('🟢 app.js: document.readyState =', document.readyState);

// Check if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('🟢 app.js: DOM still loading, adding event listener...');
  document.addEventListener("DOMContentLoaded", initApp);
} else {
  console.log('🟢 app.js: DOM already loaded, calling initApp immediately...');
  initApp();
}

/**
 * Main application initialization
 * Called on DOMContentLoaded or immediately if DOM is already loaded
 * Handles authentication, shell setup, component initialization, and routing
 */
async function initApp() {
  console.log('🟢 initApp() STARTED');
  console.log('🟢 DOMContentLoaded fired');
  try {
    console.log('🟢 Calling guard()...');
    const guardResult = guard();
    console.log('🟢 Guard result:', guardResult);
    if(!guardResult) return;
    
    // Seed example update if on updates page and no updates exist
    if(document.body.dataset.page === "updates") {
      try {
        const seedModule = await import("./seedExampleUpdate.js");
        const updates = api.listUpdatesMember();
        const allUpdates = JSON.parse(localStorage.getItem("cms:updates") || "[]");
        if((updates.length === 0 && allUpdates.length === 0) || !allUpdates.find(u => (u.issueDate || u.month) === "2026-03")) {
          seedModule.seedExampleUpdate();
        }
      } catch(e) {
        console.warn("Could not seed example update:", e);
      }
    }
    
    await setShell();
    
    // Update sidebar on navigation (for SPA-like behavior)
    if (document.getElementById('sidebarContainer')) {
      // Intercept link clicks in sidebar
      document.addEventListener('click', async (e) => {
        const link = e.target.closest('.sidebar-item');
        if (link && link.href) {
          // Let the navigation happen, then update sidebar
          setTimeout(async () => {
            const user = api.me();
            if (user) {
              const userRole = user.role || 'member';
              const currentPath = window.location.pathname;
              const { renderSidebar } = await import('./components/sidebar.js');
              await renderSidebar(userRole, currentPath, false);
            }
          }, 50);
        }
      }, true);
    }
    
    // Alle Modals beim Start schließen
    const modals = ["evOverlay", "thrOverlay", "admEvOverlay", "bookedEventOverlay"];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = "none";
      }
    });
    
    // Initialize breadcrumbs
    try {
      breadcrumbs.init();
    } catch (error) {
      handleError(error, { context: 'app', component: 'breadcrumbs' });
    }
    
    // Initialize Rich Text Editor with error handling
    try {
      if (window.Quill) {
        richTextEditor.init();
      } else {
        // Wait for Quill to load
        const checkQuill = setInterval(() => {
          if (window.Quill) {
            clearInterval(checkQuill);
            try {
              richTextEditor.init();
            } catch (error) {
              handleError(error, { context: 'app', component: 'richTextEditor' });
            }
          }
        }, 100);
        setTimeout(() => clearInterval(checkQuill), 5000); // Timeout after 5 seconds
      }
    } catch (error) {
      handleError(error, { context: 'app', component: 'richTextEditor', setup: true });
    }
    
    // Onboarding deaktiviert - nicht mehr anzeigen
    // Setze onboardingCompleted automatisch auf true, damit es nie erscheint
    localStorage.setItem('onboardingCompleted', 'true');

    // Get page from data-page attribute or route definition
    let page = document.body.dataset.page;
    
    // Fallback: try to get page from route definition
    if (!page) {
      page = getPageFromPath();
      if (page) {
        console.log('🟢 Router: Page determined from route:', page);
      } else {
        console.warn('⚠️ No data-page attribute found and could not determine page from route');
        handleError(new Error('Could not determine page'), { context: 'router', path: getCurrentPath() });
        return;
      }
    }
    
    console.log('🟢 Router: Current page =', page);
    
    try {
      // Import page modules dynamically
      const pageModules = await import('./pages/index.js');
      
      // Route mapping: page name -> render function name
      const routeMap = {
      'dashboard': 'renderDashboard',
      'termine': 'renderEvents',
      'tickets': 'renderTickets',
      'forum': 'renderForum',
      'forum-category': 'renderForumCategory',
      'forum-thread': 'renderForumThread',
      'messages': 'renderMessages',
      'compose': 'renderCompose',
      'members': 'renderMembers',
      'member': 'renderMember',
      'updates': 'renderMonatsupdates',
      'profile': 'renderMyProfile',
      'settings': null, // No rendering logic
      'admin': 'renderAdmin',
      'resources': 'renderResources',
      'resources-admin': 'renderResourcesAdmin',
      'knowledge': 'renderKnowledge',
      'knowledge-admin': 'renderKnowledgeAdmin',
      'public-pages': 'renderPublicPagesEditor',
      'inbox': 'renderInbox',
      'reports': 'renderReports',
      'audit': 'renderAudit'
      };
    
      // Pages that need special error handling
      const pagesWithErrorHandling = ['forum', 'forum-category', 'forum-thread'];
    
      // Render page using route mapping
      const renderFunction = routeMap[page];
    
      if (renderFunction === null) {
      // Settings page has no rendering logic
      return;
      }
    
      if (!renderFunction) {
      console.warn('⚠️ Unknown page:', page);
      return;
      }
    
      if (!pageModules[renderFunction]) {
      handleError(new Error(`Render function ${renderFunction} not found`), { 
        context: 'router', 
        page,
        path: getCurrentPath() 
      });
      return;
      }
    
      try {
      if (pagesWithErrorHandling.includes(page)) {
        // Pages with special error handling
        pageModules[renderFunction]();
      } else {
        // Regular pages
        await pageModules[renderFunction]();
      }
    } catch (error) {
      handleError(error, { context: 'router', page, path: getCurrentPath() });
      const main = document.querySelector('main');
      if (main) {
        const errorMessages = {
          'forum': 'Fehler beim Laden des Forums. Bitte laden Sie die Seite neu.',
          'forum-category': 'Fehler beim Laden der Kategorie. Bitte laden Sie die Seite neu.',
          'forum-thread': 'Fehler beim Laden des Threads. Bitte laden Sie die Seite neu.',
        };
        const errorMsg = errorMessages[page] || 'Fehler beim Laden der Seite. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.';
        main.innerHTML = `<div class="card pane"><div class="p">${errorMsg}</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
      }
    }


    } catch (error) {
      handleError(error, { context: 'router', page, path: getCurrentPath() });
      // Show error message to user
      const main = document.querySelector('main') || document.body;
      if (main) {
        main.innerHTML = `<div class="card pane"><div class="p">Fehler beim Laden der Seite. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>`;
      }
    }
  } catch (error) {
    handleError(error, { context: 'router', critical: true, path: getCurrentPath() });
    // Fallback: redirect to dashboard
    if (window.location.pathname.includes('/app/')) {
      window.location.href = 'dashboard.html';
    }
  }
}

console.log('🟢 app.js: End of file reached');