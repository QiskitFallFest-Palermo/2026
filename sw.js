const CACHE_VERSION = '20260912174137';
const CACHE_NAME = `qff26-${CACHE_VERSION}`;

const OFFLINE_URL = new URL(
  '/2026/offline.html',
  self.location.origin
).toString();

const PRECACHE_URLS = [...new Set([
  '/2026/',
  '/2026/offline.html',
  '/2026/favicon.ico',
  '/2026/assets/verification/crl.json',
  '/2026/assets/verification/public_key.pem',

  // Tutte le pagine (++ .css con front matter)
  '/2026/404.html',
  '/2026/NOTICE',
  '/2026/README.md',
  '/2026/blog/',
  '/2026/contacts/',
  '/2026/cookies/',
  '/2026/credits/',
  '/2026/faq/',
  '/2026/feed.xml',
  '/2026/',
  '/2026/install/',
  '/2026/assets/css/logotype.css',
  '/2026/manifest.webmanifest',
  '/2026/offline.html',
  '/2026/privacy/',
  '/2026/registration/',
  '/2026/sitemap/',
  '/2026/assets/css/style.css',
  '/2026/sw.js',
  '/2026/tos/',
  '/2026/verify',
  '/2026/assets/main.css',
  '/2026/sitemap.xml',
  '/2026/robots.txt',
  
  // articoli blog generati automaticamente da Jekyll
  '/2026/cfu-unipa/',
  '/2026/blog/2026/07/28/Why-to-partecipate.it.html',
  '/2026/blog/2026/07/28/Why-to-partecipate.en.html',
  '/2026/blog/2026/07/10/Announcing-the-Qiskit-Fall-Fest-in-Palermo.html',
  '/2026/blog/2026/07/08/First-steps-with-Qiskit.html',
  '/2026/blog/2026/07/05/Introducing-the-Qiskit-Fall-Fest.html',
  
  // CSS (-- .css con front matter)
  '/2026/assets/css/bootstrap.min.css',
  '/2026/assets/css/callout.css',
  '/2026/assets/css/components.css',
  '/2026/assets/css/fonts.css',
  '/2026/assets/css/foundations.css',
  '/2026/assets/css/layout.css',
  '/2026/assets/css/site.css',
  '/2026/assets/css/utilities.css',
  '/2026/assets/fontawesome-free-7.3.1/css/brands.min.css',
  '/2026/assets/fontawesome-free-7.3.1/css/fontawesome.min.css',
  '/2026/assets/fontawesome-free-7.3.1/css/solid.min.css',
  
  // JavaScript
  '/2026/assets/js/bootstrap.bundle.min.js',
  '/2026/assets/js/contact_me.js',
  '/2026/assets/js/pwa-install.js',
  '/2026/assets/js/pwa-overscroll.js',
  '/2026/assets/js/pwa-quick-access.js',
  '/2026/assets/js/site-preferences.js',
  '/2026/assets/js/site.js',
  '/2026/assets/js/verification/verification.js',
  '/2026/assets/js/verification/verification_page.js',
  
  // Font
  '/2026/assets/fontawesome-free-7.3.1/webfonts/fa-brands-400.woff2',
  '/2026/assets/fontawesome-free-7.3.1/webfonts/fa-solid-900.woff2',
  '/2026/assets/fonts/google/ibm-plex-sans-italic-latin.woff2',
  '/2026/assets/fonts/google/ibm-plex-sans-normal-latin.woff2',
  '/2026/assets/fonts/google/montserrat-normal-latin.woff2',
  '/2026/assets/fonts/google/roboto-slab-normal-latin.woff2',
  '/2026/assets/fonts/google/tektur-normal-latin.woff2',
  
  // Immagini
  '/2026/assets/img/circuits/bell_circuit.svg',
  '/2026/assets/img/collaborators/cottone.webp',
  '/2026/assets/img/collaborators/user_default.webp',
  '/2026/assets/img/gallery/1701374883630.jpg',
  '/2026/assets/img/gallery/DSC_6798.jpg',
  '/2026/assets/img/gallery/DSC_6819.jpg',
  '/2026/assets/img/gallery/DSC_6854_rit.jpg',
  '/2026/assets/img/gallery/DSC_6895.jpg',
  '/2026/assets/img/gallery/DSC_6904.jpg',
  '/2026/assets/img/gallery/DSC_6921.jpg',
  '/2026/assets/img/gallery/lr/1701374883630.jpg',
  '/2026/assets/img/gallery/lr/DSC_6798.jpg',
  '/2026/assets/img/gallery/lr/DSC_6819.jpg',
  '/2026/assets/img/gallery/lr/DSC_6854_rit.jpg',
  '/2026/assets/img/gallery/lr/DSC_6895.jpg',
  '/2026/assets/img/gallery/lr/DSC_6904.jpg',
  '/2026/assets/img/gallery/lr/DSC_6921.jpg',
  '/2026/assets/img/icons/favicon-16.png',
  '/2026/assets/img/icons/favicon-32.png',
  '/2026/assets/img/icons/favicon.svg',
  '/2026/assets/img/material-design-icons/install_desktop_24dp_000000.svg',
  '/2026/assets/img/material-design-icons/install_desktop_24dp_E3E3E3.svg',
  '/2026/assets/img/meta-og-image.webp',
  '/2026/assets/img/organizers/alberto.webp',
  '/2026/assets/img/organizers/francesca.webp',
  '/2026/assets/img/organizers/roberto.webp',
  '/2026/assets/img/organizers/user_default.webp',
  '/2026/assets/img/partners/ibm_quantum_logo.webp',
  '/2026/assets/img/partners/unipa_difc_2_nobg.webp',
  '/2026/assets/img/partners/unipa_logotipo-orizzontale-a-colori.webp',
  '/2026/assets/img/poster/poster_web_h1200.webp',
  '/2026/assets/img/pwa/apple-touch-icon.png',
  '/2026/assets/img/pwa/icon-192.png',
  '/2026/assets/img/pwa/icon-512.png',
  '/2026/assets/img/pwa/icon-maskable-192.png',
  '/2026/assets/img/pwa/icon-maskable-512.png',
  '/2026/assets/img/pwa/screenshot-desktop.webp',
  '/2026/assets/img/pwa/screenshot-mobile.webp',
  '/2026/assets/img/qff/badge-pink.svg',
  '/2026/assets/img/qff/qiskit_logotype.svg',
  '/2026/assets/img/qff/sticker_pictogram-purple.svg',
  '/2026/assets/img/qff/stickers/bird-eagle.svg',
  '/2026/assets/img/qff/stickers/bird-falcon.svg',
  '/2026/assets/img/qff/stickers/cloud-small.svg',
  '/2026/assets/img/qff/stickers/cloud-wide.svg',
  '/2026/assets/img/qff/wallpaper-logo.webp',
  '/2026/assets/img/qff/wallpaper.webp',
  '/2026/assets/img/speakers/gasperini.webp',
  '/2026/assets/img/speakers/innocenti.webp',
  '/2026/assets/img/speakers/palma.webp',
  '/2026/assets/img/speakers/paternostro_3.webp',
  '/2026/assets/img/speakers/user_default.webp',
  '/2026/assets/img/sponsors/aisf_palermo_logo.webp',
  '/2026/assets/img/sponsors/vivere_ateneo_white.webp',
  '/2026/assets/img/sponsors/vivere_ingegneria__bk.webp',
  '/2026/assets/img/sponsors/vivere_mmffnn_white.webp',
  '/2026/assets/minima-social-icons.svg',
  
  // /static/ folder
  '/2026/static/bell_state.py',
  
])];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        const absoluteUrls = PRECACHE_URLS.map((url) =>
          new URL(url, self.location.origin).toString()
        );

        return cache.addAll(absoluteUrls);
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
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML / navigazione:
  // prova prima la rete per avere contenuto aggiornato.
  event.respondWith(networkFirst(request));
});
