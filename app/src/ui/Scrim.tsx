// Dims the top and bottom bands of the viewfinder that the 3:2 capture
// will not keep. `keptFraction` is the share of the height that stays.
export function Scrim({ keptFraction }: { keptFraction: number }) {
  if (keptFraction >= 1) return null
  const band = `${((1 - keptFraction) / 2) * 100}%`
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 bg-black/40" style={{ height: band }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-black/40" style={{ height: band }} />
    </>
  )
}
