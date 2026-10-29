import { Language as LanguageIcon } from 'iconoir-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Curtain } from '../booth/Curtain'
import { Doorway } from '../booth/Doorway'
import { LockerDoor, Polaroids } from '../booth/LockerDoor'
import { useCurtainDrag } from '../booth/useCurtainDrag'
import { setLanguage, type Language } from '../settings'
import { Button, Sheet } from '../ui'
import '../booth/booth.css'

// The front door: two locker doors and a curtained doorway
// (docs/design/booth-landing.md §2). Drag the curtain left past half and it
// folds to the side; the library then fades in. `unfold` is set when coming
// back from the library so the curtain re-closes on screen.
export default function Booth({ unfold = false, onEnter }: { unfold?: boolean; onEnter: () => void }) {
  const { t, i18n } = useTranslation()
  const [howto, setHowto] = useState(false)
  const curtain = useCurtainDrag({ initiallyOpen: unfold, onOpen: onEnter })
  const switchLanguage = () => {
    const next: Language = i18n.language === 'en' ? 'zh-TW' : 'en'
    setLanguage(next)
    i18n.changeLanguage(next)
  }
  return (
    <div className="booth" data-testid="booth">
      {/* language lives on the front door: switching inside would be too late */}
      <Button variant="secondary" size="md" onClick={switchLanguage} aria-label={t('common.language')} className="absolute top-4 right-4 z-10 gap-1">
        <LanguageIcon width={16} height={16} />
        {i18n.language === 'en' ? '中' : 'EN'}
      </Button>
      <LockerDoor number="No. 04">
        <div className="booth-mirror" aria-hidden />
        <Polaroids />
      </LockerDoor>

      <Doorway>
        <Curtain {...curtain.props} role="button" aria-label={t('booth.hint')} tabIndex={0} />
      </Doorway>

      <LockerDoor number="No. 05">
        <button type="button" className="booth-note" onClick={() => setHowto(true)}>
          <span className="booth-hand">{t('booth.note')}</span>
        </button>
      </LockerDoor>

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
