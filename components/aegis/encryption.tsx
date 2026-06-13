"use client"

import { useEffect, useState } from "react"
import { KeyRound, Lock, Unlock, RefreshCw, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { encrypt, decrypt, revealMasterKey, regenerateMasterKey, verifyIntegrity } from "@/lib/secure-store"

export function Encryption() {
  const [plain, setPlain] = useState("")
  const [cipher, setCipher] = useState("")
  const [decoded, setDecoded] = useState("")
  const [keyVisible, setKeyVisible] = useState(false)
  const [masterKey, setMasterKey] = useState("")
  const [integrity, setIntegrity] = useState<boolean | null>(null)

  useEffect(() => {
    setMasterKey(revealMasterKey())
  }, [])

  const doEncrypt = () => {
    const c = encrypt(plain)
    setCipher(c)
    setDecoded("")
    setIntegrity(verifyIntegrity(plain))
  }
  const doDecrypt = () => {
    setDecoded(decrypt(cipher))
  }
  const regen = () => setMasterKey(regenerateMasterKey())

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={KeyRound} title="Encryption Module" subtitle="AES-256 · key management · integrity" tone="good" />

      <GlassCard className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Master Key</p>
          <button onClick={() => setKeyVisible((v) => !v)} className="text-muted-foreground" aria-label="Toggle key visibility">
            {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="break-all rounded-xl bg-secondary/60 p-3 font-mono text-xs text-primary">
          {keyVisible ? masterKey : "•".repeat(48)}
        </p>
        <button onClick={regen} className="flex w-full items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium">
          <RefreshCw className="h-4 w-4" /> Generate New Key
        </button>
      </GlassCard>

      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <p className="text-sm font-medium">Encrypt / Decrypt Test</p>
        </div>
        <textarea value={plain} onChange={(e) => setPlain(e.target.value)} rows={2} placeholder="Plaintext to encrypt..." className="w-full resize-none rounded-xl bg-input p-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <div className="grid grid-cols-2 gap-2">
          <button onClick={doEncrypt} className="flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.98]">
            <Lock className="h-4 w-4" /> Encrypt
          </button>
          <button onClick={doDecrypt} disabled={!cipher} className="flex items-center justify-center gap-2 rounded-xl bg-secondary py-2.5 text-sm font-medium disabled:opacity-50">
            <Unlock className="h-4 w-4" /> Decrypt
          </button>
        </div>
        {cipher && (
          <div className="space-y-2">
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Ciphertext</p>
              <p className="break-all font-mono text-xs text-info">{cipher}</p>
            </div>
            {integrity !== null && (
              <ToneBadge tone={integrity ? "good" : "alert"}>
                {integrity ? "Integrity verified" : "Integrity failed"}
              </ToneBadge>
            )}
          </div>
        )}
        {decoded && (
          <div className="flex items-start gap-2 rounded-xl bg-primary/10 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p className="break-words text-sm">{decoded}</p>
          </div>
        )}
      </GlassCard>
    </div>
  )
}
