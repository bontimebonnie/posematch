import { describe, expect, it } from 'vitest'
import { CELL_RATIO } from '../image'
import { stripLayout } from '../strip'

describe('stripLayout', () => {
  const layout = stripLayout({ rows: 4 })

  it('targets an Instagram 4:5 canvas', () => {
    expect(layout.width).toBe(1080)
    expect(layout.height).toBe(1350)
  })

  it('has one cartoon cell and one photo cell per row', () => {
    expect(layout.rows).toHaveLength(4)
    for (const row of layout.rows) {
      expect(row.cartoon.x).toBeLessThan(row.photo.x)
      expect(row.cartoon.y).toBe(row.photo.y)
      expect(row.cartoon.w).toBe(row.photo.w)
      expect(row.cartoon.h).toBe(row.photo.h)
    }
  })

  it('uses 3:2 cells with integer coordinates', () => {
    for (const row of layout.rows) {
      for (const cell of [row.cartoon, row.photo]) {
        expect(cell.w / cell.h).toBeCloseTo(CELL_RATIO, 1)
        for (const v of Object.values(cell)) expect(Number.isInteger(v)).toBe(true)
      }
    }
  })

  it('keeps every cell inside the canvas and separated by a constant gap', () => {
    const { rows, gap } = layout
    for (const row of rows) {
      expect(row.cartoon.x).toBeGreaterThanOrEqual(0)
      expect(row.photo.x + row.photo.w).toBeLessThanOrEqual(layout.width)
      expect(row.cartoon.y).toBeGreaterThanOrEqual(0)
      expect(row.cartoon.y + row.cartoon.h).toBeLessThanOrEqual(layout.height)
      expect(row.photo.x - (row.cartoon.x + row.cartoon.w)).toBe(gap)
    }
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].cartoon.y - (rows[i - 1].cartoon.y + rows[i - 1].cartoon.h)).toBe(gap)
    }
  })

  it('centres the strip horizontally and vertically', () => {
    const first = layout.rows[0]
    const last = layout.rows[layout.rows.length - 1]
    const left = first.cartoon.x
    const right = layout.width - (first.photo.x + first.photo.w)
    const top = first.cartoon.y
    const bottom = layout.height - (last.photo.y + last.photo.h)
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1)
    expect(Math.abs(top - bottom)).toBeLessThanOrEqual(1)
  })
})
