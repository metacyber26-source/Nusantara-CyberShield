"use client"

import { useState } from "react"
import { GraduationCap, ChevronRight } from "lucide-react"
import { GlassCard, ModuleHeader } from "./ui"
import { cn } from "@/lib/utils"

interface Lesson {
  id: string
  topic: string
  summary: string
  detail: string
  accent: "primary" | "warning" | "destructive" | "info"
}

const LESSONS: Lesson[] = [
  { id: "deepfake", topic: "Deepfake Voices", summary: "AI can clone a voice from seconds of audio.", detail: "Attackers clone a relative's or boss's voice to authorize transfers. Verify with a code word and let Voiceprint Shield watermark and analyze calls locally.", accent: "destructive" },
  { id: "phishing", topic: "Phishing", summary: "Fake links steal credentials.", detail: "Never tap urgent 'verify your account' links. Hover/inspect the domain, and run suspicious text through the Defence scanner first.", accent: "warning" },
  { id: "leaks", topic: "Data Leaks", summary: "Apps quietly exfiltrate data.", detail: "Third-party SDKs can siphon contacts and location. The Dark Data Scanner acts as a local firewall to flag silent transfers.", accent: "info" },
  { id: "spoof", topic: "Call Spoofing", summary: "Caller ID can be faked.", detail: "Scammers spoof bank numbers. Treat unsolicited calls asking for OTP/PIN as hostile and block them.", accent: "warning" },
  { id: "simswap", topic: "SIM Swap", summary: "Your number can be hijacked.", detail: "Attackers port your SIM to intercept OTPs. Use app-based 2FA over SMS and set a carrier PIN.", accent: "destructive" },
  { id: "agi", topic: "On-Device AGI", summary: "Local intelligence keeps data private.", detail: "Aegis runs all inference on your NPU. Nothing is sent to the cloud, so detection improves without sacrificing privacy.", accent: "primary" },
]

const accentText: Record<Lesson["accent"], string> = {
  primary: "text-primary",
  warning: "text-warning",
  destructive: "text-destructive",
  info: "text-info",
}
const accentBg: Record<Lesson["accent"], string> = {
  primary: "bg-primary/10",
  warning: "bg-warning/10",
  destructive: "bg-destructive/10",
  info: "bg-info/10",
}

export function Education() {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={GraduationCap} title="Security Education" subtitle="Learn to spot modern digital threats" tone="info" />

      <div className="space-y-3">
        {LESSONS.map((l) => {
          const expanded = open === l.id
          return (
            <GlassCard key={l.id} className="cursor-pointer" >
              <button onClick={() => setOpen(expanded ? null : l.id)} className="flex w-full items-center gap-3 text-left">
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", accentBg[l.accent])}>
                  <GraduationCap className={cn("h-5 w-5", accentText[l.accent])} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{l.topic}</p>
                  <p className="truncate text-xs text-muted-foreground">{l.summary}</p>
                </div>
                <ChevronRight className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", expanded && "rotate-90")} />
              </button>
              {expanded && (
                <p className="mt-3 animate-slide-up border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">{l.detail}</p>
              )}
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
