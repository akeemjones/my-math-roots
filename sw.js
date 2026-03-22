const CACHE = 'math-workbook-v5.10.1-release';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install — cache core assets immediately, then wait for user to trigger update
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
  // Do NOT skipWaiting here — we wait for the user to tap "Update Now"
});

// Message from app — user tapped "Update Now"
self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// Activate — remove old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first, update in background
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFont = url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com');

  if (!isLocal && !isFont) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Always fetch a fresh copy in background to update cache
      const fetchPromise = fetch(e.request).then(fresh => {
        if (fresh && fresh.status === 200) {
          caches.open(CACHE).then(cache => cache.put(e.request, fresh.clone()));
        }
        return fresh;
      }).catch(() => null);

      // Return cached immediately if available, otherwise wait for network
      return cached || fetchPromise || new Response('Offline', { status: 503 });
    })
  );
});
