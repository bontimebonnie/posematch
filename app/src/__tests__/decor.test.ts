import { describe, expect, it } from 'vitest'
import { FRAMES, frameById } from '../decor/frames'
import { nextPlacement, STICKERS, toCanvas, toPreview } from '../decor/stickers'
import { stripLayout } from '../strip'

describe('stripLayout with an inset', () => {
  it('inset 0 is the original geometry', () => {
    const a = stripLayout({ rows: 4 })
    const b = stripLayout({ rows: 4, inset: { top: 0, right: 0, bottom: 0, left: 0 } })
    expect(b).toEqual(a)
    expect(a.rows[0].cartoon).toEqual({ x: 48, y: 9, w: 486, h: 324 })
  })
  it('pastel (72 all round) is height-bound: 438×292 cells, 96 at the sides', () => {
    const l = stripLayout({ rows: 4, inset: frameById('pastel').inset })
    expect(l.rows[0].cartoon).toMatchObject({ w: 438, h: 292, x: 96 })
    expect(l.rows[0].cartoon.y).toBeGreaterThanOrEqual(72)
    expect(l.rows[3].photo.y + l.rows[3].photo.h).toBeLessThanOrEqual(1350 - 72)
  })
  it('stickerbook (120 top/bottom) gives 402×268 cells', () => {
    const l = stripLayout({ rows: 4, inset: frameById('stickerbook').inset })
    expect(l.rows[0].cartoon).toMatchObject({ w: 402, h: 268 })
    for (const row of l.rows) for (const c of [row.cartoon, row.photo]) for (const v of Object.values(c)) expect(Number.isInteger(v)).toBe(true)
  })
})

describe('frames and stickers manifests', () => {
  it('have unique ids and "none" is first', () => {
    expect(FRAMES[0].id).toBe('none')
    expect(new Set(FRAMES.map((f) => f.id)).size).toBe(FRAMES.length)
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length)
    expect(frameById('nope').id).toBe('none')
  })
  it('preview ↔ canvas mapping round-trips within a pixel', () => {
    const v = toCanvas(358, 1080, toPreview(358, 1080, 777))
    expect(Math.abs(v - 777)).toBeLessThan(1)
  })
  it('new stickers step so they do not stack', () => {
    const layout = stripLayout({ rows: 4 })
    const a = nextPlacement('star', [], layout)
    const b = nextPlacement('star', [a], layout)
    expect(b.x - a.x).toBe(24)
    expect(b.y - a.y).toBe(24)
  })
})
