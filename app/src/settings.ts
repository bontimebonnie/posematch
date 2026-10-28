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

// Last-used library filter, so the grid opens where the user left it.
const FILTER_KEY = 'post-match.libraryFilter'

export interface LibraryFilter {
  personCount: 1 | 2 | null
  characterName: string | null
}

export function getLibraryFilter(): LibraryFilter {
  try {
    const raw = localStorage.getItem(FILTER_KEY)
    if (raw) return JSON.parse(raw) as LibraryFilter
  } catch {
    // fall through
  }
  return { personCount: null, characterName: null }
}

export function setLibraryFilter(filter: LibraryFilter) {
  try {
    localStorage.setItem(FILTER_KEY, JSON.stringify(filter))
  } catch {
    // ignore
  }
}
