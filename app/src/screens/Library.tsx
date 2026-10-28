import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, Check, EditPencil, NavArrowLeft, NavArrowRight, Plus, Trash, Xmark } from 'iconoir-react'
import { useMemo, useRef, useState } from 'react'
import { db, deleteImages, listCharacterNames, SHOTS_PER_SET, updateImage, type PersonCount, type StoredImage } from '../db'
import { getLibraryFilter, setLibraryFilter, type LibraryFilter } from '../settings'
import { Button, FitImage, Header, PersonToggle } from '../ui'
import { useObjectUrls } from '../useObjectUrls'

type Mode = 'browse' | 'select' | 'pick'

export default function Library({
  onImport,
  onShoot,
}: {
  onImport: (files: File[]) => void
  onShoot: (cartoons: Blob[]) => void
}) {
  const [filter, setFilterState] = useState<LibraryFilter>(getLibraryFilter)
  const setFilter = (f: LibraryFilter) => {
    setFilterState(f)
    setLibraryFilter(f)
  }
  const [mode, setMode] = useState<Mode>('browse')
  const [selected, setSelected] = useState<number[]>([]) // select: any order; pick: shoot order
  const [editing, setEditing] = useState<StoredImage | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

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
    if (!confirm(`刪除 ${selected.length} 張相？`)) return
    await deleteImages(selected)
    leaveMode()
  }
  const startShoot = () => {
    const byId = new Map((images ?? []).map((i) => [i.id, i.blob]))
    onShoot(selected.map((id) => byId.get(id)!))
  }

  const title = mode === 'pick' ? `揀 ${selected.length} / ${SHOTS_PER_SET} 張` : mode === 'select' ? `已選 ${selected.length} 張` : 'Post Match'

  return (
    <div className="flex h-full flex-col">
      <Header
        title={title}
        onBack={mode === 'browse' ? undefined : leaveMode}
        right={
          mode === 'browse' && (images?.length ?? 0) > 0 ? (
            <button onClick={() => setMode('select')} className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-ink/15">
              選取
            </button>
          ) : null
        }
      />

      {/* Filters */}
      <div className="space-y-2 px-4 pb-3">
        <div className="flex gap-2">
          {([null, 1, 2] as const).map((n) => (
            <Chip key={String(n)} active={filter.personCount === n} onClick={() => setFilter({ ...filter, personCount: n })}>
              {n === null ? '全部' : `${n} 個人`}
            </Chip>
          ))}
        </div>
        {names.length > 0 && (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
            <Chip active={activeName === null} onClick={() => setFilter({ ...filter, characterName: null })}>
              所有角色
            </Chip>
            {names.map((n) => (
              <Chip key={n} active={activeName === n} onClick={() => setFilter({ ...filter, characterName: n })}>
                {n}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {images === undefined ? null : images.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/50 ring-1 ring-ink/10">
            呢度未有相。
            <br />
            撳「加入圖片」放第一張。
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2">
            {images.map((img, i) => {
              const order = selected.indexOf(img.id)
              const isSelected = order >= 0
              return (
                <li key={img.id} className="relative">
                  <button
                    onClick={() => (mode === 'browse' ? setEditing(img) : toggle(img.id))}
                    className={`block w-full overflow-hidden rounded-xl ring-2 ${isSelected ? 'ring-berry' : 'ring-transparent'}`}
                  >
                    <FitImage src={urls[i]} className="aspect-[3/2] w-full" />
                  </button>
                  {mode !== 'browse' && (
                    <span
                      className={`pointer-events-none absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isSelected ? 'bg-berry text-white' : 'bg-white/80 text-ink/40 ring-1 ring-ink/20'
                      }`}
                    >
                      {isSelected ? (mode === 'pick' ? order + 1 : <Check width={14} height={14} strokeWidth={3} />) : ''}
                    </span>
                  )}
                  {mode === 'browse' && img.characterName && (
                    <span className="pointer-events-none absolute bottom-1 left-1 max-w-[90%] truncate rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">
                      {img.characterName}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {/* Bottom bar */}
      <div className="px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {mode === 'browse' && (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => fileInput.current?.click()} className="flex flex-1 items-center justify-center gap-2">
              <Plus width={20} height={20} strokeWidth={2.2} />
              加入圖片
            </Button>
            <Button
              onClick={() => setMode('pick')}
              disabled={(images?.length ?? 0) === 0}
              className="flex flex-1 items-center justify-center gap-2"
            >
              <Camera width={20} height={20} strokeWidth={2.2} />
              開始拍攝
            </Button>
          </div>
        )}
        {mode === 'select' && (
          <Button variant="secondary" onClick={removeSelected} disabled={selected.length === 0} className="flex w-full items-center justify-center gap-2 text-berry">
            <Trash width={20} height={20} strokeWidth={2.2} />
            刪除 {selected.length} 張
          </Button>
        )}
        {mode === 'pick' && (
          <div className="space-y-3">
            <PickTray selected={selected} images={images ?? []} urls={urls} onMove={movePick} onRemove={toggle} />
            <Button onClick={startShoot} disabled={selected.length !== SHOTS_PER_SET} className="flex w-full items-center justify-center gap-2">
              <Camera width={20} height={20} strokeWidth={2.2} />
              開始
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
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors ${
        active ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-ink/15'
      }`}
    >
      {children}
    </button>
  )
}

// The four slots chosen for shooting, in order, with reorder/remove controls.
function PickTray({
  selected,
  images,
  urls,
  onMove,
  onRemove,
}: {
  selected: number[]
  images: StoredImage[]
  urls: string[]
  onMove: (i: number, dir: -1 | 1) => void
  onRemove: (id: number) => void
}) {
  const urlById = new Map(images.map((img, i) => [img.id, urls[i]]))
  return (
    <ul className="grid grid-cols-4 gap-2">
      {Array.from({ length: SHOTS_PER_SET }, (_, i) => {
        const id = selected[i]
        if (id === undefined) {
          return <li key={`empty-${i}`} className="aspect-[3/2] rounded-lg border-2 border-dashed border-ink/20" />
        }
        return (
          <li key={id} className="relative">
            <FitImage src={urlById.get(id) ?? ''} className="aspect-[3/2] w-full rounded-lg" />
            <span className="absolute top-0.5 left-0.5 rounded-full bg-berry px-1.5 text-[10px] font-bold text-white">{i + 1}</span>
            <button onClick={() => onRemove(id)} aria-label="移除" className="absolute top-0.5 right-0.5 rounded-full bg-black/50 p-0.5 text-white">
              <Xmark width={12} height={12} strokeWidth={3} />
            </button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between">
              <button onClick={() => onMove(i, -1)} disabled={i === 0} aria-label="向前" className="rounded-tr-md bg-black/50 p-0.5 text-white disabled:opacity-30">
                <NavArrowLeft width={12} height={12} strokeWidth={3} />
              </button>
              <button onClick={() => onMove(i, 1)} disabled={i === selected.length - 1} aria-label="向後" className="rounded-tl-md bg-black/50 p-0.5 text-white disabled:opacity-30">
                <NavArrowRight width={12} height={12} strokeWidth={3} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

// Edit one image's metadata, or delete it.
function EditSheet({ image, names, onClose }: { image: StoredImage; names: string[]; onClose: () => void }) {
  const [personCount, setPersonCount] = useState<PersonCount>(image.personCount)
  const [name, setName] = useState(image.characterName)
  const save = async () => {
    await updateImage(image.id, { personCount, characterName: name })
    onClose()
  }
  const remove = async () => {
    if (!confirm('刪除呢張相？')) return
    await deleteImages([image.id])
    onClose()
  }
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-xl space-y-4 rounded-t-3xl bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">
            <EditPencil width={18} height={18} />
            編輯
          </h2>
          <button onClick={onClose} aria-label="關閉" className="rounded-full p-1">
            <Xmark width={20} height={20} />
          </button>
        </div>
        <PersonToggle value={personCount} onChange={setPersonCount} />
        <CharacterNameInput value={name} onChange={setName} names={names} />
        <div className="flex gap-3">
          <Button variant="secondary" onClick={remove} className="flex flex-1 items-center justify-center gap-2 text-berry">
            <Trash width={18} height={18} />
            刪除
          </Button>
          <Button onClick={save} className="flex-1">
            儲存
          </Button>
        </div>
      </div>
    </div>
  )
}

export function CharacterNameInput({ value, onChange, names }: { value: string; onChange: (v: string) => void; names: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-ink/60">角色名（例如 Tom & Jerry）</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list="character-names"
        placeholder="可以唔填"
        className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-ink/15 outline-none focus:ring-berry"
      />
      <datalist id="character-names">
        {names.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>
    </label>
  )
}
