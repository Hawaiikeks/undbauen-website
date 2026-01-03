/* Admin Test Runner: Automatisiertes Testen von Admin-Funktionen */

import { api } from '../services/apiClient.js';
import { ticketRepository } from '../services/repositories/ticketRepository.js';
import { resourceRepository } from '../services/repositories/resourceRepository.js';
import { knowledgeRepository } from '../services/repositories/knowledgeRepository.js';
import { userRepository } from '../services/repositories/userRepository.js';
import { toast } from '../components/toast.js';

/**
 * Admin Test Suite
 */
export class AdminTestRunner {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  /**
   * Run all admin tests
   */
  async runAllTests() {
    console.log('🧪 Starting Admin Tests...');
    this.results = [];
    this.errors = [];

    try {
      await this.testContentCreation();
      await this.testEventManagement();
      await this.testUserManagement();
      await this.testDeletion();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.errors.push({ test: 'Test Suite', error: error.message });
    }
  }

  /**
   * Test content creation
   */
  async testContentCreation() {
    console.log('📝 Testing Content Creation...');
    
    // Test 1: Create Resource
    try {
      const testResource = {
        title: 'Test Resource',
        description: 'Test Description',
        type: 'file',
        tags: ['test'],
        visibility: 'member',
        isFeatured: false,
        createdByUserId: api.me()?.id || 'test_user'
      };
      
      const created = await resourceRepository.create(testResource);
      if (created && created.id) {
        this.results.push({ test: 'Create Resource', status: '✅ PASS' });
        // Cleanup
        await resourceRepository.delete(created.id);
      } else {
        throw new Error('Resource creation failed');
      }
    } catch (error) {
      this.results.push({ test: 'Create Resource', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Create Resource', error: error.message });
    }

    // Test 2: Create Knowledge Item
    try {
      const testKnowledge = {
        title: 'Test Knowledge Item',
        summary: 'Test Summary',
        type: 'article',
        tags: ['test'],
        status: 'draft',
        createdByUserId: api.me()?.id || 'test_user'
      };
      
      const created = await knowledgeRepository.create(testKnowledge);
      if (created && created.id) {
        this.results.push({ test: 'Create Knowledge Item', status: '✅ PASS' });
        // Cleanup
        await knowledgeRepository.delete(created.id);
      } else {
        throw new Error('Knowledge item creation failed');
      }
    } catch (error) {
      this.results.push({ test: 'Create Knowledge Item', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Create Knowledge Item', error: error.message });
    }
  }

  /**
   * Test event management
   */
  async testEventManagement() {
    console.log('📅 Testing Event Management...');
    
    try {
      // Check if events can be listed
      const events = api.listEvents();
      if (Array.isArray(events)) {
        this.results.push({ test: 'List Events', status: '✅ PASS' });
      } else {
        throw new Error('Events list is not an array');
      }
    } catch (error) {
      this.results.push({ test: 'List Events', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'List Events', error: error.message });
    }

    // Note: Event creation/deletion would require access to the event API
    // This is a placeholder for the actual implementation
    this.results.push({ test: 'Event CRUD', status: '⚠️ SKIP (requires event API)' });
  }

  /**
   * Test user management
   */
  async testUserManagement() {
    console.log('👥 Testing User Management...');
    
    // Test 1: List Users
    try {
      const users = await userRepository.findAll();
      if (Array.isArray(users)) {
        this.results.push({ test: 'List Users', status: '✅ PASS' });
      } else {
        throw new Error('Users list is not an array');
      }
    } catch (error) {
      this.results.push({ test: 'List Users', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'List Users', error: error.message });
    }

    // Test 2: Update User
    try {
      const users = await userRepository.findAll();
      if (users.length > 0) {
        const testUser = users[0];
        const originalName = testUser.name;
        
        const updated = await userRepository.update(testUser.id, {
          name: 'Test Updated Name'
        });
        
        if (updated && updated.name === 'Test Updated Name') {
          this.results.push({ test: 'Update User', status: '✅ PASS' });
          // Restore original name
          await userRepository.update(testUser.id, { name: originalName });
        } else {
          throw new Error('User update failed');
        }
      } else {
        this.results.push({ test: 'Update User', status: '⚠️ SKIP (no users found)' });
      }
    } catch (error) {
      this.results.push({ test: 'Update User', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Update User', error: error.message });
    }

    // Test 3: Block User (Status change)
    try {
      const users = await userRepository.findAll();
      if (users.length > 0) {
        const testUser = users[0];
        const originalStatus = testUser.status;
        
        // Block user
        const blocked = await userRepository.update(testUser.id, {
          status: 'inactive'
        });
        
        if (blocked && blocked.status === 'inactive') {
          this.results.push({ test: 'Block User', status: '✅ PASS' });
          // Restore original status
          await userRepository.update(testUser.id, { status: originalStatus });
        } else {
          throw new Error('User block failed');
        }
      } else {
        this.results.push({ test: 'Block User', status: '⚠️ SKIP (no users found)' });
      }
    } catch (error) {
      this.results.push({ test: 'Block User', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Block User', error: error.message });
    }
  }

  /**
   * Test deletion
   */
  async testDeletion() {
    console.log('🗑️ Testing Deletion...');
    
    // Test 1: Delete Resource
    try {
      const testResource = {
        title: 'Test Resource for Deletion',
        description: 'Will be deleted',
        type: 'file',
        tags: ['test'],
        visibility: 'member',
        createdByUserId: api.me()?.id || 'test_user'
      };
      
      const created = await resourceRepository.create(testResource);
      const deleted = await resourceRepository.delete(created.id);
      
      if (deleted) {
        const found = await resourceRepository.findById(created.id);
        if (!found) {
          this.results.push({ test: 'Delete Resource', status: '✅ PASS' });
        } else {
          throw new Error('Resource still exists after deletion');
        }
      } else {
        throw new Error('Deletion returned false');
      }
    } catch (error) {
      this.results.push({ test: 'Delete Resource', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Delete Resource', error: error.message });
    }

    // Test 2: Delete Knowledge Item
    try {
      const testKnowledge = {
        title: 'Test Knowledge for Deletion',
        summary: 'Will be deleted',
        type: 'article',
        tags: ['test'],
        status: 'draft',
        createdByUserId: api.me()?.id || 'test_user'
      };
      
      const created = await knowledgeRepository.create(testKnowledge);
      const deleted = await knowledgeRepository.delete(created.id);
      
      if (deleted) {
        const found = await knowledgeRepository.findById(created.id);
        if (!found) {
          this.results.push({ test: 'Delete Knowledge Item', status: '✅ PASS' });
        } else {
          throw new Error('Knowledge item still exists after deletion');
        }
      } else {
        throw new Error('Deletion returned false');
      }
    } catch (error) {
      this.results.push({ test: 'Delete Knowledge Item', status: '❌ FAIL', error: error.message });
      this.errors.push({ test: 'Delete Knowledge Item', error: error.message });
    }
  }

  /**
   * Print test results
   */
  printResults() {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    this.results.forEach(result => {
      console.log(`${result.status} - ${result.test}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    const passed = this.results.filter(r => r.status === '✅ PASS').length;
    const failed = this.results.filter(r => r.status === '❌ FAIL').length;
    const skipped = this.results.filter(r => r.status.includes('SKIP')).length;
    
    console.log('\n📈 Summary:');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Skipped: ${skipped}`);
    console.log(`📊 Total: ${this.results.length}`);
    
    if (this.errors.length > 0) {
      console.log('\n❌ Errors:');
      this.errors.forEach(err => {
        console.log(`   ${err.test}: ${err.error}`);
      });
    }
    
    // Show toast notification
    if (failed === 0) {
      toast.success(`✅ Alle Tests bestanden! (${passed}/${this.results.length})`);
    } else {
      toast.error(`❌ ${failed} Test(s) fehlgeschlagen`);
    }
  }

  /**
   * Get test results as JSON
   */
  getResults() {
    return {
      results: this.results,
      errors: this.errors,
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.status === '✅ PASS').length,
        failed: this.results.filter(r => r.status === '❌ FAIL').length,
        skipped: this.results.filter(r => r.status.includes('SKIP')).length
      }
    };
  }
}

// Export singleton instance
export const adminTestRunner = new AdminTestRunner();

// Make available globally for console access
if (typeof window !== 'undefined') {
  window.adminTestRunner = adminTestRunner;
  window.runAdminTests = () => adminTestRunner.runAllTests();
}


