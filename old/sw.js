const CACHE_NAME = 'studio-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  // Add your CSS/JS paths here, e.g., './style.css'
];

// Install: Cache core UI
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch: Stale-While-Revalidate
// This allows the app to show cached content immediately while 
// updating the cache in the background for next time.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Cache successful responses from GitHub/Pixabay dynamically
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      });
      return cachedResponse || fetchPromise;
    })
  );
});
