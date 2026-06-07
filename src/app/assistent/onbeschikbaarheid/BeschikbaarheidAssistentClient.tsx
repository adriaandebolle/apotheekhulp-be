'use client'

import { useState, useTransition } from 'react'
import { setMyAvailability } from '@/lib/actions/availability'

const DAYS = [
  { label: 'Maandag',   idx: 0 },
  { label: 'Dinsdag',   idx: 1 },
  { label: 'Woensdag',  idx: 2 },
  { label: 'Donderdag', idx: 3 },
  { label: 'Vrijdag',   idx: 4 },
  { label: 'Zaterdag',  idx: 5 },
  { label: 'Zondag',    idx: 6 },
]

export default function BeschikbaarheidAssistentClient({
  unavailable,
}: {
  unavailable: Set<number>
}) {
  // true = day is marked as unavailable (row exists in DB)
  const [days, setDays] = useState<Set<number>>(() => new Set(unavailable))
  const [, startTransition] = useTransition()

  function handleChange(idx: number, checked: boolean) {
    setDays(prev => {
      const next = new Set(prev)
      if (checked) next.add(idx)
      else next.delete(idx)
      return next
    })

    startTransition(async () => {
      try {
        // checked = mark unavailable = insert row
        // unchecked = mark available again = delete row
        await setMyAvailability(idx, checked)
      } catch {
        setDays(prev => {
          const next = new Set(prev)
          if (checked) next.delete(idx)
          else next.add(idx)
          return next
        })
      }
    })
  }

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
      {DAYS.map(({ label, idx }, i) => (
        <label
          key={idx}
          className={`flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-background transition-colors
            ${i < DAYS.length - 1 ? 'border-b border-border' : ''}`}
        >
          <span className="text-sm font-medium text-text">{label}</span>
          <input
            type="checkbox"
            checked={days.has(idx)}
            onChange={e => handleChange(idx, e.target.checked)}
            className="w-4 h-4 accent-primary cursor-pointer"
          />
        </label>
      ))}
    </div>
  )
}
