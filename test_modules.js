/**
 * Automated Test Script for Website Modules
 * Tests all page modules and their exports
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

function test(name, condition, message) {
  if (condition) {
    testResults.passed.push({ name, message });
    console.log(`✅ ${name}: ${message || 'OK'}`);
  } else {
    testResults.failed.push({ name, message });
    console.error(`❌ ${name}: ${message || 'FAILED'}`);
  }
}

function warn(name, message) {
  testResults.warnings.push({ name, message });
  console.warn(`⚠️  ${name}: ${message}`);
}

console.log('🧪 Starting automated tests...\n');

// Test 1: Check if all required page modules exist
console.log('📁 Testing module files...');
const requiredModules = [
  'assets/js/pages/dashboard.js',
  'assets/js/pages/events.js',
  'assets/js/pages/forum.js',
  'assets/js/pages/forumCategory.js',
  'assets/js/pages/forumThread.js',
  'assets/js/pages/messages.js',
  'assets/js/pages/compose.js',
  'assets/js/pages/members.js',
  'assets/js/pages/memberProfile.js',
  'assets/js/pages/myProfile.js',
  'assets/js/pages/monatsupdates.js',
  'assets/js/pages/admin.js',
  'assets/js/utils.js',
  'assets/js/app.js'
];

requiredModules.forEach(module => {
  const path = join(__dirname, module);
  test(`File exists: ${module}`, existsSync(path), existsSync(path) ? 'Found' : 'Missing');
});

// Test 2: Check app.js imports
console.log('\n📦 Testing app.js imports...');
try {
  const appJs = readFileSync(join(__dirname, 'assets/js/app.js'), 'utf-8');
  
  const requiredImports = [
    'renderDashboard',
    'renderEvents',
    'renderForum',
    'performForumSearch',
    'renderForumCategory',
    'renderForumThread',
    'renderMessages',
    'renderCompose',
    'renderMembers',
    'renderMember',
    'renderMyProfile',
    'renderMonatsupdates',
    'renderAdmin'
  ];
  
  requiredImports.forEach(importName => {
    // For combined imports like "renderForum, performForumSearch", check differently
    if (importName === 'performForumSearch') {
      const hasImport = appJs.includes(`performForumSearch`) && appJs.includes(`from "./pages/forum.js"`);
      test(`app.js imports ${importName}`, hasImport, hasImport ? 'Found' : 'Missing');
    } else {
      const hasImport = appJs.includes(`import { ${importName}`) || 
                       appJs.includes(`import { ${importName},`) ||
                       appJs.includes(`import { ${importName} }`);
      test(`app.js imports ${importName}`, hasImport, hasImport ? 'Found' : 'Missing');
    }
  });
  
  // Check for old function definitions (should not exist)
  const oldFunctions = [
    'function renderDashboard',
    'function renderEvents',
    'function renderForum',
    'function renderMessages',
    'function renderCompose',
    'function renderMembers',
    'function renderMember',
    'function renderMyProfile',
    'function renderMonatsupdates',
    'function renderAdmin'
  ];
  
  oldFunctions.forEach(func => {
    const hasOldFunction = appJs.includes(func + '(');
    test(`app.js does NOT contain old ${func}`, !hasOldFunction, hasOldFunction ? 'Found (should be removed)' : 'OK');
  });
  
} catch (error) {
  test('Read app.js', false, error.message);
}

// Test 3: Check page modules for exports
console.log('\n📤 Testing module exports...');
const moduleExports = {
  'assets/js/pages/dashboard.js': ['renderDashboard'],
  'assets/js/pages/events.js': ['renderEvents'],
  'assets/js/pages/forum.js': ['renderForum', 'performForumSearch'],
  'assets/js/pages/forumCategory.js': ['renderForumCategory'],
  'assets/js/pages/forumThread.js': ['renderForumThread'],
  'assets/js/pages/messages.js': ['renderMessages'],
  'assets/js/pages/compose.js': ['renderCompose'],
  'assets/js/pages/members.js': ['renderMembers'],
  'assets/js/pages/memberProfile.js': ['renderMember'],
  'assets/js/pages/myProfile.js': ['renderMyProfile'],
  'assets/js/pages/monatsupdates.js': ['renderMonatsupdates'],
  'assets/js/pages/admin.js': ['renderAdmin']
};

Object.entries(moduleExports).forEach(([module, exports]) => {
  const path = join(__dirname, module);
  if (existsSync(path)) {
    try {
      const content = readFileSync(path, 'utf-8');
      exports.forEach(exportName => {
        const hasExport = content.includes(`export function ${exportName}`) ||
                         content.includes(`export async function ${exportName}`) ||
                         content.includes(`export { ${exportName}`);
        test(`${module} exports ${exportName}`, hasExport, hasExport ? 'Found' : 'Missing');
      });
    } catch (error) {
      test(`Read ${module}`, false, error.message);
    }
  }
});

// Test 4: Check utils.js exports
console.log('\n🔧 Testing utils.js exports...');
try {
  const utilsJs = readFileSync(join(__dirname, 'assets/js/utils.js'), 'utf-8');
  const utilsExports = ['fmtDate', 'parseTags', 'debounce', 'formatFileSize', 'extractTeamsLink', 'calculateEndTime', 'commonTags', 'renderProfileProgress', 'getAllAvailableTags', '$', '$$', 'qs'];
  
  utilsExports.forEach(exportName => {
    // Skip renderProfileProgress and getAllAvailableTags - they are in myProfile.js
    if (exportName === 'renderProfileProgress' || exportName === 'getAllAvailableTags') {
      // Check if they exist in myProfile.js instead
      try {
        const myProfileJs = readFileSync(join(__dirname, 'assets/js/pages/myProfile.js'), 'utf-8');
        const hasExport = myProfileJs.includes(`export function ${exportName}`);
        test(`myProfile.js exports ${exportName}`, hasExport, hasExport ? 'Found' : 'Missing');
      } catch (e) {
        test(`myProfile.js exports ${exportName}`, false, 'File not found');
      }
    } else {
      const hasExport = utilsJs.includes(`export function ${exportName}`) ||
                       utilsJs.includes(`export const ${exportName}`) ||
                       utilsJs.includes(`export { ${exportName}`);
      test(`utils.js exports ${exportName}`, hasExport, hasExport ? 'Found' : 'Missing');
    }
  });
} catch (error) {
  test('Read utils.js', false, error.message);
}

// Test 5: Check for common issues
console.log('\n🔍 Checking for common issues...');
try {
  const appJs = readFileSync(join(__dirname, 'assets/js/app.js'), 'utf-8');
  
  // Check for duplicate router comments
  const routerComments = (appJs.match(/\/\* ========== ROUTER ========== \*\//g) || []).length;
  test('app.js has exactly one router comment', routerComments === 1, routerComments === 1 ? 'OK' : `Found ${routerComments} router comments`);
  
  // Check for duplicate DOMContentLoaded
  const domReady = (appJs.match(/document\.addEventListener\("DOMContentLoaded"/g) || []).length;
  test('app.js has exactly one DOMContentLoaded', domReady === 1, domReady === 1 ? 'OK' : `Found ${domReady} DOMContentLoaded listeners`);
  
  // Check file size (should be much smaller now)
  const fileSize = appJs.length;
  const fileSizeKB = (fileSize / 1024).toFixed(2);
  test('app.js is reasonably sized', fileSize < 20000, `Size: ${fileSizeKB} KB (${fileSize < 20000 ? 'OK' : 'Too large'})`);
  
} catch (error) {
  test('Check app.js issues', false, error.message);
}

// Test 6: Check HTML files reference correct paths
console.log('\n📄 Testing HTML file references...');
const htmlFiles = [
  'app/dashboard.html',
  'app/forum.html',
  'app/forum-kategorie.html',
  'app/forum-thread.html'
];

htmlFiles.forEach(htmlFile => {
  const path = join(__dirname, htmlFile);
  if (existsSync(path)) {
    try {
      const content = readFileSync(path, 'utf-8');
      const hasCorrectPath = content.includes('../assets/js/app.js') || content.includes('assets/js/app.js');
      test(`${htmlFile} references app.js`, hasCorrectPath, hasCorrectPath ? 'OK' : 'Incorrect path');
    } catch (error) {
      warn(`Read ${htmlFile}`, error.message);
    }
  } else {
    warn(`${htmlFile}`, 'File not found');
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${testResults.passed.length}`);
console.log(`❌ Failed: ${testResults.failed.length}`);
console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
console.log('='.repeat(60));

if (testResults.failed.length > 0) {
  console.log('\n❌ FAILED TESTS:');
  testResults.failed.forEach(({ name, message }) => {
    console.log(`  - ${name}: ${message}`);
  });
}

if (testResults.warnings.length > 0) {
  console.log('\n⚠️  WARNINGS:');
  testResults.warnings.forEach(({ name, message }) => {
    console.log(`  - ${name}: ${message}`);
  });
}

// Exit code
process.exit(testResults.failed.length > 0 ? 1 : 0);

