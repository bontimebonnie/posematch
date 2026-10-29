import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LockerDoor, Polaroids } from '../booth/LockerDoor'
import { Button, Sheet } from '../ui'
import '../booth/booth.css'

// The front door: two locker doors and a curtained doorway
// (docs/design/booth-landing.md §2). Doorway + curtain come in Task 40 and
// the drag in Task 41; until then a temporary button enters.
export default function Booth({ onEnter }: { onEnter: () => void }) {
  const { t } = useTranslation()
  const [howto, setHowto] = useState(false)
  return (
    <div className="booth" data-testid="booth">
      <LockerDoor number="No. 04">
        <div className="booth-mirror" aria-hidden />
        <Polaroids />
      </LockerDoor>

      <div className="booth-doorway">
        <Button onClick={onEnter} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          {t('booth.enter')}
        </Button>
      </div>

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
