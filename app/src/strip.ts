import { canvasToBlob, CELL_RATIO, drawCover, loadImage } from './image'

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

export function stripLayout({ rows }: { rows: number }): StripLayout {
  const cellW = Math.floor((STRIP_WIDTH - SIDE_PADDING * 2 - GAP) / 2)
  const cellH = Math.floor(cellW / CELL_RATIO)
  const stripH = rows * cellH + (rows - 1) * GAP
  const left = Math.floor((STRIP_WIDTH - (cellW * 2 + GAP)) / 2)
  const top = Math.floor((STRIP_HEIGHT - stripH) / 2)
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

// Composite cartoons and photos into the strip: PNG for the clipboard
// (the only image type browsers accept there), JPEG for saving.
export async function composeStrip(cartoons: Blob[], photos: Blob[]): Promise<StripOutput> {
  const layout = stripLayout({ rows: cartoons.length })
  const canvas = document.createElement('canvas')
  canvas.width = layout.width
  canvas.height = layout.height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const [cartoonImgs, photoImgs] = await Promise.all([
    Promise.all(cartoons.map(loadImage)),
    Promise.all(photos.map(loadImage)),
  ])
  layout.rows.forEach(({ cartoon, photo }, i) => {
    drawCover(ctx, cartoonImgs[i], cartoon.x, cartoon.y, cartoon.w, cartoon.h)
    drawCover(ctx, photoImgs[i], photo.x, photo.y, photo.w, photo.h)
  })
  const [png, jpeg] = await Promise.all([canvasToBlob(canvas, 'image/png'), canvasToBlob(canvas, 'image/jpeg')])
  return { png, jpeg }
}
