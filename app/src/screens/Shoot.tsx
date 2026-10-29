import { ArrowRight, Check, Flip, Timer } from 'iconoir-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SHOTS_PER_SET } from '../db'
import { canvasToBlob, CELL_RATIO, drawCover } from '../image'
import { useTranslation } from 'react-i18next'
import { cameraErrorKey } from '../camera'
import { getMirror, setMirror } from '../settings'
import { useObjectUrls } from '../useObjectUrls'
import { Button, Chip, Countdown, FitImage, Header } from '../ui'

type Facing = 'user' | 'environment'
const COUNTDOWN_SECONDS = 3

export default function Shoot({
  cartoons,
  onBack,
  onDone,
}: {
  cartoons: Blob[]
  onBack: () => void
  onDone: (photos: Blob[]) => void
}) {
  const { t } = useTranslation()
  const cartoonUrls = useObjectUrls(cartoons)
  const video = useRef<HTMLVideoElement>(null)
  const [facing, setFacingState] = useState<Facing>('user')
  const [mirrorPref, setMirrorPref] = useState(getMirror)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraAttempt, setCameraAttempt] = useState(0)
  const retryCamera = () => {
    setCameraError(null)
    setCameraAttempt((n) => n + 1)
  }
  const setFacing = (f: Facing) => {
    setCameraError(null)
    setFacingState(f)
  }
  const [photos, setPhotos] = useState<Blob[]>([])
  const [preview, setPreview] = useState<Blob | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const previewBlobs = useMemo(() => (preview ? [preview] : []), [preview])
  const previewUrls = useObjectUrls(previewBlobs)
  // The frame on screen is exactly the cell that prints: the reference and
  // the viewfinder are both 3:2, no band, no crop (Bonnie's rule, Task 44).

  const index = photos.length
  // Mirroring only makes sense for the selfie camera; the preference is
  // applied to both the live preview and the captured frame.
  const mirror = facing === 'user' && mirrorPref
  const toggleMirror = () => {
    const next = !mirrorPref
    setMirrorPref(next)
    setMirror(next)
  }

  // Start / restart the camera whenever the facing mode changes or the user retries.
  useEffect(() => {
    let stream: MediaStream | undefined
    let cancelled = false
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (video.current) video.current.srcObject = s
      })
      .catch((err: unknown) => {
        const { key, message } = cameraErrorKey(err)
        setCameraError(t(`camera.${key}`, { message }))
      })
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facing, cameraAttempt]) // eslint-disable-line react-hooks/exhaustive-deps

  const capture = useCallback(async () => {
    const v = video.current
    if (!v || !v.videoWidth) return
    // Crop the live frame to the same 3:2 cell the strip uses, so what the
    // user framed is exactly what ends up in the result.
    const w = Math.min(v.videoWidth, 1600)
    const h = Math.round(w / CELL_RATIO)
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    drawCover(ctx, v, 0, 0, w, h, mirror)
    setPreview(await canvasToBlob(canvas))
  }, [mirror])

  const startCountdown = () => setCountdown(COUNTDOWN_SECONDS)
  useEffect(() => {
    if (countdown === null) return
    const t = setTimeout(() => {
      if (countdown > 1) {
        setCountdown(countdown - 1)
      } else {
        setCountdown(null)
        void capture()
      }
    }, 1000)
    return () => clearTimeout(t)
  }, [countdown, capture])

  const keep = () => {
    if (!preview) return
    const next = [...photos, preview]
    setPreview(null)
    if (next.length === SHOTS_PER_SET) onDone(next)
    else setPhotos(next)
  }

  return (
    <div className="flex h-full flex-col">
      <Header
        title={t('shoot.title', { index: index + 1, total: SHOTS_PER_SET })}
        onBack={onBack}
        right={
          <div className="flex items-center gap-2">
            <Chip selected={mirror} tint={1} disabled={facing !== 'user'} onClick={toggleMirror}>
              {mirror ? t('shoot.mirror_on') : t('shoot.mirror_off')}
            </Chip>
            <Button variant="secondary" size="md" onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')} className="gap-1">
              <Flip width={16} height={16} />
              {t('shoot.flip')}
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-2 overflow-hidden px-4">
        {/* Reference cartoon on top */}
        <FitImage
          src={cartoonUrls[index]}
          alt={t('shoot.reference_alt')}
          className="w-full rounded-card ring-1 ring-line"
          style={{ aspectRatio: CELL_RATIO }}
        />

        {/* Camera (or the captured preview) below */}
        <div className="relative overflow-hidden rounded-card bg-dark" style={{ aspectRatio: CELL_RATIO }}>
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${mirror ? '-scale-x-100' : ''} ${preview ? 'invisible' : ''}`}
          />
          {preview && <img src={previewUrls[0]} className="absolute inset-0 h-full w-full object-contain" alt="" />}
          {countdown !== null && <Countdown seconds={countdown} />}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-body text-on-dark">
              <p>{cameraError}</p>
              <Button variant="secondary" onClick={retryCamera}>
                {t('shoot.retry')}
              </Button>
            </div>
          )}
        </div>

        {/* Thumbnails of what's already kept */}
        <div className="flex gap-2">
          {Array.from({ length: SHOTS_PER_SET }, (_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-pill ${i < index ? 'bg-accent-pressed' : i === index ? 'bg-fg' : 'bg-line'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 px-4 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {preview ? (
          <>
            <Button variant="secondary" onClick={() => setPreview(null)} className="flex-1">
              {t('shoot.retake')}
            </Button>
            <Button onClick={keep} className="flex-1">
              {index + 1 === SHOTS_PER_SET ? t('common.done') : t('common.next')}
              {index + 1 === SHOTS_PER_SET ? <Check width={20} height={20} strokeWidth={2.2} /> : <ArrowRight width={20} height={20} strokeWidth={2.2} />}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={capture} disabled={!!cameraError || countdown !== null} className="flex-1">
              {t('shoot.capture')}
            </Button>
            <Button onClick={startCountdown} disabled={!!cameraError || countdown !== null} className="flex-1">
              <Timer width={20} height={20} strokeWidth={2.2} />
              {t('shoot.countdown', { seconds: COUNTDOWN_SECONDS })}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
