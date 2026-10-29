import { loadImage } from '../image'
import type { StripLayout } from '../strip'

// Sticker manifest: simple SVGs drawn in-house (never real Chiikawa art).
// Bonnie's character PNGs can be added here later.
export interface Sticker {
  id: string
  src: string
}
export const STICKERS: Sticker[] = [
  { id: 'star', src: '/decor/star.svg' },
  { id: 'heart', src: '/decor/heart.svg' },
  { id: 'sparkle', src: '/decor/sparkle.svg' },
  { id: 'bubble', src: '/decor/bubble.svg' },
  { id: 'flower', src: '/decor/flower.svg' },
  { id: 'blush', src: '/decor/blush.svg' },
]
export const stickerById = (id: string) => STICKERS.find((s) => s.id === id)

// Where a sticker sits on the 1080×1350 canvas: centre point and size as a
// share of the canvas width (0.18 ≈ 194px).
export interface Placement {
  stickerId: string
  x: number
  y: number
  scale: number
}
export const STICKER_SCALE = 0.18
export const MAX_STICKERS = 12

// Preview ↔ canvas coordinate mapping (the preview is the canvas scaled to
// `previewWidth`). Both directions, so the DOM overlay and the saved file agree.
export const toCanvas = (previewWidth: number, canvasWidth: number, v: number) => (v * canvasWidth) / previewWidth
export const toPreview = (previewWidth: number, canvasWidth: number, v: number) => (v * previewWidth) / canvasWidth

// Add a sticker near the top centre, each new one stepped 24px so they do not stack dead on each other.
export function nextPlacement(stickerId: string, existing: Placement[], layout: StripLayout): Placement {
  const n = existing.length
  return { stickerId, x: layout.width / 2 + (n % 5) * 24 - 48, y: layout.height * 0.3 + (n % 5) * 24, scale: STICKER_SCALE }
}

export async function drawStickers(ctx: CanvasRenderingContext2D, layout: StripLayout, placements: Placement[]) {
  const imgs = new Map<string, HTMLImageElement>()
  for (const p of placements) {
    if (imgs.has(p.stickerId)) continue
    const s = stickerById(p.stickerId)
    if (!s) continue
    const res = await fetch(s.src)
    imgs.set(p.stickerId, await loadImage(await res.blob()))
  }
  for (const p of placements) {
    const img = imgs.get(p.stickerId)
    if (!img) continue
    const size = p.scale * layout.width
    ctx.drawImage(img, p.x - size / 2, p.y - size / 2, size, size)
  }
}
