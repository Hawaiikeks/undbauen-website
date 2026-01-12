/* Form Validator: Wrapper component for automatic form validation */

import { validateForm, validateField, setupInlineValidation, ValidationRules } from '../services/validation.js';

/**
 * Form Validator Component
 * Wraps a form and provides automatic validation
 */
export class FormValidator {
  constructor(form, rules, options = {}) {
    this.form = typeof form === 'string' ? document.querySelector(form) : form;
    this.rules = rules || {};
    this.options = {
      validateOnSubmit: true,
      validateOnBlur: true,
      validateOnInput: true,
      showInlineErrors: true,
      showSuccessIndicators: true,
      preventSubmitOnError: true,
      ...options
    };
    this.errors = {};
    this.isValid = false;
    
    if (!this.form) {
      console.warn('FormValidator: Form element not found');
      return;
    }
    
    this.init();
  }
  
  /**
   * Initialize form validator
   */
  init() {
    // Setup inline validation for each field
    if (this.options.validateOnBlur || this.options.validateOnInput) {
      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (field && this.rules[fieldName]) {
          if (this.options.validateOnBlur) {
            setupInlineValidation(field, this.rules[fieldName], {
              showError: this.options.showInlineErrors,
              showSuccess: this.options.showSuccessIndicators,
              formData: this.getFormData()
            });
          }
        }
      });
    }
    
    // Setup submit handler
    if (this.options.validateOnSubmit) {
      this.form.addEventListener('submit', (e) => {
        if (!this.validate()) {
          e.preventDefault();
          e.stopPropagation();
          
          // Focus first error field
          const firstErrorField = this.form.querySelector('.field-invalid');
          if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          
          return false;
        }
      });
    }
  }
  
  /**
   * Validate entire form
   * @returns {boolean}
   */
  validate() {
    const formData = this.getFormData();
    const result = validateForm(formData, this.rules);
    
    this.errors = result.errors;
    this.isValid = result.valid;
    
    // Update UI
    if (!result.valid) {
      this.showErrors();
    } else {
      this.clearErrors();
    }
    
    return result.valid;
  }
  
  /**
   * Validate single field
   * @param {string} fieldName
   * @returns {boolean}
   */
  validateField(fieldName) {
    const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
    if (!field || !this.rules[fieldName]) return true;
    
    const formData = this.getFormData();
    const result = validateField(field, this.rules[fieldName], formData);
    
    if (!result.valid) {
      this.errors[fieldName] = result.error;
      this.updateFieldError(field, result.error);
    } else {
      delete this.errors[fieldName];
      this.clearFieldError(field);
    }
    
    return result.valid;
  }
  
  /**
   * Get form data
   * @returns {Object}
   */
  getFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Also get checkbox values
    this.form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      data[checkbox.name || checkbox.id] = checkbox.checked;
    });
    
    return data;
  }
  
  /**
   * Show all errors
   */
  showErrors() {
    Object.keys(this.errors).forEach(fieldName => {
      const field = this.form.querySelector(`[name="${fieldName}"], #${fieldName}`);
      if (field) {
        this.updateFieldError(field, this.errors[fieldName]);
      }
    });
  }
  
  /**
   * Clear all errors
   */
  clearErrors() {
    this.form.querySelectorAll('.field-invalid').forEach(field => {
      this.clearFieldError(field);
    });
  }
  
  /**
   * Update field error display
   * @param {HTMLElement} field
   * @param {string} error
   */
  updateFieldError(field, error) {
    field.classList.add('field-invalid');
    field.classList.remove('field-valid');
    
    // Remove existing error message
    const existingError = field.parentElement?.querySelector('.field-error');
    if (existingError) existingError.remove();
    
    // Add error message
    if (this.options.showInlineErrors && error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.style.cssText = 'color: var(--danger); font-size: 12px; margin-top: 4px;';
      errorDiv.textContent = error;
      field.parentElement?.appendChild(errorDiv);
    }
  }
  
  /**
   * Clear field error display
   * @param {HTMLElement} field
   */
  clearFieldError(field) {
    field.classList.remove('field-invalid');
    
    const existingError = field.parentElement?.querySelector('.field-error');
    if (existingError) existingError.remove();
  }
  
  /**
   * Reset form validation
   */
  reset() {
    this.errors = {};
    this.isValid = false;
    this.clearErrors();
  }
  
  /**
   * Get validation errors
   * @returns {Object}
   */
  getErrors() {
    return { ...this.errors };
  }
}

/**
 * Create form validator
 * @param {HTMLElement|string} form - Form element or selector
 * @param {Object} rules - Validation rules
 * @param {Object} options - Options
 * @returns {FormValidator}
 */
export function createFormValidator(form, rules, options = {}) {
  return new FormValidator(form, rules, options);
}

// Export validation rules for convenience
export { ValidationRules };









