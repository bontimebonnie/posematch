import { Check } from 'iconoir-react'
import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { FitImage } from './FitImage'

// One 3:2 picture in a grid. `order` ≥ 0 means it is selected; in pick mode
// the badge shows the shoot order, otherwise a tick. `label` is a name
// pinned to the bottom-left while browsing.
export function Tile({
  src,
  onClick,
  selectable,
  order,
  showOrder,
  label,
  children,
}: {
  src: string
  onClick: () => void
  selectable: boolean
  order: number
  showOrder: boolean
  label?: ReactNode
  children?: ReactNode
}) {
  const isSelected = order >= 0
  return (
    <li className="relative">
      <button onClick={onClick} className={`block w-full overflow-hidden rounded-xl ring-2 ${isSelected ? 'ring-berry' : 'ring-transparent'}`}>
        <FitImage src={src} className="aspect-[3/2] w-full" />
      </button>
      {selectable && (
        <Badge
          className={`top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
            isSelected ? 'bg-berry text-white' : 'bg-white/80 text-ink/40 ring-1 ring-ink/20'
          }`}
        >
          {isSelected ? (showOrder ? order + 1 : <Check width={14} height={14} strokeWidth={3} />) : ''}
        </Badge>
      )}
      {!selectable && label && (
        <Badge className="bottom-1 left-1 max-w-[90%] truncate rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white">{label}</Badge>
      )}
      {children}
    </li>
  )
}
