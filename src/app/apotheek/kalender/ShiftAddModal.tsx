'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { createShift } from './actions'
import type { Assistent, LocationOption, UnavailabilityEntry, BookedSlot } from './page'

// JS getDay(): 0=Sun 1=Mon…6=Sat  →  DB: 0=Mon…6=Sun
function jsDayToDb(jsDay: number): number {
  return (jsDay + 6) % 7
}

function dayOfWeekForDate(iso: string): number {
  // Use noon to avoid any timezone-midnight edge cases
  return jsDayToDb(new Date(iso + 'T12:00:00').getDay())
}

export default function ShiftAddModal({
  date,
  assistants,
  locations,
  unavailability,
  bookedSlots,
  onClose,
}: {
  date: string
  assistants: Assistent[]
  locations: LocationOption[]
  unavailability: UnavailabilityEntry[]
  bookedSlots: BookedSlot[]
  onClose: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createShift, null)
  const [selectedDate, setSelectedDate] = useState(date)

  useEffect(() => {
    if (state?.type === 'success') {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  const dow = dayOfWeekForDate(selectedDate)

  // Build lookup sets for fast filtering
  const unavailableSet = new Set(
    unavailability
      .filter(u => u.dayOfWeek === dow)
      .map(u => u.assistantId)
  )
  const bookedSet = new Set(
    bookedSlots
      .filter(b => b.date === selectedDate)
      .map(b => b.assistantId)
  )

  const availableAssistants = assistants.filter(
    a => !unavailableSet.has(a.id) && !bookedSet.has(a.id)
  )
  const unavailableCount = assistants.length - availableAssistants.length

  return (
    <Modal open title="Shift inplannen" onClose={onClose} size="md">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shift-date">Datum</Label>
            <Input
              id="shift-date"
              name="date"
              type="date"
              defaultValue={date}
              required
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="shift-assistant">
              Assistent{' '}
              <span className="text-text-muted font-normal">(optioneel)</span>
            </Label>
            <Select id="shift-assistant" name="assistant_id">
              <option value="">— Later toewijzen —</option>
              {availableAssistants.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.first_name, a.last_name].filter(Boolean).join(' ')}
                </option>
              ))}
            </Select>
            {unavailableCount > 0 && (
              <p className="text-xs text-text-muted mt-1">
                {unavailableCount} assistent{unavailableCount > 1 ? 'en' : ''} niet beschikbaar op deze dag.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="shift-start">Beginuur</Label>
            <Input id="shift-start" name="start_time" type="time" defaultValue="08:00" required />
          </div>
          <div>
            <Label htmlFor="shift-end">Einduur</Label>
            <Input id="shift-end" name="end_time" type="time" defaultValue="17:00" required />
          </div>
          <div>
            <Label htmlFor="shift-break">Pauze (min)</Label>
            <Input id="shift-break" name="break_minutes" type="number" defaultValue="30" min="0" step="5" />
          </div>
        </div>

        <div>
          <Label htmlFor="shift-location">Locatie</Label>
          <Select id="shift-location" name="location_id" required>
            {locations.length === 0 ? (
              <option value="">Geen locaties beschikbaar</option>
            ) : (
              <>
                <option value="">— Kies locatie —</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </>
            )}
          </Select>
        </div>

        {state?.type === 'error' && (
          <p className="text-sm text-danger">{state.message}</p>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>Annuleren</Button>
          <Button type="submit" loading={pending}>Opslaan</Button>
        </div>
      </form>
    </Modal>
  )
}
