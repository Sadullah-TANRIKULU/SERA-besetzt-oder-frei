// public/sw.js

// This is a minimal Service Worker required for PWA installation.
self.addEventListener("install", (event) => {
  console.log("SERA Service Worker installed.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SERA Service Worker activated.");
});

// Basic fetch handler (required for PWA criteria)
self.addEventListener("fetch", (event) => {
  // You can add caching logic here later if you want offline support
  event.respondWith(fetch(event.request));
});
