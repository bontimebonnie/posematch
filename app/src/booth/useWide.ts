import { useSyncExternalStore } from 'react'

const WIDE = '(min-width: 761px)'
const mq = () => window.matchMedia(WIDE)
const subscribe = (cb: () => void) => {
  const m = mq()
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
// True on screens wide enough for the booth interior; phones get the plain stack.
export const useWide = () => useSyncExternalStore(subscribe, () => mq().matches, () => false)
