import { useLiveQuery } from 'dexie-react-hooks'
import { Xmark } from 'iconoir-react'
import { useState } from 'react'
import { addImages, listCharacterNames, type PersonCount } from '../db'
import { downscaleImage } from '../image'
import { Button, FitImage, Header, PersonToggle } from '../ui'
import { useObjectUrls } from '../useObjectUrls'
import { CharacterNameInput } from './Library'

// Every way of adding images (file picker, paste, share target) lands here:
// review the batch, tag it, save to the library.
export default function Import({
  files: initialFiles,
  defaultPersonCount,
  onBack,
  onDone,
}: {
  files: File[]
  defaultPersonCount: PersonCount
  onBack: () => void
  onDone: () => void
}) {
  const [files, setFiles] = useState(initialFiles)
  const [personCount, setPersonCount] = useState<PersonCount>(defaultPersonCount)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const names = useLiveQuery(listCharacterNames, [], [] as string[])
  const urls = useObjectUrls(files)

  const save = async () => {
    setSaving(true)
    try {
      const blobs = await Promise.all(files.map((f) => downscaleImage(f)))
      await addImages(blobs, { personCount, characterName: name, sourceId: crypto.randomUUID() })
      onDone()
    } catch (err) {
      alert(`Save 唔到：${err instanceof Error ? err.message : String(err)}`)
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header title={`加入 ${files.length} 張圖片`} onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <ul className="grid grid-cols-3 gap-2">
          {urls.map((u, i) => (
            <li key={u} className="relative">
              <FitImage src={u} className="aspect-[3/2] w-full rounded-xl" />
              <button
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
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
        <Button onClick={save} disabled={files.length === 0 || saving} className="w-full">
          {saving ? '儲存緊⋯' : `加入 Library`}
        </Button>
      </div>
    </div>
  )
}
