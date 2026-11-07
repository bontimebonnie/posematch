import { Language as LanguageIcon, NavArrowLeft, NavArrowRight } from 'iconoir-react'
import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Curtain } from '../booth/Curtain'
import { Doorway } from '../booth/Doorway'
import { LockerDoor, Polaroids } from '../booth/LockerDoor'
import { useCurtainDrag } from '../booth/useCurtainDrag'
import { useWide } from '../booth/useWide'
import { setLanguage, type Language } from '../settings'
import { Button, Sheet } from '../ui'
import '../booth/booth.css'

// The front door: two locker doors and a curtained doorway
// (docs/design/booth-landing.md §2). Drag the curtain left past half and it
// folds to the side; the library then fades in. `unfold` is set when coming
// back from the library so the curtain re-closes on screen.
//
// Phones: the three parts sit side by side and the view slides between them.
// The curtain owns every swipe in the doorway, so only the pills and locker
// edges move to a locker; on a locker a swipe towards the doorway comes back.
const SWIPE_BACK = 48 // px

type View = 'doorway' | 'no4' | 'no5'

export default function Booth({ unfold = false, onEnter }: { unfold?: boolean; onEnter: () => void }) {
  const { t, i18n } = useTranslation()
  const [howto, setHowto] = useState(false)
  const curtain = useCurtainDrag({ initiallyOpen: unfold, onOpen: onEnter })
  const wide = useWide()
  const [view, setView] = useState<View>('doorway')
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const shown = (v: View) => wide || view === v
  const onSwipeStart = (e: ReactPointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY }
  }
  const onSwipeEnd = (e: ReactPointerEvent) => {
    const start = swipe.current
    swipe.current = null
    if (!start || view === 'doorway') return
    const dx = e.clientX - start.x
    if (Math.abs(dx) < SWIPE_BACK || Math.abs(dx) < Math.abs(e.clientY - start.y)) return
    if ((view === 'no5' && dx > 0) || (view === 'no4' && dx < 0)) setView('doorway')
  }
  const switchLanguage = () => {
    const next: Language = i18n.language === 'en' ? 'zh-TW' : 'en'
    setLanguage(next)
    i18n.changeLanguage(next)
  }
  return (
    <div className="booth" data-testid="booth" data-view={view} onPointerDown={onSwipeStart} onPointerUp={onSwipeEnd}>
      {/* language lives on the front door: switching inside would be too late */}
      <Button variant="secondary" size="md" onClick={switchLanguage} aria-label={t('common.language')} className="absolute top-4 right-4 z-10 gap-1">
        <LanguageIcon width={16} height={16} />
        {i18n.language === 'en' ? '中' : 'EN'}
      </Button>
      <LockerDoor number="No. 04" inert={!shown('no4')}>
        <div className="booth-mirror" aria-hidden />
        <Polaroids />
      </LockerDoor>

      <Doorway {...curtain.surface} inert={!shown('doorway')}>
        <Curtain {...curtain.props} role="button" aria-label={t('booth.hint')} tabIndex={0} />
      </Doorway>

      <LockerDoor number="No. 05" inert={!shown('no5')}>
        <button type="button" className="booth-note" onClick={() => setHowto(true)}>
          <span className="booth-hand">{t('booth.note')}</span>
        </button>
      </LockerDoor>

      {!wide && (
        <>
          {/* the strip of the next part showing at each side is a tap target too; the pills are the labelled route */}
          {view !== 'no5' && (
            <button type="button" className="booth-edge booth-edge-right" aria-hidden tabIndex={-1} onClick={() => setView(view === 'no4' ? 'doorway' : 'no5')}>
              {view === 'doorway' && <span className="booth-corner booth-corner-note" />}
            </button>
          )}
          {view !== 'no4' && (
            <button type="button" className="booth-edge booth-edge-left" aria-hidden tabIndex={-1} onClick={() => setView(view === 'no5' ? 'doorway' : 'no4')}>
              {view === 'doorway' && <span className="booth-corner booth-corner-pola" />}
            </button>
          )}
          {view !== 'no4' && (
            <button type="button" className="booth-pill booth-pill-left booth-hand" onClick={() => setView(view === 'no5' ? 'doorway' : 'no4')}>
              <NavArrowLeft width={20} height={20} aria-hidden />
              {view === 'no5' ? t('booth.nav_curtain') : 'No. 04'}
            </button>
          )}
          {view !== 'no5' && (
            <button type="button" className="booth-pill booth-pill-right booth-hand" onClick={() => setView(view === 'no4' ? 'doorway' : 'no5')}>
              {view === 'no4' ? t('booth.nav_curtain') : t('booth.nav_howto')}
              <NavArrowRight width={20} height={20} aria-hidden />
            </button>
          )}
        </>
      )}

      <div className="booth-grain" aria-hidden />

      {howto && (
        <Sheet title={t('booth.howto_title')} onClose={() => setHowto(false)}>
          <ol className="list-decimal space-y-2 pl-6 text-body">
            <li>{t('booth.howto_1')}</li>
            <li>{t('booth.howto_2')}</li>
            <li>{t('booth.howto_3')}</li>
          </ol>
        </Sheet>
      )}
    </div>
  )
}
