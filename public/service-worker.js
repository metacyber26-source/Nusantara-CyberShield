const CACHE_NAME = "aegis-guardian-v1"
const URLS_TO_CACHE = [
  "/",
  "/manifest.json",
  "/offline.html",
]

// Install Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE).catch(() => {
        console.log("[SW] Some URLs could not be cached during install")
      })
    })
  )
  self.skipWaiting()
})

// Activate Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Network-first strategy with cache fallback
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response
        }

        // Clone the response before caching
        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache)
        })

        return response
      })
      .catch(() => {
        // Return cached version on network failure
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Return offline page if available
          if (event.request.destination === "document") {
            return caches.match("/offline.html")
          }
        })
      })
  )
})

// Handle message from client (for cache invalidation)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})
