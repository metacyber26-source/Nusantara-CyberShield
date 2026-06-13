"use client"

import { useEffect, useState } from "react"
import { PhoneOff, Plus, Trash2, ShieldX } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { secureGet, secureSet } from "@/lib/secure-store"
import { recordInteraction } from "@/lib/agi"

interface Blocked {
  id: string
  number: string
  label: string
  spam: boolean
}
interface CallLog {
  id: string
  number: string
  type: "call" | "sms"
  time: string
}

const SPAM_PREFIXES = ["0809", "0888", "1500", "+62809"]

export function CallBlocker() {
  const { t } = useLanguage()
  const [list, setList] = useState<Blocked[]>([])
  const [logs, setLogs] = useState<CallLog[]>([])
  const [num, setNum] = useState("")
  const [label, setLabel] = useState("")
  const [blockUnknown, setBlockUnknown] = useState(false)

  useEffect(() => {
    setList(secureGet<Blocked[]>("blocked", []))
    setLogs(secureGet<CallLog[]>("call_logs", []))
    setBlockUnknown(secureGet<boolean>("block_unknown", false))
  }, [])

  const add = () => {
    if (!num.trim()) return
    const spam = SPAM_PREFIXES.some((p) => num.replace(/\s/g, "").startsWith(p))
    const b: Blocked = { id: crypto.randomUUID(), number: num.trim(), label: label.trim() || (spam ? "Auto: SPAM ID" : "Manual block"), spam }
    const updated = [b, ...list]
    setList(updated)
    secureSet("blocked", updated)
    setNum("")
    setLabel("")
    recordInteraction(true)
  }

  const remove = (id: string) => {
    const updated = list.filter((b) => b.id !== id)
    setList(updated)
    secureSet("blocked", updated)
  }

  const toggleUnknown = () => {
    const v = !blockUnknown
    setBlockUnknown(v)
    secureSet("block_unknown", v)
  }

  const simulate = () => {
    const numbers = ["0809 1122 3344", "+62 812 9988 7766", "1500 188", "0888 0001"]
    const n = numbers[Math.floor(Math.random() * numbers.length)]
    const log: CallLog = { id: crypto.randomUUID(), number: n, type: Math.random() > 0.5 ? "call" : "sms", time: new Date().toLocaleTimeString() }
    const updated = [log, ...logs].slice(0, 20)
    setLogs(updated)
    secureSet("call_logs", updated)
    recordInteraction(true)
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={PhoneOff} title={t("callBlocker")} subtitle="Spam ID detection · unknown caller guard" tone="warn" />

      <GlassCard className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{t("blockUnknown")}</p>
          <p className="text-xs text-muted-foreground">Silences callers not in contacts</p>
        </div>
        <button onClick={toggleUnknown} className={`relative h-7 w-12 rounded-full transition-colors ${blockUnknown ? "bg-primary" : "bg-secondary"}`} aria-label={t("blockUnknown")}>
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-background transition-all ${blockUnknown ? "left-6" : "left-1"}`} />
        </button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <p className="text-sm font-medium">{t("blockUnknown")}</p>
        <input value={num} onChange={(e) => setNum(e.target.value)} placeholder={t("addNumber")} inputMode="tel" className="w-full rounded-xl bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("addNote")} className="w-full rounded-xl bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={add} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.98]">
          <Plus className="h-4 w-4" /> {t("blockUnknown")}
        </button>
      </GlassCard>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("blockedNumbers")} ({list.length})</p>
          <button onClick={simulate} className="text-xs text-info">+ {t("detectionMethod")}</button>
        </div>
        {list.length === 0 && <GlassCard><p className="text-xs text-muted-foreground">{t("noBlocked")}</p></GlassCard>}
        {list.map((b) => (
          <GlassCard key={b.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-destructive/10">
              <ShieldX className="h-4 w-4 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{b.number}</p>
              <p className="truncate text-xs text-muted-foreground">{b.label}</p>
            </div>
            {b.spam && <ToneBadge tone="alert">spam</ToneBadge>}
            <button onClick={() => remove(b.id)} aria-label={t("delete")} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </GlassCard>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="space-y-2">
          <p className="px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("detectionMethod")}</p>
          {logs.map((l) => (
            <div key={l.id} className="flex items-center gap-3 rounded-xl bg-card/60 px-3 py-2">
              <span className="rounded-md bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase">{l.type}</span>
              <p className="min-w-0 flex-1 truncate text-xs">{l.number}</p>
              <span className="font-mono text-[10px] text-muted-foreground">{l.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
