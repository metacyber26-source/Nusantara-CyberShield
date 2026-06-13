"use client"

import { useRef, useState, useEffect } from "react"
import { Send, Brain, Sparkles, TrendingUp } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { agiReply, getAgiState, behavioralInsights, type AgiState, type Insight } from "@/lib/agi"
import { cn } from "@/lib/utils"

interface Msg {
  role: "user" | "agi"
  text: string
}

export function AgiAssistant() {
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Msg[]>([
    { role: "agi", text: "I'm Aegis AGI, running entirely on your device. Ask me anything about your security." },
  ])
  const [input, setInput] = useState("")
  const [state, setState] = useState<AgiState | null>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setState(getAgiState())
    setInsights(behavioralInsights())
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return
    const reply = agiReply(text)
    setMessages((m) => [...m, { role: "user", text }, { role: "agi", text: reply }])
    setInput("")
    setState(getAgiState())
    setInsights(behavioralInsights())
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={Brain} title={t("agiChat")} subtitle="Self-improving · 100% local intelligence" tone="info" />

      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="text-center">
          <Sparkles className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-lg font-bold text-primary">{state ? state.accuracy.toFixed(0) : 85}%</p>
          <p className="text-[10px] text-muted-foreground">{t("agiAccuracy")}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <Brain className="mx-auto h-4 w-4 text-info" />
          <p className="mt-1 text-lg font-bold text-info">{state?.learningEvents ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{t("noMessages")}</p>
        </GlassCard>
        <GlassCard className="text-center">
          <TrendingUp className="mx-auto h-4 w-4 text-warning" />
          <p className="mt-1 text-lg font-bold text-warning">{state?.threatsBlocked ?? 0}</p>
          <p className="text-[10px] text-muted-foreground">{t("theftDetected")}</p>
        </GlassCard>
      </div>

      <GlassCard className="flex h-[340px] flex-col p-0">
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm",
                )}
              >
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 border-t border-border p-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={t("askAnything")}
            className="flex-1 rounded-xl bg-input px-3.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={send}
            aria-label={t("send")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </GlassCard>

      <div className="space-y-2">
        <p className="px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">Behavioral Insights</p>
        {insights.map((ins) => (
          <GlassCard key={ins.id} className="flex items-start gap-3">
            <ToneBadge tone={ins.tone === "warn" ? "warn" : ins.tone === "good" ? "good" : "info"}>{ins.tone}</ToneBadge>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{ins.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{ins.body}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
