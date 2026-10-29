import { describe, expect, it } from 'vitest'
import { decorEnabled, initialScreen } from '../booth/entry'

describe('decorEnabled', () => {
  it('is on unless VITE_DECOR=0', () => {
    expect(decorEnabled({})).toBe(true)
    expect(decorEnabled({ VITE_DECOR: '1' })).toBe(true)
    expect(decorEnabled({ VITE_DECOR: '0' })).toBe(false)
  })
})

describe('initialScreen', () => {
  it('opens on the booth every launch', () => {
    expect(initialScreen({ decor: true, share: false })).toBe('booth')
  })
  it('skips the booth when decor is off or the app was opened from the share sheet', () => {
    expect(initialScreen({ decor: false, share: false })).toBe('library')
    expect(initialScreen({ decor: true, share: true })).toBe('library')
  })
})
