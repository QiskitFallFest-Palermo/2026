const CACHE_VERSION = '20260907030215';
const CACHE_NAME = `qff26-${CACHE_VERSION}`;

const OFFLINE_URL = new URL(
  '/2026/offline.html',
  self.location.origin
).toString();

const PRECACHE_URLS = [
  // Aggiungi qui eventuali pagine che vuoi sempre disponibili offline.
  '/2026/',
  '/2026/offline.html',

  // Aggiungi qui eventuali asset che vuoi sempre disponibili offline.
  // Esempio:
  // ,'/2026/assets/img/logos/logo.webp'
  
  '/2026/assets/img/logos/ibm_quantum_logo.webp',
  
  '/2026/assets/img/logos/unipa_logotipo-orizzontale-a-colori.webp',
  
  '/2026/assets/img/logos/unipa_difc_2_nobg.webp',
  

   '/2026/assets/img/organizers/alberto.webp', '/2026/assets/img/organizers/roberto.webp', '/2026/assets/img/organizers/francesca.webp', '/2026/assets/img/organizers/user_default.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        await Promise.all(
          PRECACHE_URLS.map(async (url) => {
            const absoluteUrl = new URL(url, self.location.origin).toString();

            try {
              await cache.add(absoluteUrl);
            } catch (error) {
              console.warn(
                `[Service Worker] Failed to precache: ${absoluteUrl}`,
                error
              );
            }
          })
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith('qff26-') &&
                cacheName !== CACHE_NAME
            )
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok && response.type === 'basic') {
      await cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match(OFFLINE_URL);

      if (offlineResponse) {
        return offlineResponse;
      }
    }

    throw error;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok && response.type === 'basic') {
    await cache.put(request, response.clone());
  }

  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Immagini, font, CSS e JS:
  // usa prima la cache.
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' //||
    //request.destination === 'script'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML / navigazione:
  // prova prima la rete per avere contenuto aggiornato.
  event.respondWith(networkFirst(request));
});