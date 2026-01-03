/* Notification Bell: Header component with badge and dropdown */

import { notificationRepository } from '../services/repositories/notificationRepository.js';
import { api } from '../services/apiClient.js';
import { toast } from './toast.js';

let notificationBell = null;
let unreadCount = 0;

/**
 * Initialize notification bell
 */
export async function initNotificationBell() {
  const user = api.me();
  if (!user) return;

  // Find or create bell element
  const bellContainer = document.querySelector('#notificationBellContainer');
  if (!bellContainer) return;

  notificationBell = bellContainer;
  
  await updateNotificationBell();
  
  // Auto-update every 30 seconds
  setInterval(updateNotificationBell, 30000);
}

/**
 * Update notification bell badge and dropdown
 */
export async function updateNotificationBell() {
  const user = api.me();
  if (!user || !notificationBell) return;

  try {
    unreadCount = await notificationRepository.getUnreadCount(user.id);
    const unread = await notificationRepository.findUnreadByUserId(user.id);
    
    // Update badge
    const badge = notificationBell.querySelector('.notification-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    // Update dropdown content if open
    const dropdown = notificationBell.querySelector('.notification-dropdown');
    if (dropdown && dropdown.style.display === 'block') {
      dropdown.innerHTML = renderNotificationDropdown(unread);
      wireNotificationEvents(dropdown);
    }
  } catch (error) {
    console.error('Error updating notification bell:', error);
  }
}

/**
 * Render notification bell HTML
 */
export function renderNotificationBell() {
  return `
    <div id="notificationBellContainer" class="notification-bell" style="position: relative;">
      <button class="btn" id="notificationBellBtn" aria-label="Benachrichtigungen" title="Benachrichtigungen">
        🔔
        <span class="notification-badge" style="position: absolute; top: -4px; right: -4px; background: var(--danger); color: white; border-radius: 50%; width: 18px; height: 18px; font-size: 11px; display: flex; align-items: center; justify-content: center; font-weight: 600;">0</span>
      </button>
      <div class="notification-dropdown" style="display: none; position: absolute; top: 100%; right: 0; width: 320px; max-height: 400px; overflow-y: auto; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; margin-top: 8px;">
        <!-- Content will be populated dynamically -->
      </div>
    </div>
  `;
}

/**
 * Render notification dropdown content
 */
function renderNotificationDropdown(notifications) {
  if (notifications.length === 0) {
    return `
      <div style="padding: 24px; text-align: center; color: var(--text-secondary);">
        <div style="font-size: 32px; margin-bottom: 8px; opacity: 0.5;">🔔</div>
        <div>Keine neuen Benachrichtigungen</div>
      </div>
    `;
  }

  return `
    <div style="padding: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid var(--border);">
        <div style="font-weight: 600;">Benachrichtigungen</div>
        <button class="btn small" id="markAllReadBtn">Alle als gelesen</button>
      </div>
      <div style="max-height: 300px; overflow-y: auto;">
        ${notifications.slice(0, 10).map(notif => renderNotificationItem(notif)).join('')}
      </div>
      ${notifications.length > 10 ? `
        <div style="padding: 12px; text-align: center; border-top: 1px solid var(--border);">
          <a href="#" style="color: var(--primary); text-decoration: underline;">Alle anzeigen</a>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render single notification item
 */
function renderNotificationItem(notification) {
  const timeAgo = getTimeAgo(notification.createdAt);
  
  return `
    <div class="notification-item" 
         data-notification-id="${notification.id}"
         style="padding: 12px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s;"
         onmouseover="this.style.background='var(--bg-hover, rgba(0,0,0,0.05))'"
         onmouseout="this.style.background='transparent'"
         onclick="window.openNotification('${notification.id}', '${notification.entityType}', '${notification.entityId}')">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${notification.title || 'Benachrichtigung'}</div>
      <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4;">${notification.body || ''}</div>
      <div style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">${timeAgo}</div>
    </div>
  `;
}

/**
 * Wire notification events
 */
function wireNotificationEvents(dropdown) {
  // Mark all as read
  const markAllBtn = dropdown.querySelector('#markAllReadBtn');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const user = api.me();
      if (user) {
        await notificationRepository.markAllAsRead(user.id);
        await updateNotificationBell();
        toast.success('Alle Benachrichtigungen als gelesen markiert');
      }
    });
  }

  // Open notification
  window.openNotification = async function(notificationId, entityType, entityId) {
    const user = api.me();
    if (!user) return;

    try {
      // Mark as read
      await notificationRepository.markAsRead(notificationId);
      await updateNotificationBell();

      // Navigate to entity
      if (entityType === 'ticket') {
        window.location.href = '../app/tickets.html';
      } else if (entityType === 'report') {
        window.location.href = '../backoffice/reports.html';
      } else if (entityType === 'post') {
        // Navigate to post
        window.location.href = `../app/forum-thread.html?thread=${entityId}`;
      } else {
        // Default: dashboard
        window.location.href = '../app/dashboard.html';
      }
    } catch (error) {
      console.error('Error opening notification:', error);
    }
  };
}

/**
 * Get time ago string
 */
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Gerade eben';
  if (diffMins < 60) return `vor ${diffMins} ${diffMins === 1 ? 'Minute' : 'Minuten'}`;
  if (diffHours < 24) return `vor ${diffHours} ${diffHours === 1 ? 'Stunde' : 'Stunden'}`;
  if (diffDays < 7) return `vor ${diffDays} ${diffDays === 1 ? 'Tag' : 'Tagen'}`;
  return date.toLocaleDateString('de-DE');
}

/**
 * Setup notification bell toggle
 */
export function setupNotificationBellToggle() {
  const bellBtn = document.querySelector('#notificationBellBtn');
  const dropdown = document.querySelector('.notification-dropdown');
  
  if (!bellBtn || !dropdown) return;

  bellBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    
    if (!isVisible) {
      // Load notifications
      const user = api.me();
      if (user) {
        const unread = await notificationRepository.findUnreadByUserId(user.id);
        dropdown.innerHTML = renderNotificationDropdown(unread);
        wireNotificationEvents(dropdown);
      }
    }
    
    dropdown.style.display = isVisible ? 'none' : 'block';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (dropdown && !notificationBell.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}


