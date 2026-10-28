import { describe, expect, it } from 'vitest'
import { describeCameraError } from '../camera'

describe('describeCameraError', () => {
  it('explains a denied permission', () => {
    expect(describeCameraError(new DOMException('denied', 'NotAllowedError'))).toContain('權限')
  })
  it('explains a missing camera', () => {
    expect(describeCameraError(new DOMException('none', 'NotFoundError'))).toContain('搵唔到')
  })
  it('explains a busy camera', () => {
    expect(describeCameraError(new DOMException('busy', 'NotReadableError'))).toContain('其他 app')
  })
  it('falls back to the raw message', () => {
    expect(describeCameraError(new Error('weird'))).toContain('weird')
  })
})
