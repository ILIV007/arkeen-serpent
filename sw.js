const CACHE_NAME = 'arkeen-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/config.js',
  '/js/storage.js',
  '/js/audio.js',
  '/js/input.js',
  '/js/renderer.js',
  '/js/game.js',
  '/js/menu.js',
  '/js/main.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});