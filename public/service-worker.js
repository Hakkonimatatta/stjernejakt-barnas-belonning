const CACHE_NAME = 'stjernejobb-v6';
const NOTIF_CACHE = 'stjernejobb-notif-v1';
const urlsToCache = [
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== NOTIF_CACHE) {
              return caches.delete(cacheName);
            }
          })
        )
      ),
      self.clients.claim(),
      checkAndShowNotifications(),
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    caches.open(NOTIF_CACHE).then((cache) => {
      cache.put('/notif-config', new Response(JSON.stringify(event.data.config)));
    });
  }
  if (event.data?.type === 'DISABLE_NOTIFICATIONS') {
    caches.open(NOTIF_CACHE).then((cache) => {
      cache.delete('/notif-config');
    });
  }
});

let lastNotifCheckMs = 0;

async function checkAndShowNotifications() {
  const now = Date.now();
  if (now - lastNotifCheckMs < 20 * 60 * 1000) return; // maks én sjekk per 20 min
  lastNotifCheckMs = now;

  const cache = await caches.open(NOTIF_CACHE);
  const configRes = await cache.match('/notif-config');
  if (!configRes) return;

  const config = await configRes.json();
  if (!config.enabled) return;

  const date = new Date();
  const hour = date.getHours();
  const todayStr = date.toDateString();

  for (let i = 0; i < config.times.length; i++) {
    if (hour !== config.times[i]) continue;
    const shownKey = `/notif-shown-${todayStr}-${config.times[i]}`;
    const alreadyShown = await cache.match(shownKey);
    if (alreadyShown) continue;
    await cache.put(shownKey, new Response('1'));
    await self.registration.showNotification(config.title, {
      body: config.texts[i],
      icon: config.icon,
      tag: `stjernejobb-${config.times[i]}`,
    });
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  checkAndShowNotifications();

  // App shell (HTML) must always be fetched fresh when online, so a new
  // deploy shows up on next load instead of being stuck on a cached
  // version. Falls back to cache only when offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return response;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match('/index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});
