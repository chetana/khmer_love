// This service worker replaces the old AI Studio one.
// It unregisters itself and clears all caches so the app runs clean.
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', async () => {
  // Clear all caches from the old deployment
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  // Unregister this service worker
  await self.registration.unregister();
  // Force all open tabs to reload with fresh assets
  const clients = await self.clients.matchAll({ type: 'window' });
  clients.forEach((c) => c.navigate(c.url));
});
