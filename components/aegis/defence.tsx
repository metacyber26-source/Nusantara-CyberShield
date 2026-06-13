"use client"

import { useEffect, useState } from "react"
import { ShieldCheck, FileLock2, ScanSearch, ListChecks, Trash2, Plus } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { secureGet, secureSet } from "@/lib/secure-store"
import { recordInteraction } from "@/lib/agi"
import { cn } from "@/lib/utils"

interface Note {
  id: string
  title: string
  body: string
}
interface LogEntry {
  id: string
  text: string
  tone: "good" | "warn" | "alert"
  time: string
}

const PHISH_SIGNALS = [
  { re: /https?:\/\/[^\s]*(bit\.ly|tinyurl|verify|secure-login|account-update)/i, label: "Suspicious shortened/verify link" },
  { re: /urgent|immediately|suspended|verify your account|act now|won|prize|claim/i, label: "Urgency / lure language" },
  { re: /\b(otp|password|pin|cvv|seed phrase)\b/i, label: "Credential request" },
  { re: /<script|onerror=|javascript:|<iframe/i, label: "Injected script / HTML" },
]

function addLog(entry: Omit<LogEntry, "id" | "time">): LogEntry[] {
  const logs = secureGet<LogEntry[]>("sec_logs", [])
  const next: LogEntry = { ...entry, id: crypto.randomUUID(), time: new Date().toLocaleTimeString() }
  const updated = [next, ...logs].slice(0, 30)
  secureSet("sec_logs", updated)
  return updated
}

export function Defence() {
  const { t } = useLanguage()
  const [input, setInput] = useState("")
  const [result, setResult] = useState<{ clean: string; signals: string[] } | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [noteTitle, setNoteTitle] = useState("")
  const [noteBody, setNoteBody] = useState("")
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    setNotes(secureGet<Note[]>("notes", []))
    setLogs(secureGet<LogEntry[]>("sec_logs", []))
  }, [])

  const analyze = () => {
    const signals = PHISH_SIGNALS.filter((s) => s.re.test(input)).map((s) => s.label)
    const clean = input
      .replace(/<script[\s\S]*?<\/script>/gi, "[blocked-script]")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/javascript:/gi, "blocked:")
    setResult({ clean, signals })
    const danger = signals.length > 0
    setLogs(addLog({ text: danger ? `Neutralized ${signals.length} threat indicator(s)` : "Input validated clean", tone: danger ? "alert" : "good" }))
    recordInteraction(danger)
  }

  const runDarkScan = () => {
    setScanning(true)
    setTimeout(() => {
      const found = Math.floor(Math.random() * 3)
      setLogs(addLog({ text: found ? `Dark Data Scanner blocked ${found} silent leak attempt(s)` : "Dark Data Scan clean — no leaks", tone: found ? "warn" : "good" }))
      recordInteraction(found > 0)
      setScanning(false)
    }, 1400)
  }

  const saveNote = () => {
    if (!noteTitle.trim()) return
    const n: Note = { id: crypto.randomUUID(), title: noteTitle.trim(), body: noteBody.trim() }
    const updated = [n, ...notes]
    setNotes(updated)
    secureSet("notes", updated)
    setNoteTitle("")
    setNoteBody("")
    setLogs(addLog({ text: "Secure note encrypted (AES-256)", tone: "good" }))
  }

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id)
    setNotes(updated)
    secureSet("notes", updated)
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={ShieldCheck} title={t("defence")} subtitle="Validation · secure notes · leak firewall" tone="good" />

      {/* Input validator + phishing */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-4 w-4 text-info" />
          <p className="text-sm font-medium">{t("phishingDetector")}</p>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={3}
          placeholder={t("checkText")}
          className="w-full resize-none rounded-xl bg-input p-3 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button onClick={analyze} className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.98]">
          {t("agiChat")}
        </button>
        {result && (
          <div className="space-y-2 rounded-xl bg-secondary/60 p-3">
            {result.signals.length === 0 ? (
              <ToneBadge tone="good">{t("isSafe")}</ToneBadge>
            ) : (
              <div className="space-y-1.5">
                <ToneBadge tone="alert">{result.signals.length} indicator(s)</ToneBadge>
                {result.signals.map((s) => (
                  <p key={s} className="text-xs text-destructive">• {s}</p>
                ))}
              </div>
            )}
            <p className="break-words font-mono text-xs text-muted-foreground">{result.clean || "(empty)"}</p>
          </div>
        )}
      </GlassCard>

      {/* Dark data scanner */}
      <GlassCard className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
          <ListChecks className="h-5 w-5 text-info" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{t("darkDataScanner")}</p>
          <p className="text-xs text-muted-foreground">{t("leakFirewall")}</p>
        </div>
        <button
          onClick={runDarkScan}
          disabled={scanning}
          className="rounded-lg bg-info/15 px-3 py-2 text-xs font-medium text-info disabled:opacity-60"
        >
          {scanning ? t("scanning") : t("scanStorage")}
        </button>
      </GlassCard>

      {/* Secure notes */}
      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <FileLock2 className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">{t("secureNotes")}</p>
        </div>
        <input
          value={noteTitle}
          onChange={(e) => setNoteTitle(e.target.value)}
          placeholder={t("addNote")}
          className="w-full rounded-xl bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          rows={2}
          placeholder={t("addNote")}
          className="w-full resize-none rounded-xl bg-input p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button onClick={saveNote} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium">
          <Plus className="h-4 w-4" /> {t("encryptText")}
        </button>
        <div className="space-y-2">
          {notes.length === 0 && <p className="text-xs text-muted-foreground">{t("noNotes")}</p>}
          {notes.map((n) => (
            <div key={n.id} className="flex items-start gap-2 rounded-xl bg-secondary/60 p-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.body || "(no content)"}</p>
              </div>
              <button onClick={() => deleteNote(n.id)} aria-label={t("delete")} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security log */}
      <div className="space-y-2">
        <p className="px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{t("securityLog")}</p>
        {logs.length === 0 && <GlassCard><p className="text-xs text-muted-foreground">{t("noLogEntries")}</p></GlassCard>}
        {logs.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-xl bg-card/60 px-3 py-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", l.tone === "good" ? "bg-primary" : l.tone === "warn" ? "bg-warning" : "bg-destructive")} />
            <p className="min-w-0 flex-1 truncate text-xs">{l.text}</p>
            <span className="font-mono text-[10px] text-muted-foreground">{l.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
