// Body Map service worker — offline "cache the shell".
// The app makes no network requests beyond loading these static files, so a
// simple cache-first strategy is enough. To ship an update, bump CACHE below;
// the old cache is deleted on activate and clients pick up the new files.
const CACHE = 'bm-v2';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png',
  'icon-512-maskable.png',
  'apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          // Cache same-origin successful responses for next time.
          if (res.ok && new URL(req.url).origin === self.location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        // Offline and not cached: fall back to the app shell for navigations.
        .catch(() => (req.mode === 'navigate' ? caches.match('index.html') : Promise.reject()));
    })
  );
});
