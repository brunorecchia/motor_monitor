const V = 'motor40-live-v2';
const FILES = [
  '/motor_monitor/',
  '/motor_monitor/index.html',
  '/motor_monitor/manifest.json',
  '/motor_monitor/icon-192.png',
  '/motor_monitor/icon-512.png'
];

// Instalar y cachear archivos de la app
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V).then(c => {
      // Cachear de a uno para no fallar si alguno no existe
      return Promise.allSettled(FILES.map(f => c.add(f)));
    })
  );
  self.skipWaiting();
});

// Limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Servir desde cache, red como fallback
self.addEventListener('fetch', e => {
  // No interceptar WebSocket ni recursos externos (Chart.js, paho-mqtt CDN)
  const url = e.request.url;
  if (url.startsWith('ws://') || url.startsWith('wss://')) return;
  if (url.includes('cdnjs.cloudflare.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
