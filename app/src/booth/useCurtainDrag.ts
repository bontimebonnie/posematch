import { useCallback, useEffect, useReducer, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { closed, curtainReducer, open, type CurtainState } from './curtainState'

const TAP_SLOP = 6 // px before a press counts as a drag
const OPEN_DELAY = 300 // ms after the snap before the library shows
// motion length per phase (booth.css) + a little grace
const SETTLE_MS: Partial<Record<CurtainState['phase'], number>> = { snapping: 420 + 60, springing: 180 + 60, squeeze: 450 + 60 }

// Pointer Events → curtainReducer → one `transform: scaleX()` on the curtain.
// Finger and mouse share the same path; `touch-action: pan-y` on the doorway
// keeps vertical scrolling free. The CSS class per phase carries the
// transition (snap 420ms, spring 180ms, squeeze keyframes); `transitionend`
// and `animationend` feed `settled` back in. With prefers-reduced-motion the
// transitions are 0ms (global rule in index.css) so it simply jumps.
export function useCurtainDrag({ initiallyOpen = false, onOpen }: { initiallyOpen?: boolean; onOpen: () => void }) {
  const [state, dispatch] = useReducer(curtainReducer, initiallyOpen ? open : closed)
  const startX = useRef(0)
  const moved = useRef(false)
  const width = useRef(1)
  const active = useRef(false) // a press is in progress (pointer capture is best-effort)

  // Back from the library: mount folded, then unfold.
  useEffect(() => {
    if (initiallyOpen) dispatch({ type: 'unfold' })
  }, [initiallyOpen])

  useEffect(() => {
    if (state.phase !== 'open' || initiallyOpen) return
    const t = setTimeout(onOpen, OPEN_DELAY)
    return () => clearTimeout(t)
  }, [state.phase, initiallyOpen, onOpen])

  // Belt and braces: if transitionend never arrives (reduced motion makes the
  // transition 0ms, a tab in the background, a dropped event) settle anyway
  // shortly after the motion would have ended.
  useEffect(() => {
    const ms = SETTLE_MS[state.phase]
    if (ms === undefined) return
    const t = setTimeout(() => dispatch({ type: 'settled' }), ms)
    return () => clearTimeout(t)
  }, [state.phase])

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    startX.current = e.clientX
    moved.current = false
    width.current = e.currentTarget.getBoundingClientRect().width / Math.max(curtainScale(e.currentTarget), 0.01)
    active.current = true
    try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* synthetic or already-released pointer */ }
    dispatch({ type: 'down' })
  }, [])
  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!active.current) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > TAP_SLOP) moved.current = true
    dispatch({ type: 'move', dx, width: width.current })
  }, [])
  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!active.current) return
    active.current = false
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* not captured */ }
    dispatch({ type: 'up', moved: moved.current })
  }, [])
  const onSettled = useCallback(() => dispatch({ type: 'settled' }), [])

  const style: CSSProperties = { transform: `scaleX(${state.scale})` }
  return {
    state,
    props: {
      style,
      className: `booth-curtain booth-curtain-${state.phase}`,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      onTransitionEnd: onSettled,
      onAnimationEnd: onSettled,
    },
  }
}

function curtainScale(el: HTMLElement): number {
  const m = /scaleX\(([\d.]+)\)/.exec(el.style.transform)
  return m ? Number(m[1]) : 1
}

export type { CurtainState }
