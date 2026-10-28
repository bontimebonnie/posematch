import type { ReactNode } from 'react'

// What a list shows when it has nothing in it: what this is + how to start.
export function EmptyState({ title, body }: { title: ReactNode; body: ReactNode }) {
  return (
    <p className="rounded-2xl bg-white p-6 text-center text-sm text-ink/50 ring-1 ring-ink/10">
      {title}
      <br />
      {body}
    </p>
  )
}
