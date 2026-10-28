import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { SHOTS_PER_SET } from '../db'
import { canvasToBlob, CELL_RATIO, drawCover } from '../image'
import { getMirror, setMirror } from '../settings'
import { useObjectUrls } from '../useObjectUrls'
import { Button, Header } from '../ui'

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
  const cartoonUrls = useObjectUrls(cartoons)
  const video = useRef<HTMLVideoElement>(null)
  const [facing, setFacingState] = useState<Facing>('user')
  const [mirrorPref, setMirrorPref] = useState(getMirror)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const setFacing = (f: Facing) => {
    setCameraError(null)
    setFacingState(f)
  }
  const [photos, setPhotos] = useState<Blob[]>([])
  const [preview, setPreview] = useState<Blob | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)
  const previewBlobs = useMemo(() => (preview ? [preview] : []), [preview])
  const previewUrls = useObjectUrls(previewBlobs)

  const index = photos.length
  // Mirroring only makes sense for the selfie camera; the preference is
  // applied to both the live preview and the captured frame.
  const mirror = facing === 'user' && mirrorPref
  const toggleMirror = () => {
    const next = !mirrorPref
    setMirrorPref(next)
    setMirror(next)
  }

  // Start / restart the camera whenever the facing mode changes.
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
      .catch((err: unknown) => setCameraError(err instanceof Error ? err.message : String(err)))
    return () => {
      cancelled = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [facing])

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
        title={`第 ${index + 1} / ${SHOTS_PER_SET} 張`}
        onBack={onBack}
        right={
          <div className="flex gap-2">
            <button
              onClick={toggleMirror}
              disabled={facing !== 'user'}
              aria-pressed={mirror}
              className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-ink/15 disabled:opacity-40 ${
                mirror ? 'bg-ink text-white' : 'bg-white'
              }`}
            >
              鏡像 {mirror ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
              className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-ink/15"
            >
              🔄 轉鏡頭
            </button>
          </div>
        }
      />

      <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4">
        {/* Reference cartoon on top */}
        <div className="overflow-hidden rounded-2xl bg-black ring-1 ring-ink/10">
          <img src={cartoonUrls[index]} className="aspect-[3/2] w-full object-cover" alt="參考卡通圖" />
        </div>

        {/* Camera (or the captured preview) below */}
        <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-black">
          <video
            ref={video}
            autoPlay
            playsInline
            muted
            className={`h-full w-full object-cover ${mirror ? '-scale-x-100' : ''} ${preview ? 'invisible' : ''}`}
          />
          {preview && <img src={previewUrls[0]} className="absolute inset-0 h-full w-full object-cover" alt="" />}
          {countdown !== null && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-8xl font-black text-white">
              {countdown}
            </div>
          )}
          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-sm text-white">
              開唔到 camera：{cameraError}
            </div>
          )}
        </div>

        {/* Thumbnails of what's already kept */}
        <div className="flex gap-2">
          {Array.from({ length: SHOTS_PER_SET }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-berry' : i === index ? 'bg-ink' : 'bg-ink/15'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {preview ? (
          <>
            <Button variant="secondary" onClick={() => setPreview(null)} className="flex-1">
              重影
            </Button>
            <Button onClick={keep} className="flex-1">
              {index + 1 === SHOTS_PER_SET ? '完成 ✓' : '下一張 →'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={capture} disabled={!!cameraError || countdown !== null} className="flex-1">
              即影
            </Button>
            <Button onClick={startCountdown} disabled={!!cameraError || countdown !== null} className="flex-1">
              ⏱ {COUNTDOWN_SECONDS} 秒倒數
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
