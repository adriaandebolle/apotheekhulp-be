import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
}

export function Checkbox({ label, className, ...props }: CheckboxProps) {
  return (
    <label className={`flex items-center gap-2 text-sm text-text cursor-pointer select-none${className ? ` ${className}` : ''}`}>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        {...props}
      />
      {label}
    </label>
  )
}
