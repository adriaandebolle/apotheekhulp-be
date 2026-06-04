'use client'

import { useState } from 'react'
import { Label, Input } from './Input'
import type { VatLookupResult, ParsedAddress } from '@/app/api/vat-lookup/route'

interface VatLookupProps {
  onFound?: (result: { name: string; parsed_address: ParsedAddress }) => void
  defaultValue?: string
}

export function VatLookup({ onFound, defaultValue = '' }: VatLookupProps) {
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null)

  async function lookup(vat: string) {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch(`/api/vat-lookup?vat=${encodeURIComponent(vat)}`)
      const data: VatLookupResult = await res.json()
      if (data.valid) {
        setStatus({ ok: true, message: `✓ ${data.name}` })
        onFound?.({ name: data.name, parsed_address: data.parsed_address })
      } else {
        setStatus({ ok: false, message: data.error })
      }
    } catch {
      setStatus({ ok: false, message: 'Fout bij opzoeken. Probeer opnieuw.' })
    } finally {
      setLoading(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setValue(val)
    setStatus(null)
    // Auto-trigger as soon as we have 10 digits (Belgian VAT number length)
    if (val.replace(/\D/g, '').length === 10) lookup(val)
  }

  return (
    <div>
      <Label htmlFor="vat_number">BTW-nummer</Label>
      <div className="relative">
        <Input
          id="vat_number"
          name="vat_number"
          placeholder="BE 0000.000.000"
          value={value}
          onChange={handleChange}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </div>
      {status && (
        <p className={`mt-1 text-xs ${status.ok ? 'text-green-700' : 'text-danger'}`}>{status.message}</p>
      )}
    </div>
  )
}
