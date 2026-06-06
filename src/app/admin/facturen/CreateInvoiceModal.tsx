'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Label, Input } from '@/components/ui/Input'
import { createInvoice } from '@/lib/actions/invoices'

export type ModalShift = {
  id:           string
  date:         string
  pharmacyName: string   // for assistent invoices
  assistantName:string   // for apotheek invoices
  locationName: string
  startTime:    string
  endTime:      string
  breakMinutes: number
  hourlyRate:   number
}

const BTW_RATE = 0.21

function calcHours(start: string, end: string, brk: number) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.max(0, (eh * 60 + em) - (sh * 60 + sm) - brk) / 60
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('nl-BE', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

export default function CreateInvoiceModal({
  type,
  recipientId,
  recipientName,
  shifts,
  vatLiable,
  suggestedInvoiceNumber,
  onClose,
}: {
  type:                   'assistent' | 'apotheek'
  recipientId:            string
  recipientName:          string
  shifts:                 ModalShift[]
  vatLiable:              boolean
  suggestedInvoiceNumber?: string
  onClose:                () => void
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const [invoiceNumber, setInvoiceNumber] = useState(suggestedInvoiceNumber ?? '')
  const [invoiceDate,   setInvoiceDate]   = useState(today)
  const [checked, setChecked] = useState<Set<string>>(new Set(shifts.map(s => s.id)))

  function toggle(id: string) {
    setChecked(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  function toggleAll() {
    const all = shifts.map(s => s.id)
    const allOn = all.every(id => checked.has(id))
    setChecked(new Set(allOn ? [] : all))
  }

  const selectedShifts = shifts.filter(s => checked.has(s.id))
  const subtotal = selectedShifts.reduce((sum, s) => {
    return sum + calcHours(s.startTime, s.endTime, s.breakMinutes) * s.hourlyRate
  }, 0)
  const vatAmount = vatLiable ? subtotal * BTW_RATE : 0
  const total     = subtotal + vatAmount

  function handleSubmit() {
    if (!invoiceNumber.trim()) { setError('Factuurnummer is verplicht.'); return }
    if (checked.size === 0)    { setError('Selecteer minstens één shift.'); return }
    setError(null)

    startTransition(async () => {
      const result = await createInvoice({
        type,
        recipientId,
        invoiceNumber,
        invoiceDate,
        shiftIds: [...checked],
        subtotal,
        vatAmount,
        total,
      })
      if ('error' in result) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  return (
    <Modal
      open
      title={`Factuur aanmaken — ${recipientName}`}
      onClose={onClose}
      size="lg"
    >
      <div className="space-y-5">
        {/* Invoice fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="inv-number">Factuurnummer *</Label>
            <Input
              id="inv-number"
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              placeholder="bv. 2026-001"
              autoFocus
            />
          </div>
          <div>
            <Label htmlFor="inv-date">Factuurdatum *</Label>
            <Input
              id="inv-date"
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
            />
          </div>
        </div>

        {/* Shifts selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-text">Shifts</p>
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-primary hover:underline"
            >
              {shifts.every(s => checked.has(s.id)) ? 'Deselecteer alles' : 'Selecteer alles'}
            </button>
          </div>
          <div className="border border-border rounded-md overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-text-muted">
                    {type === 'assistent' ? 'Apotheek' : 'Assistent'}
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">Uren</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-text-muted">Bedrag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {shifts.map(s => {
                  const hours  = calcHours(s.startTime, s.endTime, s.breakMinutes)
                  const amount = hours * s.hourlyRate
                  const on     = checked.has(s.id)
                  return (
                    <tr
                      key={s.id}
                      className={`cursor-pointer hover:bg-slate-50 ${on ? '' : 'opacity-50'}`}
                      onClick={() => toggle(s.id)}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggle(s.id)}
                          onClick={e => e.stopPropagation()}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="px-3 py-2 text-text-muted">{fmtDate(s.date)}</td>
                      <td className="px-3 py-2 text-text">
                        {type === 'assistent' ? s.pharmacyName : s.assistantName}
                        <span className="text-text-muted"> — {s.locationName}</span>
                      </td>
                      <td className="px-3 py-2 text-right text-text-muted">
                        {hours.toFixed(2).replace('.', ',')} u
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-text">
                        {fmtMoney(amount)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-slate-50 rounded-md px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between text-text-muted">
            <span>Subtotaal excl. BTW</span>
            <span>{fmtMoney(subtotal)}</span>
          </div>
          <div className="flex justify-between text-text-muted">
            <span>BTW {vatLiable ? '21%' : '0%'}</span>
            <span>{fmtMoney(vatAmount)}</span>
          </div>
          <div className="flex justify-between font-semibold text-text border-t border-border pt-1 mt-1">
            <span>Totaal incl. BTW</span>
            <span className="text-primary">{fmtMoney(total)}</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-danger">{error}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Annuleren</Button>
          <Button onClick={handleSubmit} loading={isPending} disabled={checked.size === 0}>
            Factuur aanmaken
          </Button>
        </div>
      </div>
    </Modal>
  )
}
