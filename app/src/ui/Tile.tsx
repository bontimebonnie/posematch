import { Check } from 'iconoir-react'
import type { ReactNode } from 'react'
import { Badge } from './Badge'
import { focusRing } from './Button'
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
      <button
        onClick={onClick}
        aria-pressed={selectable ? isSelected : undefined}
        className={`block w-full overflow-hidden rounded-card transition-shadow duration-fast ${focusRing} ${isSelected ? 'ring-2 ring-accent-pressed' : 'ring-1 ring-line'}`}
      >
        <FitImage src={src} className="aspect-[3/2] w-full" />
      </button>
      {selectable && (
        <Badge variant={isSelected ? 'accent' : 'outline'} className="top-1 right-1 size-icon">
          {isSelected ? (showOrder ? order + 1 : <Check width={14} height={14} strokeWidth={3} />) : ''}
        </Badge>
      )}
      {!selectable && label && (
        <Badge variant="scrim" className="bottom-1 left-1 max-w-full truncate px-2 py-1 font-semibold">
          {label}
        </Badge>
      )}
      {children}
    </li>
  )
}
