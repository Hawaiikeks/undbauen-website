/* Auth Guard: Role-based route protection */

import { api } from './apiClient.js';

/**
 * Check if user has required role
 * @param {string|string[]} requiredRole - Single role or array of allowed roles
 * @returns {boolean}
 */
export function hasRequiredRole(requiredRole) {
  const user = api.me();
  if (!user) return false;
  
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  
  return user.role === requiredRole;
}

/**
 * Check if user has any of the required roles
 * @param {string[]} roles - Array of allowed roles
 * @returns {boolean}
 */
export function hasAnyRole(roles) {
  return hasRequiredRole(roles);
}

/**
 * Get required role for a route path
 * @param {string} path - Route path
 * @returns {string|string[]|null} - Required role(s) or null if public
 */
export function getRequiredRoleForPath(path) {
  // Public routes
  if (path === '/' || path.startsWith('/index.html') || 
      path.includes('/impressum') || path.includes('/datenschutz')) {
    return null; // Public
  }
  
  // Member area - requires member role or higher
  if (path.startsWith('/app/') || path.includes('/app/')) {
    return ['member', 'editor', 'moderator', 'admin'];
  }
  
  // Backoffice routes - role-specific
  if (path.startsWith('/backoffice/') || path.includes('/backoffice/')) {
    const route = path.split('/backoffice/')[1]?.split('.')[0] || '';
    
    // Admin-only routes
    if (['users', 'roles', 'settings', 'audit'].includes(route)) {
      return 'admin';
    }
    
    // Editor routes
    if (['public-pages', 'content', 'resources', 'knowledge'].includes(route)) {
      return ['editor', 'moderator', 'admin'];
    }
    
    // Moderator routes
    if (['inbox', 'reports', 'events'].includes(route)) {
      return ['moderator', 'admin'];
    }
    
    // Backoffice index - any backoffice role
    if (route === '' || route === 'index') {
      return ['editor', 'moderator', 'admin'];
    }
    
    // Default: admin only
    return 'admin';
  }
  
  // Default: member area
  return ['member', 'editor', 'moderator', 'admin'];
}

/**
 * Guard a route - check if user can access it
 * @param {string} path - Route path
 * @returns {{allowed: boolean, redirect?: string}}
 */
export function guardRoute(path) {
  // Check if logged in
  if (!api.isLoggedIn()) {
    return {
      allowed: false,
      redirect: '/index.html'
    };
  }
  
  const requiredRole = getRequiredRoleForPath(path);
  
  // Public route
  if (requiredRole === null) {
    return { allowed: true };
  }
  
  // Check role
  if (!hasRequiredRole(requiredRole)) {
    const user = api.me();
    const userRole = user?.role || 'member';
    
    // Redirect based on user role
    if (userRole === 'member') {
      return {
        allowed: false,
        redirect: '/app/dashboard.html'
      };
    }
    
    // Editor/moderator/admin - redirect to backoffice
    return {
      allowed: false,
      redirect: '/backoffice/index.html'
    };
  }
  
  return { allowed: true };
}

/**
 * Check if current user can access a route
 * @param {string} path - Route path
 * @returns {boolean}
 */
export function canAccessRoute(path) {
  return guardRoute(path).allowed;
}












