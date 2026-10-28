import { beforeEach, describe, expect, it } from 'vitest'
import { getMirror, setMirror } from '../settings'

beforeEach(() => localStorage.clear())

describe('mirror setting', () => {
  it('defaults to on', () => {
    expect(getMirror()).toBe(true)
  })

  it('persists off and back on', () => {
    setMirror(false)
    expect(getMirror()).toBe(false)
    setMirror(true)
    expect(getMirror()).toBe(true)
  })
})

describe('library filter', () => {
  it('defaults to no filter and round-trips', async () => {
    const { getLibraryFilter, setLibraryFilter } = await import('../settings')
    expect(getLibraryFilter()).toEqual({ personCount: null, characterName: null })
    setLibraryFilter({ personCount: 2, characterName: 'Kuromi' })
    expect(getLibraryFilter()).toEqual({ personCount: 2, characterName: 'Kuromi' })
  })
})
