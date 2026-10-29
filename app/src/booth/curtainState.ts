// The curtain's fold state as a pure reducer so the gesture rules can be
// unit-tested without a DOM (booth-landing.md §2 "Motion"):
// - drag left folds it like an accordion toward the left edge (scaleX),
// - release past half its width snaps to the folded stack, else springs back,
// - a tap without a drag gives a small squeeze as a hint.
export const FOLDED = 0.1
export const SNAP_AT = 0.5

export type Phase = 'closed' | 'dragging' | 'snapping' | 'open' | 'springing' | 'squeeze'
export interface CurtainState {
  phase: Phase
  scale: number // scaleX of the curtain, 1 = fully closed
}
export type CurtainEvent =
  | { type: 'down' }
  | { type: 'move'; dx: number; width: number }
  | { type: 'up'; moved: boolean }
  | { type: 'settled' } // the CSS transition / animation finished
  | { type: 'unfold' } // coming back from the library

export const closed: CurtainState = { phase: 'closed', scale: 1 }
export const open: CurtainState = { phase: 'open', scale: FOLDED }

export function curtainReducer(s: CurtainState, e: CurtainEvent): CurtainState {
  switch (e.type) {
    case 'down':
      return s.phase === 'closed' || s.phase === 'squeeze' ? { phase: 'dragging', scale: 1 } : s
    case 'move': {
      if (s.phase !== 'dragging') return s
      const scale = Math.min(1, Math.max(FOLDED, 1 + e.dx / e.width))
      return { phase: 'dragging', scale }
    }
    case 'up':
      if (s.phase !== 'dragging') return s
      if (!e.moved) return { phase: 'squeeze', scale: 1 }
      return s.scale <= SNAP_AT ? { phase: 'snapping', scale: FOLDED } : { phase: 'springing', scale: 1 }
    case 'settled':
      if (s.phase === 'snapping') return open
      if (s.phase === 'springing' || s.phase === 'squeeze') return closed
      return s
    case 'unfold':
      return s.phase === 'open' ? { phase: 'springing', scale: 1 } : s
  }
}
