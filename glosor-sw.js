/**
 * Service worker för Bliss-glosor (PWA): gör att appen startar utan nät.
 *
 * Bara glosprogrammets egna filer (inklusive typsnittet i fonts/) hanteras här;
 * alla andra anrop (index.html, server.js-API:t m.m.) passerar orörda.
 *
 * Strategi: "stale-while-revalidate" — svara direkt ur cachen och hämta en
 * färsk kopia i bakgrunden. En ändrad fil syns alltså vid NÄSTA start, utan
 * att någon versionssiffra behöver räknas upp. Höj VERSION bara om
 * fil-listan ändras (gamla cacher städas bort vid aktivering).
 *
 * Alla hämtningar går förbi webbläsarens vanliga HTTP-cache (cache: 'reload' /
 * 'no-cache') — annars kan "färsk kopia" bli samma gamla fil igen.
 */
const VERSION = 'glosor-v23';
const SHELL = [
  'glosor.html',
  'glosor.webmanifest',
  'src/glosor.js',
  'src/vendor/bliss-shapes.js',
  'src/vendor/bliss-engine.js',
  'src/vendor/bliss-data.js',
  'src/vendor/bliss-derivations.js',
  'src/vendor/bliss-meningar.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'fonts/atkinson-hyperlegible-400-latin.woff2',
  'fonts/atkinson-hyperlegible-400-latin-ext.woff2',
  'fonts/atkinson-hyperlegible-700-latin.woff2',
  'fonts/atkinson-hyperlegible-700-latin-ext.woff2',
  'fonts/atkinson-hyperlegible-400i-latin.woff2',
  'fonts/atkinson-hyperlegible-400i-latin-ext.woff2',
];
const shellUrls = new Set(SHELL.map((p) => new URL(p, self.registration.scope).href));

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION)
    .then((c) => c.addAll(SHELL.map((p) => new Request(p, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      // Gamla versioner, och cachen för Google Fonts som inte längre används.
      .then((keys) => Promise.all(keys.filter((k) => (k.startsWith('glosor-v') && k !== VERSION) || k === 'glosor-fonts').map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const key = url.origin + url.pathname;   // ?-parametrar ignoreras (t.ex. start_url med spårning)

  if (shellUrls.has(key)) {
    e.respondWith(caches.open(VERSION).then(async (cache) => {
      const hit = await cache.match(key);
      const fresh = fetch(key, { cache: 'no-cache' }).then((res) => {
        if (res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => null);
      if (hit) { e.waitUntil(fresh); return hit; }
      return (await fresh) || Response.error();
    }));
    return;
  }
});
