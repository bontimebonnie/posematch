import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'md' | 'lg'

// One accent (primary) button per screen; everything else is secondary.
const variants: Record<Variant, string> = {
  primary: 'bg-accent text-on-accent active:bg-accent-pressed',
  secondary: 'bg-surface-raised text-fg ring-1 ring-line active:bg-surface',
  danger: 'bg-surface-raised text-danger ring-1 ring-line active:bg-surface',
  ghost: 'text-fg-muted active:bg-line',
}

const sizes: Record<Size, string> = {
  md: 'h-touch px-4 text-label',
  lg: 'h-control px-6 text-body font-semibold',
}

export const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-pressed'

export function Button({
  variant = 'primary',
  size = 'lg',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-pill transition-colors duration-fast disabled:opacity-40 ${focusRing} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
