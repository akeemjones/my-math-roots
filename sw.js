const CACHE = 'math-workbook-v5.15.1-release';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install — cache core assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => {})
  );
});

// Message from app — skip waiting immediately (origin-checked)
self.addEventListener('message', e => {
  const trusted = e.source && e.source.url && e.source.url.startsWith(self.location.origin);
  if(e.data && e.data.type === 'SKIP_WAITING' && trusted) self.skipWaiting();
});

// Activate — remove old caches and claim clients immediately
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - index.html: network-first (always get latest version)
// - everything else: cache-first, update in background
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;

  const url = new URL(e.request.url);
  const isLocal = url.origin === self.location.origin;
  const isFont  = url.hostname.includes('googleapis.com') || url.hostname.includes('gstatic.com');

  if(!isLocal && !isFont) return;

  // Network-first for the main HTML document
  const isDoc = url.pathname === '/' || url.pathname === '/index.html';
  if(isDoc){
    e.respondWith(
      fetch(e.request).then(fresh => {
        if(fresh && fresh.status === 200){
          caches.open(CACHE).then(cache => cache.put(e.request, fresh.clone()));
        }
        return fresh;
      }).catch(() => caches.match(e.request).then(c => c || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // Cache-first for all other assets (fonts, manifest, etc.)
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(fresh => {
        if(fresh && fresh.status === 200){
          caches.open(CACHE).then(cache => cache.put(e.request, fresh.clone()));
        }
        return fresh;
      }).catch(() => null);
      return cached || fetchPromise || new Response('Offline', { status: 503 });
    })
  );
});
