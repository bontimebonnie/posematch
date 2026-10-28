import { useEffect, useState } from 'react'

// Object URLs for a list of blobs. Created and revoked inside the same effect
// so StrictMode's mount/unmount/mount cycle can't revoke URLs still in use.
// Callers must pass a stable array (state, props or useMemo): a fresh array
// every render would re-run the effect and re-render forever.
export function useObjectUrls(blobs: Blob[]): string[] {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    if (blobs.length === 0) {
      setUrls((prev) => (prev.length === 0 ? prev : []))
      return
    }
    const next = blobs.map((b) => URL.createObjectURL(b))
    setUrls(next)
    return () => next.forEach((u) => URL.revokeObjectURL(u))
  }, [blobs])
  return urls
}
