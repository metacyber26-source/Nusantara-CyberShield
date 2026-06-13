"use client"

import { useEffect, useState } from "react"
import { Wallet, CheckCircle2, ArrowUpRight, Plug } from "lucide-react"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { usePiAuth } from "@/contexts/pi-auth-context"
import { secureGet, secureSet } from "@/lib/secure-store"

interface Tx {
  id: string
  amount: number
  to: string
  time: string
}

export function WalletModule() {
  const { isAuthenticated, sdk } = usePiAuth()
  const [connected, setConnected] = useState(false)
  const [txs, setTxs] = useState<Tx[]>([])
  const [amount, setAmount] = useState("")
  const [to, setTo] = useState("")

  useEffect(() => {
    setConnected(secureGet<boolean>("wallet_connected", false))
    setTxs(secureGet<Tx[]>("wallet_txs", []))
  }, [])

  const connect = () => {
    setConnected(true)
    secureSet("wallet_connected", true)
  }

  const send = () => {
    const amt = Number.parseFloat(amount)
    if (!amt || amt <= 0 || !to.trim()) return
    const tx: Tx = { id: crypto.randomUUID(), amount: amt, to: to.trim(), time: new Date().toLocaleString() }
    const updated = [tx, ...txs].slice(0, 20)
    setTxs(updated)
    secureSet("wallet_txs", updated)
    setAmount("")
    setTo("")
  }

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={Wallet} title="Pi Wallet" subtitle="Pi Network integration" tone="info" />

      <GlassCard className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className={`h-2 w-2 rounded-full ${isAuthenticated ? "bg-primary" : "bg-warning"}`} />
          </span>
          <p className="text-sm font-medium">Pi Network session</p>
          <ToneBadge tone={isAuthenticated ? "good" : "warn"}>{isAuthenticated ? "authenticated" : "pending"}</ToneBadge>
        </div>
        <p className="text-xs text-muted-foreground">
          {sdk ? "Connected via Pi SDKLite." : "Authenticated through Pi Network in this session."}
        </p>
      </GlassCard>

      {!connected ? (
        <button onClick={connect} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-medium text-primary-foreground active:scale-[0.98]">
          <Plug className="h-4 w-4" /> Connect Pi Wallet
        </button>
      ) : (
        <>
          <GlassCard className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Wallet connected</p>
              <p className="text-xs text-muted-foreground">Ready to transact via Pi SDK</p>
            </div>
          </GlassCard>

          <GlassCard className="space-y-3">
            <p className="text-sm font-medium">Send Pi</p>
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient address / username" className="w-full rounded-xl bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="Amount (π)" className="w-full rounded-xl bg-input px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring" />
            <button onClick={send} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground active:scale-[0.98]">
              <ArrowUpRight className="h-4 w-4" /> Send
            </button>
          </GlassCard>

          <div className="space-y-2">
            <p className="px-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">Transaction History</p>
            {txs.length === 0 && <GlassCard><p className="text-xs text-muted-foreground">No transactions yet.</p></GlassCard>}
            {txs.map((t) => (
              <GlassCard key={t.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <ArrowUpRight className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.amount} π</p>
                  <p className="truncate text-xs text-muted-foreground">to {t.to}</p>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{t.time}</span>
              </GlassCard>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
