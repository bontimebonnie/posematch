import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-berry text-white active:bg-berry-dark disabled:opacity-40',
  secondary: 'bg-white text-ink ring-1 ring-ink/15 active:bg-ink/5 disabled:opacity-40',
  ghost: 'text-ink/70 active:bg-ink/5',
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-5 py-3 font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    />
  )
}
