// Copying an image needs ClipboardItem; Safari additionally requires the
// blob to be handed over as a Promise created inside the user gesture.
export function canCopyImage(): boolean {
  return typeof ClipboardItem !== 'undefined' && typeof navigator.clipboard?.write === 'function'
}

export async function copyImage(png: Promise<Blob> | Blob): Promise<void> {
  if (!canCopyImage()) throw new Error('clipboard unsupported')
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': png })])
}
