/*
 * Mission Control's service worker.
 *
 * It deliberately caches nothing. Every page here reads files off disk
 * at request time (client records, drafts, posts, git state), so a
 * cached copy would be a stale copy of something the app exists to tell
 * the truth about. The fetch handler is a pass-through and only exists
 * because a browser will not treat a site as installable without one.
 *
 * What it is actually for: owning the notifications. A notification
 * shown through the registration outlives the page that asked for it
 * and, when the app is installed, belongs to the app rather than to a
 * browser tab. The click handler then brings that window back.
 */

self.addEventListener("install", () => {
  // Take over immediately rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through. See the note above: no caching on purpose.
self.addEventListener("fetch", () => {});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        // Prefer a window that is already open, so clicking a
        // notification never leaves a second copy of the app behind.
        for (const client of windows) {
          if ("focus" in client) {
            client.navigate(target);
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      })
  );
});
