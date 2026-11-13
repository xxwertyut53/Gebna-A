// GEBNA A — service worker: makes the site installable as an app and handles push notifications.
const CACHE = "gebna-a-shell-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(["/home", "/manifest.webmanifest"]).catch(() => undefined)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || caches.match("/home")))
  );
});

// Push from the server: show a system notification AND tell any open window to play the
// matching in-app sound (Shopify-style order chime for admins, offer jingle for customers).
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = {}; }
  const kind = data.kind === "offer" ? "offer" : "order";
  const title = data.title || (kind === "offer" ? "New Gebna-A offer" : "New Gebna-A order");
  const body = data.body || "";
  const url = data.url || "/home";

  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: kind,
      renotify: true,
      data: { url, kind },
    });
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    windowClients.forEach((client) => client.postMessage({ type: "gebna-push", kind, title, body, url }));
  })());
});

// Tapping the notification focuses an existing window (or opens a new one) on the target page.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/home";
  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windowClients) {
      if ("focus" in client) {
        client.navigate(target).catch(() => undefined);
        return client.focus();
      }
    }
    if (self.clients.openWindow) return self.clients.openWindow(target);
    return undefined;
  })());
});
