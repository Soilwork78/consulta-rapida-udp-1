const CACHE_NAME = 'consulta-rapida-udp-v6.6';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './styles.css',
  './ultra.css',
  './data.js',
  './extras.js',
  './cdss.js',
  './session-map.js',
  './config.js',
  './app.js',
  './ultra.js',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './antibioticos-slides.html',
  './cuid2-u1-humanizado-slides.html',
  './cuid2-u2-proceso-slides.html',
  './cuid2-u3-iaas-slides.html',
  './cuid2-u4-tmsv-slides.html',
  './cuid2-u5-calculo-slides.html',
  './cuid2-u6-hidratacion-slides.html',
  './cuid2-u7-eliminacion-slides.html',
  './cuid2-u8-nutricion-slides.html',
  './cuid2-u9-balance-slides.html',
  './cuid2-u10-inhalatoria-slides.html',
  './cuid2-u11-rcp-slides.html',
  './cuid2-u12-visita-slides.html',
  './cuid2-u13-postmortem-slides.html',
  './fisio-u1-celular-slides.html',
  './fisio-u2-respiratoria-slides.html',
  './fisio-u3-cardiovascular-slides.html',
  './fisio-u4-endocrina-slides.html',
  './fisio-u5-renal-slides.html',
  './fisio-u6-neuro-slides.html',
  './fisio-u7-hematologia-slides.html',
  './unidad1-bases-slides.html',
  './unidad2-antiinfecciosos-slides.html',
  './unidad3-cardiovascular-slides.html',
  './unidad4-endocrina-slides.html',
  './unidad5-snc-slides.html',
  './unidad6-digestivo-slides.html',
  './guias-clinicas-2024-2025.md'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        const shouldCache = response && response.ok && new URL(event.request.url).origin === self.location.origin;
        if (shouldCache) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return caches.match(event.request);
      });
    })
  );
});
