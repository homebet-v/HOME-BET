const cacheName = "homebet-game-assets-v1";
const maxEntries = 180;
let writes = Promise.resolve();

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter((name) => name.startsWith("homebet-game-assets-") && name !== cacheName)
      .map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  const gameArt = request.destination === "image" &&
    /^\/images\/(slots|roulette)\//.test(url.pathname);
  const staticBundle = ["script", "style"].includes(request.destination) &&
    /^\/_next\/static\/chunks\/[^/]+\.(js|css)$/.test(url.pathname);

  if (request.method !== "GET" || url.origin !== self.location.origin ||
      request.headers.has("range") || (!gameArt && !staticBundle)) return;

  let save;
  const response = (async () => {
    const cache = await caches.open(cacheName).catch(() => null);
    const cached = await cache?.match(request).catch(() => undefined);
    if (cached) return cached;

    const result = await fetch(request);
    if (cache && result.ok && !result.redirected) {
      const copy = result.clone();
      save = writes = writes.then(async () => {
        await cache.put(request, copy);
        const keys = await cache.keys();
        await Promise.all(keys.slice(0, Math.max(0, keys.length - maxEntries))
          .map((key) => cache.delete(key)));
      }).catch(() => {});
    }
    return result;
  })();

  event.respondWith(response);
  event.waitUntil(response.then(() => save, () => undefined));
});
