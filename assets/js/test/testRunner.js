/**
 * Simple Test Runner
 *
 * Lightweight test framework for unit testing.
 * Works in both browser and Node.js environments.
 *
 * @module test/testRunner
 */

/**
 * Test Runner Class
 */
export class TestRunner {
  constructor() {
    this.tests = [];
    this.results = [];
    this.beforeEach = null;
    this.afterEach = null;
  }

  /**
   * Register a test
   * @param {string} name - Test name
   * @param {Function} fn - Test function
   */
  test(name, fn) {
    this.tests.push({ name, fn });
  }

  /**
   * Register beforeEach hook
   * @param {Function} fn - Hook function
   */
  beforeEach(fn) {
    this.beforeEach = fn;
  }

  /**
   * Register afterEach hook
   * @param {Function} fn - Hook function
   */
  afterEach(fn) {
    this.afterEach = fn;
  }

  /**
   * Assert that condition is true
   * @param {boolean} condition - Condition to check
   * @param {string} message - Error message
   * @throws {Error} If condition is false
   */
  assert(condition, message = 'Assertion failed') {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Assert that two values are equal
   * @param {*} actual - Actual value
   * @param {*} expected - Expected value
   * @param {string} message - Error message
   */
  assertEquals(actual, expected, message = `Expected ${expected}, got ${actual}`) {
    if (actual !== expected) {
      throw new Error(message);
    }
  }

  /**
   * Assert that value is truthy
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  assertTruthy(value, message = `Expected truthy value, got ${value}`) {
    if (!value) {
      throw new Error(message);
    }
  }

  /**
   * Assert that value is falsy
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  assertFalsy(value, message = `Expected falsy value, got ${value}`) {
    if (value) {
      throw new Error(message);
    }
  }

  /**
   * Assert that value is null or undefined
   * @param {*} value - Value to check
   * @param {string} message - Error message
   */
  assertNull(value, message = `Expected null/undefined, got ${value}`) {
    if (value !== null && value !== undefined) {
      throw new Error(message);
    }
  }

  /**
   * Assert that array contains item
   * @param {Array} array - Array to check
   * @param {*} item - Item to find
   * @param {string} message - Error message
   */
  assertContains(array, item, message = `Array does not contain ${item}`) {
    if (!Array.isArray(array) || !array.includes(item)) {
      throw new Error(message);
    }
  }

  /**
   * Assert that function throws error
   * @param {Function} fn - Function to test
   * @param {string} expectedError - Expected error message (optional)
   */
  assertThrows(fn, expectedError = null) {
    try {
      fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !error.message.includes(expectedError)) {
        throw new Error(
          `Expected error message to include "${expectedError}", got "${error.message}"`
        );
      }
    }
  }

  /**
   * Run all tests
   * @returns {Promise<Object>} Test results
   */
  async run() {
    this.results = [];
    let passed = 0;
    let failed = 0;

    console.log(`\n🧪 Running ${this.tests.length} test(s)...\n`);

    for (const test of this.tests) {
      try {
        // Run beforeEach hook
        if (this.beforeEach) {
          await this.beforeEach();
        }

        // Run test
        await test.fn();

        // Run afterEach hook
        if (this.afterEach) {
          await this.afterEach();
        }

        this.results.push({
          name: test.name,
          status: 'PASS',
          error: null
        });
        passed++;
        console.log(`✅ ${test.name}`);
      } catch (error) {
        this.results.push({
          name: test.name,
          status: 'FAIL',
          error: error.message
        });
        failed++;
        console.error(`❌ ${test.name}: ${error.message}`);
      }
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed, ${this.tests.length} total\n`);

    return {
      total: this.tests.length,
      passed,
      failed,
      results: this.results
    };
  }

  /**
   * Get test results
   * @returns {Array} Test results
   */
  getResults() {
    return this.results;
  }
}

/**
 * Create a new test suite
 * @param {string} suiteName - Suite name
 * @param {Function} fn - Suite function
 */
export function describe(suiteName, fn) {
  const runner = new TestRunner();
  fn(runner);
  return runner;
}

/**
 * Export singleton instance
 */
export const testRunner = new TestRunner();








