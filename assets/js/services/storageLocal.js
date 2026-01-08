/* Local Storage Adapter: localStorage-based file storage (Base64) */

import { FileStorage } from './fileStorage.js';

/**
 * LocalStorage-based file storage adapter
 * Stores files as Base64 data URLs in localStorage
 * This is a development/stub implementation - replace with S3 adapter for production
 */
class LocalStorageAdapter {
  constructor() {
    this.storageKey = 'fileStorage';
    this.files = this.loadFiles();
  }

  /**
   * Load files from localStorage
   */
  loadFiles() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.error('Error loading files:', e);
      return {};
    }
  }

  /**
   * Save files to localStorage
   */
  saveFiles() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.files));
    } catch (e) {
      console.error('Error saving files:', e);
      // If quota exceeded, try to clean up old files
      if (e.name === 'QuotaExceededError') {
        this.cleanupOldFiles();
      }
    }
  }

  /**
   * Clean up old files (keep last 100)
   */
  cleanupOldFiles() {
    const entries = Object.entries(this.files);
    if (entries.length > 100) {
      // Sort by timestamp and keep newest
      entries.sort((a, b) => (b[1].uploadedAt || 0) - (a[1].uploadedAt || 0));
      const toKeep = entries.slice(0, 100);
      this.files = Object.fromEntries(toKeep);
      this.saveFiles();
    }
  }

  /**
   * Generate file key
   */
  generateKey(filename) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = filename.split('.').pop();
    return `file_${timestamp}_${random}.${extension}`;
  }

  /**
   * Upload file
   */
  async upload(file, options = {}) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const key = this.generateKey(file.name);
        const dataUrl = event.target.result;
        
        this.files[key] = {
          url: dataUrl,
          key,
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          uploadedAt: Date.now()
        };
        
        this.saveFiles();
        
        resolve({
          url: dataUrl,
          key,
          size: file.size,
          mimeType: file.type
        });
      };
      
      reader.onerror = (error) => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * Get signed URL (for localStorage, just return the stored URL)
   */
  async getSignedUrl(key, expiresIn = 3600) {
    const file = this.files[key];
    if (!file) {
      throw new Error('Datei nicht gefunden');
    }
    
    // For localStorage, return the URL directly
    // In production with S3, this would generate a signed URL
    return file.url;
  }

  /**
   * Delete file
   */
  async delete(key) {
    if (this.files[key]) {
      delete this.files[key];
      this.saveFiles();
      return true;
    }
    return false;
  }
}

// Create singleton instance
const localStorageAdapter = new LocalStorageAdapter();
export const fileStorage = new FileStorage(localStorageAdapter);












