import { Xmark } from 'iconoir-react'
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { BoothChrome, TrayStrip } from '../booth/BoothChrome'
import { useWide } from '../booth/useWide'
import { composeDecorated, type DecorState } from '../decor/compose'
import { FRAMES, setLastFrame, type FrameId } from '../decor/frames'
import { MAX_STICKERS, nextPlacement, STICKERS, stickerById, toCanvas, toPreview, type Placement } from '../decor/stickers'
import { STRIP_WIDTH, stripLayout } from '../strip'
import { Button, Header, IconButton, SegmentedControl } from '../ui'
import { useObjectUrls } from '../useObjectUrls'

type Tab = 'frame' | 'sticker'

// Decorate the finished strip (DECOR-SPEC §3–4): pick a frame, drop
// stickers and drag them about, then Done hands the decor back to Result.
// The preview is the strip composed with the frame only; stickers sit on
// top as DOM elements (instant drag), and are painted onto the canvas on save.
export default function Decorate({
  cartoons,
  photos,
  initial,
  booth = false,
  onCancel,
  onDone,
}: {
  cartoons: Blob[]
  photos: Blob[]
  initial: DecorState
  booth?: boolean
  onCancel: () => void
  onDone: (decor: DecorState) => void
}) {
  const { t } = useTranslation()
  const wide = useWide()
  const cartoonUrls = useObjectUrls(cartoons)
  const photoUrls = useObjectUrls(photos)
  const [tab, setTab] = useState<Tab>('frame')
  const [frame, setFrame] = useState<FrameId>(initial.frame)
  const [stickers, setStickers] = useState<Placement[]>(initial.stickers)
  const [selected, setSelected] = useState<number | null>(null)
  const [base, setBase] = useState<string | null>(null)
  const layout = useMemo(() => stripLayout({ rows: cartoons.length }), [cartoons.length])

  // Frame only; stickers are overlaid live.
  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    composeDecorated(cartoons, photos, { frame, stickers: [] }).then((out) => {
      if (cancelled) return
      url = URL.createObjectURL(out.jpeg)
      setBase(url)
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [cartoons, photos, frame])

  const pickFrame = (id: FrameId) => {
    setFrame(id)
    setLastFrame(id)
  }
  const addSticker = (id: string) => {
    if (stickers.length >= MAX_STICKERS) return
    setStickers((prev) => [...prev, nextPlacement(id, prev, layout)])
    setSelected(stickers.length)
  }
  const removeSticker = (i: number) => {
    setStickers((prev) => prev.filter((_, j) => j !== i))
    setSelected(null)
  }

  // Preview width (for canvas ↔ preview mapping) tracked by a ResizeObserver.
  const stage = useRef<HTMLDivElement>(null)
  const [pw, setPw] = useState(STRIP_WIDTH)
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setPw(e.contentRect.width || STRIP_WIDTH))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  // Drag: pointer deltas in preview px → canvas px.
  const drag = useRef<{ i: number; x: number; y: number; start: Placement } | null>(null)
  const down = (i: number) => (e: ReactPointerEvent<HTMLElement>) => {
    e.stopPropagation()
    setSelected(i)
    drag.current = { i, x: e.clientX, y: e.clientY, start: stickers[i] }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic */ }
  }
  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d) return
    const dx = toCanvas(pw, STRIP_WIDTH, e.clientX - d.x)
    const dy = toCanvas(pw, STRIP_WIDTH, e.clientY - d.y)
    const x = Math.min(layout.width, Math.max(0, d.start.x + dx))
    const y = Math.min(layout.height, Math.max(0, d.start.y + dy))
    setStickers((prev) => prev.map((p, j) => (j === d.i ? { ...p, x, y } : p)))
  }
  const up = (e: ReactPointerEvent<HTMLElement>) => {
    drag.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* not captured */ }
  }

  const header = <Header title={t('decorate.title')} onBack={onCancel} />
  const preview = (
    <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden px-4">
      <div ref={stage} className="relative h-full max-w-full" style={{ aspectRatio: '4 / 5' }} onPointerDown={() => setSelected(null)}>
        {base ? (
          <img src={base} alt="" className="h-full w-full rounded-card ring-1 ring-line" draggable={false} />
        ) : (
          <div className="h-full w-full rounded-card bg-surface-raised ring-1 ring-line" />
        )}
        {stickers.map((p, i) => {
          const size = toPreview(pw, STRIP_WIDTH, p.scale * STRIP_WIDTH)
          const s = stickerById(p.stickerId)
          return (
            <div
              key={i}
              className={`absolute touch-none select-none ${selected === i ? 'rounded-card ring-2 ring-accent-pressed' : ''}`}
              style={{ left: toPreview(pw, STRIP_WIDTH, p.x) - size / 2, top: toPreview(pw, STRIP_WIDTH, p.y) - size / 2, width: size, height: size }}
              onPointerDown={down(i)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              {s && <img src={s.src} alt="" className="pointer-events-none h-full w-full" draggable={false} />}
              {selected === i && (
                <IconButton variant="scrim" size="sm" onClick={() => removeSticker(i)} aria-label={t('common.remove')} className="absolute -top-2 -right-2">
                  <Xmark width={16} height={16} strokeWidth={3} />
                </IconButton>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
  const tools = (
    <div className="space-y-2 px-4 pt-2">
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { value: 'frame', label: t('decorate.frames') },
          { value: 'sticker', label: t('decorate.stickers') },
        ]}
      />
      {tab === 'frame' ? (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          {FRAMES.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={frame === f.id}
              onClick={() => pickFrame(f.id)}
              className={`flex shrink-0 flex-col items-center gap-1 rounded-card bg-surface-raised p-2 text-caption ${frame === f.id ? 'ring-2 ring-accent-pressed text-fg' : 'ring-1 ring-line text-fg-muted'}`}
            >
              <FrameThumb id={f.id} />
              {t(`decorate.frame_${f.id}`)}
            </button>
          ))}
        </div>
      ) : (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => addSticker(s.id)}
              disabled={stickers.length >= MAX_STICKERS}
              aria-label={t(`decorate.sticker_${s.id}`)}
              className="flex size-control shrink-0 items-center justify-center rounded-card bg-surface-raised ring-1 ring-line disabled:opacity-40"
            >
              <img src={s.src} alt="" className="size-icon-lg" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
  const bottom = (
    <div className="flex gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Button variant="secondary" onClick={onCancel} className="flex-1">
        {t('common.cancel')}
      </Button>
      <Button onClick={() => onDone({ frame, stickers })} className="flex-1">
        {t('common.done')}
      </Button>
    </div>
  )

  if (booth && wide) {
    const rows = cartoonUrls.map((pose, i) => ({ pose, photo: photoUrls[i] }))
    return (
      <BoothChrome
        lit
        glass={
          <>
            {header}
            <div className="grid min-h-0 flex-1 grid-cols-2 gap-4 px-4 pb-4">
              {preview}
              {tools}
            </div>
          </>
        }
        actions={bottom}
        tray={<TrayStrip rows={rows} total={rows.length} />}
      />
    )
  }
  return (
    <div className="flex h-full flex-col">
      {header}
      {preview}
      {tools}
      {bottom}
    </div>
  )
}

// A tiny schematic of each frame: 4×2 cells on the frame's paper.
function FrameThumb({ id }: { id: FrameId }) {
  const bg = id === 'none' ? 'bg-surface-raised' : id === 'pastel' ? 'bg-decor-cream' : 'bg-decor-paper'
  const pad = id === 'none' ? 'p-1' : id === 'pastel' ? 'p-2' : 'px-2 py-2'
  return (
    <div className={`grid h-16 w-12 grid-cols-2 gap-1 rounded-crop ring-1 ring-line ${bg} ${pad} ${id === 'stickerbook' ? 'pt-4 pb-4' : ''}`} aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className={`rounded-crop ${i % 2 ? 'bg-tint-1' : 'bg-tint-3'}`} />
      ))}
    </div>
  )
}
