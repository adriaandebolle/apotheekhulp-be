'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { createBulkShifts } from './actions'
import type { Assistent, PharmacyOption } from './page'

// ── Calendar helpers ────────────────────────────────────────────────────────────

const WEEK_DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

/** ISO weekday: 0 = Monday … 6 = Sunday */
function isoWeekday(iso: string): number {
  return (new Date(iso + 'T12:00:00').getDay() + 6) % 7
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

/** Returns array of 35 or 42 cells: ISO date string or null for padding */
function buildMonthGrid(yearMonth: string): (string | null)[] {
  const [y, m] = yearMonth.split('-').map(Number)
  const firstDay = new Date(y, m - 1, 1)
  const daysInMonth = new Date(y, m, 0).getDate()
  // Monday = 0 in our system; JS getDay() Sunday = 0
  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells  = Math.ceil((startOffset + daysInMonth) / 7) * 7
  const cells: (string | null)[] = []
  for (let i = 0; i < totalCells; i++) {
    const dayNum = i - startOffset + 1
    if (dayNum < 1 || dayNum > daysInMonth) {
      cells.push(null)
    } else {
      const date = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
      cells.push(date)
    }
  }
  return cells
}

function monthLabel(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
}

function prevMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  return m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, '0')}`
}

function nextMonth(yearMonth: string): string {
  const [y, m] = yearMonth.split('-').map(Number)
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, '0')}`
}

// ── Component ───────────────────────────────────────────────────────────────────

export default function BulkShiftModal({
  assistants,
  pharmacies,
  onClose,
  initialDate,
}: {
  assistants: Assistent[]
  pharmacies: PharmacyOption[]
  onClose: () => void
  initialDate?: string
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createBulkShifts, null)
  const [pharmacyId, setPharmacyId] = useState('')

  const todayMonth = new Date().toISOString().slice(0, 7)
  const [calendarMonth, setCalendarMonth]   = useState<string>(
    initialDate ? initialDate.slice(0, 7) : todayMonth
  )
  const [selectedDates, setSelectedDates]   = useState<Set<string>>(new Set())

  // Repeat section
  const [repeatOpen, setRepeatOpen]   = useState(false)
  const [repeatDays, setRepeatDays]   = useState<Set<number>>(new Set())
  const [repeatUntil, setRepeatUntil] = useState('')

  const selectedPharmacy = pharmacies.find(p => p.id === pharmacyId)

  useEffect(() => {
    if (state?.type === 'success') {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  function toggleDate(iso: string) {
    setSelectedDates(prev => {
      const next = new Set(prev)
      next.has(iso) ? next.delete(iso) : next.add(iso)
      return next
    })
  }

  function toggleRepeatDay(d: number) {
    setRepeatDays(prev => {
      const next = new Set(prev)
      next.has(d) ? next.delete(d) : next.add(d)
      return next
    })
  }

  function generateRepeatDates() {
    if (repeatDays.size === 0 || !repeatUntil) return
    const start = `${calendarMonth}-01`
    const dates: string[] = []
    let cursor = start
    while (cursor <= repeatUntil) {
      if (repeatDays.has(isoWeekday(cursor))) dates.push(cursor)
      cursor = addDays(cursor, 1)
    }
    setSelectedDates(prev => new Set([...prev, ...dates]))
  }

  const grid   = buildMonthGrid(calendarMonth)
  const sorted = [...selectedDates].sort()
  const today  = new Date().toISOString().slice(0, 10)

  return (
    <Modal open title="Bulk shifts inplannen" onClose={onClose} size="lg">
      <form action={action} className="space-y-5">
        {/* Hidden date inputs for form submission */}
        {sorted.map(d => <input key={d} type="hidden" name="dates[]" value={d} />)}

        {/* Assistant + Apotheek */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bulk-assistant">Assistent</Label>
            <Select id="bulk-assistant" name="assistant_id" required>
              <option value="">— Kies assistent —</option>
              {assistants.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.first_name, a.last_name].filter(Boolean).join(' ') || '—'}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="bulk-pharmacy">Apotheek</Label>
            <Select
              id="bulk-pharmacy"
              value={pharmacyId}
              onChange={e => setPharmacyId(e.target.value)}
            >
              <option value="">— Kies apotheek —</option>
              {pharmacies.map(p => (
                <option key={p.id} value={p.id}>{p.company_name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="bulk-location">Locatie</Label>
          <Select id="bulk-location" name="location_id" required disabled={!selectedPharmacy}>
            {!selectedPharmacy ? (
              <option value="">— Kies eerst een apotheek —</option>
            ) : selectedPharmacy.locations.length === 0 ? (
              <option value="">Geen locaties beschikbaar</option>
            ) : (
              <>
                <option value="">— Kies locatie —</option>
                {selectedPharmacy.locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </>
            )}
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bulk-start">Beginuur</Label>
            <Input id="bulk-start" name="start_time" type="time" defaultValue="08:00" required />
          </div>
          <div>
            <Label htmlFor="bulk-end">Einduur</Label>
            <Input id="bulk-end" name="end_time" type="time" defaultValue="17:00" required />
          </div>
          <div>
            <Label htmlFor="bulk-break">Pauze (min)</Label>
            <Input id="bulk-break" name="break_minutes" type="number" defaultValue="30" min="0" step="5" />
          </div>
        </div>

        {/* ── Mini-calendar ─────────────────────────────────────────────────── */}
        <div>
          <Label>Datums</Label>

          {/* Month navigation */}
          <div className="flex items-center justify-between mb-2 mt-1">
            <button
              type="button"
              onClick={() => setCalendarMonth(prevMonth(calendarMonth))}
              className="px-2 py-1 text-text-muted hover:text-text text-sm"
              aria-label="Vorige maand"
            >
              ‹
            </button>
            <span className="text-sm font-medium text-text capitalize">
              {monthLabel(calendarMonth)}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(nextMonth(calendarMonth))}
              className="px-2 py-1 text-text-muted hover:text-text text-sm"
              aria-label="Volgende maand"
            >
              ›
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEK_DAYS.map(d => (
              <div key={d} className="text-center text-xs text-text-muted font-semibold py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {grid.map((iso, i) => {
              if (!iso) return <div key={i} />
              const isSelected = selectedDates.has(iso)
              const isToday    = iso === today
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => toggleDate(iso)}
                  className={[
                    'text-sm rounded py-1.5 text-center transition-colors',
                    isSelected
                      ? 'bg-primary text-white font-semibold'
                      : isToday
                        ? 'ring-1 ring-primary text-primary hover:bg-primary/10'
                        : 'text-text hover:bg-background',
                  ].join(' ')}
                >
                  {Number(iso.slice(8))}
                </button>
              )
            })}
          </div>

          {/* Summary */}
          <p className="text-xs text-text-muted mt-2">
            {selectedDates.size === 0
              ? 'Klik op een dag om te selecteren'
              : `${selectedDates.size} datum${selectedDates.size !== 1 ? 's' : ''} geselecteerd`}
          </p>
        </div>

        {/* ── Repeat / Herhaling ────────────────────────────────────────────── */}
        <div className="border border-border rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setRepeatOpen(o => !o)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium text-text hover:bg-background"
          >
            <span>Herhaling</span>
            <span className="text-text-muted">{repeatOpen ? '▲' : '▼'}</span>
          </button>

          {repeatOpen && (
            <div className="px-4 pb-4 pt-2 border-t border-border space-y-3">
              <div>
                <Label>Weekdagen</Label>
                <div className="flex gap-1.5 flex-wrap">
                  {WEEK_DAYS.map((label, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRepeatDay(idx)}
                      className={[
                        'text-xs px-2.5 py-1 rounded-full border transition-colors',
                        repeatDays.has(idx)
                          ? 'bg-primary text-white border-primary'
                          : 'border-border text-text hover:border-primary',
                      ].join(' ')}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="repeat-until">Tot en met</Label>
                  <Input
                    id="repeat-until"
                    type="date"
                    value={repeatUntil}
                    onChange={e => setRepeatUntil(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={generateRepeatDates}
                  disabled={repeatDays.size === 0 || !repeatUntil}
                >
                  Genereer
                </Button>
              </div>

              <p className="text-xs text-text-muted">
                Genereert alle {repeatDays.size > 0
                  ? [...repeatDays].map(d => WEEK_DAYS[d]).join(', ')
                  : '…'}-dagen van de huidige maand t.e.m. de gekozen datum.
              </p>
            </div>
          )}
        </div>

        {state?.type === 'error' && (
          <p className="text-sm text-danger">{state.message}</p>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>Annuleren</Button>
          <Button type="submit" loading={pending} disabled={selectedDates.size === 0}>
            {selectedDates.size > 1
              ? `${selectedDates.size} shifts aanmaken`
              : 'Shift aanmaken'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
