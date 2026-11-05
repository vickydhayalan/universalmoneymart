const CACHE_NAME = 'dfarm-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/dfarm.html',
  '/manifest.json',
  '/dfarm/css/style.css',
  '/dfarm/js/firebase-config.js',
  '/dfarm/js/erp-ops.js',
  '/dfarm/js/animals.js',
  '/dfarm/js/customer-ledger.js',
  '/dfarm/js/charts.js',
  '/dfarm/js/pdf-reports.js',
  '/dfarm/js/cart-storefront.js',
  'https://iili.io/nPh3Ia9.png'
];

// Install Event - Caches Core App Assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean Up Old Caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve Cached Assets when Offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      return cachedResponse || fetch(e.request).catch(() => {
        return caches.match('/dfarm.html');
      });
    })
  );
});
