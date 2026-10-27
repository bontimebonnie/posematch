import { useRef, useState } from 'react'
import { SHOTS_PER_SET, saveSet, type PersonCount } from '../db'
import { useObjectUrls } from '../useObjectUrls'
import { Button, Header, PersonToggle } from '../ui'

export default function Upload({
  personCount: initialCount,
  onBack,
  onSaved,
}: {
  personCount: PersonCount
  onBack: () => void
  onSaved: (cartoons: Blob[]) => void
}) {
  const [personCount, setPersonCount] = useState(initialCount)
  const [name, setName] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [saving, setSaving] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const urls = useObjectUrls(files)

  const addFiles = (list: FileList | null) => {
    if (!list) return
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, SHOTS_PER_SET))
  }
  const removeAt = (i: number) => setFiles((prev) => prev.filter((_, j) => j !== i))
  const move = (i: number, dir: -1 | 1) =>
    setFiles((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })

  const save = async () => {
    setSaving(true)
    const set = await saveSet(name.trim() || `卡通相 ${new Date().toLocaleDateString()}`, personCount, files)
    void set
    onSaved(files)
  }

  const ready = files.length === SHOTS_PER_SET

  return (
    <div className="flex h-full flex-col">
      <Header title="Upload 卡通相" onBack={onBack} />
      <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
        <label className="block">
          <span className="mb-1 block text-sm text-ink/60">名稱（可以唔填）</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：Tom & Jerry"
            className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-ink/15 outline-none focus:ring-berry"
          />
        </label>

        <div>
          <span className="mb-1 block text-sm text-ink/60">卡通入面有幾多個 character？</span>
          <PersonToggle value={personCount} onChange={setPersonCount} />
        </div>

        <div>
          <span className="mb-1 block text-sm text-ink/60">
            揀 {SHOTS_PER_SET} 張相（{files.length}/{SHOTS_PER_SET}），次序就係影相嘅次序
          </span>
          <ul className="grid grid-cols-2 gap-3">
            {urls.map((u, i) => (
              <li key={u} className="relative overflow-hidden rounded-xl bg-white ring-1 ring-ink/10">
                <img src={u} className="aspect-[3/2] w-full object-cover" alt="" />
                <span className="absolute top-1.5 left-1.5 rounded-full bg-black/60 px-2 text-xs font-bold text-white">
                  {i + 1}
                </span>
                <div className="flex justify-between px-1 py-1 text-sm">
                  <button onClick={() => move(i, -1)} className="px-2" disabled={i === 0}>
                    ◀
                  </button>
                  <button onClick={() => removeAt(i)} className="px-2 text-berry">
                    刪除
                  </button>
                  <button onClick={() => move(i, 1)} className="px-2" disabled={i === files.length - 1}>
                    ▶
                  </button>
                </div>
              </li>
            ))}
            {files.length < SHOTS_PER_SET && (
              <li>
                <button
                  onClick={() => input.current?.click()}
                  className="flex aspect-[3/2] w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-ink/20 text-ink/50"
                >
                  <span className="text-3xl leading-none">＋</span>
                  <span className="text-xs">加相</span>
                </button>
              </li>
            )}
          </ul>
          <input
            ref={input}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => {
              addFiles(e.target.files)
              e.target.value = ''
            }}
          />
        </div>
      </div>
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Button onClick={save} disabled={!ready || saving} className="w-full">
          {saving ? '儲存緊⋯' : 'Save 入 Library 同開始影相'}
        </Button>
      </div>
    </div>
  )
}
