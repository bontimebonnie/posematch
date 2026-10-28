import type { ReactNode } from 'react'
import { focusRing } from './Button'

export type Tint = 1 | 2 | 3 | 4

const tints: Record<Tint, string> = {
  1: 'bg-tint-1',
  2: 'bg-tint-2',
  3: 'bg-tint-3',
  4: 'bg-tint-4',
}

// A small filter pill. When selected it fills with a pastel tint (or cocoa
// when no tint is given); unselected chips are white with a thin line.
export function Chip({
  selected,
  tint,
  disabled,
  onClick,
  children,
}: {
  selected: boolean
  tint?: Tint
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={`inline-flex h-chip shrink-0 items-center gap-1 rounded-pill px-4 text-label transition-colors duration-fast disabled:opacity-40 ${focusRing} ${
        selected ? (tint ? `${tints[tint]} text-fg` : 'bg-fg text-on-dark') : 'bg-surface-raised text-fg-muted ring-1 ring-line active:bg-surface'
      }`}
    >
      {children}
    </button>
  )
}
