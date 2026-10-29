import { WarningTriangle } from 'iconoir-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './Button'
import { Sheet } from './Sheet'

// A yes/no question in a Sheet, replacing window.confirm() so it works in
// every browser (some suppress native dialogs) and matches the app's look.
// `onConfirm` is the destructive action; closing or cancelling does nothing.
export function ConfirmSheet({
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  title: ReactNode
  body?: ReactNode
  confirmLabel: ReactNode
  onConfirm: () => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <Sheet
      title={
        <>
          <WarningTriangle width={24} height={24} />
          {title}
        </>
      }
      onClose={onClose}
    >
      {body && <p className="text-body text-fg-muted">{body}</p>}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onClose} className="flex-1">
          {t('common.cancel')}
        </Button>
        <Button variant="danger" onClick={onConfirm} className="flex-1" autoFocus>
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  )
}
