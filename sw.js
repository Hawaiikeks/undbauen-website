// Service Worker für Offline-Cache und Performance
const CACHE_NAME = 'undbauen-v1';
const RUNTIME_CACHE = 'undbauen-runtime-v1';

// Assets die gecacht werden sollen
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/css/base.css',
  '/assets/css/public.css',
  '/assets/css/components.css',
  '/assets/css/app.css',
  '/assets/js/services/apiClient.js',
  '/assets/js/services/storageAdapter.js',
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

// Fetch Event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response
            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If network fails and we have a cached version, return it
            if (cachedResponse) {
              return cachedResponse;
            }
            // Otherwise return offline page or error
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});



