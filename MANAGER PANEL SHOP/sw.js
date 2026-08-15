const CACHE = 'nexus-manager-v3';
const STATIC_ASSETS = [
  'pages/index/index.html', 'pages/dashboard/dashboard.html', 'pages/users/users.html', 'pages/purchases/purchases.html',
  'pages/manual/manual.html', 'pages/crypto/crypto.html',
  'pages/add-panel/add-panel.html', 'pages/manage-panels/manage-panels.html', 'pages/categories/categories.html',
  'pages/coupons/coupons.html', 'pages/contact/contact.html',
  'assets/styles/base.css',
  'pages/index/index.css', 'pages/users/users.css', 'pages/purchases/purchases.css',
  'pages/manual/manual.css', 'pages/crypto/crypto.css',
  'pages/add-panel/add-panel.css', 'pages/manage-panels/manage-panels.css', 'pages/categories/categories.css',
  'pages/coupons/coupons.css', 'pages/contact/contact.css',
  'assets/scripts/firebase.js', 'assets/scripts/auth-guard.js', 'assets/scripts/security.js',
  'assets/scripts/sidebar-loader.js', 'assets/scripts/badges.js',
  'pages/index/index.js', 'pages/dashboard/dashboard.js', 'pages/users/users.js', 'pages/purchases/purchases.js',
  'pages/manual/manual.js', 'pages/crypto/crypto.js',
  'pages/add-panel/add-panel.js', 'pages/manage-panels/manage-panels.js', 'pages/categories/categories.js',
  'pages/coupons/coupons.js', 'pages/contact/contact.js',
  'components/shell/sidebar.html'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of STATIC_ASSETS) {
        try { const req = new Request(url, { cache: 'no-cache' }); const res = await fetch(req); if (res.ok) cache.put(req, res); } catch (_) {}
      }
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (e) => {
  const url = e.request.url;
  if (url.includes('firebaseio.com') || url.includes('googleapis.com')) return;
  if (url.includes('fonts.googleapis.com') || url.includes('fontawesome') || url.includes('gstatic.com')) {
    e.respondWith(caches.match(e.request).then(cached => {
      const fetchP = fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => cached);
      return cached || fetchP;
    }));
    return;
  }
  if (url.match(/\.(js)$/)) {
    e.respondWith(fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => caches.match(e.request)));
    return;
  }
  if (url.match(/\.css$/)) {
    e.respondWith(caches.match(e.request).then(cached => {
      const fetchP = fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => cached);
      return cached || fetchP;
    }));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => {
    const fetchP = fetch(e.request).then(res => { if (res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => cached);
    return cached || fetchP;
  }));
});
