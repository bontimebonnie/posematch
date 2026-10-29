import { composeStrip, type StripDecor, type StripOutput } from '../strip'
import { frameById, type FrameId } from './frames'
import { drawStickers, type Placement } from './stickers'
import { decorTokens } from './tokens'

export interface DecorState {
  frame: FrameId
  stickers: Placement[]
}
export const NO_DECOR: DecorState = { frame: 'none', stickers: [] }

// composeStrip with a frame and stickers applied. With NO_DECOR the call
// collapses to the plain composeStrip, so the undecorated output never changes.
export function composeDecorated(cartoons: Blob[], photos: Blob[], decor: DecorState = NO_DECOR): Promise<StripOutput> {
  const frame = frameById(decor.frame)
  const t = decorTokens()
  const d: StripDecor = {}
  if (frame.id !== 'none') {
    d.inset = frame.inset
    if (frame.background) d.background = (ctx, layout) => frame.background!(ctx, layout, t)
    if (frame.foreground) d.foreground = (ctx, layout) => frame.foreground!(ctx, layout, t)
  }
  if (decor.stickers.length) d.stickers = (ctx, layout) => drawStickers(ctx, layout, decor.stickers)
  return composeStrip(cartoons, photos, d)
}
