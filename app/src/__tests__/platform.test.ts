import { describe, expect, it } from 'vitest'
import { isMobile } from '../platform'

const ua = (userAgent: string, maxTouchPoints = 0) => ({ userAgent, maxTouchPoints })

describe('isMobile', () => {
  it('is true on iPhone, Android and iPadOS (Mac UA with touch)', () => {
    expect(isMobile(ua('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15', 5))).toBe(true)
    expect(isMobile(ua('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/120', 5))).toBe(true)
    expect(isMobile(ua('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15', 5))).toBe(true)
  })

  it('is false on desktop Mac and Windows browsers', () => {
    expect(isMobile(ua('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120', 0))).toBe(false)
    expect(isMobile(ua('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120', 0))).toBe(false)
  })
})
