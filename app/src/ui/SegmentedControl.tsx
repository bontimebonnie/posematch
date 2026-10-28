import type { ReactNode } from 'react'

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
    <div className="grid gap-2 rounded-full bg-white p-1 ring-1 ring-ink/10" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-full py-2.5 font-semibold transition-colors ${value === o.value ? 'bg-ink text-white' : 'text-ink/60'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
