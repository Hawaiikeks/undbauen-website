/**
 * Run All Unit Tests
 *
 * Executes all test suites and displays results.
 * Can be run in browser console or Node.js.
 *
 * @module test/runAllTests
 */

import { runUtilsTests } from './utils.test.js';
import { runStorageAdapterTests } from './storageAdapter.test.js';
import { runValidationTests } from './validation.test.js';

/**
 * Run all test suites
 * @returns {Promise<Object>} Combined test results
 */
export async function runAllTests() {
  console.log('🧪 Starting All Unit Tests...\n');
  console.log('='.repeat(50));

  const allResults = {
    suites: [],
    total: 0,
    passed: 0,
    failed: 0
  };

  try {
    // Run utils tests
    console.log('\n📦 Running Utils Tests...');
    const utilsResults = await runUtilsTests();
    allResults.suites.push({ name: 'Utils', ...utilsResults });
    allResults.total += utilsResults.total;
    allResults.passed += utilsResults.passed;
    allResults.failed += utilsResults.failed;
  } catch (error) {
    console.error('❌ Utils tests failed:', error);
    allResults.failed++;
  }

  try {
    // Run validation tests
    console.log('\n🔍 Running Validation Tests...');
    const validationResults = await runValidationTests();
    allResults.suites.push({ name: 'Validation', ...validationResults });
    allResults.total += validationResults.total;
    allResults.passed += validationResults.passed;
    allResults.failed += validationResults.failed;
  } catch (error) {
    console.error('❌ Validation tests failed:', error);
    allResults.failed++;
  }

  try {
    // Run storageAdapter tests
    console.log('\n💾 Running StorageAdapter Tests...');
    const storageResults = await runStorageAdapterTests();
    allResults.suites.push({ name: 'StorageAdapter', ...storageResults });
    allResults.total += storageResults.total;
    allResults.passed += storageResults.passed;
    allResults.failed += storageResults.failed;
  } catch (error) {
    console.error('❌ StorageAdapter tests failed:', error);
    allResults.failed++;
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Summary');
  console.log('='.repeat(50));
  console.log(`Total Tests: ${allResults.total}`);
  console.log(`✅ Passed: ${allResults.passed}`);
  console.log(`❌ Failed: ${allResults.failed}`);
  console.log(
    `Success Rate: ${allResults.total > 0 ? ((allResults.passed / allResults.total) * 100).toFixed(1) : 0}%`
  );

  // Print suite breakdown
  console.log('\n📋 Suite Breakdown:');
  allResults.suites.forEach(suite => {
    const rate = suite.total > 0 ? ((suite.passed / suite.total) * 100).toFixed(1) : 0;
    console.log(`  ${suite.name}: ${suite.passed}/${suite.total} (${rate}%)`);
  });

  // Show failed tests
  if (allResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    allResults.suites.forEach(suite => {
      suite.results.forEach(result => {
        if (result.status === 'FAIL') {
          console.log(`  - ${suite.name}: ${result.name} - ${result.error}`);
        }
      });
    });
  }

  return allResults;
}

// Make available globally for browser console
if (typeof window !== 'undefined') {
  window.runAllTests = runAllTests;
}

// Export for Node.js
export default runAllTests;








