// Saves the app files on first visit, then serves them from the phone so it works in flight mode.
// Change CACHE (v1 -> v2) whenever you edit any app file, so phones fetch the new version.
const CACHE = 'bill-book-v1';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'calc.js', 'qrcode.js',
               'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())));

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request)));
});
