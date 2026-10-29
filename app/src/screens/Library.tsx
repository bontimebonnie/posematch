import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, Language as LanguageIcon, MediaImage, PasteClipboard, Plus, Trash } from 'iconoir-react'
import { useTranslation } from 'react-i18next'
import { useEffect, useMemo, useRef, useState } from 'react'
import { canPasteImage, imagesFromPasteEvent, readImagesFromClipboard } from '../clipboard'
import { db, deleteImages, listCharacterNames, SHOTS_PER_SET, type StoredImage } from '../db'
import { getLibraryFilter, setLanguage, setLibraryFilter, type Language, type LibraryFilter } from '../settings'
import { Button, Chip, ConfirmSheet, EmptyState, Header, Tile, Toast, Tray } from '../ui'
import { EditSheet } from './EditSheet'
import { useObjectUrls } from '../useObjectUrls'

type Mode = 'browse' | 'select' | 'pick'

export default function Library({
  onBooth,
  onImport,
  onShoot,
}: {
  onBooth?: () => void // back to the booth front; absent when decor is off
  onImport: (files: File[]) => void
  onShoot: (cartoons: Blob[]) => void
}) {
  const { t, i18n } = useTranslation()
  const [filter, setFilterState] = useState<LibraryFilter>(getLibraryFilter)
  const switchLanguage = () => {
    const next: Language = i18n.language === 'en' ? 'zh-TW' : 'en'
    setLanguage(next)
    i18n.changeLanguage(next)
  }
  const setFilter = (f: LibraryFilter) => {
    setFilterState(f)
    setLibraryFilter(f)
  }
  const [mode, setMode] = useState<Mode>('browse')
  const [selected, setSelected] = useState<number[]>([]) // select: any order; pick: shoot order
  const [editing, setEditing] = useState<StoredImage | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const paste = async () => {
    try {
      const files = await readImagesFromClipboard()
      if (files.length === 0) setToast(t('library.paste_empty'))
      else onImport(files)
    } catch {
      setToast(t('library.paste_failed'))
    }
  }
  // Desktop Cmd/Ctrl+V anywhere on the library.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = imagesFromPasteEvent(e)
      if (files.length) {
        e.preventDefault()
        onImport(files)
      }
    }
    document.addEventListener('paste', onPaste)
    return () => document.removeEventListener('paste', onPaste)
  }, [onImport])

  const names = useLiveQuery(listCharacterNames, [], [] as string[])
  // A remembered name whose last image was deleted just stops filtering.
  const activeName = filter.characterName && names.includes(filter.characterName) ? filter.characterName : null
  const images = useLiveQuery(async () => {
    let rows = await db.images.orderBy('createdAt').reverse().toArray()
    if (filter.personCount) rows = rows.filter((r) => r.personCount === filter.personCount)
    if (activeName) rows = rows.filter((r) => r.characterName === activeName)
    return rows
  }, [filter.personCount, activeName])

  const blobs = useMemo(() => (images ?? []).map((i) => i.blob), [images])
  const urls = useObjectUrls(blobs)

  const leaveMode = () => {
    setMode('browse')
    setSelected([])
  }
  const toggle = (id: number) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id)
      if (mode === 'pick' && prev.length >= SHOTS_PER_SET) return prev
      return [...prev, id]
    })
  }
  const movePick = (i: number, dir: -1 | 1) =>
    setSelected((prev) => {
      const j = i + dir
      if (j < 0 || j >= prev.length) return prev
      const next = [...prev]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const removeSelected = async () => {
    await deleteImages(selected)
    setConfirmingDelete(false)
    leaveMode()
  }
  const traySlots = useMemo(() => {
    const urlById = new Map((images ?? []).map((img, i) => [img.id, urls[i]]))
    return selected.map((id) => ({ id, src: urlById.get(id) ?? '' }))
  }, [selected, images, urls])
  const startShoot = () => {
    const byId = new Map((images ?? []).map((i) => [i.id, i.blob]))
    onShoot(selected.map((id) => byId.get(id)!))
  }

  const title =
    mode === 'pick'
      ? t('library.pick_title', { count: selected.length, total: SHOTS_PER_SET })
      : mode === 'select'
        ? t('library.selected', { count: selected.length })
        : t('library.title')

  return (
    <div className="flex h-full flex-col">
      <Header
        title={title}
        onBack={mode === 'browse' ? onBooth : leaveMode}
        right={
          mode === 'browse' ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={switchLanguage} aria-label={t('common.language')} className="gap-1">
                <LanguageIcon width={16} height={16} />
                {i18n.language === 'en' ? '中' : 'EN'}
              </Button>
              {(images?.length ?? 0) > 0 && (
                <Button variant="secondary" size="md" onClick={() => setMode('select')}>
                  {t('library.select')}
                </Button>
              )}
            </div>
          ) : null
        }
      />

      {/* Filters */}
      <div className="space-y-2 px-4 pb-2">
        <div className="flex gap-2">
          {([null, 1, 2] as const).map((n) => (
            <Chip key={String(n)} selected={filter.personCount === n} tint={n ?? undefined} onClick={() => setFilter({ ...filter, personCount: n })}>
              {n === null ? t('library.filter_all') : t('common.people', { count: n })}
            </Chip>
          ))}
        </div>
        {names.length > 0 && (
          <div className="-mx-4 -my-1 flex gap-2 overflow-x-auto px-4 py-1">
            <Chip selected={activeName === null} onClick={() => setFilter({ ...filter, characterName: null })}>
              {t('library.filter_all_characters')}
            </Chip>
            {names.map((n, i) => (
              <Chip key={n} selected={activeName === n} tint={i % 2 ? 4 : 3} onClick={() => setFilter({ ...filter, characterName: n })}>
                {n}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {images === undefined ? null : images.length === 0 ? (
          <EmptyState icon={<MediaImage width={32} height={32} />} title={t('library.empty_title')} body={t('library.empty_body')} />
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {images.map((img, i) => (
              <Tile
                key={img.id}
                src={urls[i]}
                onClick={() => (mode === 'browse' ? setEditing(img) : toggle(img.id))}
                selectable={mode !== 'browse'}
                order={selected.indexOf(img.id)}
                showOrder={mode === 'pick'}
                label={img.characterName}
              />
            ))}
          </ul>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {toast && (
          <Toast className="mb-2">{toast}</Toast>
        )}
        {mode === 'browse' && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => fileInput.current?.click()} className="flex-1">
              <Plus width={20} height={20} strokeWidth={2.2} />
              {t('library.add')}
            </Button>
            {canPasteImage() && (
              <Button variant="secondary" onClick={paste} aria-label={t('library.paste')} className="px-4">
                <PasteClipboard width={20} height={20} strokeWidth={2.2} />
              </Button>
            )}
            <Button onClick={() => setMode('pick')} disabled={(images?.length ?? 0) === 0} className="flex-1">
              <Camera width={20} height={20} strokeWidth={2.2} />
              {t('library.shoot')}
            </Button>
          </div>
        )}
        {mode === 'select' && (
          <Button variant="danger" onClick={() => setConfirmingDelete(true)} disabled={selected.length === 0} className="w-full">
            <Trash width={20} height={20} strokeWidth={2.2} />
            {t('library.delete_count', { count: selected.length })}
          </Button>
        )}
        {mode === 'pick' && (
          <div className="space-y-2">
            <Tray slots={traySlots} total={SHOTS_PER_SET} onMove={movePick} onRemove={toggle} />
            <Button onClick={startShoot} disabled={selected.length !== SHOTS_PER_SET} className="w-full">
              <Camera width={20} height={20} strokeWidth={2.2} />
              {t('library.start')}
            </Button>
          </div>
        )}
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          e.target.value = ''
          if (files.length) onImport(files)
        }}
      />

      {editing && <EditSheet image={editing} names={names} onClose={() => setEditing(null)} />}
      {confirmingDelete && (
        <ConfirmSheet
          title={t('library.confirm_delete_title', { count: selected.length })}
          body={t('library.confirm_delete_body')}
          confirmLabel={t('library.delete_count', { count: selected.length })}
          onConfirm={removeSelected}
          onClose={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  )
}
