/* Sidebar Navigation Component
 * Rollenbasierte vertikale Sidebar mit Lucide Icons
 */

import { getIcon } from './icons.js';
import { api } from '../services/apiClient.js';

let sidebarState = {
  collapsed: false,
  mobileOpen: false
};

/**
 * Get navigation items based on user role
 * @param {string} role - User role (member, editor, moderator, admin)
 * @returns {Array} Navigation items
 */
export function getNavigationItems(role) {
  const baseItems = {
    member: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: 'dashboard.html' },
      { id: 'nachrichten', label: 'Nachrichten', icon: 'message-circle', path: 'nachrichten.html', badge: 'unread' },
      { id: 'forum', label: 'Forum', icon: 'messages-square', path: 'forum.html' },
      { id: 'termine', label: 'Termine', icon: 'calendar', path: 'termine.html' },
      { id: 'monatsupdates', label: 'Monatsupdates', icon: 'calendar', path: 'monatsupdates.html' },
      { id: 'resources', label: 'Ressourcen', icon: 'folder', path: 'resources.html' },
      { id: 'knowledge', label: 'Knowledge', icon: 'book-open', path: 'knowledge.html' },
      { id: 'profil', label: 'Profil', icon: 'user', path: 'einstellungen.html' }
    ],
    editor: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: 'dashboard.html' },
      { id: 'content', label: 'Content', icon: 'file-text', path: 'admin.html?tab=content' },
      { id: 'public-pages', label: 'Public Pages', icon: 'layout-template', path: '../backoffice/public-pages.html' },
      { id: 'monatsupdates', label: 'Monatsupdates', icon: 'calendar', path: 'monatsupdates.html' },
      { id: 'resources', label: 'Ressourcen', icon: 'folder', path: 'resources.html' },
      { id: 'knowledge', label: 'Knowledge', icon: 'book-open', path: 'knowledge.html' },
      { id: 'profil', label: 'Profil', icon: 'user', path: 'einstellungen.html' }
    ],
    moderator: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: 'dashboard.html' },
      { id: 'inbox', label: 'Inbox', icon: 'inbox', path: '../backoffice/inbox.html', badge: 'tickets' },
      { id: 'reports', label: 'Reports', icon: 'flag', path: '../backoffice/reports.html', badge: 'reports' },
      { id: 'content', label: 'Content', icon: 'file-text', path: 'admin.html?tab=content' },
      { id: 'events', label: 'Events', icon: 'calendar', path: 'admin.html?tab=events' },
      { id: 'monatsupdates', label: 'Monatsupdates', icon: 'calendar', path: 'monatsupdates.html' },
      { id: 'resources', label: 'Ressourcen', icon: 'folder', path: 'resources.html' },
      { id: 'knowledge', label: 'Knowledge', icon: 'book-open', path: 'knowledge.html' }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: 'dashboard.html' },
      { id: 'inbox', label: 'Inbox', icon: 'inbox', path: '../backoffice/inbox.html', badge: 'tickets' },
      { id: 'reports', label: 'Reports', icon: 'flag', path: '../backoffice/reports.html', badge: 'reports' },
      { id: 'content', label: 'Content', icon: 'file-text', path: 'admin.html?tab=content' },
      { id: 'events', label: 'Events', icon: 'calendar', path: 'admin.html?tab=events' },
      { id: 'monatsupdates', label: 'Monatsupdates', icon: 'calendar', path: 'monatsupdates.html' },
      { id: 'public-pages', label: 'Public Pages', icon: 'layout-template', path: '../backoffice/public-pages.html' },
      { id: 'resources', label: 'Ressourcen', icon: 'folder', path: 'resources.html' },
      { id: 'knowledge', label: 'Knowledge', icon: 'book-open', path: 'knowledge.html' },
      { id: 'users', label: 'Users', icon: 'users', path: 'admin.html?tab=users' },
      { id: 'settings', label: 'Settings', icon: 'settings', path: 'admin.html?tab=settings' },
      { id: 'audit', label: 'Audit Log', icon: 'activity', path: '../backoffice/audit.html' }
    ]
  };

  return baseItems[role] || baseItems.member;
}

/**
 * Check if route is active
 * @param {string} itemPath - Navigation item path
 * @param {string} currentPath - Current page path
 * @returns {boolean}
 */
export function isActiveRoute(itemPath, currentPath) {
  if (!itemPath || !currentPath) return false;
  
  // Normalize paths
  const normalizePath = (path) => {
    if (!path) return '';
    // Remove query params and hash
    let clean = path.split('?')[0].split('#')[0];
    // Remove leading/trailing slashes and dots
    clean = clean.replace(/^\/+|\.\.\/|\/+$/g, '');
    return clean.toLowerCase();
  };
  
  // Get current URL for comparison
  const currentUrl = new URL(window.location.href);
  const currentPathNorm = normalizePath(currentPath);
  const currentFile = currentPathNorm.split('/').pop() || currentPathNorm;
  
  // Handle relative paths
  let itemPathResolved = itemPath;
  if (itemPath.startsWith('../')) {
    // Resolve relative path
    const basePath = currentPathNorm.split('/').slice(0, -1).join('/');
    itemPathResolved = basePath + '/' + itemPath.replace('../', '');
  } else if (!itemPath.startsWith('/') && !itemPath.startsWith('http')) {
    // Relative to current directory
    const basePath = currentPathNorm.split('/').slice(0, -1).join('/');
    itemPathResolved = basePath + '/' + itemPath;
  }
  
  const itemPathNorm = normalizePath(itemPathResolved);
  const itemFile = itemPathNorm.split('/').pop() || itemPathNorm;
  
  // Exact path match
  if (itemPathNorm === currentPathNorm) return true;
  
  // Filename match (most common case)
  if (itemFile === currentFile) {
    // For tab-based navigation, check tab parameter
    if (itemPath.includes('?tab=')) {
      const itemTab = itemPath.split('?tab=')[1]?.split('&')[0];
      const currentTab = currentUrl.searchParams.get('tab');
      // If both have tabs, they must match
      if (itemTab && currentTab) {
        return itemTab === currentTab;
      }
      // If item has tab but current doesn't, not active
      if (itemTab && !currentTab) {
        return false;
      }
    }
    return true;
  }
  
  return false;
}

/**
 * Get badge count for navigation item
 * @param {string} badgeType - Badge type (unread, tickets, reports)
 * @returns {number} Badge count
 */
async function getBadgeCount(badgeType) {
  if (!badgeType) return 0;
  
  try {
    const user = api.me();
    if (!user) return 0;
    
    switch (badgeType) {
      case 'unread':
        // Count unread messages from threads
        try {
          const threads = api.getThreads(user.email) || [];
          return threads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);
        } catch (e) {
          console.warn('Error getting threads:', e);
          return 0;
        }
      
      case 'tickets':
        // Count open tickets
        try {
          const { ticketRepository } = await import('../services/repositories/ticketRepository.js');
          const allTickets = await ticketRepository.findAll();
          const userTickets = allTickets.filter(t => t.createdBy === user.email || t.assignedTo === user.email);
          return userTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
        } catch (e) {
          console.warn('Error getting tickets:', e);
          return 0;
        }
      
      case 'reports':
        // Count open reports
        try {
          const { reportRepository } = await import('../services/repositories/reportRepository.js');
          const allReports = await reportRepository.findAll();
          return allReports.filter(r => r.status === 'open' || r.status === 'pending').length;
        } catch (e) {
          console.warn('Error getting reports:', e);
          return 0;
        }
      
      default:
        return 0;
    }
  } catch (e) {
    console.warn('Error getting badge count:', e);
    return 0;
  }
}

/**
 * Update active state of sidebar items
 * @param {string} currentPath - Current page path
 */
export function updateActiveState(currentPath) {
  const navItems = document.querySelectorAll('.sidebar-item');
  let activeFound = false;
  
  navItems.forEach(item => {
    const itemPath = item.getAttribute('href');
    if (!itemPath) return;
    
    const isActive = isActiveRoute(itemPath, currentPath);
    
    // Ensure only ONE item is active
    if (isActive && !activeFound) {
      item.classList.add('active');
      activeFound = true;
    } else {
      item.classList.remove('active');
    }
  });
}

/**
 * Render sidebar navigation
 * @param {string} userRole - User role
 * @param {string} currentPath - Current page path
 * @param {boolean} forceRender - Force full re-render (default: false)
 */
export async function renderSidebar(userRole, currentPath, forceRender = false) {
  const container = document.getElementById('sidebarContainer');
  if (!container) {
    console.warn('Sidebar container not found');
    return;
  }

  // Check if sidebar already exists and we just need to update active state
  const existingSidebar = document.getElementById('sidebar');
  if (existingSidebar && !forceRender) {
    // Just update active state and badges
    updateActiveState(currentPath);
    await updateBadges();
    return;
  }

  // Load sidebar state from localStorage
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState !== null) {
    sidebarState.collapsed = savedState === 'true';
  }

  const navItems = getNavigationItems(userRole);
  const isCollapsed = sidebarState.collapsed;
  const isMobile = window.innerWidth < 768;

  // Get badge counts
  const badgeCounts = {};
  for (const item of navItems) {
    if (item.badge) {
      badgeCounts[item.id] = await getBadgeCount(item.badge);
    }
  }

  // Build navigation HTML - ensure only ONE active item
  // First pass: find which item should be active
  let activeItemId = null;
  for (const item of navItems) {
    if (isActiveRoute(item.path, currentPath)) {
      activeItemId = item.id;
      break; // Only first match
    }
  }
  
  const navHTML = navItems.map(item => {
    const isActive = item.id === activeItemId;
    const badgeCount = badgeCounts[item.id] || 0;
    const iconHTML = getIcon(item.icon, 20);
    
    return `
      <a 
        href="${item.path}" 
        class="sidebar-item ${isActive ? 'active' : ''}" 
        data-nav-id="${item.id}"
        aria-label="${item.label}"
        ${isCollapsed && !isMobile ? 'title="' + item.label + '"' : ''}
      >
        <span class="sidebar-icon" aria-hidden="true">${iconHTML}</span>
        ${badgeCount > 0 ? `<span class="sidebar-badge">${badgeCount > 99 ? '99+' : badgeCount}</span>` : ''}
        ${!isCollapsed || isMobile ? `<span class="sidebar-label">${item.label}</span>` : ''}
      </a>
    `;
  }).join('');

  // Build sidebar HTML
  const sidebarHTML = `
    <aside class="sidebar ${isCollapsed ? 'collapsed' : ''} ${sidebarState.mobileOpen ? 'mobile-open' : ''}" id="sidebar" role="complementary" aria-label="Seitennavigation">
      <div class="sidebar-header">
        ${!isCollapsed || isMobile ? '<div class="sidebar-brand">…undbauen</div>' : '<div class="sidebar-brand-icon">…</div>'}
        <button class="sidebar-toggle" id="sidebarToggle" aria-label="${isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}" aria-expanded="${!isCollapsed}" type="button">
          ${getIcon(isCollapsed ? 'chevron-right' : 'chevron-left', 20)}
        </button>
      </div>
      <nav class="sidebar-nav" role="navigation" aria-label="Hauptnavigation">
        ${navHTML}
      </nav>
    </aside>
    ${isMobile ? '<div class="sidebar-overlay" id="sidebarOverlay" aria-hidden="true"></div>' : ''}
  `;

  container.innerHTML = sidebarHTML;

  // Attach event listeners
  attachSidebarEvents();
}

/**
 * Attach event listeners to sidebar
 */
function attachSidebarEvents() {
  // Toggle button
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleSidebar);
  }

  // Mobile overlay
  const overlay = document.getElementById('sidebarOverlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebarState.mobileOpen = false;
      updateSidebarState();
    });
  }

  // Mobile menu button (in header)
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      sidebarState.mobileOpen = !sidebarState.mobileOpen;
      updateSidebarState();
    });
  }

  // Keyboard navigation
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebarState.mobileOpen) {
        sidebarState.mobileOpen = false;
        updateSidebarState();
      }
    });
  }
}

/**
 * Toggle sidebar collapsed state
 */
export function toggleSidebar() {
  sidebarState.collapsed = !sidebarState.collapsed;
  localStorage.setItem('sidebarCollapsed', sidebarState.collapsed.toString());
  updateSidebarState();
}

/**
 * Update sidebar visual state
 */
function updateSidebarState() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const container = document.getElementById('sidebarContainer');
  
  if (sidebar) {
    sidebar.classList.toggle('collapsed', sidebarState.collapsed);
    sidebar.classList.toggle('mobile-open', sidebarState.mobileOpen);
  }
  
  if (container) {
    container.classList.toggle('mobile-open', sidebarState.mobileOpen);
  }
  
  if (overlay) {
    overlay.classList.toggle('active', sidebarState.mobileOpen);
  }

  // Update toggle button icon
  const toggleBtn = document.getElementById('sidebarToggle');
  if (toggleBtn) {
    toggleBtn.innerHTML = getIcon(sidebarState.collapsed ? 'chevron-right' : 'chevron-left', 20);
    toggleBtn.setAttribute('aria-label', sidebarState.collapsed ? 'Sidebar erweitern' : 'Sidebar einklappen');
    toggleBtn.setAttribute('aria-expanded', (!sidebarState.collapsed).toString());
  }

  // Update main layout margin
  updateMainLayoutMargin();
}

/**
 * Update main layout margin based on sidebar state
 */
function updateMainLayoutMargin() {
  const mainLayout = document.getElementById('mainLayout');
  if (!mainLayout) return;

  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    mainLayout.style.marginLeft = '0';
    return;
  }

  // Use CSS variables for consistency
  if (sidebarState.collapsed) {
    mainLayout.style.marginLeft = 'var(--sidebar-width-collapsed)';
  } else {
    mainLayout.style.marginLeft = 'var(--sidebar-width-expanded)';
  }
}

/**
 * Update badge counts
 */
export async function updateBadges() {
  const navItems = getNavigationItems(api.me()?.role || 'member');
  
  for (const item of navItems) {
    if (item.badge) {
      const count = await getBadgeCount(item.badge);
      const navItem = document.querySelector(`[data-nav-id="${item.id}"]`);
      if (navItem) {
        const existingBadge = navItem.querySelector('.sidebar-badge');
        if (count > 0) {
          if (existingBadge) {
            existingBadge.textContent = count > 99 ? '99+' : count;
          } else {
            const badge = document.createElement('span');
            badge.className = 'sidebar-badge';
            badge.textContent = count > 99 ? '99+' : count;
            navItem.appendChild(badge);
          }
        } else if (existingBadge) {
          existingBadge.remove();
        }
      }
    }
  }
}

// Global sidebar instance state
let sidebarInitialized = false;
let currentUserRole = null;

/**
 * Initialize sidebar (only once, then update on route changes)
 * @param {string} userRole - User role
 * @param {string} currentPath - Current page path
 */
export async function initSidebar(userRole, currentPath) {
  if (!userRole) {
    const user = api.me();
    userRole = user?.role || 'member';
  }
  
  if (!currentPath) {
    currentPath = window.location.pathname;
  }

  // Check if role changed - if so, force re-render
  const roleChanged = currentUserRole !== userRole;
  currentUserRole = userRole;

  // Initial render or role change
  if (!sidebarInitialized || roleChanged) {
    await renderSidebar(userRole, currentPath, true);
    sidebarInitialized = true;
  } else {
    // Just update active state and badges
    await renderSidebar(userRole, currentPath, false);
  }
  
  // Update on window resize (only attach once)
  if (!window.sidebarResizeHandler) {
    window.sidebarResizeHandler = () => {
      updateMainLayoutMargin();
      // Update active state on resize (in case of mobile/desktop switch)
      const currentPath = window.location.pathname;
      updateActiveState(currentPath);
    };
    window.addEventListener('resize', window.sidebarResizeHandler);
  }
  
  // Initial margin update (with delay to ensure DOM is ready)
  setTimeout(() => {
    updateMainLayoutMargin();
  }, 100);
  
  // Listen for route changes (popstate for browser back/forward)
  if (!window.sidebarPopStateHandler) {
    window.sidebarPopStateHandler = async () => {
      const user = api.me();
      const userRole = user?.role || 'member';
      const currentPath = window.location.pathname;
      await renderSidebar(userRole, currentPath, false);
    };
    window.addEventListener('popstate', window.sidebarPopStateHandler);
  }
}

