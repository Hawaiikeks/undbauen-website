/**
 * Router Tests
 * Tests for router functionality and route definitions
 */

import { describe, it, expect, beforeEach } from './test-framework.js';
import { routes, getCurrentPath, getCurrentRoute, getPageFromPath, routeExists } from '../assets/js/services/router.js';

describe('Router', () => {
  describe('Route Definitions', () => {
    it('should have public routes defined', () => {
      expect(routes.public).toBeDefined();
      expect(routes.public['/']).toBeDefined();
      expect(routes.public['/'].page).toBe('public');
    });

    it('should have member routes defined', () => {
      expect(routes.member).toBeDefined();
      expect(routes.member['/app/dashboard.html']).toBeDefined();
      expect(routes.member['/app/dashboard.html'].page).toBe('dashboard');
    });

    it('should have backoffice routes defined', () => {
      expect(routes.backoffice).toBeDefined();
      expect(routes.backoffice['/backoffice/inbox.html']).toBeDefined();
      expect(routes.backoffice['/backoffice/inbox.html'].page).toBe('inbox');
    });
  });

  describe('getPageFromPath', () => {
    it('should extract page from member route', () => {
      const page = getPageFromPath('/app/dashboard.html');
      expect(page).toBe('dashboard');
    });

    it('should extract page from backoffice route', () => {
      const page = getPageFromPath('/backoffice/inbox.html');
      expect(page).toBe('inbox');
    });

    it('should return null for unknown route', () => {
      const page = getPageFromPath('/unknown/route.html');
      expect(page).toBeNull();
    });
  });

  describe('routeExists', () => {
    it('should return true for existing routes', () => {
      expect(routeExists('/app/dashboard.html')).toBe(true);
      expect(routeExists('/backoffice/inbox.html')).toBe(true);
    });

    it('should return false for non-existing routes', () => {
      expect(routeExists('/unknown/route.html')).toBe(false);
    });
  });
});
