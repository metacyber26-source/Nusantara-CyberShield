"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, ScanFace, ShieldAlert, Activity } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { OfflineModeIndicator } from "./offline-indicator"
import { GlassCard, ToneBadge } from "./ui"
import { predictThreatLevel, getAgiState } from "@/lib/agi"
import { cn } from "@/lib/utils"

type Status = "protected" | "warning" | "alert"

export function Dashboard() {
  const { t } = useLanguage()
  const { offlineMode } = usePiAuth()
  
  const modules = [
    { nameKey: "voiceprintShield" as const, descKey: "deepfakeDetection" as const, icon: ScanFace },
    { nameKey: "antiFraud" as const, descKey: "phishingGuard" as const, icon: ShieldCheck },
    { nameKey: "theftLock" as const, descKey: "behavioralBiometrics" as const, icon: ShieldAlert },
    { nameKey: "darkDataScanner" as const, descKey: "leakFirewall" as const, icon: Activity },
  ]
  const [status, setStatus] = useState<Status>("protected")
  const [score, setScore] = useState(18)
  const [accuracy, setAccuracy] = useState(85)
  const [reason, setReason] = useState("")

  useEffect(() => {
    const tick = () => {
      const pred = predictThreatLevel()
      setScore(pred.score)
      setReason(pred.reason)
      setStatus(pred.level === "high" ? "alert" : pred.level === "elevated" ? "warning" : "protected")
      setAccuracy(getAgiState().accuracy)
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])

  const statusTone = status === "protected" ? "good" : status === "warning" ? "warn" : "alert"
  const ringColor =
    status === "protected" ? "var(--primary)" : status === "warning" ? "var(--warning)" : "var(--destructive)"
  
  const statusLabel = status === "protected" ? t("protected") : status === "warning" ? t("warning") : t("alert")

  return (
    <div className="space-y-5 animate-slide-up">
      {offlineMode && <OfflineModeIndicator />}
      
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("systemStatus")}</p>
          <h1 className="text-2xl font-bold capitalize">{statusLabel}</h1>
        </div>
        <ToneBadge tone={statusTone}>{score} {t("riskScore")}</ToneBadge>
      </div>

      {/* Radar */}
      <GlassCard className="flex flex-col items-center gap-4 py-8">
        <div className="relative h-48 w-48">
          <div
            className="absolute inset-0 rounded-full border"
            style={{ borderColor: ringColor, opacity: 0.25 }}
          />
          <div
            className="absolute inset-6 rounded-full border"
            style={{ borderColor: ringColor, opacity: 0.2 }}
          />
          <div
            className="absolute inset-12 rounded-full border"
            style={{ borderColor: ringColor, opacity: 0.15 }}
          />
          <div
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 2px ${ringColor}` }}
          />
          {/* sweep */}
          <div className="animate-radar absolute inset-0">
            <div
              className="absolute left-1/2 top-1/2 h-1/2 w-1/2 origin-top-left"
              style={{
                background: `conic-gradient(from 0deg, ${ringColor}55, transparent 70%)`,
                clipPath: "polygon(0 0, 100% 0, 0 100%)",
              }}
            />
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ShieldCheck className="h-12 w-12 text-glow" style={{ color: ringColor }} />
            <span className="mt-1 font-mono text-xs text-muted-foreground">{t("scanning")}</span>
          </div>
        </div>
        <p className="max-w-xs text-balance text-center text-xs text-muted-foreground">{reason}</p>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t("agiAccuracy")}</p>
          <p className="mt-1 text-2xl font-bold text-primary text-glow">{accuracy.toFixed(1)}%</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${accuracy}%` }} />
          </div>
        </GlassCard>
        <GlassCard>
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{t("processing")}</p>
          <p className="mt-1 text-2xl font-bold text-info text-glow">{t("onDevice")}</p>
          <p className="mt-2 text-xs text-muted-foreground">{t("zeroCloud")}</p>
        </GlassCard>
      </div>

      <div className="space-y-2">
        <p className="px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("activeModules")}</p>
        {modules.map((m, i) => (
          <GlassCard key={m.nameKey} className="flex items-center gap-3 animate-slide-up" >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <m.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{t(m.nameKey)}</p>
              <p className="truncate text-xs text-muted-foreground">{t(m.descKey)}</p>
            </div>
            <ToneBadge tone="good">{t("on")}</ToneBadge>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
