import { afterEach, describe, expect, it, vi } from 'vitest'
import { canCopyImage, copyImage } from '../clipboard'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('copyImage', () => {
  it('reports unsupported when ClipboardItem is missing', () => {
    vi.stubGlobal('ClipboardItem', undefined)
    expect(canCopyImage()).toBe(false)
  })

  it('writes a PNG ClipboardItem', async () => {
    class FakeClipboardItem {
      items: Record<string, Blob | Promise<Blob>>
      constructor(items: Record<string, Blob | Promise<Blob>>) {
        this.items = items
      }
    }
    const write = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('ClipboardItem', FakeClipboardItem)
    vi.stubGlobal('navigator', { clipboard: { write } })

    const png = new Blob(['x'], { type: 'image/png' })
    await copyImage(png)

    expect(write).toHaveBeenCalledTimes(1)
    const [items] = write.mock.calls[0][0] as FakeClipboardItem[]
    expect(items.items['image/png']).toBe(png)
  })
})

describe('readImagesFromClipboard', () => {
  it('returns only image items as files', async () => {
    const { readImagesFromClipboard } = await import('../clipboard')
    const png = new Blob(['p'], { type: 'image/png' })
    const read = vi.fn().mockResolvedValue([
      { types: ['text/plain'], getType: vi.fn() },
      { types: ['text/html', 'image/png'], getType: vi.fn().mockResolvedValue(png) },
    ])
    vi.stubGlobal('navigator', { clipboard: { read } })
    const files = await readImagesFromClipboard()
    expect(files).toHaveLength(1)
    expect(files[0].type).toBe('image/png')
    expect(files[0].name).toBe('pasted-1.png')
  })
})
