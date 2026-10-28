// The seconds left before the shutter fires, over the live preview.
export function Countdown({ seconds }: { seconds: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-8xl font-black text-white" aria-live="assertive">
      {seconds}
    </div>
  )
}
