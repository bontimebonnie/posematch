import { Check, NavArrowRight, Plus } from 'iconoir-react'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Cropper, { type Area } from 'react-easy-crop'
import type { ImportItem } from '../db'
import { CELL_RATIO, cropImage } from '../image'
import { Button, Header } from '../ui'
import { useObjectUrls } from '../useObjectUrls'

// Walks through each incoming file. From one source the user can cut as
// many 3:2 pieces as they like ("cut another"), skip cropping entirely, or
// cut once and move on. Everything cut from one file shares a sourceId.
export default function Crop({
  files,
  onBack,
  onDone,
}: {
  files: File[]
  onBack: () => void
  onDone: (items: ImportItem[]) => void
}) {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const [items, setItems] = useState<ImportItem[]>([])
  const [cutsFromThis, setCutsFromThis] = useState(0)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const sourceIds = useMemo(() => files.map(() => crypto.randomUUID()), [files])
  const urls = useObjectUrls(files)

  const file = files[index]
  const last = index === files.length - 1
  const onCropComplete = useCallback((_: Area, pixels: Area) => setArea(pixels), [])

  const advance = (next: ImportItem[]) => {
    if (last) {
      onDone(next)
      return
    }
    setIndex(index + 1)
    setCutsFromThis(0)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setArea(null)
  }

  const cut = async (): Promise<ImportItem | null> => {
    if (!area) return null
    const blob = await cropImage(file, { x: area.x, y: area.y, width: area.width, height: area.height })
    return { blob, sourceId: sourceIds[index] }
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

  return (
    <div className="flex h-full flex-col">
      <Header
        title={files.length > 1 ? t('crop.title_n', { index: index + 1, total: files.length }) : t('crop.title')}
        onBack={onBack}
        right={cutsFromThis > 0 ? <span className="text-sm text-ink/60">{t('crop.cut_count', { count: cutsFromThis })}</span> : null}
      />
      <div className="relative mx-4 flex-1 overflow-hidden rounded-2xl bg-black">
        {urls[index] && (
          <Cropper
            image={urls[index]}
            crop={crop}
            zoom={zoom}
            aspect={CELL_RATIO}
            objectFit="contain"
            minZoom={1}
            maxZoom={5}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        )}
      </div>
      <p className="px-4 pt-2 text-center text-xs text-ink/50">{t('crop.hint')}</p>
      <div className="space-y-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button variant="secondary" onClick={cutAnother} disabled={busy || !area} className="flex w-full items-center justify-center gap-2">
          <Plus width={20} height={20} strokeWidth={2.2} />
          {t('crop.cut_another')}
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={skip} disabled={busy} className="flex-1">
            {cutsFromThis > 0 ? t('crop.enough') : t('crop.keep_whole')}
          </Button>
          <Button onClick={cutAndNext} disabled={busy || !area} className="flex flex-1 items-center justify-center gap-2">
            {last ? t('crop.finish') : t('crop.cut_next')}
            {last ? <Check width={20} height={20} strokeWidth={2.2} /> : <NavArrowRight width={20} height={20} strokeWidth={2.2} />}
          </Button>
        </div>
      </div>
    </div>
  )
}
