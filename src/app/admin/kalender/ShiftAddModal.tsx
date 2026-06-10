'use client'

import { useActionState, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input, Label, Select } from '@/components/ui/Input'
import { createShift } from './actions'
import type { Assistent, PharmacyOption } from './page'

export default function ShiftAddModal({
  date,
  assistants,
  pharmacies,
  onClose,
}: {
  date: string
  assistants: Assistent[]
  pharmacies: PharmacyOption[]
  onClose: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createShift, null)
  const [pharmacyId, setPharmacyId] = useState('')

  const selectedPharmacy = pharmacies.find(p => p.id === pharmacyId)

  useEffect(() => {
    if (state?.type === 'success') {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  return (
    <Modal open title="Shift inplannen" onClose={onClose} size="md">
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shift-date">Datum</Label>
            <Input id="shift-date" name="date" type="date" defaultValue={date} required />
          </div>
          <div>
            <Label htmlFor="shift-assistant">Assistent</Label>
            <Select id="shift-assistant" name="assistant_id" required>
              <option value="">— Kies assistent —</option>
              {assistants.map(a => (
                <option key={a.id} value={a.id}>
                  {[a.first_name, a.last_name].filter(Boolean).join(' ') || '—'}
                </option>
              ))}
            </Select>
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
          <Label htmlFor="shift-pharmacy">Apotheek</Label>
          <Select
            id="shift-pharmacy"
            value={pharmacyId}
            onChange={e => setPharmacyId(e.target.value)}
          >
            <option value="">— Kies apotheek —</option>
            {pharmacies.map(p => (
              <option key={p.id} value={p.id}>{p.company_name}</option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="shift-location">Locatie</Label>
          <Select id="shift-location" name="location_id" required disabled={!selectedPharmacy}>
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
