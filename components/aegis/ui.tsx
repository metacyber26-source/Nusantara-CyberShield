"use client"

import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export type StatusTone = "good" | "warn" | "alert" | "info"

const toneMap: Record<StatusTone, { text: string; bg: string; ring: string; dot: string }> = {
  good: { text: "text-primary", bg: "bg-primary/10", ring: "border-primary/40", dot: "bg-primary" },
  warn: { text: "text-warning", bg: "bg-warning/10", ring: "border-warning/40", dot: "bg-warning" },
  alert: { text: "text-destructive", bg: "bg-destructive/10", ring: "border-destructive/40", dot: "bg-destructive" },
  info: { text: "text-info", bg: "bg-info/10", ring: "border-info/40", dot: "bg-info" },
}

export function ToneBadge({
  tone,
  children,
}: {
  tone: StatusTone
  children: React.ReactNode
}) {
  const t = toneMap[tone]
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium font-mono", t.bg, t.ring, t.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
      {children}
    </span>
  )
}

export function ModuleHeader({
  icon: Icon,
  title,
  subtitle,
  tone = "info",
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  tone?: StatusTone
}) {
  const t = toneMap[tone]
  return (
    <div className="flex items-center gap-3">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border", t.bg, t.ring)}>
        <Icon className={cn("h-5 w-5", t.text)} />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-lg font-semibold leading-tight">{title}</h2>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  )
}

export function GlassCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("glass rounded-2xl p-4", className)}>{children}</div>
}

export { toneMap }
