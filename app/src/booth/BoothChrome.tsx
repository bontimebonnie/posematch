import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import './booth.css'

export interface TrayRow {
  pose?: string // picked pose (object URL)
  photo?: string // the photo taken for it
}

// The strip as it will print, in the counter's slanted tray: 4 rows, left
// the picked pose (with its number), right the photo slot (dotted until a
// photo is taken). Rows with nothing picked stay dashed and faded.
export function TrayStrip({ rows, total, eject = false }: { rows: TrayRow[]; total: number; eject?: boolean }) {
  return (
    <div className={`booth-strip ${eject ? 'booth-strip-eject' : ''}`}>
      {Array.from({ length: total }, (_, i) => {
        const row = rows[i]
        return (
          <div key={i} className="booth-row">
            <div className={`booth-cell ${row?.pose ? 'booth-cell-full' : ''}`} data-n={i + 1}>
              {row?.pose && <img src={row.pose} alt="" />}
            </div>
            <div className={`booth-cell booth-cell-photo ${row?.pose ? 'booth-cell-full' : ''} ${row?.photo ? 'booth-cell-taken' : ''}`}>
              {row?.photo && <img src={row.photo} alt="" />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// The booth interior shell (booth-landing.md §3): cream metal back wall,
// the screen's content in the glass of a metal bezel, a tube light each
// side (`lit` makes them glow), then the counter with `actions` on the left
// and the slanted tray on the right. Every screen inside the booth
// (Library, Crop, Shoot, Result, Decorate) hands in its glass, actions and
// tray rows; the chrome never changes between them.
export function BoothChrome({ glass, actions, tray, lit = false }: { glass: ReactNode; actions: ReactNode; tray: ReactNode; lit?: boolean }) {
  const { t } = useTranslation()
  return (
    <div className={`booth booth-inside ${lit ? 'booth-lit' : ''}`} data-testid="booth-interior">
      <div className="booth-wall">
        <div className="booth-tube" aria-hidden />
        <div className="booth-bezel">
          <div className="booth-glass">{glass}</div>
        </div>
        <div className="booth-tube" aria-hidden />
      </div>
      <div className="booth-ledge" aria-hidden />
      <div className="booth-cfront">
        <div className="booth-actions">{actions}</div>
        <div className="booth-tray" aria-hidden>
          <span className="booth-lbl booth-hand">{t('booth.tray_label')}</span>
          <div className="booth-slot" />
          <div className="booth-out">{tray}</div>
        </div>
      </div>
      <div className="booth-grain" aria-hidden />
    </div>
  )
}
