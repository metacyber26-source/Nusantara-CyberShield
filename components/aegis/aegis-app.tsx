"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Brain,
  ShieldCheck,
  ShieldAlert,
  PhoneOff,
  HardDriveDownload,
  KeyRound,
  GraduationCap,
  Wallet,
  ShieldHalf,
  Globe,
} from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Dashboard } from "./dashboard"
import { AgiAssistant } from "./agi-assistant"
import { Defence } from "./defence"
import { TheftLock } from "./theft-lock"
import { CallBlocker } from "./call-blocker"
import { FileSweeper } from "./file-sweeper"
import { Encryption } from "./encryption"
import { Education } from "./education"
import { WalletModule } from "./wallet"
import { cn } from "@/lib/utils"

type Tab = "dashboard" | "agi" | "defence" | "theft" | "calls" | "sweeper" | "crypto" | "learn" | "wallet"

export function AegisApp() {
  const [tab, setTab] = useState<Tab>("dashboard")
  const { language, setLanguage, t } = useLanguage()

  const NAV: { id: Tab; label: keyof typeof t }[] = [
    { id: "dashboard", label: "home" },
    { id: "agi", label: "agi" },
    { id: "defence", label: "defence" },
    { id: "theft", label: "theft" },
    { id: "wallet", label: "wallet" },
  ]

  const MORE: { id: Tab; label: keyof typeof t }[] = [
    { id: "calls", label: "blocker" },
    { id: "sweeper", label: "storage" },
    { id: "crypto", label: "encrypt" },
    { id: "learn", label: "learn" },
  ]

  const navIcons: Record<Tab, typeof LayoutDashboard> = {
    dashboard: LayoutDashboard,
    agi: Brain,
    defence: ShieldCheck,
    theft: ShieldAlert,
    wallet: Wallet,
    calls: PhoneOff,
    sweeper: HardDriveDownload,
    crypto: KeyRound,
    learn: GraduationCap,
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-30 glass flex items-center gap-2.5 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15">
          <ShieldHalf className="h-5 w-5 text-primary text-glow" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight">{t("appTitle")}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-primary">{t("subtitle")}</p>
        </div>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-1">
          <span className="h-1.5 w-1.5 animate-glow rounded-full bg-primary" />
          <span className="font-mono text-[10px] text-primary">{t("secure")}</span>
        </span>
        {/* Language switcher */}
        <button
          onClick={() => setLanguage(language === "en" ? "id" : "en")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card/60 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary"
          title={language === "en" ? "Switch to Indonesia" : "Beralih ke English"}
        >
          <Globe className="h-4 w-4" />
        </button>
      </header>

      {/* Quick row for "more" modules */}
      <div className="flex gap-2 overflow-x-auto px-4 py-3">
        {MORE.map((m) => {
          const Icon = navIcons[m.id]
          return (
            <button
              key={m.id}
              onClick={() => setTab(m.id)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                tab === m.id ? "border-primary/50 bg-primary/15 text-primary" : "border-border bg-card/60 text-muted-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(m.label)}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <main className="flex-1 px-4 pb-28">
        {tab === "dashboard" && <Dashboard />}
        {tab === "agi" && <AgiAssistant />}
        {tab === "defence" && <Defence />}
        {tab === "theft" && <TheftLock />}
        {tab === "calls" && <CallBlocker />}
        {tab === "sweeper" && <FileSweeper />}
        {tab === "crypto" && <Encryption />}
        {tab === "learn" && <Education />}
        {tab === "wallet" && <WalletModule />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md glass border-t border-border">
        <div className="grid grid-cols-5">
          {NAV.map((n) => {
            const active = tab === n.id
            const Icon = navIcons[n.id]
            return (
              <button
                key={n.id}
                onClick={() => setTab(n.id)}
                className="flex flex-col items-center gap-1 py-3"
                aria-label={t(n.label)}
              >
                <Icon className={cn("h-5 w-5 transition-colors", active ? "text-primary text-glow" : "text-muted-foreground")} />
                <span className={cn("text-[10px] font-medium", active ? "text-primary" : "text-muted-foreground")}>{t(n.label)}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
