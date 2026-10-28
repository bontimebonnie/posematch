import { useLiveQuery } from 'dexie-react-hooks'
import { Xmark } from 'iconoir-react'
import { useMemo, useState } from 'react'
import { addImageBatch, listCharacterNames, type ImportItem, type PersonCount } from '../db'
import { downscaleImage } from '../image'
import { Button, FitImage, Header, PersonToggle } from '../ui'
import { useObjectUrls } from '../useObjectUrls'
import { CharacterNameInput } from './Library'

// Every way of adding images (file picker, paste, share target) lands here:
// review the batch, tag it, save to the library.
export default function Import({
  items: initialItems,
  defaultPersonCount,
  onBack,
  onDone,
}: {
  items: ImportItem[]
  defaultPersonCount: PersonCount
  onBack: () => void
  onDone: () => void
}) {
  const [items, setItems] = useState(initialItems)
  const blobs = useMemo(() => items.map((i) => i.blob), [items])
  const [personCount, setPersonCount] = useState<PersonCount>(defaultPersonCount)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const names = useLiveQuery(listCharacterNames, [], [] as string[])
  const urls = useObjectUrls(blobs)

  const save = async () => {
    setSaving(true)
    try {
      const scaled = await Promise.all(items.map(async (i) => ({ ...i, blob: await downscaleImage(i.blob) })))
      await addImageBatch(scaled, { personCount, characterName: name })
      onDone()
    } catch (err) {
      alert(`Save 唔到：${err instanceof Error ? err.message : String(err)}`)
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={`加入 ${items.length} 張圖片`} onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <ul className="grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <li key={u} className="relative">
              <FitImage src={u} className="aspect-[3/2] w-full rounded-xl" />
              <button
                onClick={() => setItems((prev) => prev.filter((_, j) => j !== i))}
                aria-label="移除"
                className="absolute top-1 right-1 rounded-full bg-black/50 p-1 text-white"
              >
                <Xmark width={14} height={14} strokeWidth={3} />
              </button>
            </li>
          ))}
        </ul>
        <div>
          <span className="mb-1 block text-sm text-ink/60">卡通入面有幾多個 character？</span>
          <PersonToggle value={personCount} onChange={setPersonCount} />
        </div>
        <CharacterNameInput value={name} onChange={setName} names={names} />
      </div>
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button onClick={save} disabled={items.length === 0 || saving} className="w-full">
          {saving ? '儲存緊⋯' : `加入 Library`}
        </Button>
      </div>
    </div>
  )
}
