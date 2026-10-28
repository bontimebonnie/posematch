// Small persisted user preferences. Reads and writes are wrapped because
// localStorage can throw in private browsing.
const MIRROR_KEY = 'post-match.mirror'

export function getMirror(): boolean {
  try {
    const v = localStorage.getItem(MIRROR_KEY)
    return v === null ? true : v === '1'
  } catch {
    return true
  }
}

export function setMirror(on: boolean) {
  try {
    localStorage.setItem(MIRROR_KEY, on ? '1' : '0')
  } catch {
    // nothing to do; the in-memory state still applies for this session
  }
}
