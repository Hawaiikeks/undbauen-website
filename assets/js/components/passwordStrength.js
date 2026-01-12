/**
 * Password Strength Indicator
 * Simple, clean password strength visualization
 */

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @returns {Object} Strength info
 */
export function calculatePasswordStrength(password) {
  if (!password) {
    return { strength: 0, label: '', color: '' };
  }

  let strength = 0;
  
  // Length check
  if (password.length >= 8) strength += 1;
  if (password.length >= 12) strength += 1;
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1;
  if (/[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
  
  // Determine label and color
  let label, color;
  if (strength <= 2) {
    label = 'Schwach';
    color = 'var(--danger)';
  } else if (strength <= 4) {
    label = 'Mittel';
    color = 'var(--warn)';
  } else if (strength <= 5) {
    label = 'Gut';
    color = 'var(--ok)';
  } else {
    label = 'Sehr gut';
    color = 'var(--accent)';
  }
  
  return {
    strength: Math.min(6, strength),
    maxStrength: 6,
    label,
    color,
    percentage: (strength / 6) * 100
  };
}

/**
 * Create password strength indicator
 * @param {HTMLElement} container - Container element
 * @param {HTMLElement} passwordInput - Password input field
 * @returns {Function} Cleanup function
 */
export function createPasswordStrengthIndicator(container, passwordInput) {
  if (!container || !passwordInput) return () => {};

  const indicator = document.createElement('div');
  indicator.className = 'password-strength';
  indicator.style.cssText = 'margin-top: 8px;';
  
  const bar = document.createElement('div');
  bar.className = 'password-strength-bar';
  bar.style.cssText = `
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 4px;
  `;
  
  const fill = document.createElement('div');
  fill.className = 'password-strength-fill';
  fill.style.cssText = `
    height: 100%;
    width: 0%;
    transition: width 0.2s ease, background-color 0.2s ease;
    border-radius: 2px;
  `;
  
  const label = document.createElement('div');
  label.className = 'password-strength-label';
  label.style.cssText = `
    font-size: 12px;
    color: var(--text-secondary);
  `;
  
  bar.appendChild(fill);
  indicator.appendChild(bar);
  indicator.appendChild(label);
  container.appendChild(indicator);
  
  const updateStrength = () => {
    const strength = calculatePasswordStrength(passwordInput.value);
    fill.style.width = `${strength.percentage}%`;
    fill.style.backgroundColor = strength.color;
    label.textContent = passwordInput.value ? strength.label : '';
  };
  
  passwordInput.addEventListener('input', updateStrength);
  passwordInput.addEventListener('focus', updateStrength);
  
  return () => {
    passwordInput.removeEventListener('input', updateStrength);
    passwordInput.removeEventListener('focus', updateStrength);
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  };
}





