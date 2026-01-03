// public/sw.js
const CACHE_NAME = 'sera-cache-v1';

// We don't need complex caching for now, just a functional listener
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Simple pass-through to satisfy PWA requirements
  event.respondWith(fetch(event.request));
});