import type { ButtonHTMLAttributes } from 'react'

type Variant = 'ghost' | 'scrim'

// A round button holding only an icon. `aria-label` is required because
// there is no visible text. `scrim` sits on top of photos.
const variants: Record<Variant, string> = {
  ghost: 'rounded-full p-2',
  scrim: 'rounded-full bg-black/50 p-1 text-white',
}

export function IconButton({
  variant = 'ghost',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; 'aria-label': string }) {
  return <button className={`${variants[variant]} ${className}`} {...props} />
}
