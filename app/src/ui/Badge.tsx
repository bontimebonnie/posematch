import type { ReactNode } from 'react'

// A tiny label pinned to a corner of an image: order number, tick, name.
export function Badge({ className = '', children }: { className?: string; children: ReactNode }) {
  return <span className={`pointer-events-none absolute ${className}`}>{children}</span>
}
