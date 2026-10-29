import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { fitContain, initialBox, moveBox, resizeBox, toPixelCrop, type Rect } from '../cropBox'

export interface PixelCrop {
  x: number
  y: number
  width: number
  height: number
}

// The picture shown whole, with a fixed-ratio crop box over it: drag the
// box to move it, pull the round bottom-right handle to resize. Outside the
// box is dimmed; rule-of-thirds lines inside. Reports the crop in picture
// pixels whenever it changes. Pointer Events, so finger and mouse share
// one path; geometry lives in cropBox.ts.
export function CropBox({ src, ratio, tag, onChange }: { src: string; ratio: number; tag?: string; onChange: (crop: PixelCrop | null) => void }) {
  const stage = useRef<HTMLDivElement>(null)
  const [natural, setNatural] = useState<[number, number] | null>(null)
  const [size, setSize] = useState<[number, number]>([0, 0])
  // The box is tied to the picture/stage it was made for; a new picture or
  // a resize starts a fresh centred box (state derived during render).
  const key = `${src}|${natural?.join('x')}|${size.join('x')}`
  const [boxState, setBoxState] = useState<{ key: string; box: Rect | null }>({ key: '', box: null })
  const drag = useRef<{ mode: 'move' | 'resize'; x: number; y: number; start: Rect } | null>(null)

  // Stage size (ResizeObserver) and picture size (onLoad) decide where the
  // picture lands; a new picture or a resize re-centres the box.
  useEffect(() => {
    const el = stage.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setSize([e.contentRect.width, e.contentRect.height]))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const pic = useMemo(() => (natural && size[0] ? fitContain(size[0], size[1], natural[0], natural[1]) : null), [natural, size])
  if (boxState.key !== key) setBoxState({ key, box: pic ? initialBox(pic, ratio) : null })
  const box = boxState.key === key ? boxState.box : pic ? initialBox(pic, ratio) : null
  const setBox = (b: Rect) => setBoxState({ key, box: b })
  const iw = natural?.[0]
  useEffect(() => {
    onChange(box && pic && iw ? toPixelCrop(box, pic, iw) : null)
  }, [box, pic, iw, onChange])

  const down = (mode: 'move' | 'resize') => (e: ReactPointerEvent<HTMLElement>) => {
    if (!box) return
    e.stopPropagation()
    drag.current = { mode, x: e.clientX, y: e.clientY, start: box }
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic pointer */ }
  }
  const move = (e: ReactPointerEvent<HTMLElement>) => {
    const d = drag.current
    if (!d || !pic) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    setBox(d.mode === 'move' ? moveBox(d.start, dx, dy, pic) : resizeBox(d.start, dx, dy, pic, ratio))
  }
  const up = (e: ReactPointerEvent<HTMLElement>) => {
    drag.current = null
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* not captured */ }
  }

  return (
    <div ref={stage} className="relative h-full w-full touch-none select-none overflow-hidden">
      <img
        src={src}
        alt=""
        draggable={false}
        onLoad={(e) => setNatural([e.currentTarget.naturalWidth, e.currentTarget.naturalHeight])}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />
      {box && (
        <div
          role="group"
          className="absolute cursor-move rounded-crop shadow-dim ring-2 ring-on-dark"
          style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
          onPointerDown={down('move')}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        >
          <div className="pointer-events-none absolute inset-0 crop-thirds" aria-hidden />
          {tag && (
            <span className="pointer-events-none absolute -top-8 left-0 whitespace-nowrap rounded-pill bg-surface-raised px-2 py-1 text-caption font-bold text-fg">
              {tag}
            </span>
          )}
          <button
            type="button"
            aria-label="resize"
            className="absolute -right-4 -bottom-4 size-icon-lg cursor-nwse-resize rounded-pill bg-surface-raised ring-2 ring-fg"
            onPointerDown={down('resize')}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
          />
        </div>
      )}
    </div>
  )
}
