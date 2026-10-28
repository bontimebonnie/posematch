import type { ReactNode } from 'react'

// Short confirmation or failure message; the caller decides where it sits.
export function Toast({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-full bg-ink px-4 py-2 text-center text-sm text-white ${className}`}>{children}</div>
}
