import type { ReactNode } from 'react'

// Labelled single-line input with optional autocomplete suggestions.
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  suggestions,
}: {
  label: ReactNode
  value: string
  onChange: (v: string) => void
  placeholder?: string
  suggestions?: { id: string; values: string[] }
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-label text-fg-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={suggestions?.id}
        placeholder={placeholder}
        className="h-control w-full rounded-card bg-surface-raised px-4 text-body text-fg ring-1 ring-line outline-none placeholder:text-fg-subtle focus:ring-2 focus:ring-accent-pressed"
      />
      {suggestions && (
        <datalist id={suggestions.id}>
          {suggestions.values.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
      )}
    </label>
  )
}
