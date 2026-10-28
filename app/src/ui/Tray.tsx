import { NavArrowLeft, NavArrowRight, Xmark } from 'iconoir-react'
import { useTranslation } from 'react-i18next'
import { Badge } from './Badge'
import { FitImage } from './FitImage'
import { IconButton } from './IconButton'

// The slots chosen for shooting, in order, with reorder/remove controls.
// `slots` holds a src per filled slot; empty slots are drawn dashed.
export function Tray({
  slots,
  total,
  onMove,
  onRemove,
}: {
  slots: { id: number; src: string }[]
  total: number
  onMove: (i: number, dir: -1 | 1) => void
  onRemove: (id: number) => void
}) {
  const { t } = useTranslation()
  return (
    <ul className="grid grid-cols-4 gap-2">
      {Array.from({ length: total }, (_, i) => {
        const slot = slots[i]
        if (!slot) {
          return <li key={`empty-${i}`} className="aspect-[3/2] rounded-lg border-2 border-dashed border-ink/20" />
        }
        return (
          <li key={slot.id} className="relative">
            <FitImage src={slot.src} className="aspect-[3/2] w-full rounded-lg" />
            <Badge className="top-0.5 left-0.5 rounded-full bg-berry px-1.5 text-[10px] font-bold text-white">{i + 1}</Badge>
            <IconButton variant="scrim" onClick={() => onRemove(slot.id)} aria-label={t('common.remove')} className="absolute top-0.5 right-0.5 p-0.5">
              <Xmark width={12} height={12} strokeWidth={3} />
            </IconButton>
            <div className="absolute inset-x-0 bottom-0 flex justify-between">
              <button onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={t('library.move_earlier')} className="rounded-tr-md bg-black/50 p-0.5 text-white disabled:opacity-30">
                <NavArrowLeft width={12} height={12} strokeWidth={3} />
              </button>
              <button onClick={() => onMove(i, 1)} disabled={i === slots.length - 1} aria-label={t('library.move_later')} className="rounded-tl-md bg-black/50 p-0.5 text-white disabled:opacity-30">
                <NavArrowRight width={12} height={12} strokeWidth={3} />
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
