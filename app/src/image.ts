// Every cell in the strip is a 3:2 landscape frame, matching the reference
// layouts (cartoon on the left, photo on the right).
export const CELL_RATIO = 3 / 2

type Source = CanvasImageSource & { width?: number; height?: number }

function sourceSize(src: Source): [number, number] {
  if (src instanceof HTMLVideoElement) return [src.videoWidth, src.videoHeight]
  if (src instanceof HTMLImageElement) return [src.naturalWidth, src.naturalHeight]
  return [src.width as number, src.height as number]
}

// The source rect to copy so that a sw x sh image fills a w x h target,
// centre-cropped like CSS object-fit: cover. Pure so it can be unit tested.
export function coverRect(sw: number, sh: number, w: number, h: number) {
  const scale = Math.max(w / sw, h / sh)
  const cw = w / scale
  const ch = h / scale
  return { sx: (sw - cw) / 2, sy: (sh - ch) / 2, cw, ch }
}

// Draws `src` into the rect, center-cropped like CSS object-fit: cover.
export function drawCover(
  ctx: CanvasRenderingContext2D,
  src: Source,
  x: number,
  y: number,
  w: number,
  h: number,
  mirror = false,
) {
  const [sw, sh] = sourceSize(src)
  const { sx, sy, cw, ch } = coverRect(sw, sh, w, h)
  ctx.save()
  if (mirror) {
    ctx.translate(x + w, y)
    ctx.scale(-1, 1)
    ctx.drawImage(src, sx, sy, cw, ch, 0, 0, w, h)
  } else {
    ctx.drawImage(src, sx, sy, cw, ch, x, y, w, h)
  }
  ctx.restore()
}

export function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/jpeg'): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), type, 0.92),
  )
}

// Target size for an image whose longest edge must not exceed `maxEdge`.
export function fitWithin(w: number, h: number, maxEdge: number): [number, number] {
  const scale = Math.min(1, maxEdge / Math.max(w, h))
  return [Math.round(w * scale), Math.round(h * scale)]
}

// Re-encodes an uploaded image at most `maxEdge` px on its longest side so
// the library and the strip canvas don't carry multi-megapixel originals.
export async function downscaleImage(blob: Blob, maxEdge = 1600): Promise<Blob> {
  const img = await loadImage(blob)
  const [w, h] = fitWithin(img.naturalWidth, img.naturalHeight, maxEdge)
  URL.revokeObjectURL(img.src)
  if (w === img.naturalWidth && h === img.naturalHeight) return blob
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
  return canvasToBlob(canvas)
}
