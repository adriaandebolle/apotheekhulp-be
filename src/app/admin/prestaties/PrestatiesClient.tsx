'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import ShiftEditModal from '@/app/admin/kalender/ShiftEditModal'
import { approveShift, denyShift, deleteShift } from '@/app/admin/kalender/actions'
import type { PrestatieShift, PlatformConfig } from './page'
import type { Assistent, PharmacyOption, ShiftData } from '../kalender/page'

// ── Helpers ────────────────────────────────────────────────────────────────────

function calcHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [sh, sm] = startTime.split(':').map(Number)
  const [eh, em] = endTime.split(':').map(Number)
  const totalMin = (eh * 60 + em) - (sh * 60 + sm) - breakMinutes
  return Math.max(0, totalMin) / 60
}

function fmtHours(h: number): string {
  return h.toFixed(2).replace('.', ',') + ' u'
}

function fmtMoney(amount: number): string {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(amount)
}

function fmtDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('nl-BE', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function toShiftData(s: PrestatieShift): ShiftData {
  return {
    id: s.id, assistantId: s.assistantId, locationId: s.locationId,
    date: s.date, startTime: s.startTime, endTime: s.endTime,
    breakMinutes: s.breakMinutes, status: s.status,
    assistantName: s.assistantName, pharmacyName: s.pharmacyName,
    locationName: s.locationName, color: s.color,
  }
}

const STATUS_LABEL: Record<string, string> = {
  pending_assistant: 'In afwachting assistent',
  confirmed:         'Bevestigd door assistent',
  pending_admin:     'In afwachting beheerder',
  approved:          'Goedgekeurd',
  denied:            'Geweigerd',
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  approved:          'success',
  pending_admin:     'warning',
  confirmed:         'warning',
  pending_assistant: 'neutral',
  denied:            'danger',
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-border">
      <h2 className="text-sm font-semibold text-text uppercase tracking-wide">{title}</h2>
      <span className="text-xs font-semibold bg-primary text-white rounded-full px-2 py-0.5 leading-none">
        {count}
      </span>
    </div>
  )
}

// ── Inline action cell ─────────────────────────────────────────────────────────

function ActionCell({
  shift,
  onEdit,
  showApprove,
}: {
  shift: PrestatieShift
  onEdit: (s: PrestatieShift) => void
  showApprove?: boolean
}) {
  const router = useRouter()
  const [acting, startTransition] = useTransition()
  const [confirmDel, setConfirmDel] = useState(false)

  function handleApprove() {
    startTransition(async () => { await approveShift(shift.id); router.refresh() })
  }
  function handleDeny() {
    startTransition(async () => { await denyShift(shift.id); router.refresh() })
  }
  function handleDelete() {
    startTransition(async () => { await deleteShift(shift.id); router.refresh(); setConfirmDel(false) })
  }

  if (confirmDel) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-muted">Zeker?</span>
        <Button size="sm" variant="danger" loading={acting} onClick={handleDelete}>Ja</Button>
        <Button size="sm" variant="ghost" onClick={() => setConfirmDel(false)}>Nee</Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      {showApprove && (
        <>
          <Button size="sm" loading={acting} onClick={handleApprove}>Goedkeuren</Button>
          <Button size="sm" variant="danger" loading={acting} onClick={handleDeny}>Weigeren</Button>
        </>
      )}
      <Button size="sm" variant="secondary" onClick={() => onEdit(shift)}>Bewerken</Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(true)}>Verwijderen</Button>
    </div>
  )
}

// ── Month filter ───────────────────────────────────────────────────────────────

function monthKey(date: string) { return date.slice(0, 7) } // "YYYY-MM"

function fmtMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PrestatiesClient({
  shifts,
  config,
  assistants,
  pharmacies,
}: {
  shifts: PrestatieShift[]
  config: PlatformConfig
  assistants: Assistent[]
  pharmacies: PharmacyOption[]
}) {
  const [editShift, setEditShift] = useState<PrestatieShift | null>(null)

  const pending   = shifts.filter(s => s.status === 'pending_assistant')
  const toApprove = shifts.filter(s => s.status === 'confirmed' || s.status === 'pending_admin')
  const approved  = shifts.filter(s => s.status === 'approved')

  // Month filter for approved section
  const approvedMonths = [...new Set(approved.map(s => monthKey(s.date)))].sort().reverse()
  const currentMonth = monthKey(new Date().toISOString())
  const defaultMonth = approvedMonths.includes(currentMonth) ? currentMonth : (approvedMonths[0] ?? currentMonth)
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set())

  const approvedFiltered = approved.filter(s => monthKey(s.date) === selectedMonth)

  function toggleCheck(id: string) {
    setCheckedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    const allIds = approvedFiltered.map(s => s.id)
    const allChecked = allIds.every(id => checkedIds.has(id))
    if (allChecked) setCheckedIds(prev => { const n = new Set(prev); allIds.forEach(id => n.delete(id)); return n })
    else setCheckedIds(prev => { const n = new Set(prev); allIds.forEach(id => n.add(id)); return n })
  }

  // Cost summary for selected approved shifts
  const selectedShifts = approvedFiltered.filter(s => checkedIds.has(s.id))
  const totalCostAssistant = selectedShifts.reduce((sum, s) => {
    const h    = calcHours(s.startTime, s.endTime, s.breakMinutes)
    const rate = s.hourlyRateAssistant ?? config.defaultRateAssistant
    return sum + h * rate
  }, 0)
  const totalCostPharmacy = selectedShifts.reduce((sum, s) => {
    const h    = calcHours(s.startTime, s.endTime, s.breakMinutes)
    const rate = s.hourlyRatePharmacy ?? config.defaultRatePharmacy
    return sum + h * rate
  }, 0)

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
        <div>
          <p className="text-xs text-text-muted mb-1">Prestaties</p>
          <h1 className="text-2xl font-bold text-text">Prestaties & Workflow</h1>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* ── Section 1: Te bevestigen door assistent ──────────────────── */}
        <section className="border-b border-border">
          <SectionHeader title="1. Te bevestigen door assistent" count={pending.length} />
          <Table>
            <Thead>
              <tr>
                <Th>Datum</Th>
                <Th>Assistent</Th>
                <Th>Apotheek / Locatie</Th>
                <Th>Uren</Th>
                <Th>Acties</Th>
              </tr>
            </Thead>
            <Tbody>
              {pending.length === 0
                ? <EmptyRow colSpan={5} message="Geen shifts in afwachting van bevestiging." />
                : pending.map(s => (
                  <Tr key={s.id}>
                    <Td>{fmtDate(s.date)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        {s.assistantName}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-text">{s.pharmacyName}</span>
                      <span className="text-text-muted"> — {s.locationName}</span>
                    </Td>
                    <Td>{fmtHours(calcHours(s.startTime, s.endTime, s.breakMinutes))}</Td>
                    <Td>
                      <ActionCell shift={s} onEdit={setEditShift} showApprove={false} />
                    </Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </section>

        {/* ── Section 2: Te goedkeuren door beheerder ──────────────────── */}
        <section className="border-b border-border">
          <SectionHeader title="2. Te goedkeuren door beheerder" count={toApprove.length} />
          <Table>
            <Thead>
              <tr>
                <Th>Datum</Th>
                <Th>Assistent</Th>
                <Th>Apotheek / Locatie</Th>
                <Th>Uren</Th>
                <Th>Status</Th>
                <Th>Acties</Th>
              </tr>
            </Thead>
            <Tbody>
              {toApprove.length === 0
                ? <EmptyRow colSpan={6} message="Geen shifts te goedkeuren." />
                : toApprove.map(s => (
                  <Tr key={s.id}>
                    <Td>{fmtDate(s.date)}</Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                        {s.assistantName}
                      </div>
                    </Td>
                    <Td>
                      <span className="text-text">{s.pharmacyName}</span>
                      <span className="text-text-muted"> — {s.locationName}</span>
                    </Td>
                    <Td>{fmtHours(calcHours(s.startTime, s.endTime, s.breakMinutes))}</Td>
                    <Td>
                      <Badge variant={STATUS_VARIANT[s.status] ?? 'neutral'}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </Td>
                    <Td>
                      <ActionCell shift={s} onEdit={setEditShift} showApprove />
                    </Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </section>

        {/* ── Section 3 & 4: Goedgekeurde prestaties ───────────────────── */}
        <section>
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-border">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-text uppercase tracking-wide">
                3. Goedgekeurde prestaties
              </h2>
              <span className="text-xs font-semibold bg-success text-white rounded-full px-2 py-0.5 leading-none">
                {approved.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {approvedMonths.length > 0 && (
                <select
                  value={selectedMonth}
                  onChange={e => { setSelectedMonth(e.target.value); setCheckedIds(new Set()) }}
                  className="text-sm border border-border rounded-md px-3 py-1.5 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {approvedMonths.map(m => (
                    <option key={m} value={m}>{fmtMonth(m)}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Selection summary bar */}
          {checkedIds.size > 0 && (
            <div className="flex items-center justify-between px-6 py-3 bg-primary-light border-b border-primary/20">
              <span className="text-sm text-primary font-medium">
                {checkedIds.size} shift{checkedIds.size !== 1 ? 's' : ''} geselecteerd
                {' '}—{' '}
                Assistent: <strong>{fmtMoney(totalCostAssistant)}</strong>
                {' '} / Apotheek: <strong>{fmtMoney(totalCostPharmacy)}</strong>
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled title="Beschikbaar in fase 8">
                  PDF assistent
                </Button>
                <Button size="sm" variant="secondary" disabled title="Beschikbaar in fase 8">
                  PDF apotheek
                </Button>
              </div>
            </div>
          )}

          <Table>
            <Thead>
              <tr>
                <Th className="w-10">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    checked={approvedFiltered.length > 0 && approvedFiltered.every(s => checkedIds.has(s.id))}
                    onChange={toggleAll}
                  />
                </Th>
                <Th>Datum</Th>
                <Th>Assistent</Th>
                <Th>Apotheek / Locatie</Th>
                <Th>Uren</Th>
                <Th>Tarief ass.</Th>
                <Th>Bedrag ass.</Th>
                <Th>Tarief apo.</Th>
                <Th>Bedrag apo.</Th>
              </tr>
            </Thead>
            <Tbody>
              {approvedFiltered.length === 0
                ? <EmptyRow colSpan={9} message="Geen goedgekeurde prestaties voor deze maand." />
                : approvedFiltered.map(s => {
                  const hours        = calcHours(s.startTime, s.endTime, s.breakMinutes)
                  const rateAss      = s.hourlyRateAssistant ?? config.defaultRateAssistant
                  const rateApo      = s.hourlyRatePharmacy  ?? config.defaultRatePharmacy
                  const amountAss    = hours * rateAss
                  const amountApo    = hours * rateApo
                  const noRateAss    = s.hourlyRateAssistant === null
                  const noRateApo    = s.hourlyRatePharmacy  === null
                  return (
                    <Tr key={s.id}>
                      <Td>
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                          checked={checkedIds.has(s.id)}
                          onChange={() => toggleCheck(s.id)}
                        />
                      </Td>
                      <Td>{fmtDate(s.date)}</Td>
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          {s.assistantName}
                        </div>
                      </Td>
                      <Td>
                        <span className="text-text">{s.pharmacyName}</span>
                        <span className="text-text-muted"> — {s.locationName}</span>
                      </Td>
                      <Td>{fmtHours(hours)}</Td>
                      <Td className={noRateAss ? 'text-warning' : ''}>
                        {fmtMoney(rateAss)}/u{noRateAss ? '*' : ''}
                      </Td>
                      <Td className="font-medium">{fmtMoney(amountAss)}</Td>
                      <Td className={noRateApo ? 'text-warning' : ''}>
                        {fmtMoney(rateApo)}/u{noRateApo ? '*' : ''}
                      </Td>
                      <Td className="font-medium">{fmtMoney(amountApo)}</Td>
                    </Tr>
                  )
                })
              }
            </Tbody>
          </Table>

          {/* Totals footer */}
          {approvedFiltered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-slate-50 text-sm">
              <div className="text-text-muted text-xs">
                * Geen specifiek tarief voor dit koppel — standaardtarief gebruikt
              </div>
              <div className="flex gap-8 font-medium text-text">
                <span>
                  Totaal assistent:{' '}
                  <strong>
                    {fmtMoney(approvedFiltered.reduce((sum, s) => {
                      const h = calcHours(s.startTime, s.endTime, s.breakMinutes)
                      return sum + h * (s.hourlyRateAssistant ?? config.defaultRateAssistant)
                    }, 0))}
                  </strong>
                </span>
                <span>
                  Totaal apotheek:{' '}
                  <strong>
                    {fmtMoney(approvedFiltered.reduce((sum, s) => {
                      const h = calcHours(s.startTime, s.endTime, s.breakMinutes)
                      return sum + h * (s.hourlyRatePharmacy ?? config.defaultRatePharmacy)
                    }, 0))}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Edit modal ──────────────────────────────────────────────────── */}
      {editShift && (
        <ShiftEditModal
          shift={toShiftData(editShift)}
          onClose={() => setEditShift(null)}
        />
      )}
    </>
  )
}
