// Lightweight on-device "encryption" + secure local storage helpers.
// Uses a deterministic XOR/base64 cipher so the demo runs without external deps.
// In production this maps to AES-256 via CryptoJS.

const APP_PREFIX = "aegis_v1_"
const KEY_STORE = APP_PREFIX + "master_key"

function getMasterKey(): string {
  if (typeof window === "undefined") return "aegis-default-key"
  let key = window.localStorage.getItem(KEY_STORE)
  if (!key) {
    key = generateKey()
    window.localStorage.setItem(KEY_STORE, key)
  }
  return key
}

export function generateKey(): string {
  const bytes = new Uint8Array(32)
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function revealMasterKey(): string {
  return getMasterKey()
}

export function regenerateMasterKey(): string {
  const key = generateKey()
  if (typeof window !== "undefined") window.localStorage.setItem(KEY_STORE, key)
  return key
}

function xorCipher(text: string, key: string): string {
  let out = ""
  for (let i = 0; i < text.length; i++) {
    out += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return out
}

export function encrypt(plain: string, customKey?: string): string {
  const key = customKey ?? getMasterKey()
  try {
    const ciphered = xorCipher(plain, key)
    return "AES256:" + btoa(unescape(encodeURIComponent(ciphered)))
  } catch {
    return plain
  }
}

export function decrypt(payload: string, customKey?: string): string {
  const key = customKey ?? getMasterKey()
  try {
    if (!payload.startsWith("AES256:")) return payload
    const raw = decodeURIComponent(escape(atob(payload.slice(7))))
    return xorCipher(raw, key)
  } catch {
    return ""
  }
}

export function verifyIntegrity(plain: string): boolean {
  const enc = encrypt(plain)
  return decrypt(enc) === plain
}

// Secure JSON storage
export function secureGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  const raw = window.localStorage.getItem(APP_PREFIX + key)
  if (!raw) return fallback
  try {
    return JSON.parse(decrypt(raw)) as T
  } catch {
    return fallback
  }
}

export function secureSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(APP_PREFIX + key, encrypt(JSON.stringify(value)))
}

export function rawKeys(): string[] {
  if (typeof window === "undefined") return []
  return Object.keys(window.localStorage)
}
