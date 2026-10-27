/* Generated at build time. Do not cache weather, coordinates or user data. */
const CACHE = "babyguide-__VERSION__";
const PRECACHE = __PRECACHE__;
self.addEventListener("install", (event) =>
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE))),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys())
        if (key.startsWith("babyguide-") && key !== CACHE)
          await caches.delete(key);
      await self.clients.claim();
    })(),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE);
        return (await cache.match("/")) || Response.error();
      }),
    );
    return;
  }
  if (PRECACHE.includes(url.pathname))
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        return (await cache.match(request)) || fetch(request);
      })(),
    );
});
