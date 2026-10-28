import type { ReactNode } from 'react'
import { focusRing } from './Button'

// Two or more mutually exclusive options, one always selected.
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: ReactNode }[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div className="grid gap-1 rounded-pill bg-surface-raised p-1 ring-1 ring-line" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`h-touch rounded-pill text-label transition-colors duration-fast ${focusRing} ${
            value === o.value ? 'bg-accent text-on-accent' : 'text-fg-muted active:bg-surface'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
