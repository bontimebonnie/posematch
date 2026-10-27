import { useEffect, useState } from 'react'

// Object URLs for a list of blobs. Created and revoked inside the same effect
// so StrictMode's mount/unmount/mount cycle can't revoke URLs still in use.
export function useObjectUrls(blobs: Blob[]): string[] {
  const [urls, setUrls] = useState<string[]>([])
  useEffect(() => {
    const next = blobs.map((b) => URL.createObjectURL(b))
    setUrls(next)
    return () => next.forEach((u) => URL.revokeObjectURL(u))
  }, [blobs])
  return urls
}
