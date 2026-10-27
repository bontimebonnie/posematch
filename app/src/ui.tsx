import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-berry text-white active:bg-berry-dark disabled:opacity-40',
  secondary: 'bg-white text-ink ring-1 ring-ink/15 active:bg-ink/5 disabled:opacity-40',
  ghost: 'text-ink/70 active:bg-ink/5',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-5 py-3 font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  )
}

export function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="flex items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      {onBack && (
        <button onClick={onBack} className="-ml-2 rounded-full px-3 py-2 text-lg" aria-label="返回">
          ←
        </button>
      )}
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {right}
    </header>
  )
}

export function PersonToggle({ value, onChange }: { value: 1 | 2; onChange: (v: 1 | 2) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 ring-1 ring-ink/10">
      {([1, 2] as const).map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`rounded-full py-2.5 font-semibold transition-colors ${
            value === n ? 'bg-ink text-white' : 'text-ink/60'
          }`}
        >
          {n} 個人
        </button>
      ))}
    </div>
  )
}
