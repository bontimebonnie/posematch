import type { ReactNode } from 'react'

// Short confirmation or failure message; the caller decides where it sits.
export function Toast({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div role="status" className={`flex min-h-touch items-center justify-center rounded-pill bg-fg px-4 py-2 text-center text-label text-on-dark ${className}`}>
      {children}
    </div>
  )
}
