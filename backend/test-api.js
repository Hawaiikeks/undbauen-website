/**
 * API Test Script
 * Tests the backend API endpoints
 */

const API_BASE = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function test(endpoint, method = 'GET', body = null, token = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

async function runTests() {
  log('\n🧪 Backend API Tests\n', 'blue');
  log('='.repeat(50), 'blue');

  // Test 1: Health Check
  log('\n1. Health Check', 'yellow');
  const healthResponse = await fetch('http://localhost:3000/health');
  const healthData = await healthResponse.json();
  const health = {
    status: healthResponse.status,
    ok: healthResponse.ok,
    data: healthData
  };
  if (health.ok && health.data.status === 'ok') {
    log('   ✅ Server is running', 'green');
    log(`   ✅ Database: ${health.data.database}`, 'green');
  } else {
    log('   ⚠️  Server is running but database connection failed', 'yellow');
    log(`   Error: ${health.data?.error || health.error}`, 'red');
    log('   Note: This is expected if PostgreSQL is not running', 'yellow');
  }

  // Test 2: Register
  log('\n2. Register User', 'yellow');
  const registerResult = await test('/auth/register', 'POST', {
    email: 'test@example.com',
    password: 'test1234',
    firstName: 'Test',
    lastName: 'User'
  });

  if (registerResult.ok) {
    log('   ✅ User registered successfully', 'green');
    log(`   Token: ${registerResult.data.token.substring(0, 20)}...`, 'green');
    const token = registerResult.data.token;

    // Test 3: Get Me
    log('\n3. Get Current User', 'yellow');
    const meResult = await test('/auth/me', 'GET', null, token);
    if (meResult.ok) {
      log('   ✅ User info retrieved', 'green');
      log(`   Email: ${meResult.data.email}`, 'green');
    } else {
      log(`   ❌ Failed: ${meResult.data?.error || meResult.error}`, 'red');
    }

    // Test 4: Update Profile
    log('\n4. Update Profile', 'yellow');
    const profileResult = await test('/profiles/me', 'PUT', {
      bio: 'Test bio',
      company: 'Test Company',
      position: 'Developer'
    }, token);

    if (profileResult.ok) {
      log('   ✅ Profile updated', 'green');
    } else {
      log(`   ❌ Failed: ${profileResult.data?.error || profileResult.error}`, 'red');
    }

    // Test 5: List Events
    log('\n5. List Events', 'yellow');
    const eventsResult = await test('/events');
    if (eventsResult.ok) {
      log(`   ✅ Events retrieved: ${eventsResult.data.events?.length || 0} events`, 'green');
    } else {
      log(`   ❌ Failed: ${eventsResult.data?.error || eventsResult.error}`, 'red');
    }

    // Test 6: List Forum Categories
    log('\n6. List Forum Categories', 'yellow');
    const categoriesResult = await test('/forum/categories');
    if (categoriesResult.ok) {
      log(`   ✅ Categories retrieved: ${categoriesResult.data.categories?.length || 0} categories`, 'green');
    } else {
      log(`   ❌ Failed: ${categoriesResult.data?.error || categoriesResult.error}`, 'red');
    }

    // Test 7: List CMS Updates
    log('\n7. List CMS Updates', 'yellow');
    const updatesResult = await test('/cms/updates');
    if (updatesResult.ok) {
      log(`   ✅ Updates retrieved: ${updatesResult.data.updates?.length || 0} updates`, 'green');
    } else {
      log(`   ❌ Failed: ${updatesResult.data?.error || updatesResult.error}`, 'red');
    }

  } else {
    log(`   ❌ Registration failed: ${registerResult.data?.error || registerResult.error}`, 'red');
    
    // Try login instead
    log('\n2b. Try Login', 'yellow');
    const loginResult = await test('/auth/login', 'POST', {
      email: 'test@example.com',
      password: 'test1234'
    });

    if (loginResult.ok) {
      log('   ✅ Login successful', 'green');
      const token = loginResult.data.token;

      // Continue with tests using existing user
      log('\n3. Get Current User', 'yellow');
      const meResult = await test('/auth/me', 'GET', null, token);
      if (meResult.ok) {
        log('   ✅ User info retrieved', 'green');
      }
    } else {
      log(`   ❌ Login failed: ${loginResult.data?.error || loginResult.error}`, 'red');
      log('   Note: Database connection required for auth endpoints', 'yellow');
    }
  }

  log('\n' + '='.repeat(50), 'blue');
  log('\n✅ Tests completed!\n', 'blue');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test error: ${error.message}`, 'red');
  process.exit(1);
});

