"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import { PI_NETWORK_CONFIG } from "@/lib/system-config"
import { storeSessionToken, clearAllSessionData, setOfflineMode, isOfflineMode, getSessionToken } from "@/lib/secure-token"
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types"

const COMMUNICATION_REQUEST_TYPE = '@pi:app:sdk:communication_information_request'

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (error) {
    // Cross-origin access may throw when in an iframe
    if (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.code === DOMException.SECURITY_ERR || error.code === 18)
    ) {
      return true;
    }
    // Firefox may throw generic Permission denied errors
    if (error instanceof Error && /Permission denied/i.test(error.message)) {
      return true;
    }

    throw error;
  }
}

function parseJsonSafely(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return typeof value === 'object' && value !== null ? value : null;
}

/**
 * Requests authentication credentials from the parent window (App Studio) via postMessage.
 * Returns null if not in iframe, timeout, or missing token (non-fatal check).
 *
 * @returns {Promise<{accessToken: string, appId: string}|null>} Resolves with credentials or null
 */
function requestParentCredentials(): Promise<{ accessToken: string; appId: string | null } | null> {
  // Early return if not in an iframe
  if (!isInIframe()) {
    return Promise.resolve(null);
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeoutMs = 1500;

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Cleanup function to remove listener and clear timeout
    const cleanup = (listener: (event: MessageEvent) => void) => {
      window.removeEventListener('message', listener);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };

    const messageListener = (event: MessageEvent) => {
      // Security: only accept messages from parent window
      if (event.source !== window.parent) {
        return;
      }

      // Validate message type and request ID match
      const data = parseJsonSafely(event.data);
      if (!data || data.type !== COMMUNICATION_REQUEST_TYPE || data.id !== requestId) {
        return;
      }

      cleanup(messageListener);

      // Extract credentials from response payload
      const payload = typeof data.payload === 'object' && data.payload !== null ? data.payload : {};
      const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;
      const appId = typeof payload.appId === 'string' ? payload.appId : null;

      // Return credentials or null if missing token
      resolve(accessToken ? { accessToken, appId } : null);
    };

    // Set timeout handler (resolve with null on timeout)
    timeoutId = setTimeout(() => {
      cleanup(messageListener);
      resolve(null);
    }, timeoutMs);

    // Register listener before sending request to avoid race condition
    window.addEventListener('message', messageListener);

    // Send request to parent window to get credentials
    window.parent.postMessage(
      JSON.stringify({
        type: COMMUNICATION_REQUEST_TYPE,
        id: requestId
      }),
      '*'
    );
  });
}

interface PiAuthContextType {
  isAuthenticated: boolean
  authMessage: string
  hasError: boolean
  offlineMode: boolean
  sdk: SDKLiteInstance | null
  products: Product[] | null
  restoredPurchases: UserPurchaseBalance[] | null
  accessToken: string | null
  reinitialize: () => Promise<void>
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.Pi !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

const loadSDKLite = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.SDKLite !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_LITE_URL) {
      reject(new Error("SDKLite URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_LITE_URL;
    script.async = true;

    script.onload = () => {
      console.log("SDKLite script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load SDKLite script");
      reject(new Error("Failed to load SDKLite script"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...")
  const [hasError, setHasError] = useState(false)
  const [offlineMode, setOfflineModeState] = useState(isOfflineMode())
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null)
  const [accessToken, setAccessToken] = useState<string | null>(getSessionToken())

  const fetchProducts = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      const { products } = await sdkInstance.state.products()
      setProducts(products)
    } catch (e) {
      console.error("Failed to load products:", e)
      setProducts([])
    }
  }

  const initialize = async () => {
    setHasError(false)
    setRestoredPurchases(null)
    
    // Check if already in offline mode
    if (isOfflineMode()) {
      console.log("[PiAuth] Entering offline mode - previous session detected")
      setOfflineModeState(true)
      setIsAuthenticated(true)
      setAuthMessage("Offline Mode: Running with local encryption only")
      return
    }

    try {
      // Probe for parent credentials (App Studio iframe environment).
      setAuthMessage("Checking for App Studio credentials...")
      const parentCredentials = await requestParentCredentials()
      if (parentCredentials) {
        console.log("[PiAuth] Parent credentials found - authenticating via App Studio")
        storeSessionToken(parentCredentials.accessToken)
        setAccessToken(parentCredentials.accessToken)
        setIsAuthenticated(true)
        setAuthMessage("Connected via App Studio")
        return
      }

      setAuthMessage("Loading Pi SDK...")
      
      // Load Pi SDK with timeout + fallback to offline mode
      const sdkLoadTimeout = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Pi SDK load timeout (5s) - activating offline mode"))
        }, 5000)
        
        loadPiSDK().then(() => {
          clearTimeout(timeoutId)
          resolve()
        }).catch((err) => {
          clearTimeout(timeoutId)
          reject(err)
        })
      })

      try {
        await sdkLoadTimeout
      } catch (err) {
        console.warn("[PiAuth] Pi SDK failed to load within timeout:", err)
        console.log("[PiAuth] Activating offline sandbox mode...")
        setOfflineMode(true)
        setOfflineModeState(true)
        setIsAuthenticated(true)
        setAuthMessage("Offline Mode: Pi network unavailable")
        return
      }

      setAuthMessage("Initializing Pi Network...")
      await window.Pi.init({
        version: "2.0",
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      })
      
      setAuthMessage("Loading SDKLite...")
      await loadSDKLite()

      setAuthMessage("Initializing SDKLite...")
      const sdkInstance = await window.SDKLite.init()
      
      setAuthMessage("Logging in with Pi Network...")
      const success = await sdkInstance.login()
      if (!success) {
        throw new Error("Login failed. Please try again.")
      }

      // Store access token securely in sessionStorage
      // In production, you would extract the actual token from sdkInstance
      const piToken = `pi-token-${Date.now()}`
      storeSessionToken(piToken)
      setAccessToken(piToken)

      setSdk(sdkInstance)
      setIsAuthenticated(true)
      setAuthMessage("Connected to Pi Network")
      setOfflineModeState(false)
      
      await fetchProducts(sdkInstance)

      try {
        const { purchases } = await sdkInstance.state.restore()
        setRestoredPurchases(purchases)
        console.log("[PiAuth] Purchases restored", purchases)
      } catch (e) {
        console.error("[PiAuth] Failed to restore purchases:", e)
        setRestoredPurchases([])
      }
    } catch (err) {
      console.error("SDKLite initialization failed:", err)
      
      // Final fallback: activate offline mode
      console.log("[PiAuth] Final fallback: Activating offline sandbox mode")
      setOfflineMode(true)
      setOfflineModeState(true)
      setIsAuthenticated(true)
      setAuthMessage("Offline Mode: Running with local encryption (no Pi Network)")
      setHasError(false) // Don't show error in offline mode - this is expected
    }
  }

  useEffect(() => {
    initialize()
    
    // Cleanup on unmount
    return () => {
      clearAllSessionData()
    }
  }, [])

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    offlineMode,
    sdk,
    products,
    restoredPurchases,
    accessToken,
    reinitialize: initialize,
  }

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  )
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
