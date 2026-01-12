/**
 * Unit Tests for utils.js
 *
 * @module test/utils.test
 */

import { describe } from './testRunner.js';
import {
  fmtDate,
  parseTags,
  debounce,
  formatFileSize,
  extractTeamsLink,
  calculateEndTime,
  commonTags
} from '../utils.js';

/**
 * Run utils tests
 * @returns {Promise<Object>} Test results
 */
export async function runUtilsTests() {
  const suite = describe('Utils Tests', test => {
    // Test fmtDate
    test('fmtDate formats date correctly', () => {
      const event = { date: '2026-01-15', time: '18:00' };
      const result = fmtDate(event);
      test.assertEquals(result, '15.01.2026 18:00', 'Date should be formatted as DD.MM.YYYY HH:MM');
    });

    test('fmtDate handles invalid date', () => {
      const event = { date: 'invalid', time: '18:00' };
      const result = fmtDate(event);
      test.assert(result.includes('18:00'), 'Should still include time');
    });

    // Test parseTags
    test('parseTags parses comma-separated tags', () => {
      const result = parseTags('tag1, tag2, tag3');
      test.assertEquals(result.length, 3, 'Should parse 3 tags');
      test.assertContains(result, 'tag1');
      test.assertContains(result, 'tag2');
      test.assertContains(result, 'tag3');
    });

    test('parseTags removes duplicates', () => {
      const result = parseTags('tag1, tag1, tag2');
      test.assertEquals(result.length, 2, 'Should remove duplicates');
    });

    test('parseTags handles empty string', () => {
      const result = parseTags('');
      test.assertEquals(result.length, 0, 'Should return empty array for empty string');
    });

    test('parseTags handles null/undefined', () => {
      const result1 = parseTags(null);
      const result2 = parseTags(undefined);
      test.assertEquals(result1.length, 0, 'Should handle null');
      test.assertEquals(result2.length, 0, 'Should handle undefined');
    });

    // Test formatFileSize
    test('formatFileSize formats bytes correctly', () => {
      test.assertEquals(formatFileSize(0), '0 Bytes');
      test.assertEquals(formatFileSize(1024), '1 KB');
      test.assertEquals(formatFileSize(1048576), '1 MB');
    });

    test('formatFileSize handles null/undefined', () => {
      test.assertEquals(formatFileSize(null), '0 Bytes');
      test.assertEquals(formatFileSize(undefined), '0 Bytes');
    });

    // Test extractTeamsLink
    test('extractTeamsLink extracts Teams URL', () => {
      const location = 'Join here: https://teams.microsoft.com/l/meetup-join/...';
      const result = extractTeamsLink(location);
      test.assertTruthy(result, 'Should extract Teams link');
      test.assert(result.includes('teams.microsoft.com'), 'Should contain Teams domain');
    });

    test('extractTeamsLink returns null for no link', () => {
      const result = extractTeamsLink('No link here');
      test.assertNull(result, 'Should return null when no link found');
    });

    test('extractTeamsLink handles null/undefined', () => {
      test.assertNull(extractTeamsLink(null));
      test.assertNull(extractTeamsLink(undefined));
    });

    // Test calculateEndTime
    test('calculateEndTime calculates end time correctly', () => {
      const result = calculateEndTime('18:00', 90);
      test.assertEquals(result, '19:30', 'Should add 90 minutes to 18:00');
    });

    test('calculateEndTime handles null inputs', () => {
      const result = calculateEndTime(null, 90);
      test.assertNull(result, 'Should return null for null start time');
    });

    // Test commonTags
    test('commonTags finds common tags', () => {
      const a = { skills: ['BIM', 'Revit'], interests: ['Nachhaltigkeit'] };
      const b = { skills: ['BIM', 'AutoCAD'], interests: ['Nachhaltigkeit'] };
      const result = commonTags(a, b);
      test.assertContains(result, 'BIM');
      test.assertContains(result, 'Nachhaltigkeit');
      test.assertEquals(result.length, 2, 'Should find 2 common tags');
    });

    test('commonTags handles empty profiles', () => {
      const result = commonTags({}, {});
      test.assertEquals(result.length, 0, 'Should return empty array for empty profiles');
    });

    // Test debounce (async test)
    test('debounce delays function execution', async () => {
      let callCount = 0;
      const debouncedFn = debounce(() => {
        callCount++;
      }, 100);

      debouncedFn();
      debouncedFn();
      debouncedFn();

      test.assertEquals(callCount, 0, 'Function should not be called immediately');

      await new Promise(resolve => setTimeout(resolve, 150));
      test.assertEquals(callCount, 1, 'Function should be called once after delay');
    });
  });

  return await suite.run();
}








