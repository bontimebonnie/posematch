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
