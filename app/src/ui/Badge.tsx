import type { ReactNode } from 'react'

type Variant = 'accent' | 'outline' | 'scrim'

// A tiny label pinned to a corner of an image: order number, tick, name.
const variants: Record<Variant, string> = {
  accent: 'bg-accent text-on-accent',
  outline: 'bg-surface-raised text-fg-subtle ring-1 ring-line-strong',
  scrim: 'bg-scrim text-on-dark',
}

export function Badge({ variant = 'accent', className = '', children }: { variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <span className={`pointer-events-none absolute inline-flex items-center justify-center rounded-pill text-caption font-bold ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}
