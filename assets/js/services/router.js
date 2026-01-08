/* Router: Route definitions and navigation */

import { guardRoute } from './authGuard.js';

/**
 * Route definitions
 */
export const routes = {
  // Public routes
  public: {
    '/': { page: 'public', role: null },
    '/index.html': { page: 'public', role: null },
    '/impressum': { page: 'public', role: null },
    '/datenschutz': { page: 'public', role: null }
  },
  
  // Member area routes
  member: {
    '/app/dashboard.html': { page: 'dashboard', role: 'member' },
    '/app/tickets.html': { page: 'tickets', role: 'member' },
    '/app/resources.html': { page: 'resources', role: 'member' },
    '/app/knowledge.html': { page: 'knowledge', role: 'member' },
    '/app/termine.html': { page: 'termine', role: 'member' },
    '/app/forum.html': { page: 'forum', role: 'member' },
    '/app/nachrichten.html': { page: 'messages', role: 'member' },
    '/app/mitglieder.html': { page: 'members', role: 'member' },
    '/app/profil.html': { page: 'profile', role: 'member' },
    '/app/einstellungen.html': { page: 'settings', role: 'member' },
    '/app/monatsupdates.html': { page: 'updates', role: 'member' }
  },
  
  // Backoffice routes
  backoffice: {
    '/backoffice/index.html': { page: 'backoffice-dashboard', role: ['editor', 'moderator', 'admin'] },
    '/backoffice/inbox.html': { page: 'inbox', role: ['moderator', 'admin'] },
    '/backoffice/reports.html': { page: 'reports', role: ['moderator', 'admin'] },
    '/backoffice/content.html': { page: 'content', role: ['editor', 'moderator', 'admin'] },
    '/backoffice/events.html': { page: 'events', role: ['moderator', 'admin'] },
    '/backoffice/public-pages.html': { page: 'public-pages', role: ['editor', 'moderator', 'admin'] },
    '/backoffice/resources.html': { page: 'resources-admin', role: ['editor', 'moderator', 'admin'] },
    '/backoffice/knowledge.html': { page: 'knowledge-admin', role: ['editor', 'moderator', 'admin'] },
    '/backoffice/users.html': { page: 'users', role: 'admin' },
    '/backoffice/roles.html': { page: 'roles', role: 'admin' },
    '/backoffice/settings.html': { page: 'backoffice-settings', role: 'admin' },
    '/backoffice/audit.html': { page: 'audit', role: 'admin' }
  }
};

/**
 * Get current route path
 * @returns {string}
 */
export function getCurrentPath() {
  return window.location.pathname;
}

/**
 * Navigate to a route with guard check
 * @param {string} path - Route path
 * @param {boolean} force - Force navigation even if guard fails
 */
export function navigateTo(path, force = false) {
  const guard = guardRoute(path);
  
  if (!guard.allowed && !force) {
    if (guard.redirect) {
      window.location.href = guard.redirect;
    }
    return false;
  }
  
  window.location.href = path;
  return true;
}

/**
 * Get route info for current path
 * @returns {{page: string, role: string|string[]|null}|null}
 */
export function getCurrentRoute() {
  const path = getCurrentPath();
  
  // Check all route categories
  for (const category of Object.values(routes)) {
    if (category[path]) {
      return category[path];
    }
  }
  
  return null;
}

/**
 * Check if route exists
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function routeExists(path) {
  for (const category of Object.values(routes)) {
    if (category[path]) {
      return true;
    }
  }
  return false;
}












