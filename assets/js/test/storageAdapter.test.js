/**
 * Unit Tests for storageAdapter.js
 *
 * Note: These tests use a mock localStorage to avoid side effects
 *
 * @module test/storageAdapter.test
 */

import { describe } from './testRunner.js';

// Mock localStorage for testing
function createMockStorage() {
  const storage = {};
  return {
    getItem: key => storage[key] || null,
    setItem: (key, value) => {
      storage[key] = value;
    },
    removeItem: key => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }
  };
}

/**
 * Run storageAdapter tests
 * @returns {Promise<Object>} Test results
 */
export async function runStorageAdapterTests() {
  // Note: These are basic structure tests
  // Full integration tests would require actual localStorage setup

  const suite = describe('StorageAdapter Tests', test => {
    test('storageAdapter exports required functions', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test auth functions
      test.assert(typeof storageAdapter.login === 'function', 'login should be a function');
      test.assert(typeof storageAdapter.register === 'function', 'register should be a function');
      test.assert(typeof storageAdapter.logout === 'function', 'logout should be a function');
      test.assert(typeof storageAdapter.me === 'function', 'me should be a function');
      test.assert(
        typeof storageAdapter.isLoggedIn === 'function',
        'isLoggedIn should be a function'
      );

      // Test profile functions
      test.assert(
        typeof storageAdapter.getProfileByEmail === 'function',
        'getProfileByEmail should be a function'
      );
      test.assert(
        typeof storageAdapter.updateMyProfile === 'function',
        'updateMyProfile should be a function'
      );
      test.assert(
        typeof storageAdapter.listMembers === 'function',
        'listMembers should be a function'
      );

      // Test event functions
      test.assert(
        typeof storageAdapter.listEvents === 'function',
        'listEvents should be a function'
      );
      test.assert(typeof storageAdapter.getEvent === 'function', 'getEvent should be a function');
      test.assert(typeof storageAdapter.bookEvent === 'function', 'bookEvent should be a function');

      // Test forum functions
      test.assert(
        typeof storageAdapter.listForumCategories === 'function',
        'listForumCategories should be a function'
      );
      test.assert(
        typeof storageAdapter.createForumThread === 'function',
        'createForumThread should be a function'
      );

      // Test message functions
      test.assert(
        typeof storageAdapter.sendMessage === 'function',
        'sendMessage should be a function'
      );
      test.assert(
        typeof storageAdapter.getThreads === 'function',
        'getThreads should be a function'
      );
    });

    test('login validates email parameter', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null email
      const result1 = await storageAdapter.login(null, 'password');
      test.assertFalsy(result1.ok, 'Should fail with null email');
      test.assert(result1.error.includes('E-Mail'), 'Should return email error');

      // Test with empty email
      const result2 = await storageAdapter.login('', 'password');
      test.assertFalsy(result2.ok, 'Should fail with empty email');

      // Test with invalid email type
      const result3 = await storageAdapter.login(123, 'password');
      test.assertFalsy(result3.ok, 'Should fail with non-string email');
    });

    test('login validates password parameter', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null password
      const result1 = await storageAdapter.login('test@example.com', null);
      test.assertFalsy(result1.ok, 'Should fail with null password');
      test.assert(result1.error.includes('Passwort'), 'Should return password error');

      // Test with empty password
      const result2 = await storageAdapter.login('test@example.com', '');
      test.assertFalsy(result2.ok, 'Should fail with empty password');
    });

    test('register validates parameters', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with invalid name
      const result1 = await storageAdapter.register('', 'test@example.com', 'password123');
      test.assertFalsy(result1.ok, 'Should fail with empty name');

      // Test with invalid email
      const result2 = await storageAdapter.register('Test User', 'invalid-email', 'password123');
      test.assertFalsy(result2.ok, 'Should fail with invalid email');

      // Test with short password
      const result3 = await storageAdapter.register('Test User', 'test@example.com', 'short');
      test.assertFalsy(result3.ok, 'Should fail with short password');
    });

    test('getProfileByEmail handles invalid input', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null
      const result1 = storageAdapter.getProfileByEmail(null);
      test.assertNull(result1, 'Should return null for null email');

      // Test with empty string
      const result2 = storageAdapter.getProfileByEmail('');
      test.assertNull(result2, 'Should return null for empty email');

      // Test with non-string
      const result3 = storageAdapter.getProfileByEmail(123);
      test.assertNull(result3, 'Should return null for non-string email');
    });

    test('updateMyProfile validates payload', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null payload
      const result1 = storageAdapter.updateMyProfile(null);
      test.assertFalsy(result1.ok, 'Should fail with null payload');

      // Test with non-object payload
      const result2 = storageAdapter.updateMyProfile('invalid');
      test.assertFalsy(result2.ok, 'Should fail with non-object payload');
    });

    test('bookEvent validates eventId', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null eventId
      const result1 = storageAdapter.bookEvent(null);
      test.assertFalsy(result1.ok, 'Should fail with null eventId');

      // Test with empty eventId
      const result2 = storageAdapter.bookEvent('');
      test.assertFalsy(result2.ok, 'Should fail with empty eventId');
    });

    test('sendMessage validates parameters', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null to
      const result1 = storageAdapter.sendMessage({ to: null, subject: 'Test', body: 'Test' });
      test.assertFalsy(result1.ok, 'Should fail with null recipient');

      // Test with empty to
      const result2 = storageAdapter.sendMessage({ to: '', subject: 'Test', body: 'Test' });
      test.assertFalsy(result2.ok, 'Should fail with empty recipient');
    });

    test('createForumThread validates parameters', async () => {
      const { storageAdapter } = await import('../services/storageAdapter.js');

      // Test with null categoryId
      const result1 = storageAdapter.createForumThread(null, 'Title', 'Body');
      test.assertFalsy(result1.ok, 'Should fail with null categoryId');

      // Test with empty title
      const result2 = storageAdapter.createForumThread('cat1', '', 'Body');
      test.assertFalsy(result2.ok, 'Should fail with empty title');

      // Test with empty body
      const result3 = storageAdapter.createForumThread('cat1', 'Title', '');
      test.assertFalsy(result3.ok, 'Should fail with empty body');
    });
  });

  return await suite.run();
}








