/**
 * Main Application Entry Point
 * Handles routing, initialization, and page rendering
 */

import { api } from '../services/apiClient.js';
import { breadcrumbs } from '../components/breadcrumbs.js';
import { richTextEditor } from '../components/richTextEditor.js';
import { initSidebar } from '../components/sidebar.js';
import { handleError } from '../services/errorHandler.js';
import { initGlobalErrorBoundary } from '../components/errorBoundary.js';
import { enforceHTTPS } from '../services/security.js';
import { guardRoute } from '../services/authGuard.js';
import { getCurrentPath } from '../services/router.js';
import { $, qs } from '../utils.js';

/**
 * Theme management
 */
function initTheme() {
  const savedTheme =
    localStorage.getItem('theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

function updateThemeIcon(theme) {
  const btn = $('#themeToggle');
  if (btn) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
}

function toggleTheme() {
  const current =
    document.documentElement.getAttribute('data-theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const newTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon(newTheme);
}

/**
 * Initialize shell (theme, user info, sidebar)
 */
function setShell() {
  initTheme();
  if ($('#themeToggle')) {
    $('#themeToggle').addEventListener('click', toggleTheme);
  }

  const u = api.me();
  if ($('#userLabel')) {
    $('#userLabel').textContent = u?.name || 'Member';
  }
  if ($('#logoutBtn')) {
    $('#logoutBtn').addEventListener('click', () => {
      api.logout();
      window.location.href = '../index.html';
    });
  }
  if ($('#logoutBtn2')) {
    $('#logoutBtn2').addEventListener('click', () => {
      api.logout();
      window.location.href = '../index.html';
    });
  }

  // Initialize Sidebar Navigation
  if (document.getElementById('sidebarContainer')) {
    const userRole = u?.role || 'member';
    const currentPath = window.location.pathname;
    initSidebar(userRole, currentPath);

    // Show mobile menu button on mobile
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    if (mobileMenuBtn) {
      const checkMobile = () => {
        mobileMenuBtn.style.display = window.innerWidth < 768 ? 'block' : 'none';
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
    }
  }
}

/**
 * Route guard - check authentication and authorization
 * @returns {boolean} True if access is allowed
 */
function guard() {
  if (!api.isLoggedIn()) {
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
 * Main router - handles page rendering based on data-page attribute
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Enforce HTTPS in production
    enforceHTTPS();

    if (!guard()) {
      return;
    }

    // Seed example update if on updates page and no updates exist
    if (document.body.dataset.page === 'updates') {
      try {
        const seedModule = await import('../seedExampleUpdate.js');
        const updates = api.listUpdatesMember();
        const allUpdates = JSON.parse(localStorage.getItem('cms:updates') || '[]');
        if (
          (updates.length === 0 && allUpdates.length === 0) ||
          !allUpdates.find(u => (u.issueDate || u.month) === '2026-03')
        ) {
          seedModule.seedExampleUpdate();
        }
      } catch (e) {
        console.warn('Could not seed example update:', e);
      }
    }

    setShell();

    // Update sidebar on navigation (for SPA-like behavior)
    if (document.getElementById('sidebarContainer')) {
      // Intercept link clicks in sidebar
      document.addEventListener(
        'click',
        async e => {
          const link = e.target.closest('.sidebar-item');
          if (link && link.href) {
            // Let the navigation happen, then update sidebar
            setTimeout(async () => {
              const user = api.me();
              if (user) {
                const userRole = user.role || 'member';
                const currentPath = window.location.pathname;
                const { renderSidebar } = await import('../components/sidebar.js');
                await renderSidebar(userRole, currentPath, false);
              }
            }, 50);
          }
        },
        true
      );
    }

    // Alle Modals beim Start schließen
    const modals = ['evOverlay', 'thrOverlay', 'admEvOverlay', 'bookedEventOverlay'];
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
      }
    });

    // Initialize breadcrumbs
    try {
      breadcrumbs.init();
    } catch (error) {
      console.error('Error initializing breadcrumbs:', error);
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
              console.error('Error initializing Quill editor:', error);
            }
          }
        }, 100);
        setTimeout(() => clearInterval(checkQuill), 5000); // Timeout after 5 seconds
      }
    } catch (error) {
      console.error('Error setting up Quill editor:', error);
    }

    // Onboarding deaktiviert - nicht mehr anzeigen
    // Setze onboardingCompleted automatisch auf true, damit es nie erscheint
    localStorage.setItem('onboardingCompleted', 'true');

    // Initialize global error boundary
    initGlobalErrorBoundary();

    const page = document.body.dataset.page;
    try {
      switch (page) {
        case 'dashboard':
          const { renderDashboard } = await import('../pages/dashboard.js');
          await renderDashboard();
          break;
        case 'termine':
          const { renderEvents } = await import('../pages/events.js');
          renderEvents();
          break;
        case 'forum':
          try {
            const { renderForum } = await import('../pages/forum.js');
            renderForum();
          } catch (error) {
            console.error('Error rendering forum:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = '<div class="card pane"><div class="p">Fehler beim Laden des Forums. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>';
            }
          }
          break;
        case 'forum-category':
          try {
            const { renderForumCategory } = await import('../pages/forum.js');
            renderForumCategory();
          } catch (error) {
            console.error('Error rendering forum category:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = '<div class="card pane"><div class="p">Fehler beim Laden der Kategorie. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>';
            }
          }
          break;
        case 'forum-thread':
          try {
            const { renderForumThread } = await import('../pages/forum.js');
            renderForumThread();
          } catch (error) {
            console.error('Error rendering forum thread:', error);
            const main = document.querySelector('main');
            if (main) {
              main.innerHTML = '<div class="card pane"><div class="p">Fehler beim Laden des Threads. Bitte laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>';
            }
          }
          break;
        case 'messages':
          const { renderMessages } = await import('../pages/messages.js');
          renderMessages();
          break;
        case 'compose':
          const { renderCompose } = await import('../pages/messages.js');
          renderCompose();
          break;
        case 'members':
          const { renderMembers } = await import('../pages/members.js');
          renderMembers();
          break;
        case 'member':
          const { renderMember } = await import('../pages/members.js');
          renderMember();
          break;
        case 'updates':
          const { renderMonatsupdates } = await import('../pages/updates.js');
          renderMonatsupdates();
          break;
        case 'profile':
          const { renderMyProfile } = await import('../pages/profile.js');
          renderMyProfile();
          break;
        case 'settings':
          /* nothing more */
          break;
        case 'admin':
          const { renderAdmin } = await import('../pages/admin.js');
          renderAdmin();
          break;
        case 'resources':
          const { renderResources } = await import('../pages/resources.js');
          renderResources();
          break;
        case 'resources-admin':
          const { renderResourcesAdmin } = await import('../pages/resourcesAdmin.js');
          renderResourcesAdmin();
          break;
        case 'knowledge':
          const { renderKnowledge } = await import('../pages/knowledge.js');
          renderKnowledge();
          break;
        case 'knowledge-admin':
          const { renderKnowledgeAdmin } = await import('../pages/knowledgeAdmin.js');
          renderKnowledgeAdmin();
          break;
        case 'public-pages':
          const { renderPublicPagesEditor } = await import('../pages/publicPagesEditor.js');
          renderPublicPagesEditor();
          break;
        default:
          console.warn('Unknown page:', page);
      }
    } catch (error) {
      console.error('Error rendering page:', page, error);
      // Show error message to user
      const main = document.querySelector('main') || document.body;
      if (main) {
        main.innerHTML = '<div class="card pane"><div class="p">Fehler beim Laden der Seite. Bitte versuchen Sie es erneut oder laden Sie die Seite neu.</div><button class="btn primary" onclick="window.location.reload()">Seite neu laden</button></div>';
      }
    }
  } catch (error) {
    console.error('Critical error in router:', error);
    // Fallback: redirect to dashboard
    if (window.location.pathname.includes('/app/')) {
      window.location.href = 'dashboard.html';
    }
  }
});








