import type { ButtonHTMLAttributes } from 'react'
import { focusRing } from './Button'

type Variant = 'ghost' | 'scrim'
type Size = 'md' | 'sm'

// A round button holding only an icon; `aria-label` is required because
// there is no visible text. `scrim` sits on top of photos. `sm` (32px) is
// only for controls pinned to small thumbnails, where 44px would cover the
// picture.
const variants: Record<Variant, string> = {
  ghost: 'text-fg active:bg-line',
  scrim: 'bg-scrim text-on-dark',
}

const sizes: Record<Size, string> = {
  md: 'size-touch',
  sm: 'size-icon-lg',
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; 'aria-label': string }) {
  return (
    <button
      className={`inline-flex shrink-0 items-center justify-center rounded-pill transition-colors duration-fast disabled:opacity-40 ${focusRing} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
