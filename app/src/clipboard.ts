// Copying an image needs ClipboardItem; Safari additionally requires the
// blob to be handed over as a Promise created inside the user gesture.
export function canCopyImage(): boolean {
  return typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function'
}

export async function copyImage(png: Promise<Blob> | Blob): Promise<void> {
  if (!canCopyImage()) throw new Error('clipboard unsupported')
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}

export function canPasteImage(): boolean {
  return typeof navigator.clipboard?.read === 'function'
}

// Image files currently on the clipboard (Safari needs this inside a user
// gesture and asks for permission each time).
export async function readImagesFromClipboard(): Promise<File[]> {
  if (!canPasteImage()) throw new Error('clipboard read unsupported')
  const items = await navigator.clipboard.read()
  const files: File[] = []
  for (const item of items) {
    const type = item.types.find((t) => t.startsWith('image/'))
    if (!type) continue
    const blob = await item.getType(type)
    files.push(new File([blob], `pasted-${files.length + 1}.${type.split('/')[1]}`, { type }))
  }
  return files
}

// Image files from a paste event (desktop Cmd/Ctrl+V).
export function imagesFromPasteEvent(e: ClipboardEvent): File[] {
  const files: File[] = []
  for (const item of Array.from(e.clipboardData?.items ?? [])) {
    if (item.kind === 'file' && item.type.startsWith('image/')) {
      const f = item.getAsFile()
      if (f) files.push(f)
    }
  }
  return files
}
