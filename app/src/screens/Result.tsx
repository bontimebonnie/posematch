import { Copy, Star } from 'iconoir-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { canCopyImage, copyImage } from '../clipboard'
import { composeDecorated, NO_DECOR, type DecorState } from '../decor/compose'
import { saveJpeg } from '../save'
import type { StripOutput } from '../strip'
import { BoothChrome, TrayStrip } from '../booth/BoothChrome'
import { useWide } from '../booth/useWide'
import { useObjectUrls } from '../useObjectUrls'
import { Button, Header, IconButton, Toast } from '../ui'

export default function Result({
  cartoons,
  photos,
  decor = NO_DECOR,
  booth = false,
  onRetake,
  onDecorate,
  onHome,
}: {
  cartoons: Blob[]
  photos: Blob[]
  decor?: DecorState
  booth?: boolean // render inside the booth chrome on wide screens
  onRetake: () => void
  onDecorate?: () => void // absent when decor is off
  onHome: () => void
}) {
  const { t } = useTranslation()
  const wide = useWide()
  const cartoonUrls = useObjectUrls(cartoons)
  const photoUrls = useObjectUrls(photos)
  const [strip, setStrip] = useState<(StripOutput & { url: string }) | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const copySupported = canCopyImage()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    let url: string | undefined
    let cancelled = false
    composeDecorated(cartoons, photos, decor).then((out) => {
      if (cancelled) return
      url = URL.createObjectURL(out.jpeg)
      setStrip({ ...out, url })
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [cartoons, photos, decor])

  const copy = async () => {
    if (!strip) return
    try {
      await copyImage(strip.png)
      setToast(t('result.copied'))
    } catch {
      setToast(t('result.copy_failed'))
    }
  }

  const save = () => strip && saveJpeg(strip.jpeg, strip.url)

  // Copy lives in the header so the bar below has room for Retake · Decorate · Save.
  const header = (
    <Header
      title={t('result.title')}
      onBack={onHome}
      right={
        copySupported ? (
          <IconButton onClick={copy} disabled={!strip} aria-label={t('result.copy')} className="-mr-2">
            <Copy width={24} height={24} />
          </IconButton>
        ) : null
      }
    />
  )
  const picture = (
    <div className="flex min-h-0 flex-1 items-start justify-center overflow-y-auto px-4">
      {strip ? (
        <img src={strip.url} className="reveal max-h-full w-auto max-w-full rounded-card ring-1 ring-line" alt={t('result.alt')} />
      ) : (
        <p className="pt-12 text-body text-fg-muted">{t('result.composing')}</p>
      )}
    </div>
  )
  const bottom = (
    <div className="relative px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
      {toast && <Toast className="absolute -top-12 left-1/2 -translate-x-1/2">{toast}</Toast>}
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onRetake} className="flex-1">
          {t('result.retake')}
        </Button>
        {onDecorate && (
          <Button variant="secondary" onClick={onDecorate} disabled={!strip} className="flex-1">
            <Star width={20} height={20} strokeWidth={2.2} />
            {t('result.decorate')}
          </Button>
        )}
        <Button onClick={save} disabled={!strip} className="flex-1">
          {t('result.save')}
        </Button>
      </div>
    </div>
  )

  if (booth && wide) {
    const rows = cartoonUrls.map((pose, i) => ({ pose, photo: photoUrls[i] }))
    return (
      <BoothChrome
        lit
        glass={
          <>
            {header}
            {picture}
          </>
        }
        actions={bottom}
        tray={<TrayStrip rows={rows} total={rows.length} eject={!!strip} />}
      />
    )
  }
  return (
    <div className="flex h-full flex-col">
      {header}
      {picture}
      {bottom}
    </div>
  )
}
