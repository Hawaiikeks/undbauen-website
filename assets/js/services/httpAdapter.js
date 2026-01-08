/**
 * HTTP Adapter
 * Replaces localStorage-based storageAdapter with HTTP API calls
 * 
 * @module httpAdapter
 */

const API_BASE = window.API_BASE_URL || 'http://localhost:3000/api';

// Cache for user data (for isAdmin, hasRole, etc.)
let userCache = null;

// Request cache for GET requests (5 minutes TTL)
const requestCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get cache key for request
 */
function getCacheKey(endpoint, options = {}) {
  const method = options.method || 'GET';
  const body = options.body ? JSON.stringify(options.body) : '';
  return `${method}:${endpoint}:${body}`;
}

/**
 * Check if request is cacheable
 */
function isCacheable(method, endpoint) {
  // Only cache GET requests
  if (method && method !== 'GET') return false;
  
  // Don't cache auth endpoints
  if (endpoint.includes('/auth/')) return false;
  
  // Don't cache admin endpoints
  if (endpoint.includes('/admin/')) return false;
  
  return true;
}

/**
 * Get authentication token from localStorage
 * @returns {string|null} JWT token or null
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Set authentication token in localStorage
 * @param {string} token - JWT token
 */
function setToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Clear authentication token from localStorage
 */
function clearToken() {
  localStorage.removeItem('token');
  userCache = null;
}

/**
 * Make authenticated HTTP request
 * @param {string} endpoint - API endpoint (without base URL)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data or error object
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const url = `${API_BASE}${endpoint}`;
  const method = options.method || 'GET';
  
  // Check cache for GET requests
  if (isCacheable(method, endpoint)) {
    const cacheKey = getCacheKey(endpoint, options);
    const cached = requestCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.data;
    }
  }
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error || 'Request failed', status: response.status };
    }

    // Cache successful GET responses
    if (isCacheable(method, endpoint) && !data.error) {
      const cacheKey = getCacheKey(endpoint, options);
      requestCache.set(cacheKey, {
        data,
        expiresAt: Date.now() + CACHE_TTL
      });
    }

    // Invalidate cache for POST/PUT/DELETE requests
    if (method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      // Clear related caches based on endpoint
      if (endpoint.includes('/events')) {
        clearRequestCache('/events');
      } else if (endpoint.includes('/forum')) {
        clearRequestCache('/forum');
      } else if (endpoint.includes('/messages')) {
        clearRequestCache('/messages');
      } else if (endpoint.includes('/profiles')) {
        clearRequestCache('/profiles');
      } else if (endpoint.includes('/auth')) {
        // Clear all cache on auth changes
        clearRequestCache();
        userCache = null;
      }
    }

    return data;
  } catch (error) {
    console.error('API request error:', error);
    return { error: 'Network error', details: error.message };
  }
}

/**
 * Clear request cache
 */
export function clearRequestCache(pattern = null) {
  if (pattern) {
    for (const [key] of requestCache.entries()) {
      if (key.includes(pattern)) {
        requestCache.delete(key);
      }
    }
  } else {
    requestCache.clear();
  }
}

/**
 * Generate unique ID (for client-side operations)
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/**
 * Get current timestamp in ISO format
 * @returns {string} ISO timestamp
 */
function nowISO() {
  return new Date().toISOString();
}

// ==================== AUTH ====================

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{ok: boolean, error?: string, user?: Object}>}
 */
export async function login(email, password) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return { ok: false, error: 'E-Mail ist erforderlich.' };
  }
  if (!password || typeof password !== 'string') {
    return { ok: false, error: 'Passwort ist erforderlich.' };
  }

  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email: email.trim(), password },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  if (result.token) {
    setToken(result.token);
    userCache = result.user;
    return { ok: true, user: result.user };
  }

  return { ok: false, error: 'Login failed' };
}

/**
 * Register new user
 * @param {string} name - User name (will be split into firstName/lastName)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{ok: boolean, error?: string, user?: Object}>}
 */
export async function register(name, email, password) {
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return { ok: false, error: 'Bitte Namen angeben (mindestens 2 Zeichen).' };
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return { ok: false, error: 'Bitte gültige E-Mail angeben.' };
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return { ok: false, error: 'Passwort min. 8 Zeichen.' };
  }

  // Split name into firstName and lastName
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: { email: email.trim(), password, firstName, lastName },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  if (result.token) {
    setToken(result.token);
    userCache = result.user;
    return { ok: true, user: result.user };
  }

  return { ok: false, error: 'Registration failed' };
}

/**
 * Logout user
 * @returns {Promise<{ok: boolean}>}
 */
export async function logout() {
  await apiRequest('/auth/logout', { method: 'POST' });
  clearToken();
  return { ok: true };
}

/**
 * Get current user info (with caching)
 * @returns {Promise<Object|null>} User object or null
 */
export async function me() {
  // Return cached user if available and not expired (1 minute cache)
  if (userCache && userCache._cachedAt && Date.now() - userCache._cachedAt < 60000) {
    return userCache;
  }
  
  const result = await apiRequest('/auth/me', { method: 'GET' });
  if (result.error) {
    userCache = null;
    return null;
  }
  
  // Cache user data with timestamp
  userCache = { ...result, _cachedAt: Date.now() };
  return result;
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
export function isLoggedIn() {
  return !!getToken();
}

/**
 * Check if current user is admin
 * @returns {boolean} True if admin
 */
export async function isAdmin() {
  if (!isLoggedIn()) return false;
  const user = userCache || await me();
  return user && user.role === 'admin';
}

/**
 * Check if current user has specific role
 * @param {string} role - Role to check
 * @returns {Promise<boolean>} True if user has the role
 */
export async function hasRole(role) {
  if (!isLoggedIn()) return false;
  const user = userCache || await me();
  return user && user.role === role;
}

/**
 * Check if current user has any of the specified roles
 * @param {Array<string>} roles - Array of roles to check
 * @returns {Promise<boolean>} True if user has any of the roles
 */
export async function hasAnyRole(roles) {
  if (!isLoggedIn() || !Array.isArray(roles)) return false;
  const user = userCache || await me();
  return user && roles.includes(user.role);
}

// ==================== PROFILES ====================

/**
 * Get profile by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} Profile object or null
 */
export async function getProfileByEmail(email) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    return null;
  }

  const result = await apiRequest(`/profiles/members/${encodeURIComponent(email.trim())}`, {
    method: 'GET',
  });

  if (result.error) return null;
  return result;
}

/**
 * Get public profile by email
 * @param {string} email - User email
 * @returns {Promise<Object|null>} Profile object or null
 */
export async function getProfileByEmailPublic(email) {
  return getProfileByEmail(email);
}

/**
 * Update current user's profile
 * @param {Object} profileData - Profile data to update
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function updateMyProfile(profileData) {
  const result = await apiRequest('/profiles/me', {
    method: 'PUT',
    body: profileData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  // Update cache if user data changed
  if (result.id) {
    userCache = result;
  }

  return { ok: true, profile: result };
}

/**
 * List all members
 * @param {string} search - Search query
 * @returns {Promise<Array<Object>>} Array of member objects
 */
export async function listMembers(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const result = await apiRequest(`/profiles/members${params}`, { method: 'GET' });
  if (result.error) return [];
  return result.members || [];
}

/**
 * List all members (public)
 * @param {string} search - Search query
 * @returns {Promise<Array<Object>>} Array of member objects
 */
export async function listMembersPublic(search = '') {
  return listMembers(search);
}

// ==================== EVENTS ====================

/**
 * List all events
 * @param {boolean} upcoming - Filter for upcoming events only
 * @returns {Promise<Array<Object>>} Array of event objects
 */
export async function listEvents(upcoming = false) {
  const params = upcoming ? '?upcoming=true' : '';
  const result = await apiRequest(`/events${params}`, { method: 'GET' });
  if (result.error) return [];
  return result.events || [];
}

/**
 * Get event by ID
 * @param {string} id - Event ID
 * @returns {Promise<Object|null>} Event object or null
 */
export async function getEvent(id) {
  if (!id) return null;
  const result = await apiRequest(`/events/${id}`, { method: 'GET' });
  if (result.error) return null;
  return result;
}

/**
 * Book an event
 * @param {string} eventId - Event ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function bookEvent(eventId) {
  if (!eventId) {
    return { ok: false, error: 'Event-ID ist erforderlich.' };
  }

  const result = await apiRequest(`/events/${eventId}/book`, {
    method: 'POST',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Cancel event booking
 * @param {string} eventId - Event ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function cancelBooking(eventId) {
  if (!eventId) {
    return { ok: false, error: 'Event-ID ist erforderlich.' };
  }

  const result = await apiRequest(`/events/${eventId}/book`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Save event to favorites (client-side only)
 * @param {string} eventId - Event ID
 * @returns {{ok: boolean, saved?: boolean, error?: string}}
 */
export function saveEvent(eventId) {
  if (!isLoggedIn()) {
    return { ok: false, error: 'Not logged in' };
  }

  const user = userCache || (async () => await me())();
  if (!user) {
    return { ok: false, error: 'Not logged in' };
  }

  const key = `savedEvents:${user.email?.toLowerCase() || 'unknown'}`;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const has = saved.includes(eventId);
  const next = has ? saved.filter(id => id !== eventId) : [...saved, eventId];
  localStorage.setItem(key, JSON.stringify(next));

  return { ok: true, saved: !has };
}

/**
 * Get bookings count for event
 * @param {string} eventId - Event ID
 * @returns {Promise<number>} Number of bookings
 */
export async function bookingsCount(eventId) {
  const event = await getEvent(eventId);
  return event?.bookingsCount || 0;
}

/**
 * Get event participants
 * @param {string} eventId - Event ID
 * @returns {Promise<Array<Object>>} Array of participant objects
 */
export async function getParticipants(eventId) {
  if (!eventId) return [];
  const result = await apiRequest(`/events/${eventId}/participants`, { method: 'GET' });
  if (result.error) return [];
  return result.participants || [];
}

/**
 * Ensure event thread exists (creates forum thread for event)
 * @param {string} eventId - Event ID
 * @returns {Promise<string|null>} Thread ID or null
 */
export async function ensureEventThread(eventId) {
  const event = await getEvent(eventId);
  if (!event) return null;

  // Check if thread already exists
  const threads = await getForumThreads();
  const existingThread = threads.find(t => t.eventId === eventId);
  if (existingThread) {
    return existingThread.id;
  }

  // Create new thread
  const result = await createForumThread('cat_events', `Event: ${event.title}`, 
    `Diskussion zum Event **${event.title}**.\n\n📅 ${event.startDate}\n📍 ${event.location || 'TBA'}\n\nSchreibe hier Fragen, Links und Learnings.`);

  if (result.error) {
    return null;
  }

  return result.thread?.id || null;
}

/**
 * Export event as ICS file (client-side)
 * @param {string} eventId - Event ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function exportICSForEvent(eventId) {
  const event = await getEvent(eventId);
  if (!event) {
    return { ok: false, error: 'Event nicht gefunden' };
  }

  // Generate ICS content
  const pad = (n) => String(n).padStart(2, '0');
  const toICSDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const dtStart = toICSDate(event.startDate);
  const dtEnd = event.endDate ? toICSDate(event.endDate) : dtStart;
  const uidIcs = `${eventId}@undbauen`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//undbauen//Event//DE',
    'BEGIN:VEVENT',
    `UID:${uidIcs}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || ''}`,
    `LOCATION:${event.location || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  // Download file
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${eventId}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { ok: true };
}

/**
 * Export all booked events as ICS file (client-side)
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function exportICSForBooked() {
  if (!isLoggedIn()) {
    return { ok: false, error: 'Not logged in' };
  }

  const events = await listEvents();
  const user = await me();
  if (!user) {
    return { ok: false, error: 'Not logged in' };
  }

  // Get user's bookings
  const bookings = [];
  for (const event of events) {
    const participants = await getParticipants(event.id);
    if (participants.some(p => p.userId === user.id)) {
      bookings.push(event);
    }
  }

  // Generate ICS for all booked events
  const pad = (n) => String(n).padStart(2, '0');
  const toICSDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  };

  const icsBlocks = bookings.map(event => {
    const dtStart = toICSDate(event.startDate);
    const dtEnd = event.endDate ? toICSDate(event.endDate) : dtStart;
    const uidIcs = `${event.id}@undbauen`;

    return [
      'BEGIN:VEVENT',
      `UID:${uidIcs}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      'END:VEVENT'
    ].join('\r\n');
  });

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//undbauen//Events//DE',
    ...icsBlocks,
    'END:VCALENDAR'
  ].join('\r\n');

  // Download file
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'undbauen-booked.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { ok: true };
}

// ==================== FORUM ====================

/**
 * List forum categories
 * @returns {Promise<Array<Object>>} Array of category objects
 */
export async function listForumCategories() {
  const result = await apiRequest('/forum/categories', { method: 'GET' });
  if (result.error) return [];
  return result.categories || [];
}

/**
 * Get forum threads
 * @param {string} categoryId - Optional category filter
 * @param {string} search - Optional search query
 * @returns {Promise<Array<Object>>} Array of thread objects
 */
export async function getForumThreads(categoryId = null, search = '') {
  const params = new URLSearchParams();
  if (categoryId) params.append('categoryId', categoryId);
  if (search) params.append('search', search);
  const query = params.toString() ? `?${params}` : '';
  
  const result = await apiRequest(`/forum/threads${query}`, { method: 'GET' });
  if (result.error) return [];
  return result.threads || [];
}

/**
 * Save forum threads (not needed - backend handles this)
 * @param {Array<Object>} threads - Threads array
 * @returns {{ok: boolean}}
 */
export function saveForumThreads(threads) {
  // Backend handles saving, this is a no-op
  return { ok: true };
}

/**
 * Get forum thread by ID
 * @param {string} threadId - Thread ID
 * @returns {Promise<Object|null>} Thread object or null
 */
export async function getForumThread(threadId) {
  if (!threadId) return null;
  const result = await apiRequest(`/forum/threads/${threadId}`, { method: 'GET' });
  if (result.error) return null;
  return result;
}

/**
 * Get forum posts for thread
 * @param {string} threadId - Thread ID
 * @returns {Promise<Array<Object>>} Array of post objects
 */
export async function getForumPosts(threadId) {
  if (!threadId) return [];
  const result = await apiRequest(`/forum/threads/${threadId}/posts`, { method: 'GET' });
  if (result.error) return [];
  return result.posts || [];
}

/**
 * Create forum thread
 * @param {string} categoryId - Category ID
 * @param {string} title - Thread title
 * @param {string} body - Thread content
 * @returns {Promise<{ok: boolean, thread?: Object, error?: string}>}
 */
export async function createForumThread(categoryId, title, body) {
  if (!categoryId || !title || !body) {
    return { ok: false, error: 'Category, title, and body are required' };
  }

  const result = await apiRequest('/forum/threads', {
    method: 'POST',
    body: { categoryId, title, content: body },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, thread: result };
}

/**
 * Reply to forum thread
 * @param {string} threadId - Thread ID
 * @param {string} body - Reply content
 * @returns {Promise<{ok: boolean, post?: Object, error?: string}>}
 */
export async function replyForumThread(threadId, body) {
  if (!threadId || !body) {
    return { ok: false, error: 'Thread ID and body are required' };
  }

  const result = await apiRequest(`/forum/threads/${threadId}/posts`, {
    method: 'POST',
    body: { content: body },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, post: result };
}

/**
 * Delete forum post
 * @param {string} postId - Post ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function deleteForumPost(postId) {
  if (!postId) {
    return { ok: false, error: 'Post ID is required' };
  }

  const result = await apiRequest(`/forum/posts/${postId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Like forum thread
 * @param {string} threadId - Thread ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function likeThread(threadId) {
  if (!threadId) {
    return { ok: false, error: 'Thread ID is required' };
  }

  const result = await apiRequest(`/forum/threads/${threadId}/like`, {
    method: 'POST',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Watch forum thread (stub - endpoint may not exist)
 * @param {string} threadId - Thread ID
 * @returns {Promise<{ok: boolean}>}
 */
export async function watchThread(threadId) {
  // Endpoint may not exist yet, return success for now
  return { ok: true };
}

/**
 * Pin forum thread (admin only)
 * @param {string} threadId - Thread ID
 * @param {boolean} pinned - Pin status
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminPinThread(threadId, pinned) {
  if (!threadId) {
    return { ok: false, error: 'Thread ID is required' };
  }

  const result = await apiRequest(`/forum/threads/${threadId}/pin`, {
    method: 'PATCH',
    body: { pinned },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Lock forum thread (admin/moderator only)
 * @param {string} threadId - Thread ID
 * @param {boolean} locked - Lock status
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminLockThread(threadId, locked) {
  if (!threadId) {
    return { ok: false, error: 'Thread ID is required' };
  }

  const result = await apiRequest(`/forum/threads/${threadId}/lock`, {
    method: 'PATCH',
    body: { locked },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Delete forum thread (admin only)
 * @param {string} threadId - Thread ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminDeleteThread(threadId) {
  if (!threadId) {
    return { ok: false, error: 'Thread ID is required' };
  }

  const result = await apiRequest(`/forum/threads/${threadId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

// ==================== MESSAGES ====================

/**
 * Get message threads
 * @returns {Promise<Array<Object>>} Array of thread objects
 */
export async function getThreads() {
  const result = await apiRequest('/messages/threads', { method: 'GET' });
  if (result.error) return [];
  return result.threads || [];
}

/**
 * Get messages for thread
 * @param {string} threadId - Thread ID
 * @returns {Promise<Array<Object>>} Array of message objects
 */
export async function getMessages(threadId) {
  if (!threadId) return [];
  const result = await apiRequest(`/messages/threads/${threadId}/messages`, { method: 'GET' });
  if (result.error) return [];
  return result.messages || [];
}

/**
 * Send message
 * @param {Object} messageData - Message data {to, subject, body, attachments}
 * @returns {Promise<{ok: boolean, thread?: Object, message?: Object, error?: string}>}
 */
export async function sendMessage({ to, subject = '', body = '', attachments = [] }) {
  if (!to || !body) {
    return { ok: false, error: 'Recipient and body are required' };
  }

  // Check if thread exists with this recipient
  const threads = await getThreads();
  let thread = threads.find(t => 
    t.participants?.some(p => p.email === to || p.id === to)
  );

  if (!thread) {
    // Create new thread
    const threadResult = await apiRequest('/messages/threads', {
      method: 'POST',
      body: { subject, participantEmail: to },
    });

    if (threadResult.error) {
      return { ok: false, error: threadResult.error };
    }

    thread = threadResult.thread || threadResult;
  }

  // Send message
  const result = await apiRequest(`/messages/threads/${thread.id}/messages`, {
    method: 'POST',
    body: { content: body },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, thread, message: result };
}

/**
 * Mark thread as read
 * @param {string} threadId - Thread ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function markThreadRead(threadId) {
  if (!threadId) {
    return { ok: false, error: 'Thread ID is required' };
  }

  const result = await apiRequest(`/messages/threads/${threadId}/read`, {
    method: 'PATCH',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * List system messages (stub - no backend endpoint yet)
 * @returns {Array<Object>} Array of system messages
 */
export function listSystemMessages() {
  // No backend endpoint yet, return empty array
  return [];
}

/**
 * Add system message (stub - no backend endpoint yet)
 * @param {string} email - User email
 * @param {Object} msg - Message object
 * @returns {{ok: boolean}}
 */
export function addSystemMessage(email, msg) {
  // No backend endpoint yet, return success
  return { ok: true };
}

// ==================== NOTIFICATIONS ====================

/**
 * List notifications (stub - endpoint may not exist)
 * @returns {Promise<Array<Object>>} Array of notification objects
 */
export async function listNotifications() {
  // Endpoint may not exist yet
  const result = await apiRequest('/notifications', { method: 'GET' });
  if (result.error) return [];
  return result.notifications || [];
}

/**
 * Mark notification as read (stub - endpoint may not exist)
 * @param {string} id - Notification ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function markNotificationRead(id) {
  if (!id) {
    return { ok: false, error: 'Notification ID is required' };
  }

  const result = await apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

// ==================== FAVORITES / ACTIVITY / RECOMMENDATIONS ====================

/**
 * Get favorites (client-side only)
 * @returns {Array<Object>} Array of favorite objects
 */
export function getFavorites() {
  if (!isLoggedIn()) return [];
  const user = userCache;
  if (!user || !user.id) return [];
  
  const key = `favorites:${user.id}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Toggle favorite (client-side only)
 * @param {string} targetType - Target type (e.g., 'user', 'event')
 * @param {string} targetId - Target ID
 * @returns {{ok: boolean, active?: boolean, error?: string}}
 */
export function toggleFavorite(targetType, targetId) {
  if (!isLoggedIn()) {
    return { ok: false, error: 'Not logged in' };
  }

  const user = userCache;
  if (!user || !user.id) {
    return { ok: false, error: 'Not logged in' };
  }

  const key = `favorites:${user.id}`;
  const arr = JSON.parse(localStorage.getItem(key) || '[]');
  const exists = arr.some(f => f.targetType === targetType && f.targetId === targetId);
  const next = exists
    ? arr.filter(f => !(f.targetType === targetType && f.targetId === targetId))
    : [{ id: uid('fav'), userId: user.id, targetType, targetId, createdAt: nowISO() }, ...arr];
  
  localStorage.setItem(key, JSON.stringify(next));
  return { ok: true, active: !exists };
}

/**
 * List activity (client-side only)
 * @returns {Array<Object>} Array of activity objects
 */
export function listActivity() {
  if (!isLoggedIn()) return [];
  const user = userCache;
  if (!user || !user.id) return [];
  
  const key = `activity:${user.id}`;
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Recommend contacts (client-side calculation)
 * @returns {Promise<Array<Object>>} Array of recommended member objects
 */
export async function recommendContacts() {
  if (!isLoggedIn()) return [];
  
  const user = await me();
  if (!user) return [];

  const myProfile = await getProfileByEmail(user.email);
  if (!myProfile || !myProfile.profile) return [];

  const myTags = new Set([
    ...(myProfile.profile.tags || []),
  ].map(x => x.toLowerCase()));

  const members = await listMembers('');
  const scored = members
    .filter(m => m.email?.toLowerCase() !== user.email?.toLowerCase())
    .map(m => {
      const memberTags = new Set((m.tags || []).map(x => x.toLowerCase()));
      let score = 0;
      for (const tag of memberTags) {
        if (myTags.has(tag)) {
          score++;
        }
      }
      return { member: m, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(x => x.member);
}

// ==================== ADMIN ====================

/**
 * List all users (admin only)
 * @returns {Promise<Array<Object>>} Array of user objects
 */
export async function adminListUsers() {
  const result = await apiRequest('/users', { method: 'GET' });
  if (result.error) return [];
  return result.users || [];
}

/**
 * Set user role (admin only)
 * @param {string} userId - User ID
 * @param {string} role - New role
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminSetUserRole(userId, role) {
  if (!userId || !role) {
    return { ok: false, error: 'User ID and role are required' };
  }

  const result = await apiRequest(`/users/${userId}/role`, {
    method: 'PATCH',
    body: { role },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Set user status (admin only)
 * @param {string} userId - User ID
 * @param {string} status - New status
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminSetUserStatus(userId, status) {
  if (!userId || !status) {
    return { ok: false, error: 'User ID and status are required' };
  }

  const result = await apiRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    body: { status },
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Delete user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminDeleteUser(userId) {
  if (!userId) {
    return { ok: false, error: 'User ID is required' };
  }

  const result = await apiRequest(`/users/${userId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Create event (admin only)
 * @param {Object} eventData - Event data
 * @returns {Promise<{ok: boolean, event?: Object, error?: string}>}
 */
export async function adminCreateEvent(eventData) {
  const result = await apiRequest('/events', {
    method: 'POST',
    body: eventData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, event: result };
}

/**
 * Update event (admin only)
 * @param {string} eventId - Event ID
 * @param {Object} eventData - Event data
 * @returns {Promise<{ok: boolean, event?: Object, error?: string}>}
 */
export async function adminUpdateEvent(eventId, eventData) {
  if (!eventId) {
    return { ok: false, error: 'Event ID is required' };
  }

  const result = await apiRequest(`/events/${eventId}`, {
    method: 'PUT',
    body: eventData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, event: result };
}

/**
 * Delete event (admin only)
 * @param {string} eventId - Event ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminDeleteEvent(eventId) {
  if (!eventId) {
    return { ok: false, error: 'Event ID is required' };
  }

  const result = await apiRequest(`/events/${eventId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

// ==================== CMS ====================

/**
 * List public updates
 * @returns {Promise<Array<Object>>} Array of update objects
 */
export async function listUpdatesPublic() {
  const result = await apiRequest('/cms/updates?published=true', { method: 'GET' });
  if (result.error) return [];
  return result.updates || [];
}

/**
 * List public publications
 * @returns {Promise<Array<Object>>} Array of publication objects
 */
export async function listPublicationsPublic() {
  const result = await apiRequest('/cms/publications', { method: 'GET' });
  if (result.error) return [];
  return result.publications || [];
}

/**
 * List member updates (same as public for now)
 * @returns {Promise<Array<Object>>} Array of update objects
 */
export async function listUpdatesMember() {
  return listUpdatesPublic();
}

/**
 * List member publications (same as public for now)
 * @returns {Promise<Array<Object>>} Array of publication objects
 */
export async function listPublicationsMember() {
  return listPublicationsPublic();
}

/**
 * Create update (admin only)
 * @param {Object} updateData - Update data
 * @returns {Promise<{ok: boolean, update?: Object, error?: string}>}
 */
export async function adminCreateUpdate(updateData) {
  const result = await apiRequest('/cms/updates', {
    method: 'POST',
    body: updateData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, update: result };
}

/**
 * Delete update (admin only)
 * @param {string} updateId - Update ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminDeleteUpdate(updateId) {
  if (!updateId) {
    return { ok: false, error: 'Update ID is required' };
  }

  const result = await apiRequest(`/cms/updates/${updateId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

/**
 * Update update (admin only)
 * @param {string} updateId - Update ID
 * @param {Object} updateData - Update data
 * @returns {Promise<{ok: boolean, update?: Object, error?: string}>}
 */
export async function adminUpdateUpdate(updateId, updateData) {
  if (!updateId) {
    return { ok: false, error: 'Update ID is required' };
  }

  const result = await apiRequest(`/cms/updates/${updateId}`, {
    method: 'PUT',
    body: updateData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, update: result };
}

/**
 * Save update draft (admin only)
 * @param {Object} draftData - Draft data
 * @returns {Promise<{ok: boolean, id?: string, error?: string}>}
 */
export async function adminSaveUpdateDraft(draftData) {
  // Use update endpoint with is_draft flag
  if (draftData.id) {
    // Update existing draft
    const result = await adminUpdateUpdate(draftData.id, { ...draftData, is_draft: true });
    return { ok: result.ok, id: draftData.id, error: result.error };
  } else {
    // Create new draft - backend should handle is_draft flag
    const result = await adminCreateUpdate({ ...draftData, is_draft: true });
    return { ok: result.ok, id: result.update?.id, error: result.error };
  }
}

/**
 * Get all updates raw including drafts (admin only)
 * @returns {Promise<Array<Object>>} Array of all update objects
 */
export async function getAllUpdatesRaw() {
  const result = await apiRequest('/cms/updates/drafts/all', { method: 'GET' });
  if (result.error) return [];
  return result.updates || [];
}

/**
 * Create publication (admin only)
 * @param {Object} publicationData - Publication data
 * @returns {Promise<{ok: boolean, publication?: Object, error?: string}>}
 */
export async function adminCreatePublication(publicationData) {
  const result = await apiRequest('/cms/publications', {
    method: 'POST',
    body: publicationData,
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, publication: result };
}

/**
 * Delete publication (admin only)
 * @param {string} publicationId - Publication ID
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
export async function adminDeletePublication(publicationId) {
  if (!publicationId) {
    return { ok: false, error: 'Publication ID is required' };
  }

  const result = await apiRequest(`/cms/publications/${publicationId}`, {
    method: 'DELETE',
  });

  if (result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

// ==================== EXPORT ====================

export const httpAdapter = {
  // auth
  login,
  register,
  logout,
  me,
  isLoggedIn,
  isAdmin,
  hasRole,
  hasAnyRole,

  // profiles
  getProfileByEmail,
  getProfileByEmailPublic,
  updateMyProfile,
  listMembers,
  listMembersPublic,

  // events
  listEvents,
  getEvent,
  bookEvent,
  cancelBooking,
  saveEvent,
  bookingsCount,
  getParticipants,
  ensureEventThread,
  exportICSForEvent,
  exportICSForBooked,

  // forum
  listForumCategories,
  getForumThreads,
  saveForumThreads,
  getForumThread,
  getForumPosts,
  createForumThread,
  replyForumThread,
  deleteForumPost,
  likeThread,
  watchThread,
  adminPinThread,
  adminLockThread,
  adminDeleteThread,

  // messages
  getThreads,
  getMessages,
  sendMessage,
  markThreadRead,
  listSystemMessages,
  addSystemMessage,

  // notifications
  listNotifications,
  markNotificationRead,

  // favorites / activity / recommendations
  getFavorites,
  toggleFavorite,
  listActivity,
  recommendContacts,

  // admin
  adminListUsers,
  adminSetUserRole,
  adminSetUserStatus,
  adminDeleteUser,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,

  // cms
  listUpdatesPublic,
  listPublicationsPublic,
  listUpdatesMember,
  listPublicationsMember,
  adminCreateUpdate,
  adminDeleteUpdate,
  adminUpdateUpdate,
  adminSaveUpdateDraft,
  getAllUpdatesRaw,
  adminCreatePublication,
  adminDeletePublication,
};

