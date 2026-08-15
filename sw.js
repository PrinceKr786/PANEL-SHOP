const CACHE = 'nexus-store-v19';

const PRECACHE = [
  'index.html',
  'pages/index/index.html', 'pages/home/home.html', 'pages/shop/shop.html', 'pages/wallet/wallet.html', 'pages/profile/profile.html',
  'pages/index/index.css', 'pages/home/home.css', 'pages/shop/shop.css', 'pages/wallet/wallet.css', 'pages/profile/profile.css', 'assets/styles/core/dark-light-mode.css',
  'assets/scripts/core/firebase.js', 'pages/index/index.js', 'pages/home/home.js', 'pages/shop/shop.js', 'pages/wallet/wallet.js', 'pages/profile/profile.js', 'assets/scripts/utils/language.js', 'assets/scripts/core/security.js', 'assets/scripts/utils/navigator.js', 'assets/scripts/utils/data-cache.js',
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
  const req = e.request;
  const url = new URL(req.url);

  const isCdn = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('cdn.tailwindcss.com') || url.hostname.includes('gstatic.com') ||
    url.hostname.includes('fontawesome') || url.hostname.includes('zapupi.com') ||
    url.hostname.includes('cdnjs.cloudflare.com');
  const isFirebase = url.hostname.includes('firebaseio.com') || url.hostname.includes('googleapis.com') || url.hostname.includes('firestore.googleapis.com');
  const isImage = /\.(png|jpe?g|gif|svg|webp|avif|ico|bmp)(\?|$)/i.test(url.pathname) || (req.headers.get('accept') || '').includes('image/');
  const isNav = req.mode === 'navigate';

  if (isCdn) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetchP = fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached);
        return cached || fetchP;
      })
    );
    return;
  }

  if (isFirebase) {
    return;
  }

  if (isImage) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const isSame = url.origin === self.location.origin;
        if (cached) {
          fetch(req, { mode: isSame ? 'cors' : 'no-cors' }).then((res) => {
            if (res && res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          }).catch(() => {});
          return cached;
        }
        return fetch(req, { mode: isSame ? 'cors' : 'no-cors' }).then((res) => {
          caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => cached || new Response('<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1"><rect width="1" height="1" fill="#111317"/></svg>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } }));
      })
    );
    return;
  }

  if (isNav) {
    e.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
          return res;
        }).catch(() => caches.match('index.html'));
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
