import { useEffect, useState } from 'react'
import { canvasToBlob, CELL_RATIO, drawCover, loadImage } from '../image'
import { Button, Header } from '../ui'

const CELL_W = 900
const CELL_H = Math.round(CELL_W / CELL_RATIO)
const GAP = 12

// Composite the strip: four rows, cartoon on the left, photo on the right.
async function composeStrip(cartoons: Blob[], photos: Blob[]): Promise<Blob> {
  const rows = cartoons.length
  const canvas = document.createElement('canvas')
  canvas.width = CELL_W * 2 + GAP * 3
  canvas.height = CELL_H * rows + GAP * (rows + 1)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const [cartoonImgs, photoImgs] = await Promise.all([
    Promise.all(cartoons.map(loadImage)),
    Promise.all(photos.map(loadImage)),
  ])
  for (let i = 0; i < rows; i++) {
    const y = GAP + i * (CELL_H + GAP)
    drawCover(ctx, cartoonImgs[i], GAP, y, CELL_W, CELL_H)
    drawCover(ctx, photoImgs[i], GAP * 2 + CELL_W, y, CELL_W, CELL_H)
  }
  return canvasToBlob(canvas)
}

export default function Result({
  cartoons,
  photos,
  onRetake,
  onHome,
}: {
  cartoons: Blob[]
  photos: Blob[]
  onRetake: () => void
  onHome: () => void
}) {
  const [strip, setStrip] = useState<{ blob: Blob; url: string } | null>(null)

  useEffect(() => {
    let url: string | undefined
    composeStrip(cartoons, photos).then((blob) => {
      url = URL.createObjectURL(blob)
      setStrip({ blob, url })
    })
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [cartoons, photos])

  const share = async () => {
    if (!strip) return
    const filename = `post-match-${Date.now()}.jpg`
    const file = new File([strip.blob], filename, { type: 'image/jpeg' })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch {
        // user cancelled or share failed; fall through to download
      }
    }
    const a = document.createElement('a')
    a.href = strip.url
    a.download = filename
    a.click()
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="搞掂！" onBack={onHome} />
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4">
        {strip ? (
          <img src={strip.url} className="max-h-full w-auto max-w-full rounded-xl shadow-lg" alt="Four-strip 成果" />
        ) : (
          <p className="pt-10 text-ink/50">砌緊相⋯</p>
        )}
      </div>
      <div className="flex gap-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" onClick={onRetake} className="flex-1">
          重新影過
        </Button>
        <Button onClick={share} disabled={!strip} className="flex-1">
          儲存 / 分享
        </Button>
      </div>
    </div>
  )
}
