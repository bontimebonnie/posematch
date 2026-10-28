import { describe, expect, it } from 'vitest'
import { coverRect, fitRect, fitWithin } from '../image'

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

describe('fitWithin', () => {
  it('leaves small images alone', () => {
    expect(fitWithin(800, 600, 1600)).toEqual([800, 600])
  })
  it('scales the longest edge down to the limit', () => {
    expect(fitWithin(4000, 3000, 1600)).toEqual([1600, 1200])
    expect(fitWithin(3000, 4000, 1600)).toEqual([1200, 1600])
  })
})

describe('fitRect', () => {
  it('letterboxes a squarer source inside a 3:2 target, centred', () => {
    // 1200x1000 into 900x600: height binds → 720x600, centred horizontally
    expect(fitRect(1200, 1000, 0, 0, 900, 600)).toEqual({ x: 90, y: 0, w: 720, h: 600 })
  })
  it('pillarboxes a wider source, centred', () => {
    // 4000x1000 into 900x600: width binds → 900x225, centred vertically
    expect(fitRect(4000, 1000, 0, 0, 900, 600)).toEqual({ x: 0, y: 188, w: 900, h: 225 })
  })
  it('fills exactly when ratios match and respects the target offset', () => {
    expect(fitRect(1500, 1000, 10, 20, 900, 600)).toEqual({ x: 10, y: 20, w: 900, h: 600 })
  })
})
