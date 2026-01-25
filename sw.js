const CACHE = 'ttrpg-clock-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // add the six SVGs here
  '/assets/clock-3.svg',
  '/assets/clock-4.svg',
  '/assets/clock-5.svg',
  '/assets/clock-6.svg',
  '/assets/clock-8.svg',
  '/assets/clock-10.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
