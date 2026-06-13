import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { AppWrapper } from "@/components/app-wrapper"
import { ServiceWorkerRegistration } from "@/components/service-worker-registration"
import "./globals.css"

export const metadata: Metadata = {
  title: "Made with App Studio",
  description:
    "Aegis Guardian AI — 100% on-device security with AGI engine, deepfake voice detection, behavioral theft-lock, anti-fraud, and dark data scanning.",
  generator: "App Studio",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aegis Guardian AI",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Aegis Guardian AI",
    description: "100% on-device mobile security with AGI engine",
    type: "web",
  },
}

export const viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Aegis" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="msapplication-TileColor" content="#0a0a0f" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%230a0a0f'/><g fill='%2300ff88'><rect x='48' y='48' width='96' height='96' rx='12'/><circle cx='96' cy='96' r='24' fill='%230a0a0f'/></g></svg>" />
        <link rel="apple-touch-icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 192 192'><rect fill='%230a0a0f'/><g fill='%2300ff88'><rect x='48' y='48' width='96' height='96' rx='12'/><circle cx='96' cy='96' r='24' fill='%230a0a0f'/></g></svg>" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
        <script src="/anti-tampering.js" defer></script>
      </head>
      <body>
        <ServiceWorkerRegistration />
        <AppWrapper>{children}</AppWrapper>
      </body>
    </html>
  )
}
