/* Storage Repository: localStorage-based implementation of BaseRepository */

import { BaseRepository } from './baseRepository.js';

/**
 * Generic localStorage-based repository implementation
 */
export class StorageRepository extends BaseRepository {
  constructor(storageKey) {
    super(storageKey);
  }

  /**
   * Get all items from localStorage
   * @returns {Array}
   */
  _getAll() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`Error reading ${this.storageKey}:`, e);
      return [];
    }
  }

  /**
   * Save all items to localStorage
   * @param {Array} items
   */
  _saveAll(items) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      console.error(`Error saving ${this.storageKey}:`, e);
      throw e;
    }
  }

  /**
   * Apply filter to items
   * @param {Array} items
   * @param {Object} filter
   * @returns {Array}
   */
  _applyFilter(items, filter) {
    if (!filter || Object.keys(filter).length === 0) {
      return items;
    }

    return items.filter(item => {
      for (const [key, value] of Object.entries(filter)) {
        if (item[key] !== value) {
          return false;
        }
      }
      return true;
    });
  }

  async findAll(filter = {}) {
    const items = this._getAll();
    return this._applyFilter(items, filter);
  }

  async findById(id) {
    const items = this._getAll();
    return items.find(item => item.id === id) || null;
  }

  async create(data) {
    const items = this._getAll();
    const newItem = {
      ...data,
      id: data.id || this._generateId(),
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString()
    };
    items.push(newItem);
    this._saveAll(items);
    return newItem;
  }

  async update(id, data) {
    const items = this._getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) {
      throw new Error(`Entity with id ${id} not found`);
    }

    items[index] = {
      ...items[index],
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    this._saveAll(items);
    return items[index];
  }

  async delete(id) {
    const items = this._getAll();
    const filtered = items.filter(item => item.id !== id);
    
    if (filtered.length === items.length) {
      return false; // Item not found
    }
    
    this._saveAll(filtered);
    return true;
  }

  async count(filter = {}) {
    const items = this._getAll();
    const filtered = this._applyFilter(items, filter);
    return filtered.length;
  }

  /**
   * Generate unique ID
   * @returns {string}
   */
  _generateId() {
    return `${this.storageKey}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


