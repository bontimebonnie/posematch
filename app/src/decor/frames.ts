import { NO_INSET, type Inset, type StripLayout } from '../strip'
import type { DecorTokens } from './tokens'

// A frame reserves an inset around the cells and paints there. `background`
// runs before the cells, `foreground` after them and is clipped so it can
// never cover a cell (DECOR-SPEC §4.1).
export interface Frame {
  id: FrameId
  inset: Inset
  background?: (ctx: CanvasRenderingContext2D, layout: StripLayout, t: DecorTokens) => void
  foreground?: (ctx: CanvasRenderingContext2D, layout: StripLayout, t: DecorTokens) => void
}
export type FrameId = 'none' | 'pastel' | 'stickerbook'

const none: Frame = { id: 'none', inset: NO_INSET }

// Cream paper with a sand band and a pastel dot in each corner.
const pastel: Frame = {
  id: 'pastel',
  inset: { top: 72, right: 72, bottom: 72, left: 72 },
  background(ctx, layout, t) {
    ctx.fillStyle = t.cream
    ctx.fillRect(0, 0, layout.width, layout.height)
  },
  foreground(ctx, layout, t) {
    ctx.lineWidth = 24
    ctx.strokeStyle = t.sand
    ctx.strokeRect(12, 12, layout.width - 24, layout.height - 24)
    const dots = [t.pink, t.blue, t.yellow, t.peach]
    ;[
      [36, 36],
      [layout.width - 36, 36],
      [36, layout.height - 36],
      [layout.width - 36, layout.height - 36],
    ].forEach(([x, y], i) => {
      ctx.fillStyle = dots[i]
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()
    })
  },
}

// White page with pastel washi tape across the top and bottom bands and
// small stars in the gutters.
const stickerbook: Frame = {
  id: 'stickerbook',
  inset: { top: 120, right: 72, bottom: 120, left: 72 },
  background(ctx, layout, t) {
    ctx.fillStyle = t.paper
    ctx.fillRect(0, 0, layout.width, layout.height)
  },
  foreground(ctx, layout, t) {
    const tape = (x: number, y: number, w: number, color: string, angle: number) => {
      ctx.save()
      ctx.translate(x + w / 2, y)
      ctx.rotate(angle)
      ctx.globalAlpha = 0.85
      ctx.fillStyle = color
      ctx.fillRect(-w / 2, -16, w, 32)
      ctx.setLineDash([8, 6])
      ctx.strokeStyle = t.ink
      ctx.lineWidth = 2
      ctx.strokeRect(-w / 2, -16, w, 32)
      ctx.restore()
    }
    tape(layout.width * 0.12, 56, 260, t.pink, -0.06)
    tape(layout.width * 0.58, 64, 300, t.blue, 0.05)
    tape(layout.width * 0.2, layout.height - 60, 300, t.yellow, 0.04)
    tape(layout.width * 0.62, layout.height - 52, 240, t.mint, -0.05)
    ctx.fillStyle = t.lilac
    for (const [x, y] of [
      [40, layout.height / 2],
      [layout.width - 40, layout.height / 2 - 120],
      [layout.width - 40, layout.height / 2 + 140],
    ]) {
      star(ctx, x, y, 14)
    }
  },
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 ? r * 0.45 : r
    const a = -Math.PI / 2 + (i * Math.PI) / 5
    ctx.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad)
  }
  ctx.closePath()
  ctx.fill()
}

export const FRAMES: Frame[] = [none, pastel, stickerbook]
export const frameById = (id: string | null | undefined): Frame => FRAMES.find((f) => f.id === id) ?? none

const FRAME_KEY = 'post-match.frame'
export function getLastFrame(): FrameId {
  try {
    return frameById(localStorage.getItem(FRAME_KEY)).id
  } catch {
    return 'none'
  }
}
export function setLastFrame(id: FrameId) {
  try {
    localStorage.setItem(FRAME_KEY, id)
  } catch {
    // private browsing; fine
  }
}
