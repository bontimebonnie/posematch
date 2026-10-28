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
          return <li key={`empty-${i}`} className="aspect-[3/2] rounded-card border-2 border-dashed border-line-strong" />
        }
        return (
          <li key={slot.id} className="relative overflow-hidden rounded-card ring-1 ring-line">
            <FitImage src={slot.src} className="aspect-[3/2] w-full" />
            <Badge className="top-1 left-1 size-icon-sm">{i + 1}</Badge>
            <IconButton variant="scrim" size="sm" onClick={() => onRemove(slot.id)} aria-label={t('common.remove')} className="absolute top-1 right-1">
              <Xmark width={16} height={16} strokeWidth={3} />
            </IconButton>
            <div className="absolute inset-x-1 bottom-1 flex justify-between">
              <IconButton variant="scrim" size="sm" onClick={() => onMove(i, -1)} disabled={i === 0} aria-label={t('library.move_earlier')}>
                <NavArrowLeft width={16} height={16} strokeWidth={3} />
              </IconButton>
              <IconButton variant="scrim" size="sm" onClick={() => onMove(i, 1)} disabled={i === slots.length - 1} aria-label={t('library.move_later')}>
                <NavArrowRight width={16} height={16} strokeWidth={3} />
              </IconButton>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
