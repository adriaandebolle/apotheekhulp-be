'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import CreateInvoiceModal from '../CreateInvoiceModal'
import { updateInvoiceStatus, deleteInvoice } from '@/lib/actions/invoices'
import type { ApotheekUninvoicedRow, InvoiceRow } from './page'

function fmtMoney(n: number) {
  return new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR' }).format(n)
}
function fmtHours(h: number) { return h.toFixed(2).replace('.', ',') + ' u' }
function fmtMonth(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })
}
function fmtDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('nl-BE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
}

function InvoiceActions({ inv }: { inv: InvoiceRow }) {
  const router = useRouter()
  const [acting, startTransition] = useTransition()
  const [confirmDel, setConfirmDel] = useState(false)

  function handleStatusToggle() {
    const next = inv.status === 'betaald' ? 'te_betalen' : 'betaald'
    startTransition(async () => { await updateInvoiceStatus(inv.id, next); router.refresh() })
  }
  function handleDelete() {
    startTransition(async () => { await deleteInvoice(inv.id); router.refresh(); setConfirmDel(false) })
  }

  if (confirmDel) return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-text-muted">Verwijderen?</span>
      <Button size="sm" variant="danger" loading={acting} onClick={handleDelete}>Ja</Button>
      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(false)}>Nee</Button>
    </div>
  )

  return (
    <div className="flex items-center gap-1.5">
      <Button size="sm" variant="secondary" loading={acting} onClick={handleStatusToggle}>
        {inv.status === 'betaald' ? 'Markeer TE BETALEN' : 'Markeer betaald'}
      </Button>
      <a
        href={`/api/pdf/apotheek?invoice_id=${inv.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-primary border border-primary rounded-md hover:bg-primary-light transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        PDF
      </a>
      <Button size="sm" variant="ghost" onClick={() => setConfirmDel(true)}>Verwijderen</Button>
    </div>
  )
}

export default function FacturenApotheekClient({
  uninvoicedRows,
  invoiceRows,
  month,
  months,
}: {
  uninvoicedRows: ApotheekUninvoicedRow[]
  invoiceRows:    InvoiceRow[]
  month:          string
  months:         string[]
}) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  const [modalRow, setModalRow] = useState<ApotheekUninvoicedRow | null>(null)

  function setMonth(m: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('month', m)
    router.push(`${pathname}?${params}`)
  }

  const totalUninvoiced = uninvoicedRows.reduce((s, r) => s + r.total, 0)
  const totalInvoiced   = invoiceRows.reduce((s, r) => s + r.total, 0)
  const totalBetaald    = invoiceRows.filter(r => r.status === 'betaald').reduce((s, r) => s + r.total, 0)

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
        <div>
          <p className="text-xs text-text-muted mb-1">Facturen</p>
          <h1 className="text-2xl font-bold text-text">Apotheken</h1>
        </div>
        <select
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-2 bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {months.map(mo => <option key={mo} value={mo}>{fmtMonth(mo)}</option>)}
          {months.length === 0 && <option value={month}>{fmtMonth(month)}</option>}
        </select>
      </div>

      <div className="px-8 py-6 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Nog te factureren',    value: fmtMoney(totalUninvoiced), color: 'text-warning' },
            { label: 'Gefactureerd deze maand', value: fmtMoney(totalInvoiced) },
            { label: 'Betaald',              value: fmtMoney(totalBetaald),    color: 'text-success' },
          ].map(card => (
            <div key={card.label} className="bg-white border border-border rounded-lg px-5 py-4">
              <p className="text-xs text-text-muted mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color ?? 'text-text'}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* Nog te factureren */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-border">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Nog te factureren</h2>
            <span className="text-xs font-semibold bg-warning text-white rounded-full px-2 py-0.5 leading-none">
              {uninvoicedRows.length}
            </span>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Apotheek</Th>
                <Th>Assistent(en)</Th>
                <Th className="text-right">Shifts</Th>
                <Th className="text-right">Uren</Th>
                <Th className="text-right">Excl. BTW</Th>
                <Th className="text-right">BTW</Th>
                <Th className="text-right">Totaal</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {uninvoicedRows.length === 0
                ? <EmptyRow colSpan={8} message={`Alle shifts voor ${fmtMonth(month)} zijn gefactureerd.`} />
                : uninvoicedRows.map(row => (
                  <Tr key={row.id}>
                    <Td className="font-medium">{row.companyName}</Td>
                    <Td className="text-text-muted">{row.assistantNames.join(', ') || '—'}</Td>
                    <Td className="text-right">{row.shiftCount}</Td>
                    <Td className="text-right">{fmtHours(row.totalHours)}</Td>
                    <Td className="text-right">{fmtMoney(row.subtotal)}</Td>
                    <Td className="text-right">{fmtMoney(row.btwAmount)}</Td>
                    <Td className="text-right font-semibold">{fmtMoney(row.total)}</Td>
                    <Td>
                      <Button size="sm" onClick={() => setModalRow(row)}>
                        Maak factuur
                      </Button>
                    </Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
        </div>

        {/* Bestaande facturen */}
        <div className="bg-white border border-border rounded-lg overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-border">
            <h2 className="text-sm font-semibold text-text uppercase tracking-wide">Facturen</h2>
            <span className="text-xs font-semibold bg-primary text-white rounded-full px-2 py-0.5 leading-none">
              {invoiceRows.length}
            </span>
          </div>
          <Table>
            <Thead>
              <tr>
                <Th>Factuurnr</Th>
                <Th>Datum</Th>
                <Th>Apotheek</Th>
                <Th className="text-right">Shifts</Th>
                <Th className="text-right">Excl. BTW</Th>
                <Th className="text-right">BTW</Th>
                <Th className="text-right">Totaal</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </Thead>
            <Tbody>
              {invoiceRows.length === 0
                ? <EmptyRow colSpan={9} message={`Geen facturen voor ${fmtMonth(month)}.`} />
                : invoiceRows.map(inv => (
                  <Tr key={inv.id}>
                    <Td className="font-mono text-sm">{inv.invoiceNumber}</Td>
                    <Td>{fmtDate(inv.invoiceDate)}</Td>
                    <Td className="font-medium">{inv.recipientName}</Td>
                    <Td className="text-right">{inv.shiftCount}</Td>
                    <Td className="text-right">{fmtMoney(inv.subtotal)}</Td>
                    <Td className="text-right">{fmtMoney(inv.vatAmount)}</Td>
                    <Td className="text-right font-semibold">{fmtMoney(inv.total)}</Td>
                    <Td>
                      <Badge variant={inv.status === 'betaald' ? 'success' : 'warning'}>
                        {inv.status === 'betaald' ? 'Betaald' : 'Te betalen'}
                      </Badge>
                    </Td>
                    <Td><InvoiceActions inv={inv} /></Td>
                  </Tr>
                ))
              }
            </Tbody>
          </Table>
          {invoiceRows.length > 0 && (
            <div className="flex items-center justify-end gap-8 px-6 py-3 border-t border-border bg-slate-50 text-sm font-medium text-text">
              <span>Gefactureerd: <strong>{fmtMoney(totalInvoiced)}</strong></span>
              <span className="text-success">Betaald: <strong>{fmtMoney(totalBetaald)}</strong></span>
              <span className="text-warning">Openstaand: <strong>{fmtMoney(totalInvoiced - totalBetaald)}</strong></span>
            </div>
          )}
        </div>
      </div>

      {modalRow && (
        <CreateInvoiceModal
          type="apotheek"
          recipientId={modalRow.id}
          recipientName={modalRow.companyName}
          shifts={modalRow.shifts}
          vatLiable={modalRow.vatLiable}
          suggestedInvoiceNumber={modalRow.suggestedInvoiceNumber ?? undefined}
          onClose={() => setModalRow(null)}
        />
      )}
    </>
  )
}
