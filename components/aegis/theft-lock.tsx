"use client"

import { useEffect, useRef, useState } from "react"
import { ShieldAlert, Lock, Activity, Delete } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { secureGet, secureSet } from "@/lib/secure-store"
import { recordInteraction } from "@/lib/agi"
import { cn } from "@/lib/utils"

type Sensitivity = "low" | "medium" | "high"
const THRESHOLDS: Record<Sensitivity, number> = { low: 28, medium: 18, high: 11 }

export function TheftLock() {
  const { t } = useLanguage()
  const [armed, setArmed] = useState(false)
  const [sensitivity, setSensitivity] = useState<Sensitivity>("medium")
  const [locked, setLocked] = useState(false)
  const [pin, setPin] = useState("")
  const [entry, setEntry] = useState("")
  const [error, setError] = useState(false)
  const [motion, setMotion] = useState(0)
  const lastAcc = useRef<{ x: number; y: number; z: number } | null>(null)

  useEffect(() => {
    setPin(secureGet<string>("theft_pin", "1234"))
    setSensitivity(secureGet<Sensitivity>("theft_sens", "medium"))
  }, [])

  useEffect(() => {
    if (!armed) return
    const handler = (e: DeviceMotionEvent) => {
      const a = e.accelerationIncludingGravity
      if (!a || a.x == null) return
      const cur = { x: a.x ?? 0, y: a.y ?? 0, z: a.z ?? 0 }
      if (lastAcc.current) {
        const d =
          Math.abs(cur.x - lastAcc.current.x) +
          Math.abs(cur.y - lastAcc.current.y) +
          Math.abs(cur.z - lastAcc.current.z)
        setMotion(d)
        if (d > THRESHOLDS[sensitivity]) {
          setLocked(true)
          recordInteraction(true)
        }
      }
      lastAcc.current = cur
    }
    window.addEventListener("devicemotion", handler)
    return () => window.removeEventListener("devicemotion", handler)
  }, [armed, sensitivity])

  const toggleArm = async () => {
    if (!armed) {
      // iOS requires permission for motion
      const DM = (window as any).DeviceMotionEvent
      if (DM && typeof DM.requestPermission === "function") {
        try {
          await DM.requestPermission()
        } catch {
          /* ignore */
        }
      }
    }
    setArmed((a) => !a)
  }

  const simulate = () => {
    setLocked(true)
    recordInteraction(true)
  }

  const setSens = (s: Sensitivity) => {
    setSensitivity(s)
    secureSet("theft_sens", s)
  }

  const press = (n: string) => {
    if (entry.length >= 6) return
    const next = entry + n
    setEntry(next)
    if (next === pin || (next.length >= 4 && next === pin)) {
      setLocked(false)
      setEntry("")
      setError(false)
    }
  }
  const submit = () => {
    if (entry === pin) {
      setLocked(false)
      setEntry("")
      setError(false)
    } else {
      setError(true)
      setEntry("")
      setTimeout(() => setError(false), 600)
    }
  }

  if (locked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/95 px-6 backdrop-blur-md">
        <div className={cn("flex flex-col items-center", error && "animate-shake")}>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/15 glow-primary" style={{ boxShadow: "0 0 32px -4px var(--destructive)" }}>
            <Lock className="h-12 w-12 text-destructive" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-destructive text-glow">{t("lockActive")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("theftDetected")}</p>
          <div className="mt-6 flex gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={cn("h-3 w-3 rounded-full border", i < entry.length ? "bg-primary border-primary" : "border-muted-foreground/40")} />
            ))}
          </div>
        </div>
        <div className="mt-8 grid w-full max-w-xs grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
            <button key={n} onClick={() => press(n)} className="aspect-square rounded-2xl bg-secondary text-xl font-semibold active:scale-95 active:bg-primary active:text-primary-foreground">
              {n}
            </button>
          ))}
          <button onClick={() => setEntry("")} className="aspect-square rounded-2xl text-sm text-muted-foreground active:scale-95">{t("cancel")}</button>
          <button onClick={() => press("0")} className="aspect-square rounded-2xl bg-secondary text-xl font-semibold active:scale-95">0</button>
          <button onClick={() => setEntry(entry.slice(0, -1))} className="flex aspect-square items-center justify-center rounded-2xl active:scale-95"><Delete className="h-5 w-5" /></button>
        </div>
        <button onClick={submit} className="mt-5 w-full max-w-xs rounded-xl bg-primary py-3 font-medium text-primary-foreground active:scale-[0.98]">{t("unlock")}</button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={ShieldAlert} title={t("theftLockModule")} subtitle="Accelerometer + biometric motion guard" tone={armed ? "good" : "warn"} />

      <GlassCard className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{t("theftLockModule")}</p>
          <p className="text-xs text-muted-foreground">{armed ? t("enabled") : t("disabled")}</p>
        </div>
        <button
          onClick={toggleArm}
          className={cn("relative h-7 w-12 rounded-full transition-colors", armed ? "bg-primary" : "bg-secondary")}
          aria-label={t("theftLockModule")}
        >
          <span className={cn("absolute top-1 h-5 w-5 rounded-full bg-background transition-all", armed ? "left-6" : "left-1")} />
        </button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-info" />
          <p className="text-sm font-medium">{t("processing")}</p>
          <span className="ml-auto font-mono text-xs text-muted-foreground">{motion.toFixed(1)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-all", motion > THRESHOLDS[sensitivity] ? "bg-destructive" : "bg-primary")}
            style={{ width: `${Math.min(100, (motion / THRESHOLDS[sensitivity]) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Trips lock above {THRESHOLDS[sensitivity]} m/s². Move/shake your phone to test (or simulate below).</p>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-sm font-medium">{t("sensitivity")}</p>
        <div className="grid grid-cols-3 gap-2">
          {(["low", "medium", "high"] as Sensitivity[]).map((s) => (
            <button
              key={s}
              onClick={() => setSens(s)}
              className={cn("rounded-xl py-2.5 text-sm font-medium capitalize transition-colors", sensitivity === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}
            >
              {t(s === "low" ? "low" : s === "medium" ? "medium" : "high")}
            </button>
          ))}
        </div>
      </GlassCard>

      <button onClick={simulate} className="w-full rounded-xl border border-destructive/40 bg-destructive/10 py-3 text-sm font-medium text-destructive active:scale-[0.98]">
        {t("theftDetected")}
      </button>
      <div className="flex items-center justify-center">
        <ToneBadge tone="info">{t("enterPin")}: {pin}</ToneBadge>
      </div>
    </div>
  )
}
