import Link, { type LinkProps } from 'next/link'
import { type ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'white'
type Size = 'sm' | 'md' | 'lg'

const variantClasses: Record<Variant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-dark border border-transparent',
  secondary: 'bg-white text-primary border border-primary hover:bg-primary-light',
  danger:    'bg-danger text-white hover:bg-red-700 border border-transparent',
  ghost:     'bg-transparent text-text-muted hover:bg-slate-100 border border-transparent',
  white:     'bg-white text-primary hover:bg-gray-50 border border-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-5 py-2.5 text-base rounded-lg',
}

export function buttonVariants({ variant = 'primary' as Variant, size = 'md' as Size, className = '' } = {}) {
  return `inline-flex items-center justify-center font-medium transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`${buttonVariants({ variant, size })} disabled:opacity-50 disabled:cursor-not-allowed ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: Variant
  size?: Size
  fullWidth?: boolean
  children: React.ReactNode
  title?: string
  className?: string
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={`${buttonVariants({ variant, size })} ${fullWidth ? 'w-full' : ''} ${className}`} {...props}>
      {children}
    </Link>
  )
}
