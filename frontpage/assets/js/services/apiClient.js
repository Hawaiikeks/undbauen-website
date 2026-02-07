/**
 * API Client
 *
 * Central API interface for the application.
 * Uses localStorage adapter for development (no backend required).
 *
 * @module apiClient
 */

// import { httpAdapter } from './httpAdapter.js';  // For production with backend
import { storageAdapter } from './storageAdapter.js';  // For development with localStorage

/**
 * API instance - using storage adapter (localStorage-based, no backend needed)
 * @type {Object}
 */
export const api = storageAdapter;

