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
      <span className="mb-1 block text-sm text-ink/60">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        list={suggestions?.id}
        placeholder={placeholder}
        className="w-full rounded-xl bg-white px-4 py-3 ring-1 ring-ink/15 outline-none focus:ring-berry"
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
