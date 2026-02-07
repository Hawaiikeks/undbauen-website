/**
 * Page Modules Tests
 * Tests for page rendering functions
 */

import { describe, it, expect } from './test-framework.js';

describe('Page Modules', () => {
  describe('Exports', () => {
    it('should export all required render functions', async () => {
      const pageModules = await import('../assets/js/pages/index.js');
      
      // Check main pages
      expect(pageModules.renderDashboard).toBeDefined();
      expect(pageModules.renderEvents).toBeDefined();
      expect(pageModules.renderTickets).toBeDefined();
      expect(pageModules.renderForum).toBeDefined();
      expect(pageModules.renderMessages).toBeDefined();
      expect(pageModules.renderMembers).toBeDefined();
      expect(pageModules.renderMyProfile).toBeDefined();
      expect(pageModules.renderMonatsupdates).toBeDefined();
      expect(pageModules.renderAdmin).toBeDefined();
      
      // Check admin pages
      expect(pageModules.renderResources).toBeDefined();
      expect(pageModules.renderResourcesAdmin).toBeDefined();
      expect(pageModules.renderKnowledge).toBeDefined();
      expect(pageModules.renderKnowledgeAdmin).toBeDefined();
      expect(pageModules.renderPublicPagesEditor).toBeDefined();
      expect(pageModules.renderInbox).toBeDefined();
      expect(pageModules.renderReports).toBeDefined();
      expect(pageModules.renderAudit).toBeDefined();
    });

    it('should have render functions as functions', async () => {
      const pageModules = await import('../assets/js/pages/index.js');
      
      expect(typeof pageModules.renderDashboard).toBe('function');
      expect(typeof pageModules.renderTickets).toBe('function');
      expect(typeof pageModules.renderForum).toBe('function');
    });
  });

  describe('Dashboard', () => {
    it('should export renderDashboard function', async () => {
      const { renderDashboard } = await import('../assets/js/pages/dashboard.js');
      expect(typeof renderDashboard).toBe('function');
    });
  });

  describe('Tickets', () => {
    it('should export renderTickets function', async () => {
      const { renderTickets } = await import('../assets/js/pages/tickets.js');
      expect(typeof renderTickets).toBe('function');
    });
  });

  describe('Forum', () => {
    it('should export renderForum function', async () => {
      const { renderForum } = await import('../assets/js/pages/forum.js');
      expect(typeof renderForum).toBe('function');
    });

    it('should export renderForumCategory function', async () => {
      const { renderForumCategory } = await import('../assets/js/pages/forumCategory.js');
      expect(typeof renderForumCategory).toBe('function');
    });

    it('should export renderForumThread function', async () => {
      const { renderForumThread } = await import('../assets/js/pages/forumThread.js');
      expect(typeof renderForumThread).toBe('function');
    });
  });
});
