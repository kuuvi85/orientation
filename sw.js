// Simple cache to keep the page available offline.
const CACHE = 'offline-v1';
const ASSETS = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  // Cache-first for navigation and our assets.
  if (req.mode === 'navigate' || ASSETS.some(a => req.url.endsWith(a.replace('./','')))) {
    e.respondWith(
      caches.match(req).then(res => res || fetch(req).then(net => {
        const copy = net.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return net;
      }).catch(() => caches.match('./index.html')))
    );
  }
});
