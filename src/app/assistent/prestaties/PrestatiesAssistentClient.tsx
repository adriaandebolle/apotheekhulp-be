'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { confirmShift, declineShift } from './actions'

export type AssistentShift = {
  id: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  status: string
  pharmacyName: string
  locationName: string
  notes: string | null
}

function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('nl-BE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function fmtTime(t: string) { return t.slice(0, 5) }

function calcHours(startTime: string, endTime: string, breakMinutes: number): string {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const min = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes
  return (Math.max(0, min) / 60).toFixed(2).replace('.', ',') + ' u'
}

const STATUS_LABEL: Record<string, string> = {
  pending_assistant: 'Bevestiging vereist',
  confirmed:         'Bevestigd',
  pending_admin:     'In behandeling',
  approved:          'Goedgekeurd',
  denied:            'Geweigerd',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  approved:          'success',
  confirmed:         'info',
  pending_admin:     'warning',
  pending_assistant: 'warning',
  denied:            'danger',
}

function ConfirmCell({ shift }: { shift: AssistentShift }) {
  const router = useRouter()
  const [acting, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => { await confirmShift(shift.id); router.refresh() })
  }
  function handleDecline() {
    startTransition(async () => { await declineShift(shift.id); router.refresh() })
  }

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" loading={acting} onClick={handleConfirm}>Bevestigen</Button>
      <Button size="sm" variant="danger" loading={acting} onClick={handleDecline}>Weigeren</Button>
    </div>
  )
}

export default function PrestatiesAssistentClient({ shifts }: { shifts: AssistentShift[] }) {
  const pending  = shifts.filter(s => s.status === 'pending_assistant')
  const history  = shifts.filter(s => s.status !== 'pending_assistant')

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="px-8 py-6 border-b border-border">
        <p className="text-xs text-text-muted mb-1">Prestaties</p>
        <h1 className="text-2xl font-bold text-text">Mijn prestaties</h1>
      </div>

      <div className="flex-1 overflow-y-auto">

        {/* ── Section: Te bevestigen ───────────────────────────────────── */}
        <section className="border-b border-border">
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-border">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
              Te bevestigen
            </h2>
            {pending.length > 0 && (
              <span className="text-xs font-semibold bg-warning text-white rounded-full px-2 py-0.5 leading-none">
                {pending.length}
              </span>
            )}
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Datum</Th>
                <Th>Apotheek / Locatie</Th>
                <Th>Uren</Th>
                <Th>Acties</Th>
              </tr>
            </Thead>
            <Tbody>
              {pending.length === 0
                ? <EmptyRow colSpan={4} message="Geen shifts die bevestiging vereisen." />
                : pending.map(s => (
                  <Tr key={s.id}>
                    <Td>
                      <p className="font-medium">{fmtDate(s.date)}</p>
                      <p className="text-xs text-text-muted">
                        {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                        {s.breakMinutes > 0 && ` (${s.breakMinutes} min pauze)`}
                      </p>
                    </Td>
                    <Td>
                      <p>{s.pharmacyName}</p>
                      <p className="text-xs text-text-muted">{s.locationName}</p>
                    </Td>
                    <Td>{calcHours(s.startTime, s.endTime, s.breakMinutes)}</Td>
                    <Td><ConfirmCell shift={s} /></Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </section>

        {/* ── Section: Historiek ───────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-border">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Historiek</h2>
            <span className="text-xs text-text-muted">({history.length})</span>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Datum</Th>
                <Th>Apotheek / Locatie</Th>
                <Th>Uren</Th>
                <Th>Status</Th>
              </tr>
            </Thead>
            <Tbody>
              {history.length === 0
                ? <EmptyRow colSpan={4} message="Geen prestaties gevonden." />
                : history.map(s => (
                  <Tr key={s.id}>
                    <Td>
                      <p className="font-medium">{fmtDate(s.date)}</p>
                      <p className="text-xs text-text-muted">
                        {fmtTime(s.startTime)} – {fmtTime(s.endTime)}
                        {s.breakMinutes > 0 && ` (${s.breakMinutes} min pauze)`}
                      </p>
                    </Td>
                    <Td>
                      <p>{s.pharmacyName}</p>
                      <p className="text-xs text-text-muted">{s.locationName}</p>
                    </Td>
                    <Td>{calcHours(s.startTime, s.endTime, s.breakMinutes)}</Td>
                    <Td>
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'neutral'}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </section>
      </div>
    </>
  )
}
