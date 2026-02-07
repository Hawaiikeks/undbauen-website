/**
 * Services Tests
 * Tests for service modules
 */

import { describe, it, expect } from './test-framework.js';

describe('Services', () => {
  describe('API Client', () => {
    it('should export api object', async () => {
      const { api } = await import('../assets/js/services/apiClient.js');
      expect(api).toBeDefined();
    });

    it('should have isLoggedIn method', async () => {
      const { api } = await import('../assets/js/services/apiClient.js');
      expect(typeof api.isLoggedIn).toBe('function');
    });

    it('should have me method', async () => {
      const { api } = await import('../assets/js/services/apiClient.js');
      expect(typeof api.me).toBe('function');
    });

    it('should have login method', async () => {
      const { api } = await import('../assets/js/services/apiClient.js');
      expect(typeof api.login).toBe('function');
    });

    it('should have logout method', async () => {
      const { api } = await import('../assets/js/services/apiClient.js');
      expect(typeof api.logout).toBe('function');
    });
  });

  describe('Auth Guard', () => {
    it('should export guardRoute function', async () => {
      const { guardRoute } = await import('../assets/js/services/authGuard.js');
      expect(typeof guardRoute).toBe('function');
    });

    it('should export hasRequiredRole function', async () => {
      const { hasRequiredRole } = await import('../assets/js/services/authGuard.js');
      expect(typeof hasRequiredRole).toBe('function');
    });

    it('should export hasAnyRole function', async () => {
      const { hasAnyRole } = await import('../assets/js/services/authGuard.js');
      expect(typeof hasAnyRole).toBe('function');
    });
  });

  describe('Error Handler', () => {
    it('should export handleError function', async () => {
      const { handleError } = await import('../assets/js/services/errorHandler.js');
      expect(typeof handleError).toBe('function');
    });

    it('should export ErrorCategory enum', async () => {
      const { ErrorCategory } = await import('../assets/js/services/errorHandler.js');
      expect(ErrorCategory).toBeDefined();
      expect(ErrorCategory.NETWORK).toBe('network');
      expect(ErrorCategory.VALIDATION).toBe('validation');
      expect(ErrorCategory.PERMISSION).toBe('permission');
    });
  });

  describe('Router', () => {
    it('should export routes object', async () => {
      const { routes } = await import('../assets/js/services/router.js');
      expect(routes).toBeDefined();
      expect(routes.public).toBeDefined();
      expect(routes.member).toBeDefined();
      expect(routes.backoffice).toBeDefined();
    });

    it('should export getCurrentPath function', async () => {
      const { getCurrentPath } = await import('../assets/js/services/router.js');
      expect(typeof getCurrentPath).toBe('function');
    });

    it('should export getPageFromPath function', async () => {
      const { getPageFromPath } = await import('../assets/js/services/router.js');
      expect(typeof getPageFromPath).toBe('function');
    });
  });
});
