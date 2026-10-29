// Decor colours for canvas drawing, read from the CSS tokens so the saved
// strip matches the screen. Fallbacks keep tests (no stylesheet) working.
export interface DecorTokens {
  cream: string
  paper: string
  ink: string
  pink: string
  blue: string
  yellow: string
  mint: string
  lilac: string
  peach: string
  sand: string
}
const FALLBACK: DecorTokens = {
  cream: '#fff8e7',
  paper: '#fffdf5',
  ink: '#5a4a42',
  pink: '#f9c6cf',
  blue: '#bcd8ee',
  yellow: '#fde8a6',
  mint: '#cfe8c6',
  lilac: '#ddd0ea',
  peach: '#fbd9c3',
  sand: '#eadfc8',
}
export function decorTokens(): DecorTokens {
  if (typeof getComputedStyle !== 'function' || typeof document === 'undefined') return FALLBACK
  const cs = getComputedStyle(document.documentElement)
  const read = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
  return {
    cream: read('--color-decor-cream', FALLBACK.cream),
    paper: read('--color-decor-paper', FALLBACK.paper),
    ink: read('--color-decor-ink', FALLBACK.ink),
    pink: read('--color-decor-pink', FALLBACK.pink),
    blue: read('--color-decor-blue', FALLBACK.blue),
    yellow: read('--color-decor-yellow', FALLBACK.yellow),
    mint: read('--color-decor-mint', FALLBACK.mint),
    lilac: read('--color-decor-lilac', FALLBACK.lilac),
    peach: read('--color-decor-peach', FALLBACK.peach),
    sand: read('--color-sand', FALLBACK.sand),
  }
}
