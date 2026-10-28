import { Xmark } from 'iconoir-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from './IconButton'

// A panel that rises from the bottom over a dimmed page. Tapping the dim
// area or the close button dismisses it.
export function Sheet({ title, onClose, children }: { title: ReactNode; onClose: () => void; children: ReactNode }) {
  const { t } = useTranslation()
  return (
    <div className="fixed inset-0 z-10 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        className="w-full max-w-xl space-y-4 rounded-t-3xl bg-cream p-4 pb-[max(1rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-bold">{title}</h2>
          <IconButton onClick={onClose} aria-label={t('common.close')} className="p-1">
            <Xmark width={20} height={20} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  )
}
