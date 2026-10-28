import { describe, expect, it } from 'vitest'
import { cameraErrorKey } from '../camera'

describe('cameraErrorKey', () => {
  it('classifies the common getUserMedia errors', () => {
    expect(cameraErrorKey(new DOMException('x', 'NotAllowedError')).key).toBe('denied')
    expect(cameraErrorKey(new DOMException('x', 'NotFoundError')).key).toBe('not_found')
    expect(cameraErrorKey(new DOMException('x', 'NotReadableError')).key).toBe('busy')
  })
  it('keeps the raw message for unknown errors', () => {
    expect(cameraErrorKey(new Error('weird'))).toEqual({ key: 'unknown', message: 'weird' })
  })
})
