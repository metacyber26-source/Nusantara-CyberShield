"use client"

import { useEffect, useState } from "react"
import { HardDriveDownload, Trash2, Snowflake, FileArchive, Layers } from "lucide-react"
import { GlassCard, ModuleHeader, ToneBadge } from "./ui"
import { recordInteraction } from "@/lib/agi"
import { cn } from "@/lib/utils"

interface JunkItem {
  id: string
  name: string
  type: "duplicate" | "corrupt" | "cache" | "orphan" | "cold"
  size: number // KB
}

const TYPE_META: Record<JunkItem["type"], { label: string; tone: "warn" | "alert" | "info" | "good" }> = {
  duplicate: { label: "Duplicate", tone: "warn" },
  corrupt: { label: "Corrupt", tone: "alert" },
  cache: { label: "Stale cache", tone: "info" },
  orphan: { label: "Orphan data", tone: "warn" },
  cold: { label: "Cold file", tone: "good" },
}

function genJunk(): JunkItem[] {
  const names = ["IMG_2024_blur.jpg", "tmp_cache_38f", "app_session.old", "duplicate(2).pdf", "screenshot_corrupt", "backup_orphan.dat", "video_lowres.mp4", "thumb_cache_v1"]
  const types: JunkItem["type"][] = ["duplicate", "corrupt", "cache", "orphan", "cold"]
  const count = 5 + Math.floor(Math.random() * 4)
  return Array.from({ length: count }).map(() => ({
    id: crypto.randomUUID(),
    name: names[Math.floor(Math.random() * names.length)],
    type: types[Math.floor(Math.random() * types.length)],
    size: Math.floor(40 + Math.random() * 4000),
  }))
}

export function FileSweeper() {
  const [items, setItems] = useState<JunkItem[]>([])
  const [scanning, setScanning] = useState(false)
  const [reclaimed, setReclaimed] = useState(0)

  useEffect(() => {
    scan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scan = () => {
    setScanning(true)
    setTimeout(() => {
      setItems(genJunk())
      setScanning(false)
      recordInteraction()
    }, 1200)
  }

  const totalKB = items.reduce((a, b) => a + b.size, 0)

  const remove = (id: string) => {
    const item = items.find((i) => i.id === id)
    if (item) setReclaimed((r) => r + item.size)
    setItems((it) => it.filter((i) => i.id !== id))
  }

  const optimizeAll = () => {
    setReclaimed((r) => r + totalKB)
    setItems([])
    recordInteraction()
  }

  const fmt = (kb: number) => (kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`)

  return (
    <div className="space-y-5 animate-slide-up">
      <ModuleHeader icon={HardDriveDownload} title="Phantom Storage Optimizer" subtitle="Predictive compression · deep-freeze apps" tone="info" />

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="text-center">
          <FileArchive className="mx-auto h-5 w-5 text-warning" />
          <p className="mt-1 text-xl font-bold text-warning">{fmt(totalKB)}</p>
          <p className="text-xs text-muted-foreground">Recoverable</p>
        </GlassCard>
        <GlassCard className="text-center">
          <Snowflake className="mx-auto h-5 w-5 text-info" />
          <p className="mt-1 text-xl font-bold text-info">{fmt(reclaimed)}</p>
          <p className="text-xs text-muted-foreground">Reclaimed</p>
        </GlassCard>
      </div>

      <div className="flex gap-2">
        <button onClick={scan} disabled={scanning} className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-medium disabled:opacity-60">
          {scanning ? "Scanning…" : "Re-scan"}
        </button>
        <button onClick={optimizeAll} disabled={!items.length} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50 active:scale-[0.98]">
          Optimize All
        </button>
      </div>

      {scanning && (
        <GlassCard className="flex items-center gap-3">
          <Layers className="h-5 w-5 animate-pulse text-primary" />
          <p className="text-sm text-muted-foreground">AI predicting cold files & compressing…</p>
        </GlassCard>
      )}

      <div className="space-y-2">
        {!scanning && items.length === 0 && (
          <GlassCard className="text-center">
            <p className="text-sm font-medium text-primary">Storage optimized</p>
            <p className="text-xs text-muted-foreground">No junk or cold files detected.</p>
          </GlassCard>
        )}
        {items.map((it) => {
          const meta = TYPE_META[it.type]
          return (
            <GlassCard key={it.id} className="flex items-center gap-3">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", meta.tone === "alert" ? "bg-destructive/10" : meta.tone === "warn" ? "bg-warning/10" : "bg-info/10")}>
                <FileArchive className={cn("h-4 w-4", meta.tone === "alert" ? "text-destructive" : meta.tone === "warn" ? "text-warning" : "text-info")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{it.name}</p>
                <p className="text-xs text-muted-foreground">{fmt(it.size)}</p>
              </div>
              <ToneBadge tone={meta.tone}>{meta.label}</ToneBadge>
              <button onClick={() => remove(it.id)} aria-label="Clean item" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </GlassCard>
          )
        })}
      </div>
    </div>
  )
}
