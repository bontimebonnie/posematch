import { describe, expect, it } from 'vitest'
import { fitContain, initialBox, moveBox, resizeBox, toPixelCrop } from '../cropBox'

const R = 3 / 2
const pic = fitContain(400, 300, 1200, 900) // → 400×300 at 0,0

describe('fitContain', () => {
  it('letterboxes a tall picture in a wide box', () => {
    expect(fitContain(400, 300, 600, 900)).toEqual({ x: 100, y: 0, w: 200, h: 300 })
  })
})

describe('initialBox', () => {
  it('is 3:2, 70% wide and centred', () => {
    const b = initialBox(pic, R)
    expect(b.w).toBeCloseTo(280)
    expect(b.h).toBeCloseTo(280 / R)
    expect(b.x + b.w / 2).toBeCloseTo(200)
    expect(b.y + b.h / 2).toBeCloseTo(150)
  })
  it('shrinks to fit a short picture', () => {
    const short = { x: 0, y: 0, w: 400, h: 100 }
    const b = initialBox(short, R)
    expect(b.h).toBeCloseTo(90)
    expect(b.w).toBeCloseTo(135)
  })
})

describe('moveBox', () => {
  it('moves and stays inside the picture', () => {
    const b = { x: 50, y: 50, w: 120, h: 80 }
    expect(moveBox(b, 10, -5, pic)).toEqual({ x: 60, y: 45, w: 120, h: 80 })
    expect(moveBox(b, -999, 999, pic)).toEqual({ x: 0, y: 220, w: 120, h: 80 })
  })
})

describe('resizeBox', () => {
  const b = { x: 100, y: 100, w: 120, h: 80 }
  it('keeps the ratio and the top-left corner', () => {
    const r = resizeBox(b, 30, 0, pic, R)
    expect(r.x).toBe(100)
    expect(r.y).toBe(100)
    expect(r.w).toBe(150)
    expect(r.h).toBeCloseTo(100)
  })
  it('follows the vertical drag when it is the larger one', () => {
    const r = resizeBox(b, 2, 40, pic, R)
    expect(r.h).toBeCloseTo(120)
    expect(r.w).toBeCloseTo(180)
  })
  it('cannot leave the picture or shrink below the minimum', () => {
    const big = resizeBox(b, 9999, 0, pic, R)
    expect(big.x + big.w).toBeLessThanOrEqual(400)
    expect(big.y + big.h).toBeLessThanOrEqual(300 + 1e-9)
    expect(resizeBox(b, -9999, 0, pic, R).w).toBe(48)
  })
})

describe('toPixelCrop', () => {
  it('maps the box back to picture pixels', () => {
    expect(toPixelCrop({ x: 100, y: 50, w: 200, h: 133.33 }, pic, 1200)).toEqual({ x: 300, y: 150, width: 600, height: 400 })
  })
})
