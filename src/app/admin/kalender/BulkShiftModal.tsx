'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { createBulkShifts } from './actions'
import type { Assistent, PharmacyOption } from './page'

export default function BulkShiftModal({
  assistants,
  pharmacies,
  onClose,
}: {
  assistants: Assistent[]
  pharmacies: PharmacyOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createBulkShifts, null)
  const [pharmacyId, setPharmacyId] = useState('')
  const [dates, setDates] = useState<string[]>([''])

  const selectedPharmacy = pharmacies.find(p => p.id === pharmacyId)

  useEffect(() => {
    if (state?.type === 'success') {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  function addDate() { setDates(prev => [...prev, '']) }
  function removeDate(i: number) { setDates(prev => prev.filter((_, idx) => idx !== i)) }
  function updateDate(i: number, val: string) {
    setDates(prev => prev.map((d, idx) => idx === i ? val : d))
  }

  return (
    <Modal open title="Bulk shifts inplannen" onClose={onClose} size="md">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bulk-assistant">Assistent</Label>
            <Select id="bulk-assistant" name="assistant_id" required>
              <option value="">— Kies assistent —</option>
              {assistants.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.first_name, a.last_name].filter(Boolean).join(' ')}
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

        {/* Date list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Datums</Label>
            <button
              type="button"
              onClick={addDate}
              className="text-xs text-primary hover:underline"
            >
              + Datum toevoegen
            </button>
          </div>
          <div className="space-y-2">
            {dates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  name="dates[]"
                  type="date"
                  value={d}
                  onChange={e => updateDate(i, e.target.value)}
                  required
                />
                {dates.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDate(i)}
                    className="text-text-muted hover:text-danger text-sm px-1"
                    title="Verwijder"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-1">
            {dates.filter(Boolean).length} datum{dates.filter(Boolean).length !== 1 ? 's' : ''} — elke datum krijgt dezelfde shift-instellingen
          </p>
        </div>

        {state?.type === 'error' && (
          <p className="text-sm text-danger">{state.message}</p>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose}>Annuleren</Button>
          <Button type="submit" loading={pending}>
            {dates.filter(Boolean).length > 1
              ? `${dates.filter(Boolean).length} shifts aanmaken`
              : 'Shift aanmaken'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
