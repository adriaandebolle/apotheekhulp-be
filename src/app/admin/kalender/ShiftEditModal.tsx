'use client'

import { useActionState, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input, Label } from '@/components/ui/Input'
import { updateShift, approveShift, denyShift, deleteShift } from './actions'
import type { ShiftData } from './page'

const STATUS_LABELS: Record<string, string> = {
  pending_assistant: 'In afwachting assistent',
  pending_apotheek:  'In afwachting apotheek',
  approved:          'Goedgekeurd',
  denied:            'Geweigerd',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved:          'success',
  pending_apotheek:  'warning',
  pending_assistant: 'neutral',
  denied:            'danger',
}

function localDateLabel(isoDate: string) {
  return new Date(isoDate + 'T00:00:00').toLocaleDateString('nl-BE', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function ShiftEditModal({
  shift,
  onClose,
}: {
  shift: ShiftData
  onClose: () => void
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(updateShift, null)
  const [acting, startTransition] = useTransition()
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (state?.type === 'success') {
      router.refresh()
      onClose()
    }
  }, [state, router, onClose])

  function handleApprove() {
    startTransition(async () => {
      await approveShift(shift.id)
      router.refresh()
      onClose()
    })
  }

  function handleDeny() {
    startTransition(async () => {
      await denyShift(shift.id)
      router.refresh()
      onClose()
    })
  }

  function handleDeleteConfirmed() {
    startTransition(async () => {
      await deleteShift(shift.id)
      router.refresh()
      onClose()
    })
  }

  return (
    <Modal open title="Shift bewerken" onClose={onClose} size="md">
      <form action={action} className="space-y-4">
        <input type="hidden" name="id" value={shift.id} />

        {/* Info row */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-text">{shift.assistantName}</p>
            <p className="text-xs text-text-muted">{shift.pharmacyName} — {shift.locationName}</p>
          </div>
          <Badge variant={STATUS_VARIANT[shift.status] ?? 'neutral'}>
            {STATUS_LABELS[shift.status] ?? shift.status}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="edit-date">Datum</Label>
            <Input id="edit-date" name="date" type="date" defaultValue={shift.date} required />
          </div>
          <div>
            <Label htmlFor="edit-start">Beginuur</Label>
            <Input id="edit-start" name="start_time" type="time" defaultValue={shift.startTime.slice(0, 5)} required />
          </div>
          <div>
            <Label htmlFor="edit-end">Einduur</Label>
            <Input id="edit-end" name="end_time" type="time" defaultValue={shift.endTime.slice(0, 5)} required />
            {shift.endTime < shift.startTime && (
              <p className="text-xs text-text-muted mt-1">Eindigt volgende dag</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="edit-break">Pauze (min)</Label>
            <Input id="edit-break" name="break_minutes" type="number" defaultValue={shift.breakMinutes} min="0" step="5" />
          </div>
        </div>

        {state?.type === 'error' && (
          <p className="text-sm text-danger">{state.message}</p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex gap-2">
            {shift.status === 'pending_apotheek' && (
              <>
                <Button type="button" size="sm" onClick={handleApprove} loading={acting}>
                  Aanvaarden
                </Button>
                <Button type="button" variant="danger" size="sm" onClick={handleDeny} loading={acting}>
                  Weigeren
                </Button>
              </>
            )}
            <Button type="submit" variant="secondary" size="sm" loading={pending}>
              Bewerken
            </Button>
            <Button type="button" variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              Verwijderen
            </Button>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>Sluiten</Button>
        </div>
      </form>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Shift verwijderen"
        size="sm"
      >
        <p className="text-sm text-text mb-1">
          Ben je zeker dat je de shift van <strong>{shift.assistantName}</strong> op{' '}
          <strong>{localDateLabel(shift.date)}</strong> wilt verwijderen?
        </p>
        <p className="text-xs text-text-muted mb-6">
          Deze actie kan niet ongedaan gemaakt worden.
        </p>
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Annuleren</Button>
          <Button variant="danger" loading={acting} onClick={handleDeleteConfirmed}>
            Verwijderen
          </Button>
        </div>
      </Modal>
    </Modal>
  )
}
