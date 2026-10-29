import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { DefaultShell, type LibraryParts } from '../screens/Library'
import './booth.css'

const WIDE = '(min-width: 761px)'
const mq = () => window.matchMedia(WIDE)
const subscribe = (cb: () => void) => {
  const m = mq()
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const useWide = () => useSyncExternalStore(subscribe, () => mq().matches, () => false)

// The library seen from inside the booth (booth-landing.md §3): cream metal
// back wall, the library in the glass of a metal bezel, a tube light each
// side that glows brighter once 4 are picked, then the counter with the
// action bar on the left and the slanted print tray on the right showing
// the strip as it will print (4 rows: picked pose | photo to take).
// Below 760px it is the plain phone layout.
export function BoothInterior(parts: LibraryParts) {
  const { t } = useTranslation()
  const wide = useWide()
  if (!wide) return <DefaultShell {...parts} />
  const lit = parts.mode === 'pick' && parts.picked.length >= parts.total
  return (
    <div className={`booth booth-inside ${lit ? 'booth-lit' : ''}`} data-testid="booth-interior">
      <div className="booth-wall">
        <div className="booth-tube" aria-hidden />
        <div className="booth-bezel">
          <div className="booth-glass">
            {parts.header}
            {parts.filters}
            {parts.grid}
          </div>
        </div>
        <div className="booth-tube" aria-hidden />
      </div>
      <div className="booth-ledge" aria-hidden />
      <div className="booth-cfront">
        <div className="booth-actions">{parts.bottom}</div>
        <div className="booth-tray" aria-hidden>
          <span className="booth-lbl booth-hand">{t('booth.tray_label')}</span>
          <div className="booth-slot" />
          <div className="booth-out">
            <div className="booth-strip">
              {Array.from({ length: parts.total }, (_, i) => {
                const pick = parts.picked[i]
                return (
                  <div key={i} className="booth-row">
                    <div className={`booth-cell ${pick ? 'booth-cell-full' : ''}`} data-n={i + 1}>
                      {pick && <img src={pick.src} alt="" />}
                    </div>
                    <div className={`booth-cell booth-cell-photo ${pick ? 'booth-cell-full' : ''}`} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="booth-grain" aria-hidden />
    </div>
  )
}
