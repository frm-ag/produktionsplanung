const CACHE = 'produktionsplanung-v1';
const SHELL = ['./index.html', './manifest.json', './icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Nur die App-Shell (HTML/CSS/JS) aus dem Cache bedienen.
// Firestore-Anfragen laufen immer live über das Netzwerk (kein Caching der Daten).
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return; // externe Requests (Firebase, Fonts) nicht anfassen
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
