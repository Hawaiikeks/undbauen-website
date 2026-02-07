/**
 * Components Tests
 * Tests for UI components
 */

import { describe, it, expect } from './test-framework.js';

describe('Components', () => {
  describe('Sidebar', () => {
    it('should export getNavigationItems function', async () => {
      const { getNavigationItems } = await import('../assets/js/components/sidebar.js');
      expect(typeof getNavigationItems).toBe('function');
    });

    it('should return navigation items for member role', async () => {
      const { getNavigationItems } = await import('../assets/js/components/sidebar.js');
      const items = getNavigationItems('member');
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return navigation items for admin role', async () => {
      const { getNavigationItems } = await import('../assets/js/components/sidebar.js');
      const items = getNavigationItems('admin');
      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
    });

    it('should have dashboard item for all roles', async () => {
      const { getNavigationItems } = await import('../assets/js/components/sidebar.js');
      const memberItems = getNavigationItems('member');
      const adminItems = getNavigationItems('admin');
      
      const memberHasDashboard = memberItems.some(item => item.id === 'dashboard');
      const adminHasDashboard = adminItems.some(item => item.id === 'dashboard');
      
      expect(memberHasDashboard).toBe(true);
      expect(adminHasDashboard).toBe(true);
    });
  });

  describe('Icons', () => {
    it('should export getIcon function', async () => {
      const { getIcon } = await import('../assets/js/components/icons.js');
      expect(typeof getIcon).toBe('function');
    });

    it('should return SVG for known icon', async () => {
      const { getIcon } = await import('../assets/js/components/icons.js');
      const icon = getIcon('dashboard');
      expect(icon).toBeDefined();
      expect(typeof icon).toBe('string');
    });
  });

  describe('Toast', () => {
    it('should export toast object', async () => {
      const { toast } = await import('../assets/js/components/toast.js');
      expect(toast).toBeDefined();
    });

    it('should have success method', async () => {
      const { toast } = await import('../assets/js/components/toast.js');
      expect(typeof toast.success).toBe('function');
    });

    it('should have error method', async () => {
      const { toast } = await import('../assets/js/components/toast.js');
      expect(typeof toast.error).toBe('function');
    });
  });
});
