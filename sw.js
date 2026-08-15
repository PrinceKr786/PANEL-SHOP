const CACHE = 'nexus-store-v9';

const PRECACHE = [
  'index.html',
  'pages/index/index.html', 'pages/home/home.html', 'pages/shop/shop.html', 'pages/wallet/wallet.html', 'pages/profile/profile.html',
  'pages/index/index.css', 'pages/home/home.css', 'pages/shop/shop.css', 'pages/wallet/wallet.css', 'pages/profile/profile.css', 'assets/styles/core/dark-light-mode.css',
  'assets/scripts/core/firebase.js', 'pages/index/index.js', 'pages/home/home.js', 'pages/shop/shop.js', 'pages/wallet/wallet.js', 'pages/profile/profile.js', 'assets/scripts/utils/language.js', 'assets/scripts/core/security.js', 'assets/scripts/utils/navigator.js',
  'components/pages/hwid-reset.html', 'components/pages/my-keys.html', 'components/pages/referrals.html', 'components/pages/helpdesk.html', 'components/pages/user-settings.html', 'components/pages/payment-settings.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of PRECACHE) {
        try {
          const req = new Request(url, { cache: 'no-cache' });
          const res = await fetch(req);
          if (res.ok) cache.put(req, res);
        } catch (_) {}
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;

  if (url.includes('firebaseio.com') || url.includes('googleapis.com') || url.includes('firestore.googleapis.com')) {
    return;
  }

  if (url.includes('fonts.googleapis.com') || url.includes('fontawesome') || url.includes('cdn.tailwindcss.com') || url.includes('gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchP = fetch(e.request).then((res) => {
          if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchP;
      })
    );
    return;
  }

  if (url.endsWith('.js')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => caches.match(e.request).then(cached => cached || new Response('Offline', { status: 503 })))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
