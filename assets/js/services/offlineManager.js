/**
 * Offline Manager
 *
 * Manages offline functionality, sync queue, and online/offline state.
 * Works with Service Worker for offline support.
 *
 * @module services/offlineManager
 */

/**
 * Offline Manager Class
 */
class OfflineManager {
  constructor() {
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.listeners = [];
    this.maxQueueSize = 100;

    // Listen to online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnline());
      window.addEventListener('offline', () => this.handleOffline());
    }
  }

  /**
   * Initialize offline manager
   */
  init() {
    // Load sync queue from localStorage
    this.loadSyncQueue();

    // Try to sync queued items if online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    // Register sync event listener for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then(registration => {
        // Background sync is available
        this.backgroundSyncAvailable = true;
      });
    }
  }

  /**
   * Handle online event
   */
  handleOnline() {
    this.isOnline = true;
    this.notifyListeners('online');

    // Process sync queue
    this.processSyncQueue();

    // Show notification
    this.showNotification('Verbindung wiederhergestellt', 'success');
  }

  /**
   * Handle offline event
   */
  handleOffline() {
    this.isOnline = false;
    this.notifyListeners('offline');

    // Show notification
    this.showNotification(
      'Keine Internetverbindung. Änderungen werden gespeichert und später synchronisiert.',
      'warning'
    );
  }

  /**
   * Check if currently online
   * @returns {boolean}
   */
  isCurrentlyOnline() {
    return navigator.onLine && this.isOnline;
  }

  /**
   * Add item to sync queue
   * @param {Object} item - Item to sync
   * @param {string} item.type - Action type (e.g., 'sendMessage', 'createThread')
   * @param {Object} item.data - Data to sync
   * @param {Function} item.syncFn - Function to call when syncing
   */
  addToSyncQueue(item) {
    const queueItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: item.type,
      data: item.data,
      syncFn: item.syncFn,
      timestamp: new Date().toISOString(),
      retries: 0,
      maxRetries: 3
    };

    this.syncQueue.push(queueItem);

    // Limit queue size
    if (this.syncQueue.length > this.maxQueueSize) {
      this.syncQueue.shift();
    }

    // Save to localStorage
    this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }

    return queueItem.id;
  }

  /**
   * Process sync queue
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToSync) {
      try {
        if (item.syncFn && typeof item.syncFn === 'function') {
          await item.syncFn(item.data);
          console.log(`✅ Synced item: ${item.type}`, item.id);
        } else {
          console.warn('Sync function not available for item:', item);
        }
      } catch (error) {
        console.error('Failed to sync item:', item, error);

        // Retry if not exceeded max retries
        if (item.retries < item.maxRetries) {
          item.retries++;
          this.syncQueue.push(item);
        } else {
          console.error('Max retries exceeded for item:', item);
          // Could notify user about failed sync
        }
      }
    }

    // Save updated queue
    this.saveSyncQueue();
  }

  /**
   * Save sync queue to localStorage
   */
  saveSyncQueue() {
    try {
      // Only save metadata, not functions
      const queueData = this.syncQueue.map(item => ({
        id: item.id,
        type: item.type,
        data: item.data,
        timestamp: item.timestamp,
        retries: item.retries,
        maxRetries: item.maxRetries
      }));
      localStorage.setItem('offline_sync_queue', JSON.stringify(queueData));
    } catch (e) {
      console.warn('Failed to save sync queue:', e);
    }
  }

  /**
   * Load sync queue from localStorage
   */
  loadSyncQueue() {
    try {
      const saved = localStorage.getItem('offline_sync_queue');
      if (saved) {
        const queueData = JSON.parse(saved);
        // Note: syncFn is not restored, needs to be provided when processing
        this.syncQueue = queueData;
      }
    } catch (e) {
      console.warn('Failed to load sync queue:', e);
      this.syncQueue = [];
    }
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue() {
    this.syncQueue = [];
    localStorage.removeItem('offline_sync_queue');
  }

  /**
   * Get sync queue
   * @returns {Array} Sync queue
   */
  getSyncQueue() {
    return [...this.syncQueue];
  }

  /**
   * Register listener for online/offline events
   * @param {Function} callback - Callback function
   */
  onStatusChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify listeners of status change
   * @param {string} status - 'online' or 'offline'
   */
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (e) {
        console.error('Error in status change listener:', e);
      }
    });
  }

  /**
   * Show notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type
   */
  showNotification(message, type = 'info') {
    // Try to use toast component
    if (typeof window !== 'undefined') {
      import('../components/toast.js')
        .then(({ toast }) => {
          toast[type](message);
        })
        .catch(() => {
          // Toast not available, use console
          console.log(`[${type.toUpperCase()}] ${message}`);
        });
    }
  }

  /**
   * Register background sync
   * @param {string} tag - Sync tag
   * @param {Object} options - Sync options
   */
  async registerBackgroundSync(tag, options = {}) {
    if (!this.backgroundSyncAvailable) {
      console.warn('Background sync not available');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      return true;
    } catch (error) {
      console.error('Failed to register background sync:', error);
      return false;
    }
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    offlineManager.init();
  });
}








