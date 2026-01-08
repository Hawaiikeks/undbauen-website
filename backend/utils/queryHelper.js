/**
 * Query Helper
 * Provides query timeout and error handling utilities
 */

import pool from '../config/database.js';

/**
 * Execute query with timeout
 * @param {string} text - SQL query text
 * @param {Array} values - Query parameters
 * @param {number} timeout - Timeout in milliseconds (default: 5000)
 * @returns {Promise<Object>} Query result
 */
export async function queryWithTimeout(text, values = [], timeout = 5000) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Query timeout'));
    }, timeout);

    pool.query(text, values)
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Execute query with default timeout (5 seconds)
 * @param {string} text - SQL query text
 * @param {Array} values - Query parameters
 * @returns {Promise<Object>} Query result
 */
export async function query(text, values = []) {
  return queryWithTimeout(text, values, 5000);
}





