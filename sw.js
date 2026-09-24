const CACHE = 'produktionsplanung-v2';
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

// Erst Netzwerk versuchen (damit Änderungen sofort ankommen, ohne hartes Neuladen),
// nur bei fehlendem Internet auf die zuletzt gespeicherte Version zurückfallen.
// Firestore-Anfragen laufen immer live über das Netzwerk (kein Caching der Daten).
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if(url.origin !== self.location.origin) return; // externe Requests (Firebase, Fonts, pdf.js) nicht anfassen
  event.respondWith(
    fetch(event.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, clone));
        return resp;
      })
      .catch(() => caches.match(event.request))
  );
});
