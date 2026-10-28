import type { ReactNode } from 'react'

// What a list shows when it has nothing in it: what this is + how to start.
export function EmptyState({ icon, title, body, action }: { icon?: ReactNode; title: ReactNode; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card bg-surface-raised p-8 text-center ring-1 ring-line">
      {icon && <div className="mb-2 flex size-icon-lg items-center justify-center text-fg-subtle">{icon}</div>}
      <h2 className="text-title">{title}</h2>
      <p className="text-body text-fg-muted">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
