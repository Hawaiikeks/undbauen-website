/**
 * Service Worker für Offline-Cache und Performance
 * 
 * Provides offline functionality, caching strategies, and background sync.
 * 
 * @module serviceWorker
 */

// Cache-Version für Development: Timestamp-basiert für automatisches Cache-Busting
const CACHE_VERSION = 'v7'; // Updated version - force cache refresh (Knowledge Base + Resources Toolbox)
const CACHE_NAME = `undbauen-${CACHE_VERSION}`;
const RUNTIME_CACHE = `undbauen-runtime-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/index.html';

// Assets die gecacht werden sollen
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/base.css',
  '/assets/css/public.css',
  '/assets/css/components.css',
  '/assets/css/app.css',
  '/assets/js/services/apiClient.js',
  '/assets/js/services/httpAdapter.js', // Updated: httpAdapter instead of storageAdapter
  '/assets/js/components/toast.js',
  '/assets/js/components/hoverCard.js',
  '/assets/js/components/search.js',
  '/assets/js/components/scrollNavigation.js',
  '/assets/js/components/lazyLoad.js',
  '/assets/js/public.js',
  '/assets/js/app.js'
];

// Install Event - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => self.clients.claim())
  );
});

// Network First Strategy - für HTML/Documents
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache First Strategy - für statische Assets
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback if available
    if (request.destination === 'document') {
      const offlinePage = await caches.match('/index.html');
      if (offlinePage) return offlinePage;
    }
    throw error;
  }
}

// Stale-While-Revalidate Strategy - für CSS/JS mit Cache-Busting
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached if available
    return cachedResponse;
  });
  
  // Return cached immediately, update in background
  return cachedResponse || fetchPromise;
}

// Fetch Event - Intelligente Cache-Strategie basierend auf Request-Typ
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (allow external APIs like dicebear)
  const url = new URL(event.request.url);
  if (!url.href.startsWith(self.location.origin) && !url.hostname.includes('dicebear.com') && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  const url = new URL(event.request.url);
  const request = event.request;

  // Network First für HTML/Documents (immer frische Version)
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Stale-While-Revalidate für CSS/JS (mit Cache-Busting Query-Params)
  if (request.destination === 'style' || 
      request.destination === 'script' ||
      url.pathname.match(/\.(css|js)$/)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Network First für externe Bilder (Dicebear Avatare, etc.)
  if (url.hostname.includes('dicebear.com') || url.hostname.includes('api.dicebear.com')) {
    event.respondWith(networkFirst(request));
    return;
  }
  
  // Cache First für statische Assets (Bilder, Fonts, etc.)
  if (request.destination === 'image' ||
      request.destination === 'font' ||
      url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Default: Network First with offline fallback
  event.respondWith(
    networkFirst(request).catch(() => {
      // If network fails and it's a navigation request, show offline page
      if (request.mode === 'navigate') {
        return caches.match(OFFLINE_PAGE);
      }
      // For other requests, return cache or empty response
      return caches.match(request);
    })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(
      Promise.resolve().then(() => {
        console.log('[SW] Background sync triggered');
        // Notify clients to process sync queue
        return self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SYNC_QUEUE' });
          });
        });
      })
    );
  }
});

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});


