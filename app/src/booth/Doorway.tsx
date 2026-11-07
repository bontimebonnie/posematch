import type { ComponentProps } from 'react'
import { useTranslation } from 'react-i18next'

// The dark doorway between the lockers: metal inner frame, plank floor in
// the open bottom quarter, the hint, rod + rings, and whatever hangs in it
// (the Curtain). The drag handlers and `inert` are spread onto it, so a swipe
// can start anywhere in the doorway.
export function Doorway({ children, ...rest }: ComponentProps<'div'>) {
  const { t } = useTranslation()
  return (
    <div className="booth-doorway" {...rest}>
      <div className="booth-peek">
        <div className="booth-hint booth-hand">
          <svg viewBox="0 0 48 24" aria-hidden>
            <path d="M40 12 H6 M14 4 L6 12 L14 20" />
          </svg>
          {t('booth.hint')}
        </div>
        <div className="booth-floor" />
      </div>
      <div className="booth-rod" />
      <div className="booth-rings" />
      {children}
    </div>
  )
}
