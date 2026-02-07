/**
 * Error Handler Tests
 * Tests for error handling functionality
 */

import { describe, it, expect } from './test-framework.js';
import { handleError, ErrorCategory } from '../assets/js/services/errorHandler.js';

describe('Error Handler', () => {
  describe('Error Categorization', () => {
    it('should categorize network errors', () => {
      const error = new Error('Failed to fetch');
      const result = handleError(error);
      expect(result.category).toBe(ErrorCategory.NETWORK);
    });

    it('should categorize permission errors', () => {
      const error = new Error('Unauthorized access');
      const result = handleError(error);
      expect(result.category).toBe(ErrorCategory.PERMISSION);
    });

    it('should categorize validation errors', () => {
      const error = 'Dieses Feld ist erforderlich';
      const result = handleError(error);
      expect(result.category).toBe(ErrorCategory.VALIDATION);
    });
  });

  describe('Error Handling', () => {
    it('should return error info object', () => {
      const error = new Error('Test error');
      const result = handleError(error);
      expect(result).toBeDefined();
      expect(result.message).toBeDefined();
      expect(result.category).toBeDefined();
    });

    it('should include context in error info', () => {
      const error = new Error('Test error');
      const context = { page: 'dashboard', action: 'render' };
      const result = handleError(error, context);
      expect(result.context).toBeDefined();
    });
  });
});
