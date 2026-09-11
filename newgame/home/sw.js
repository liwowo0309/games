const CACHE = "english-life-home-v20";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/state.js",
  "./js/speech.js",
  "./js/world.js",
  "./js/dialogue.js",
  "./js/shop.js",
  "./js/app.js",
  "./js/data/events.js",
  "./js/data/more-events.js",
  "./js/data/school-events.js",
  "./js/data/town-events.js",
  "./js/data/alts.js",
  "./manifest.json",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
