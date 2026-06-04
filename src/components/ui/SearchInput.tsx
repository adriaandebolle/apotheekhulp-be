'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface Props {
  defaultValue?: string
  placeholder?: string
  basePath: string
  extraParams?: Record<string, string>
}

export function SearchInput({ defaultValue = '', placeholder = 'Zoeken...', basePath, extraParams = {} }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleChange(value: string) {
    const params = new URLSearchParams(extraParams)
    if (value) params.set('q', value)
    startTransition(() => {
      router.push(`${basePath}?${params.toString()}`)
    })
  }

  return (
    <div className="relative">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="search"
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={e => handleChange(e.target.value)}
        className={`pl-9 pr-3 py-2 border border-border rounded-lg text-sm bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64 ${isPending ? 'opacity-60' : ''}`}
      />
    </div>
  )
}
