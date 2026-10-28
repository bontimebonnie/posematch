// Turns a getUserMedia rejection into something the user can act on.
export function describeCameraError(err: unknown): string {
  const name = err instanceof DOMException || err instanceof Error ? err.name : ''
  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return '冇 camera 權限。去瀏覽器設定開返 camera，再撳「重試」。'
    case 'NotFoundError':
    case 'OverconstrainedError':
      return '搵唔到 camera。試下轉另一個鏡頭。'
    case 'NotReadableError':
    case 'AbortError':
      return 'Camera 俾其他 app 用緊，閂咗佢再撳「重試」。'
    default:
      return `開唔到 camera（${err instanceof Error ? err.message : String(err)}）`
  }
}
