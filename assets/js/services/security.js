/**
 * Security utilities
 * Provides security-related helper functions
 */

/**
 * Enforce HTTPS in production
 * Redirects to HTTPS if not already using it (except localhost)
 */
export function enforceHTTPS() {
  if (
    location.protocol !== 'https:' &&
    location.hostname !== 'localhost' &&
    location.hostname !== '127.0.0.1' &&
    !location.hostname.startsWith('192.168.') &&
    !location.hostname.startsWith('10.') &&
    !location.hostname.startsWith('172.')
  ) {
    location.replace('https:' + window.location.href.substring(window.location.protocol.length));
  }
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .replace(/[<>]/g, '') // Remove < >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick=, etc.)
    .trim();
}

/**
 * Validate CSRF token
 * @param {string} token - CSRF token to validate
 * @returns {boolean} True if token is valid
 */
export function validateCSRFToken(token) {
  if (!token) {
    return false;
  }
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.content;
  return token === metaToken;
}

/**
 * Get CSRF token from meta tag
 * @returns {string|null} CSRF token or null
 */
export function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || null;
}

/**
 * Generate secure random token
 * @param {number} length - Token length in bytes
 * @returns {string} Base64 encoded random token
 */
export function generateSecureToken(length = 32) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

/**
 * Check if running in secure context (HTTPS)
 * @returns {boolean}
 */
export function isSecureContext() {
  return window.isSecureContext || location.protocol === 'https:';
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, score: number, feedback: string[]}}
 */
export function validatePasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, score: 0, feedback: ['Passwort ist erforderlich'] };
  }

  const feedback = [];
  let score = 0;

  // Length check
  if (password.length < 8) {
    feedback.push('Mindestens 8 Zeichen erforderlich');
  } else {
    score += 1;
    if (password.length >= 12) {
      score += 1;
    }
  }

  // Character variety
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Kleinbuchstaben verwenden');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Großbuchstaben verwenden');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Zahlen verwenden');
  }

  if (/[^a-zA-Z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Sonderzeichen verwenden');
  }

  return {
    valid: score >= 4 && password.length >= 8,
    score: Math.min(score, 5),
    feedback: feedback.length > 0 ? feedback : ['Passwort ist sicher']
  };
}








