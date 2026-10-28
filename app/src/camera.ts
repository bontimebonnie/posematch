// Maps a getUserMedia rejection to a translation key under `camera.*`.
export type CameraErrorKey = 'denied' | 'not_found' | 'busy' | 'unknown'

export function cameraErrorKey(err: unknown): { key: CameraErrorKey; message: string } {
  const name = err instanceof DOMException || err instanceof Error ? err.name : ''
  const message = err instanceof Error ? err.message : String(err)
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return { key: 'denied', message }
    case 'NotFoundError':
    case 'OverconstrainedError':
      return { key: 'not_found', message }
    case 'NotReadableError':
    case 'AbortError':
      return { key: 'busy', message }
    default:
      return { key: 'unknown', message }
  }
}
