import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { canCopyImage, copyImage } from '../clipboard'
import { isMobile } from '../platform'
import { composeStrip, type StripOutput } from '../strip'
import { BoothChrome, TrayStrip } from '../booth/BoothChrome'
import { useWide } from '../booth/useWide'
import { useObjectUrls } from '../useObjectUrls'
import { Button, Header, Toast } from '../ui'

export default function Result({
  cartoons,
  photos,
  booth = false,
  onRetake,
  onHome,
}: {
  cartoons: Blob[]
  photos: Blob[]
  booth?: boolean // render inside the booth chrome on wide screens
  onRetake: () => void
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
    composeStrip(cartoons, photos).then((out) => {
      if (cancelled) return
      url = URL.createObjectURL(out.jpeg)
      setStrip({ ...out, url })
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [cartoons, photos])

  const copy = async () => {
    if (!strip) return
    try {
      await copyImage(strip.png)
      setToast(t('result.copied'))
    } catch {
      setToast(t('result.copy_failed'))
    }
  }

  const save = async () => {
    if (!strip) return
    const file = new File([strip.jpeg], `post-match-${Date.now()}.jpg`, { type: 'image/jpeg' })
    // Phones: share sheet (saves to the album). Desktop: straight download,
    // even though desktop Chrome can share files, because the OS share sheet
    // is a detour there.
    if (isMobile() && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file] })
        return
      } catch {
        // user cancelled or share failed; fall through to download
      }
    }
    const a = document.createElement('a')
    a.href = strip.url
    a.download = file.name
    a.click()
  }

  const header = <Header title={t('result.title')} onBack={onHome} />
  const picture = (
    <div className="flex flex-1 items-start justify-center overflow-y-auto px-4">
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
        <Button
          variant="secondary"
          onClick={copy}
          disabled={!strip || !copySupported}
          title={copySupported ? undefined : t('result.copy_unsupported')}
          className="flex-1"
        >
          {t('result.copy')}
        </Button>
        <Button onClick={save} disabled={!strip} className="flex-1">
          {t('result.save')}
        </Button>
      </div>
      {!copySupported && <p className="mt-2 text-center text-body text-fg-muted">{t('result.copy_unsupported')}</p>}
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
