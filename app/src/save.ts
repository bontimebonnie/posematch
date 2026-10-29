import { isMobile } from './platform'

// Phones: share sheet (saves to the album). Desktop: straight download,
// even though desktop Chrome can share files, because the OS share sheet
// is a detour there (Task 37).
export async function saveJpeg(jpeg: Blob, url: string) {
  const file = new File([jpeg], `post-match-${Date.now()}.jpg`, { type: 'image/jpeg' })
  if (isMobile() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return
    } catch {
      // user cancelled or share failed; fall through to download
    }
  }
  const a = document.createElement('a')
  a.href = url
  a.download = file.name
  a.click()
}
