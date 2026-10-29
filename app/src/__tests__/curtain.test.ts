import { describe, expect, it } from 'vitest'
import { closed, curtainReducer, FOLDED, open, type CurtainEvent, type CurtainState } from '../booth/curtainState'

const run = (events: CurtainEvent[], from: CurtainState = closed) => events.reduce(curtainReducer, from)

describe('curtainReducer', () => {
  it('follows the pointer 1:1 while dragging left, clamped to the folded stack', () => {
    expect(run([{ type: 'down' }, { type: 'move', dx: -100, width: 400 }])).toEqual({ phase: 'dragging', scale: 0.75 })
    expect(run([{ type: 'down' }, { type: 'move', dx: -900, width: 400 }]).scale).toBe(FOLDED)
    expect(run([{ type: 'down' }, { type: 'move', dx: 50, width: 400 }]).scale).toBe(1) // cannot widen
  })

  it('snaps to the folded stack past half, then opens when the transition ends', () => {
    const s = run([{ type: 'down' }, { type: 'move', dx: -220, width: 400 }, { type: 'up', moved: true }])
    expect(s).toEqual({ phase: 'snapping', scale: FOLDED })
    expect(curtainReducer(s, { type: 'settled' })).toEqual(open)
  })

  it('springs back before half', () => {
    const s = run([{ type: 'down' }, { type: 'move', dx: -150, width: 400 }, { type: 'up', moved: true }])
    expect(s).toEqual({ phase: 'springing', scale: 1 })
    expect(curtainReducer(s, { type: 'settled' })).toEqual(closed)
  })

  it('squeezes on a tap without a drag', () => {
    const s = run([{ type: 'down' }, { type: 'up', moved: false }])
    expect(s.phase).toBe('squeeze')
    expect(curtainReducer(s, { type: 'settled' })).toEqual(closed)
  })

  it('unfolds when coming back from the library', () => {
    const s = curtainReducer(open, { type: 'unfold' })
    expect(s).toEqual({ phase: 'springing', scale: 1 })
    expect(curtainReducer(s, { type: 'settled' })).toEqual(closed)
  })

  it('ignores stray events', () => {
    expect(curtainReducer(open, { type: 'down' })).toEqual(open)
    expect(curtainReducer(closed, { type: 'move', dx: -10, width: 100 })).toEqual(closed)
    expect(curtainReducer(closed, { type: 'up', moved: true })).toEqual(closed)
  })
})
