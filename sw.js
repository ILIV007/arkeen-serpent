const CACHE_NAME = 'arkeen-v1.3';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/src/main.js',
  '/src/core/config.js',
  '/src/core/state.js',
  '/src/core/loop.js',
  '/src/systems/input.js',
  '/src/systems/audio.js',
  '/src/systems/storage.js',
  '/src/gameplay/snake.js',
  '/src/gameplay/rules.js',
  '/src/render/renderer.js',
  '/src/render/particles.js',
  '/src/ui/screens.js',
  '/src/ui/menu.js',
  '/src/utils/events.js',
  '/src/utils/math.js',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});