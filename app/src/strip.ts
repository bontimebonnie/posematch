import { canvasToBlob, CELL_RATIO, drawCover, drawFit, loadImage } from './image'

// Output targets an Instagram feed post (4:5). The strip sits centred on the
// canvas; the padding around it is where Phase C decorations will go.
export const STRIP_WIDTH = 1080
export const STRIP_HEIGHT = 1350
const GAP = 12
const SIDE_PADDING = 48

export interface Cell {
  x: number
  y: number
  w: number
  h: number
}

export interface StripLayout {
  width: number
  height: number
  gap: number
  rows: { cartoon: Cell; photo: Cell }[]
}

// Space a frame reserves around the cells (canvas px). All zero = the
// original geometry (SIDE_PADDING 48, rows centred, 9px top and bottom).
export interface Inset {
  top: number
  right: number
  bottom: number
  left: number
}
export const NO_INSET: Inset = { top: 0, right: 0, bottom: 0, left: 0 }

// Cells are as large as fit inside the inset area: width-bound at inset 0
// (486×324), height-bound once a frame takes the top and bottom.
export function stripLayout({ rows, inset = NO_INSET }: { rows: number; inset?: Inset }): StripLayout {
  const availW = STRIP_WIDTH - Math.max(inset.left, SIDE_PADDING) - Math.max(inset.right, SIDE_PADDING)
  const availH = STRIP_HEIGHT - inset.top - inset.bottom
  const byWidth = Math.floor((availW - GAP) / 2)
  const byHeight = Math.floor(Math.floor((availH - (rows - 1) * GAP) / rows) * CELL_RATIO)
  const cellW = Math.min(byWidth, byHeight)
  const cellH = Math.floor(cellW / CELL_RATIO)
  const stripH = rows * cellH + (rows - 1) * GAP
  const left = inset.left + Math.floor((STRIP_WIDTH - inset.left - inset.right - (cellW * 2 + GAP)) / 2)
  const top = inset.top + Math.floor((availH - stripH) / 2)
  return {
    width: STRIP_WIDTH,
    height: STRIP_HEIGHT,
    gap: GAP,
    rows: Array.from({ length: rows }, (_, i) => {
      const y = top + i * (cellH + GAP)
      return {
        cartoon: { x: left, y, w: cellW, h: cellH },
        photo: { x: left + cellW + GAP, y, w: cellW, h: cellH },
      }
    }),
  }
}

export interface StripOutput {
  png: Blob
  jpeg: Blob
}

// Optional decoration (Phase C): a frame that reserves an inset and paints
// around the cells, then stickers on top. Without it the output is exactly
// what it was before decor existed.
export interface StripDecor {
  inset?: Inset
  // paint the background (before the cells) and the frame (after the cells, never over them)
  background?: (ctx: CanvasRenderingContext2D, layout: StripLayout) => void
  foreground?: (ctx: CanvasRenderingContext2D, layout: StripLayout) => void
  // drawn last, may overlap cells (the user placed them)
  stickers?: (ctx: CanvasRenderingContext2D, layout: StripLayout) => Promise<void> | void
}

// Composite cartoons and photos into the strip: PNG for the clipboard
// (the only image type browsers accept there), JPEG for saving.
export async function composeStrip(cartoons: Blob[], photos: Blob[], decor: StripDecor = {}): Promise<StripOutput> {
  const layout = stripLayout({ rows: cartoons.length, inset: decor.inset })
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  decor.background?.(ctx, layout)

  const [cartoonImgs, photoImgs] = await Promise.all([
    Promise.all(cartoons.map(loadImage)),
    Promise.all(photos.map(loadImage)),
  ])
  layout.rows.forEach(({ cartoon, photo }, i) => {
    // Cartoons can be any shape, so show them whole with blur fill; photos
    // were captured at the cell ratio already, so cover is a no-op crop.
    drawFit(ctx, cartoonImgs[i], cartoon.x, cartoon.y, cartoon.w, cartoon.h)
    drawCover(ctx, photoImgs[i], photo.x, photo.y, photo.w, photo.h)
  })
  if (decor.foreground) {
    // the frame may reach into the gutters but never over a cell
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, layout.width, layout.height)
    for (const { cartoon, photo } of layout.rows) {
      ctx.rect(cartoon.x, cartoon.y, cartoon.w, cartoon.h)
      ctx.rect(photo.x, photo.y, photo.w, photo.h)
    }
    ctx.clip('evenodd')
    decor.foreground(ctx, layout)
    ctx.restore()
  }
  await decor.stickers?.(ctx, layout)
  const [png, jpeg] = await Promise.all([canvasToBlob(canvas, 'image/png'), canvasToBlob(canvas, 'image/jpeg')])
  return { png, jpeg }
}
