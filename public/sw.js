const CACHE_NAME = 'scriptorium-v1';
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png'
];

// Install: precache the App Shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching offline app shell');
        return cache.addAll(PRECACHE_ASSETS);
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

// Fetch: Network-first or Stale-While-Revalidate strategy for assets
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Skip non-GET requests and browser extensions/external APIs
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) {
    // For external static assets like Google Fonts or jsdelivr CDN (pdf.js workers, fonts), cache them!
    if (event.request.url.includes('googleapis.com') || 
        event.request.url.includes('gstatic.com') ||
        event.request.url.includes('jsdelivr.net') ||
        event.request.url.includes('cdnjs.cloudflare.com')) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cacheCopy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, cacheCopy);
              });
            }
            return networkResponse;
          }).catch(() => {
            // Offline fallback
            return new Response('Offline content unavailable for this third-party resource.');
          });
        })
      );
    }
    return;
  }

  // Stale-While-Revalidate strategy for index page and local JS/CSS/image assets
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // If response is valid, update the cache
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((err) => {
          console.warn('[Service Worker] Fetch failed, returning cache if available:', err);
          // If we are offline and no cache matches, and it is a document request, return root / index
          if (event.request.mode === 'navigate') {
            return cache.match('/');
          }
          throw err;
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
