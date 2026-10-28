import type { CSSProperties } from 'react'

// An image shown fully (object-fit: contain) with the leftover area filled by
// a blurred, darkened copy of itself. Same look as drawFit() in image.ts.
export function FitImage({
  src,
  alt = '',
  className = '',
  style,
}: {
  src: string
  alt?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <div className={`relative overflow-hidden bg-ink/10 ${className}`} style={style}>
      <img src={src} aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover blur-md brightness-90" />
      <img src={src} alt={alt} className="relative h-full w-full object-contain" />
    </div>
  )
}
