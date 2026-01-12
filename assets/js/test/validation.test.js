/**
 * Unit Tests for validation.js
 *
 * @module test/validation.test
 */

import { describe } from './testRunner.js';
import {
  isValidEmail,
  isValidURL,
  validateLength,
  sanitizeInput,
  validatePasswordStrength
} from '../services/validation.js';

/**
 * Run validation tests
 * @returns {Promise<Object>} Test results
 */
export async function runValidationTests() {
  const suite = describe('Validation Tests', test => {
    // Test isValidEmail
    test('isValidEmail validates correct emails', () => {
      test.assertTruthy(isValidEmail('test@example.com'), 'Should accept valid email');
      test.assertTruthy(
        isValidEmail('user.name@domain.co.uk'),
        'Should accept email with dots and subdomain'
      );
    });

    test('isValidEmail rejects invalid emails', () => {
      test.assertFalsy(isValidEmail('invalid-email'), 'Should reject email without @');
      test.assertFalsy(isValidEmail('test@'), 'Should reject email without domain');
      test.assertFalsy(isValidEmail('@example.com'), 'Should reject email without local part');
      test.assertFalsy(isValidEmail(''), 'Should reject empty email');
      test.assertFalsy(isValidEmail(null), 'Should reject null email');
      test.assertFalsy(isValidEmail(undefined), 'Should reject undefined email');
    });

    // Test isValidURL
    test('isValidURL validates correct URLs', () => {
      test.assertTruthy(isValidURL('https://example.com'), 'Should accept HTTPS URL');
      test.assertTruthy(isValidURL('http://example.com'), 'Should accept HTTP URL');
      test.assertTruthy(
        isValidURL('https://example.com/path?query=1'),
        'Should accept URL with path and query'
      );
    });

    test('isValidURL rejects invalid URLs', () => {
      test.assertFalsy(isValidURL('not-a-url'), 'Should reject invalid URL');
      test.assertFalsy(isValidURL(''), 'Should reject empty URL');
      test.assertFalsy(isValidURL(null), 'Should reject null URL');
    });

    // Test validateLength
    test('validateLength validates string length', () => {
      test.assertTruthy(validateLength('hello', 3), 'Should accept string longer than min');
      test.assertTruthy(validateLength('hello', 3, 10), 'Should accept string within range');
      test.assertFalsy(validateLength('hi', 3), 'Should reject string shorter than min');
      test.assertFalsy(validateLength('hello world', 3, 5), 'Should reject string longer than max');
    });

    test('validateLength handles edge cases', () => {
      test.assertFalsy(validateLength('', 1), 'Should reject empty string when min > 0');
      test.assertTruthy(validateLength('', 0), 'Should accept empty string when min = 0');
      test.assertFalsy(validateLength(null, 1), 'Should reject null');
    });

    // Test sanitizeInput
    test('sanitizeInput removes dangerous characters', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      test.assertFalsy(result.includes('<'), 'Should remove < character');
      test.assertFalsy(result.includes('>'), 'Should remove > character');
    });

    test('sanitizeInput removes javascript: protocol', () => {
      const result = sanitizeInput('javascript:alert("xss")');
      test.assertFalsy(result.includes('javascript:'), 'Should remove javascript: protocol');
    });

    test('sanitizeInput handles null/undefined', () => {
      test.assertEquals(sanitizeInput(null), '', 'Should return empty string for null');
      test.assertEquals(sanitizeInput(undefined), '', 'Should return empty string for undefined');
    });

    // Test validatePasswordStrength
    test('validatePasswordStrength validates strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123!');
      test.assertTruthy(result.valid, 'Should accept strong password');
      test.assert(result.score >= 4, 'Should have score >= 4');
    });

    test('validatePasswordStrength rejects weak passwords', () => {
      const result1 = validatePasswordStrength('short');
      test.assertFalsy(result1.valid, 'Should reject short password');

      const result2 = validatePasswordStrength('onlylowercase');
      test.assertFalsy(result2.valid, 'Should reject password without uppercase/numbers');
    });

    test('validatePasswordStrength provides feedback', () => {
      const result = validatePasswordStrength('weak');
      test.assert(Array.isArray(result.feedback), 'Should provide feedback array');
      test.assert(result.feedback.length > 0, 'Should have feedback items');
    });

    test('validatePasswordStrength handles null/undefined', () => {
      const result1 = validatePasswordStrength(null);
      test.assertFalsy(result1.valid, 'Should reject null password');

      const result2 = validatePasswordStrength(undefined);
      test.assertFalsy(result2.valid, 'Should reject undefined password');
    });
  });

  return await suite.run();
}








