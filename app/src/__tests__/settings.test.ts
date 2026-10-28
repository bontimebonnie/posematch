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

describe('language', () => {
  it('maps any Chinese locale to zh-TW and everything else to en', async () => {
    const { detectLanguage } = await import('../settings')
    expect(detectLanguage('zh-HK')).toBe('zh-TW')
    expect(detectLanguage('zh-Hant-TW')).toBe('zh-TW')
    expect(detectLanguage('en-GB')).toBe('en')
    expect(detectLanguage('ja')).toBe('en')
  })
  it('remembers an explicit choice', async () => {
    const { getLanguage, setLanguage } = await import('../settings')
    setLanguage('zh-TW')
    expect(getLanguage()).toBe('zh-TW')
  })
})
