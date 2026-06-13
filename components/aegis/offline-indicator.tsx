"use client"

import { usePiAuth } from "@/contexts/pi-auth-context"
import { Wifi, WifiOff } from "lucide-react"

/**
 * Status indicator showing whether app is connected to Pi Network or running in Offline Mode.
 * Displayed in the dashboard when offline mode is active.
 */
export function OfflineModeIndicator() {
  const { offlineMode } = usePiAuth()

  if (!offlineMode) return null

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2">
      <WifiOff className="h-4 w-4 text-warning" />
      <div className="flex-1">
        <p className="text-xs font-medium text-warning">Offline Mode</p>
        <p className="text-[10px] text-muted-foreground">Running with local encryption · Pi Network unavailable</p>
      </div>
    </div>
  )
}

/**
 * Status badge for connection state (Pi Network or Offline).
 */
export function ConnectionStatusBadge() {
  const { offlineMode, isAuthenticated } = usePiAuth()

  return (
    <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
      offlineMode
        ? "border border-warning/40 bg-warning/10 text-warning"
        : "border border-primary/40 bg-primary/10 text-primary"
    }`}>
      {offlineMode ? (
        <>
          <WifiOff className="h-3 w-3" />
          Offline
        </>
      ) : (
        <>
          <Wifi className="h-3 w-3" />
          Connected
        </>
      )}
    </div>
  )
}
