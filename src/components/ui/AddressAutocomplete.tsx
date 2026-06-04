'use client'

import { useState, useEffect, useRef } from 'react'
import { Label, Input } from './Input'

interface AddressValues {
  street: string
  house_number: string
  postcode: string
  city: string
}

interface NominatimResult {
  place_id: number
  display_name: string
  address: {
    road?: string
    house_number?: string
    postcode?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string
  }
}

export interface AddressAutocompleteProps {
  /** name attributes for each hidden form field */
  names: { street: string; house_number: string; postcode: string; city: string }
  /** pre-fill with existing values (e.g. edit form) */
  defaults?: Partial<AddressValues>
}

export function AddressAutocomplete({ names, defaults }: AddressAutocompleteProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState<AddressValues>({
    street:       defaults?.street       ?? '',
    house_number: defaults?.house_number ?? '',
    postcode:     defaults?.postcode     ?? '',
    city:         defaults?.city         ?? '',
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounced search
  useEffect(() => {
    if (query.length < 3) { setSuggestions([]); setOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/address-search?q=${encodeURIComponent(query)}`)
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch { /* network error — silent */ }
      finally { setLoading(false) }
    }, 320)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  function select(result: NominatimResult) {
    const a = result.address
    setValues({
      street:       a.road ?? '',
      house_number: a.house_number ?? '',
      postcode:     a.postcode ?? '',
      city:         a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? '',
    })
    setQuery('')
    setOpen(false)
  }

  const inputBase = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

  return (
    <div className="space-y-3">
      {/* Search box — not a form field, only used to populate the fields below */}
      <div ref={containerRef} className="relative">
        <Label>Adres opzoeken</Label>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Typ straat of gemeente om te zoeken…"
            autoComplete="off"
            className={inputBase}
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

        {open && (
          <ul className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden divide-y divide-border">
            {suggestions.map(s => (
              <li key={s.place_id}>
                <button
                  type="button"
                  onClick={() => select(s)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary-light hover:text-primary transition-colors leading-snug"
                >
                  {s.display_name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Editable address fields — these are the actual form inputs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <Label htmlFor={names.street}>Straat</Label>
          <Input
            id={names.street}
            name={names.street}
            value={values.street}
            onChange={e => setValues(v => ({ ...v, street: e.target.value }))}
            placeholder="Wanzelesteenweg"
          />
        </div>
        <div>
          <Label htmlFor={names.house_number}>Nr.</Label>
          <Input
            id={names.house_number}
            name={names.house_number}
            value={values.house_number}
            onChange={e => setValues(v => ({ ...v, house_number: e.target.value }))}
            placeholder="98"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={names.postcode}>Postcode</Label>
          <Input
            id={names.postcode}
            name={names.postcode}
            value={values.postcode}
            onChange={e => setValues(v => ({ ...v, postcode: e.target.value }))}
            placeholder="9260"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor={names.city}>Gemeente</Label>
          <Input
            id={names.city}
            name={names.city}
            value={values.city}
            onChange={e => setValues(v => ({ ...v, city: e.target.value }))}
            placeholder="Wichelen"
          />
        </div>
      </div>
    </div>
  )
}
