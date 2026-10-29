import { useTranslation } from 'react-i18next'
import { Button } from '../ui'
import '../booth/booth.css'

// The front door: two locker doors and a curtained doorway. Task 38 is the
// shell only; doors (Task 39), doorway + curtain (Task 40) and the drag
// (Task 41) fill it in. The temporary button goes once the curtain drags.
export default function Booth({ onEnter }: { onEnter: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="booth" data-testid="booth">
      <div className="booth-locker" />
      <div className="booth-doorway">
        <Button onClick={onEnter} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          {t('booth.enter')}
        </Button>
      </div>
      <div className="booth-locker" />
    </div>
  )
}
