const SHARE_CACHE = 'share-target'

export function launchedFromShare(): boolean {
  return new URLSearchParams(location.search).get('import') === 'share'
}

// Files the service worker stashed for us (see sw.ts). They are removed
// from the cache once read, and the query string is cleaned up.
export async function takeSharedFiles(): Promise<File[]> {
  if (!('caches' in window)) return []
  const cache = await caches.open(SHARE_CACHE)
  const keys = await cache.keys()
  const files: File[] = []
  for (const req of keys) {
    const res = await cache.match(req)
    if (!res) continue
    const type = res.headers.get('content-type') ?? 'image/jpeg'
    const name = decodeURIComponent(res.headers.get('x-file-name') ?? 'shared.jpg')
    files.push(new File([await res.blob()], name, { type }))
    await cache.delete(req)
  }
  history.replaceState(null, '', location.pathname)
  return files
}
