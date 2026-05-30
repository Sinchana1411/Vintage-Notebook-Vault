const CACHE_NAME = 'scriptorium-pwa-v2';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png'
];

// Install: precache the App Shell resources robustly
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline assets');
        return Promise.allSettled(
          PRECACHE_ASSETS.map((asset) => {
            return cache.add(asset)
              .then(() => console.log(`[Service Worker] Cached asset: ${asset}`))
              .catch((err) => console.warn(`[Service Worker] Precache failed for ${asset}:`, err));
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch handler: robust offline compliance for Chrome / Vercel
self.addEventListener('fetch', (event) => {
  // Only handle GET requests or requests within our scope
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);

  // 1. Navigation Requests (HTML Pages / Root)
  // Network first, falling back to cache
  if (event.request.mode === 'navigate' || requestUrl.pathname === '/' || requestUrl.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
          }
          return networkResponse;
        })
        .catch(() => {
          console.log('[Service Worker] Navigation request offline, falling back to cache');
          return caches.match('/')
            .then((cachedResponse) => cachedResponse || caches.match('/index.html'));
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, PNG, JPEG, SVG, WOFF, etc.)
  // Cache first, falling back to network
  const isStaticAsset = 
    requestUrl.origin === self.location.origin ||
    event.request.url.includes('googleapis.com') ||
    event.request.url.includes('gstatic.com') ||
    event.request.url.includes('jsdelivr.net') ||
    event.request.url.includes('cdnjs.cloudflare.com');

  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse; // Return cache hit immediately
        }

        // Fetch from network, clone, and cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseCopy));
            }
            return networkResponse;
          })
          .catch((err) => {
            console.warn('[Service Worker] Asset fetch failed and not cached:', event.request.url, err);
            // Return dummy offline image or generic response if it's an image
            if (event.request.destination === 'image') {
              return caches.match('/icon-192.png');
            }
            return new Response('Asset unavailable offline.', { status: 404, statusText: 'Offline' });
          });
      })
    );
    return;
  }
});
