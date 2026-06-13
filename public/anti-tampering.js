/**
 * Anti-Tampering & Inspection Protection
 * Blocks F12, right-click context menu, and developer console access
 * Runs as early as possible to prevent debugging/code theft
 */

(function () {
  "use strict"

  // Disable F12 (DevTools)
  document.addEventListener("keydown", function (event) {
    if (event.keyCode === 123) {
      event.preventDefault()
      event.stopPropagation()
      console.warn("[Security] F12 DevTools access blocked")
    }
    // Also block Ctrl+Shift+I (Inspect Element)
    if (event.ctrlKey && event.shiftKey && event.keyCode === 73) {
      event.preventDefault()
      event.stopPropagation()
      console.warn("[Security] Inspect Element (Ctrl+Shift+I) blocked")
    }
    // Block Ctrl+Shift+J (Console)
    if (event.ctrlKey && event.shiftKey && event.keyCode === 74) {
      event.preventDefault()
      event.stopPropagation()
      console.warn("[Security] Console (Ctrl+Shift+J) blocked")
    }
    // Block Ctrl+Shift+C (Inspect Element alternate)
    if (event.ctrlKey && event.shiftKey && event.keyCode === 67) {
      event.preventDefault()
      event.stopPropagation()
      console.warn("[Security] Inspect Element (Ctrl+Shift+C) blocked")
    }
  })

  // Disable right-click context menu
  document.addEventListener("contextmenu", function (event) {
    event.preventDefault()
    event.stopPropagation()
    console.warn("[Security] Right-click context menu disabled")
  })

  // Block DevTools detection workaround attempts
  const devtools = {
    open: false,
    orientation: undefined,
  }

  const threshold = 160

  setInterval(function () {
    if (window.outerHeight - window.innerHeight > threshold || window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true
        console.error("[Security] Developer Tools detected - consider closing for security")
      }
    } else {
      devtools.open = false
    }
  }, 500)

  // Disable console methods to prevent script injection
  const noop = function () {}
  const methods = ["log", "debug", "info", "warn", "error", "assert", "count", "clear", "time", "timeEnd"]

  // Store original console methods for internal use
  if (typeof window !== "undefined") {
    const originalConsole = {
      log: console.log.bind(console),
      warn: console.warn.bind(console),
      error: console.error.bind(console),
    }

    // Disable public access to console (but keep internal logging)
    Object.defineProperty(window, "console", {
      get: function () {
        return {
          log: noop,
          debug: noop,
          info: noop,
          warn: noop,
          error: noop,
          assert: noop,
          count: noop,
          clear: noop,
          time: noop,
          timeEnd: noop,
          trace: noop,
          group: noop,
          groupEnd: noop,
          table: noop,
          // Keep originals accessible only internally
          _original: originalConsole,
        }
      },
      set: function () {},
      configurable: false,
    })
  }

  // Prevent common debugging tricks
  if (typeof window !== "undefined") {
    // Block debugger statement
    Object.defineProperty(window, "debugger", {
      get: function () {
        console.error("[Security] Debugger access blocked")
        return undefined
      },
      set: function () {},
      configurable: false,
    })

    // Detect and warn about eval usage
    const originalEval = eval
    window.eval = function (code) {
      console.error("[Security] Eval execution blocked for security")
      return undefined
    }
  }

  console.warn("[Security] Anti-tampering protection initialized")
})()
