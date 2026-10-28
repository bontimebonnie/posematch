// The seconds left before the shutter fires, over the live preview.
export function Countdown({ seconds }: { seconds: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-scrim-light text-countdown text-on-dark" aria-live="assertive">
      {seconds}
    </div>
  )
}
