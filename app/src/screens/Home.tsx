import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Xmark } from 'iconoir-react'
import { useEffect, useState } from 'react'
import { db, deleteSet, loadSetImages, type CartoonSet, type PersonCount } from '../db'
import { Button, FitImage, Header, PersonToggle } from '../ui'
import { useObjectUrls } from '../useObjectUrls'

export default function Home({
  personCount,
  onPersonCount,
  onUpload,
  onPick,
}: {
  personCount: PersonCount
  onPersonCount: (n: PersonCount) => void
  onUpload: () => void
  onPick: (cartoons: Blob[]) => void
}) {
  const sets = useLiveQuery(
    () => db.sets.where('personCount').equals(personCount).reverse().sortBy('createdAt'),
    [personCount],
  )

  return (
    <div className="flex h-full flex-col">
      <Header title="Post Match" />
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <p className="mb-2 text-sm text-ink/60">幾多個人影？</p>
        <PersonToggle value={personCount} onChange={onPersonCount} />

        <Button onClick={onUpload} className="mt-5 flex w-full items-center justify-center gap-2">
          <Plus width={20} height={20} strokeWidth={2.2} />
          Upload 新嘅一套卡通相
        </Button>

        <h2 className="mt-7 mb-3 font-bold">Library</h2>
        {sets === undefined ? null : sets.length === 0 ? (
          <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/50 ring-1 ring-ink/10">
            仲未有 {personCount} 個人嘅卡通相，
            <br />
            撳上面個掣 upload 第一套啦。
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {sets.map((set) => (
              <SetCard key={set.id} set={set} onPick={onPick} />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function SetCard({ set, onPick }: { set: CartoonSet; onPick: (cartoons: Blob[]) => void }) {
  const [blobs, setBlobs] = useState<Blob[]>([])
  const urls = useObjectUrls(blobs)

  useEffect(() => {
    let cancelled = false
    loadSetImages(set).then((b) => {
      if (!cancelled) setBlobs(b)
    })
    return () => {
      cancelled = true
    }
  }, [set])

  const remove = async () => {
    if (confirm(`刪除「${set.name}」？`)) await deleteSet(set)
  }

  return (
    <li className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-ink/10">
      <button onClick={() => onPick(blobs)} className="block w-full text-left" disabled={!blobs.length}>
        <div className="grid grid-cols-2 gap-0.5 bg-ink/10">
          {urls.map((u, i) => (
            <FitImage key={i} src={u} className="aspect-[3/2] w-full" />
          ))}
        </div>
        <div className="truncate px-3 py-2 text-sm font-semibold">{set.name}</div>
      </button>
      <button
        onClick={remove}
        aria-label="刪除"
        className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white"
      >
        <Xmark width={16} height={16} strokeWidth={2.4} />
      </button>
    </li>
  )
}
