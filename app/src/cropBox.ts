// Geometry for the drag-handle crop box (Task 45): a fixed-ratio box the
// user moves by dragging and resizes from its bottom-right corner, kept
// inside the picture. Pure functions so the rules are unit-tested; the DOM
// side (CropBox.tsx) only feeds in pointer deltas.
export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

// Where a picture of iw×ih lands when fitted (object-fit: contain) in cw×ch.
export function fitContain(cw: number, ch: number, iw: number, ih: number): Rect {
  const scale = Math.min(cw / iw, ch / ih)
  const w = iw * scale
  const h = ih * scale
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h }
}

// Starting box: as wide as fits, up to 70% of the picture, centred.
export function initialBox(pic: Rect, ratio: number): Rect {
  let w = pic.w * 0.7
  let h = w / ratio
  if (h > pic.h * 0.9) {
    h = pic.h * 0.9
    w = h * ratio
  }
  return { x: pic.x + (pic.w - w) / 2, y: pic.y + (pic.h - h) / 2, w, h }
}

export function moveBox(box: Rect, dx: number, dy: number, pic: Rect): Rect {
  const x = clamp(box.x + dx, pic.x, pic.x + pic.w - box.w)
  const y = clamp(box.y + dy, pic.y, pic.y + pic.h - box.h)
  return { ...box, x, y }
}

// Resize from the bottom-right corner; the top-left stays put, the ratio
// is locked, and the box cannot leave the picture or shrink below minW.
export function resizeBox(box: Rect, dx: number, dy: number, pic: Rect, ratio: number, minW = 48): Rect {
  // follow whichever axis the pointer moved more, then derive the other
  const wantedW = Math.abs(dx) >= Math.abs(dy * ratio) ? box.w + dx : (box.h + dy) * ratio
  const maxW = Math.min(pic.x + pic.w - box.x, (pic.y + pic.h - box.y) * ratio)
  const w = clamp(wantedW, Math.min(minW, maxW), maxW)
  return { ...box, w, h: w / ratio }
}

// Box in picture-pixel coordinates (what cropImage() wants).
export function toPixelCrop(box: Rect, pic: Rect, iw: number) {
  const s = iw / pic.w
  return {
    x: Math.round((box.x - pic.x) * s),
    y: Math.round((box.y - pic.y) * s),
    width: Math.round(box.w * s),
    height: Math.round(box.h * s),
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
