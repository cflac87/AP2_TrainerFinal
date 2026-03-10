// AP2 Trainer Service Worker v2 — Offline-First (fixed)
const CACHE = 'ap2-trainer-v2';

// Install: cache all critical assets immediately
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache =>
      // Cache the page itself (all URL variants)
      cache.addAll([
        './',
        './index.html',
        './manifest.json',
        './icon.svg',
        './icon-192.png',
        './icon-512.png',
      ])
    ).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches, take control immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-first — always serve from cache if available
self.addEventListener('fetch', e => {
  // Only handle GET requests
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(cached => {
        if (cached) return cached;

        // Not in cache — try network and cache the result
        return fetch(e.request)
          .then(resp => {
            if (resp && resp.status === 200) {
              cache.put(e.request, resp.clone());
            }
            return resp;
          })
          .catch(() => {
            // Offline fallback — always return index.html
            return cache.match('./index.html');
          });
      })
    )
  );
});
