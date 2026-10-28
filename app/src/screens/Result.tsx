import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { canCopyImage, copyImage } from '../clipboard'
import { composeStrip, type StripOutput } from '../strip'
import { Button, Header, Toast } from '../ui'

export default function Result({
  cartoons,
  photos,
  onRetake,
  onHome,
}: {
  cartoons: Blob[]
  photos: Blob[]
  onRetake: () => void
  onHome: () => void
}) {
  const { t } = useTranslation()
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
    if (navigator.canShare?.({ files: [file] })) {
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

  return (
    <div className="flex h-full flex-col">
      <Header title={t('result.title')} onBack={onHome} />
      <div className="flex flex-1 items-start justify-center overflow-y-auto px-4">
        {strip ? (
          <img src={strip.url} className="max-h-full w-auto max-w-full rounded-card ring-1 ring-line" alt={t('result.alt')} />
        ) : (
          <p className="pt-12 text-body text-fg-muted">{t('result.composing')}</p>
        )}
      </div>
      <div className="relative px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {toast && (
          <Toast className="absolute -top-12 left-1/2 -translate-x-1/2">{toast}</Toast>
        )}
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
    </div>
  )
}
