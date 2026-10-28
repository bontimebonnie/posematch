import type { ReactNode } from 'react'

// A small filter pill; `selected` is the active filter.
export function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 transition-colors ${
        selected ? 'bg-ink text-white ring-ink' : 'bg-white text-ink/70 ring-ink/15'
      }`}
    >
      {children}
    </button>
  )
}
