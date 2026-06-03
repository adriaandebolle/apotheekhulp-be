import { type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const inputBase = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:text-text-muted'

interface LabelProps {
  htmlFor?: string
  children: React.ReactNode
  required?: boolean
}

export function Label({ htmlFor, children, required }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-text mb-1">
      {children}
      {required && <span className="text-danger ml-0.5">*</span>}
    </label>
  )
}

interface FieldErrorProps { message?: string }
export function FieldError({ message }: FieldErrorProps) {
  if (!message) return null
  return <p className="mt-1 text-xs text-danger">{message}</p>
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`${inputBase} ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
      {...props}
    />
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
}

export function Select({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`${inputBase} ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ error, className = '', ...props }: TextareaProps) {
  return (
    <textarea
      className={`${inputBase} resize-y min-h-[100px] ${error ? 'border-danger focus:ring-danger' : ''} ${className}`}
      {...props}
    />
  )
}
