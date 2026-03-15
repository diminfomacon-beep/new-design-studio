const CACHE_NAME = 'studio-v1';
const assets = [
  './',
  './index.html',
  './manifest.json'
  // Add links to your main CSS/JS files if they are separate
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(assets))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
