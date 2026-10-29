import { Check, NavArrowRight, Plus, Xmark } from 'iconoir-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ImportItem } from '../db'
import { CELL_RATIO, cropImage } from '../image'
import { BoothChrome, TrayStrip } from '../booth/BoothChrome'
import { useWide } from '../booth/useWide'
import { Button, CropBox, FitImage, Header, IconButton, type PixelCrop } from '../ui'
import { useObjectUrls } from '../useObjectUrls'

// Walks through each incoming file. The picture is shown whole with a 3:2
// box to drag and resize (Task 45). From one source the user can cut as
// many pieces as they like ("cut another"), skip cropping entirely, or cut
// once and move on. Everything cut so far shows in a row underneath, each
// removable. Everything cut from one file shares a sourceId.
export default function Crop({
  files,
  booth = false,
  onBack,
  onDone,
}: {
  files: File[]
  booth?: boolean // render inside the booth chrome on wide screens
  onBack: () => void
  onDone: (items: ImportItem[]) => void
}) {
  const { t } = useTranslation()
  const wide = useWide()
  const [index, setIndex] = useState(0)
  const [items, setItems] = useState<ImportItem[]>([])
  const [cutsFromThis, setCutsFromThis] = useState(0)
  const [area, setArea] = useState<PixelCrop | null>(null)
  const [busy, setBusy] = useState(false)
  const sourceIds = useMemo(() => files.map(() => crypto.randomUUID()), [files])
  const urls = useObjectUrls(files)
  const cutBlobs = useMemo(() => items.map((i) => i.blob), [items])
  const cutUrls = useObjectUrls(cutBlobs)

  const file = files[index]
  const last = index === files.length - 1

  const advance = (next: ImportItem[]) => {
    if (last) {
      onDone(next)
      return
    }
    setIndex(index + 1)
    setCutsFromThis(0)
    setArea(null)
  }

  const cut = async (): Promise<ImportItem | null> => {
    if (!area) return null
    const blob = await cropImage(file, area)
    return { blob, sourceId: sourceIds[index] }
  }
  const removeCut = (i: number) => {
    if (items[i].sourceId === sourceIds[index]) setCutsFromThis((n) => Math.max(0, n - 1))
    setItems((prev) => prev.filter((_, j) => j !== i))
  }

  const cutAnother = async () => {
    setBusy(true)
    const item = await cut()
    if (item) {
      setItems((prev) => [...prev, item])
      setCutsFromThis((n) => n + 1)
    }
    setBusy(false)
  }

  const cutAndNext = async () => {
    setBusy(true)
    const item = await cut()
    const next = item ? [...items, item] : items
    setItems(next)
    setBusy(false)
    advance(next)
  }

  // Keep the original (it will be shown whole with blur fill later).
  const skip = () => {
    const next = cutsFromThis > 0 ? items : [...items, { blob: file, sourceId: sourceIds[index] }]
    setItems(next)
    advance(next)
  }

  const header = (
    <>
      <Header
        title={files.length > 1 ? t('crop.title_n', { index: index + 1, total: files.length }) : t('crop.title')}
        onBack={onBack}
        right={cutsFromThis > 0 ? <span className="text-label text-fg-muted">{t('crop.cut_count', { count: cutsFromThis })}</span> : null}
  />
    </>
  )
  const stage = (
    <>
      <div className="relative mx-4 flex-1 overflow-hidden rounded-card bg-dark">
        {urls[index] && <CropBox src={urls[index]} ratio={CELL_RATIO} tag={t('crop.tag')} onChange={setArea} />}
      </div>
      <p className="px-4 pt-2 text-center text-body text-fg-muted">{t('crop.hint')}</p>
      {items.length > 0 && (
        <ul className="-my-1 flex gap-2 overflow-x-auto px-4 py-1" aria-label={t('crop.cut_so_far')}>
          {items.map((item, i) => (
            <li key={item.sourceId + i} className="relative shrink-0">
              <FitImage src={cutUrls[i]} className="aspect-[3/2] h-16 rounded-card ring-1 ring-line" />
              <IconButton variant="scrim" size="sm" onClick={() => removeCut(i)} aria-label={t('common.remove')} className="absolute -top-1 -right-1">
                <Xmark width={16} height={16} strokeWidth={3} />
              </IconButton>
            </li>
          ))}
        </ul>
  )}
    </>
  )
  const bottom = (
      <div className="space-y-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" onClick={cutAnother} disabled={busy || !area} className="w-full">
          <Plus width={20} height={20} strokeWidth={2.2} />
          {t('crop.cut_another')}
        </Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={skip} disabled={busy} className="flex-1">
            {cutsFromThis > 0 ? t('crop.enough') : t('crop.keep_whole')}
          </Button>
          <Button onClick={cutAndNext} disabled={busy || !area} className="flex-1">
            {last ? t('crop.finish') : t('crop.cut_next')}
            {last ? <Check width={20} height={20} strokeWidth={2.2} /> : <NavArrowRight width={20} height={20} strokeWidth={2.2} />}
          </Button>
        </div>
      </div>
  )

  if (booth && wide) {
    return <BoothChrome glass={<>{header}{stage}</>} actions={bottom} tray={<TrayStrip rows={[]} total={4} />} />
  }
  return (
    <div className="flex h-full flex-col">
      {header}
      {stage}
      {bottom}
    </div>
  )
}
