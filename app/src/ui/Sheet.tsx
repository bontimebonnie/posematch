import { Xmark } from 'iconoir-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from './IconButton'

// A panel that rises from the bottom over a dimmed page. Tapping the dim
// area or the close button dismisses it.
export function Sheet({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-scrim" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        className="w-full max-w-xl space-y-4 rounded-t-card bg-surface p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-sheet"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex min-h-touch items-center justify-between">
          <h2 className="flex items-center gap-2 text-title">{title}</h2>
          <IconButton onClick={onClose} aria-label={t('common.close')} className="-mr-2">
            <Xmark width={24} height={24} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}
