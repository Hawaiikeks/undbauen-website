/* Validation: Input validation and sanitization utilities */

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize rich text content (from Quill)
 * @param {string} html - Rich text HTML
 * @returns {string} Sanitized HTML
 */
export function sanitizeRichText(html) {
  if (!html) return '';
  
  // Create a temporary element
  const div = document.createElement('div');
  div.innerHTML = html;
  
  // Remove script tags and event handlers
  const scripts = div.querySelectorAll('script');
  scripts.forEach(script => script.remove());
  
  // Remove event handlers from all elements
  const allElements = div.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove all event handler attributes
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Remove javascript: URLs
    if (el.tagName === 'A' && el.href && el.href.startsWith('javascript:')) {
      el.removeAttribute('href');
    }
    
    if (el.tagName === 'IMG' && el.src && el.src.startsWith('javascript:')) {
      el.removeAttribute('src');
    }
  });
  
  return div.innerHTML;
}

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate URL
 * @param {string} url
 * @returns {boolean}
 */
export function isValidURL(url) {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required field
 * @param {*} value
 * @returns {boolean}
 */
export function isRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate string length
 * @param {string} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function validateLength(value, min = 0, max = Infinity) {
  if (!value) return min === 0;
  const length = typeof value === 'string' ? value.trim().length : value.length;
  return length >= min && length <= max;
}

/**
 * Validate file
 * @param {File} file
 * @param {Object} options
 * @returns {{valid: boolean, error?: string}}
 */
export function validateFile(file, options = {}) {
  if (!file) {
    return { valid: false, error: 'Keine Datei ausgewählt' };
  }

  const {
    maxSize = 50 * 1024 * 1024, // 50MB
    allowedTypes = null,
    allowedExtensions = null
  } = options;

  // Check size
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Datei ist zu groß. Maximal ${maxSizeMB}MB erlaubt.`
    };
  }

  // Check type
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Dateityp nicht erlaubt. Erlaubte Typen: ${allowedTypes.join(', ')}`
    };
  }

  // Check extension
  if (allowedExtensions) {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !allowedExtensions.includes(extension)) {
      return {
        valid: false,
        error: `Dateiendung nicht erlaubt. Erlaubte Endungen: ${allowedExtensions.join(', ')}`
      };
    }
  }

  return { valid: true };
}

/**
 * Validate form data
 * @param {Object} data - Form data
 * @param {Object} rules - Validation rules
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateForm(data, rules) {
  const errors = {};

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field];

    // Required check
    if (rule.required && !isRequired(value)) {
      errors[field] = rule.requiredMessage || `${field} ist erforderlich`;
      continue;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rule.required) continue;

    // Email validation
    if (rule.email && !isValidEmail(value)) {
      errors[field] = rule.emailMessage || 'Ungültige E-Mail-Adresse';
      continue;
    }

    // URL validation
    if (rule.url && !isValidURL(value)) {
      errors[field] = rule.urlMessage || 'Ungültige URL';
      continue;
    }

    // Length validation
    if (rule.minLength && !validateLength(value, rule.minLength)) {
      errors[field] = rule.minLengthMessage || `Mindestens ${rule.minLength} Zeichen erforderlich`;
      continue;
    }

    if (rule.maxLength && !validateLength(value, 0, rule.maxLength)) {
      errors[field] = rule.maxLengthMessage || `Maximal ${rule.maxLength} Zeichen erlaubt`;
      continue;
    }

    // Custom validator
    if (rule.validator && typeof rule.validator === 'function') {
      const result = rule.validator(value, data);
      if (result !== true) {
        errors[field] = result || `${field} ist ungültig`;
        continue;
      }
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}


