import { ArrowLeft } from 'iconoir-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { IconButton } from './IconButton'

export function Header({ title, onBack, right }: { title: string; onBack?: () => void; right?: ReactNode }) {
  const { t } = useTranslation()
  return (
    <header className="flex items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
      {onBack && (
        <IconButton onClick={onBack} className="-ml-2" aria-label={t('common.back')}>
          <ArrowLeft width={24} height={24} />
        </IconButton>
      )}
      <h1 className="flex-1 text-lg font-bold">{title}</h1>
      {right}
    </header>
  )
}
