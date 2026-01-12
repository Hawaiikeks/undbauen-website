/**
 * Utility Functions
 * Shared helper functions used across multiple pages
 */

/**
 * Query selector shorthand
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
export const $ = s => document.querySelector(s);

/**
 * Query selector all shorthand
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export const $$ = s => document.querySelectorAll(s);

/**
 * Get URL search parameters
 * @returns {URLSearchParams}
 */
export const qs = new URLSearchParams(location.search);

/**
 * Format date from YYYY-MM-DD to DD.MM.YYYY
 * @param {Object} ev - Event object with date and time properties
 * @returns {string} Formatted date string
 */
export function fmtDate(ev) {
  const dateParts = ev.date.split('-');
  const formattedDate =
    dateParts.length === 3 ? `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}` : ev.date;
  return `${formattedDate} ${ev.time}`;
}

/**
 * Parse comma-separated tags string into array
 * @param {string} str - Comma-separated tags string
 * @returns {string[]} Array of unique tags
 */
export function parseTags(str) {
  return (str || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i);
}

/**
 * Debounce utility for performance
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Format file size in bytes to human-readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) {
    return '0 Bytes';
  }
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Extract Teams link from location string
 * @param {string} location - Location string that may contain Teams link
 * @returns {string|null} Extracted Teams link or null
 */
export function extractTeamsLink(location) {
  if (!location) {
    return null;
  }
  const teamsMatch = location.match(/https?:\/\/[^\s]+teams[^\s]+/i);
  return teamsMatch ? teamsMatch[0] : null;
}

/**
 * Calculate end time from start time and duration
 * @param {string} startTime - Start time in HH:MM format
 * @param {number} durationMinutes - Duration in minutes
 * @returns {string} End time in HH:MM format
 */
export function calculateEndTime(startTime, durationMinutes) {
  if (!startTime || !durationMinutes) {
    return null;
  }
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  startDate.setMinutes(startDate.getMinutes() + durationMinutes);
  return `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
}

/**
 * Find common tags between two profiles
 * @param {Object} a - First profile
 * @param {Object} b - Second profile
 * @returns {string[]} Array of common tags
 */
export function commonTags(a, b) {
  const A = new Set([...(a?.skills || []), ...(a?.interests || [])].map(x => x.toLowerCase()));
  const out = [];
  for (const x of [...(b?.skills || []), ...(b?.interests || [])]) {
    if (A.has(x.toLowerCase())) {
      out.push(x);
    }
  }
  return out;
}
