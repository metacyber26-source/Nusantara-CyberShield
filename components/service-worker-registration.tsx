"use client"

import { useEffect } from "react"

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker for PWA functionality
      navigator.serviceWorker
        .register("/service-worker.js", { scope: "/" })
        .then((registration) => {
          console.log("[PWA] Service Worker registered successfully", registration)

          // Check for updates periodically
          const updateCheckInterval = setInterval(() => {
            registration.update().catch((err) => {
              console.error("[PWA] Service Worker update check failed:", err)
            })
          }, 60000) // Check every minute

          return () => clearInterval(updateCheckInterval)
        })
        .catch((error) => {
          console.error("[PWA] Service Worker registration failed:", error)
        })
    }
  }, [])

  return null
}
