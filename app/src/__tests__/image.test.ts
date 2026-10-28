import { describe, expect, it } from 'vitest'
import { coverRect } from '../image'

describe('coverRect', () => {
  it('crops the sides of a landscape source going into a squarer target', () => {
    // 1920x1080 source into a 3:2 cell: height fits, width is cropped
    const r = coverRect(1920, 1080, 900, 600)
    expect(r.ch).toBe(1080)
    expect(r.cw).toBe(1620)
    expect(r.sx).toBe(150)
    expect(r.sy).toBe(0)
  })

  it('crops the top and bottom of a portrait source going into a landscape target', () => {
    // 1080x1920 source into a 3:2 cell: width fits, height is cropped
    const r = coverRect(1080, 1920, 900, 600)
    expect(r.cw).toBe(1080)
    expect(r.ch).toBe(720)
    expect(r.sx).toBe(0)
    expect(r.sy).toBe(600)
  })

  it('uses the whole source when ratios already match', () => {
    const r = coverRect(1500, 1000, 900, 600)
    expect(r).toEqual({ sx: 0, sy: 0, cw: 1500, ch: 1000 })
  })

  it('keeps the crop centred', () => {
    const r = coverRect(4000, 1000, 900, 600)
    expect(r.sx + r.cw / 2).toBe(2000)
    expect(r.sy + r.ch / 2).toBe(500)
  })
})
