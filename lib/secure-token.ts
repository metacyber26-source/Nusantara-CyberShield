// Secure token storage using sessionStorage + AES-256 encryption
// Prevents token theft in public browsers (warnet) by using session-only storage
// and encrypting sensitive auth tokens

import { encrypt, decrypt } from "./secure-store"

const SESSION_TOKEN_KEY = "aegis_pi_token_v1"
const SESSION_OFFLINE_KEY = "aegis_offline_mode_v1"

/**
 * Store Pi Network access token securely in sessionStorage with encryption.
 * sessionStorage is cleared when browser tab closes, preventing token persistence
 * in public computer environments (warnet).
 */
export function storeSessionToken(token: string): void {
  if (typeof window === "undefined") return
  try {
    const encrypted = encrypt(token)
    window.sessionStorage.setItem(SESSION_TOKEN_KEY, encrypted)
    console.log("[SecureToken] Access token stored in encrypted sessionStorage")
  } catch (error) {
    console.error("[SecureToken] Failed to store token:", error)
  }
}

/**
 * Retrieve and decrypt Pi Network access token from sessionStorage.
 * Returns null if token doesn't exist or decryption fails.
 */
export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const encrypted = window.sessionStorage.getItem(SESSION_TOKEN_KEY)
    if (!encrypted) return null
    const decrypted = decrypt(encrypted)
    return decrypted || null
  } catch (error) {
    console.error("[SecureToken] Failed to retrieve token:", error)
    return null
  }
}

/**
 * Clear session token (on logout or tab close).
 */
export function clearSessionToken(): void {
  if (typeof window === "undefined") return
  try {
    window.sessionStorage.removeItem(SESSION_TOKEN_KEY)
    console.log("[SecureToken] Session token cleared")
  } catch (error) {
    console.error("[SecureToken] Failed to clear token:", error)
  }
}

/**
 * Enable offline mode flag in sessionStorage when Pi SDK fails.
 * Offline mode allows the app to run with local encryption only.
 */
export function setOfflineMode(enabled: boolean): void {
  if (typeof window === "undefined") return
  try {
    if (enabled) {
      window.sessionStorage.setItem(SESSION_OFFLINE_KEY, "true")
      console.log("[OfflineMode] Offline mode activated - running with local encryption only")
    } else {
      window.sessionStorage.removeItem(SESSION_OFFLINE_KEY)
      console.log("[OfflineMode] Offline mode disabled")
    }
  } catch (error) {
    console.error("[OfflineMode] Failed to set offline mode:", error)
  }
}

/**
 * Check if offline mode is currently active.
 */
export function isOfflineMode(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.sessionStorage.getItem(SESSION_OFFLINE_KEY) === "true"
  } catch (error) {
    console.error("[OfflineMode] Failed to check offline mode:", error)
    return false
  }
}

/**
 * Clear all session data when user logs out or session expires.
 */
export function clearAllSessionData(): void {
  if (typeof window === "undefined") return
  try {
    clearSessionToken()
    setOfflineMode(false)
    console.log("[SecureToken] All session data cleared")
  } catch (error) {
    console.error("[SecureToken] Failed to clear all session data:", error)
  }
}
