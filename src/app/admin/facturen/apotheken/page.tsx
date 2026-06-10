import { createClient } from '@/lib/supabase/server'
import FacturenApotheekClient from './FacturenApotheekClient'
import { calcHours, BTW_RATE } from '@/lib/pdf/pdf-utils'
import type { ModalShift } from '../CreateInvoiceModal'

export type ApotheekUninvoicedRow = {
  id:                     string
  companyName:            string
  assistantNames:         string[]
  vatLiable:              boolean
  shiftCount:             number
  totalHours:             number
  subtotal:               number
  btwAmount:              number
  total:                  number
  shifts:                 ModalShift[]
  suggestedInvoiceNumber: string | null
}

export type InvoiceRow = {
  id:            string
  invoiceNumber: string
  invoiceDate:   string
  recipientId:   string
  recipientName: string
  shiftCount:    number
  subtotal:      number
  vatAmount:     number
  total:         number
  status:        'te_betalen' | 'betaald'
}

export default async function FacturenApotheekPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const month  = params.month ?? new Date().toISOString().slice(0, 7)

  const [y, m] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd   = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]

  const supabase = await createClient()

  const [
    { data: rawLinks },
    { data: config },
    { data: rawPharmacies },
    { data: rawLocations },
    { data: monthDates },
    { data: rawInvoices },
    { data: rawUsers },
  ] = await Promise.all([
    supabase.from('links')
      .select('assistant_id, location_id, hourly_rate_pharmacy')
      .is('deleted_at', null),
    supabase.from('platform_config')
      .select('default_hourly_rate_pharmacy, invoice_prefix, invoice_next_number')
      .single(),
    supabase.from('pharmacy_profiles')
      .select('user_id, company_name, vat_liable')
      .order('company_name'),
    supabase.from('locations')
      .select('id, pharmacy_id')
      .is('deleted_at', null),
    supabase.rpc('get_shift_months'),
    supabase.from('invoices')
      .select('id, invoice_number, invoice_date, recipient_id, status, subtotal, vat_amount, total, shifts!apotheek_invoice_id(id)')
      .eq('type', 'apotheek')
      .gte('invoice_date', monthStart)
      .lte('invoice_date', monthEnd)
      .order('invoice_date', { ascending: false }),
    supabase.from('users')
      .select('id, first_name, last_name')
      .eq('role', 'assistent')
      .eq('is_active', true),
  ])

  const locationsByPharmacy = new Map<string, string[]>()
  for (const loc of rawLocations ?? []) {
    const arr = locationsByPharmacy.get(loc.pharmacy_id) ?? []
    arr.push(loc.id)
    locationsByPharmacy.set(loc.pharmacy_id, arr)
  }

  const rateByKey = new Map<string, number>()
  for (const link of rawLinks ?? []) {
    if (link.hourly_rate_pharmacy !== null) {
      rateByKey.set(`${link.assistant_id}:${link.location_id}`, link.hourly_rate_pharmacy)
    }
  }
  const defaultRate = config?.default_hourly_rate_pharmacy ?? 0
  const invoicePrefix     = config?.invoice_prefix ?? null
  let   invoiceNextNumber = config?.invoice_next_number ?? 1

  const assistantNameById = new Map((rawUsers ?? []).map(u => [
    u.id,
    [u.first_name, u.last_name].filter(Boolean).join(' '),
  ]))

  const allLocationIds = [...new Set((rawLocations ?? []).map(l => l.id))]

  const { data: allUninvoicedShifts } = allLocationIds.length > 0
    ? await supabase
        .from('shifts')
        .select('id, assistant_id, location_id, date, start_time, end_time, break_minutes')
        .eq('status', 'approved')
        .is('deleted_at', null)
        .is('apotheek_invoice_id', null)
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .in('location_id', allLocationIds)
    : { data: [] }

  type UninvoicedShift = NonNullable<typeof allUninvoicedShifts>[number]
  const shiftsByLocation = new Map<string, UninvoicedShift[]>()
  for (const s of allUninvoicedShifts ?? []) {
    const arr = shiftsByLocation.get(s.location_id) ?? []
    arr.push(s)
    shiftsByLocation.set(s.location_id, arr)
  }

  const uninvoicedRows: ApotheekUninvoicedRow[] = []

  for (const p of rawPharmacies ?? []) {
    const locationIds = locationsByPharmacy.get(p.user_id)
    if (!locationIds || locationIds.length === 0) continue

    const rawShifts = locationIds.flatMap(lid => shiftsByLocation.get(lid) ?? [])

    if (rawShifts.length === 0) continue

    const vatLiable = p.vat_liable ?? true
    let totalHours = 0
    let subtotal   = 0
    const seenAssistants = new Set<string>()
    const modalShifts: ModalShift[] = []

    for (const s of rawShifts) {
      const hours = calcHours(s.start_time, s.end_time, s.break_minutes)
      const rate  = rateByKey.get(`${s.assistant_id}:${s.location_id}`) ?? defaultRate
      totalHours += hours
      subtotal   += hours * rate
      const aName = assistantNameById.get(s.assistant_id) ?? '—'
      seenAssistants.add(aName)
      modalShifts.push({
        id:            s.id,
        date:          s.date,
        pharmacyName:  '',
        assistantName: aName,
        locationName:  '',
        startTime:     s.start_time,
        endTime:       s.end_time,
        breakMinutes:  s.break_minutes,
        hourlyRate:    rate,
      })
    }
    const btwAmount = vatLiable ? subtotal * BTW_RATE : 0

    uninvoicedRows.push({
      id:             p.user_id,
      companyName:    p.company_name ?? '—',
      assistantNames: [...seenAssistants].sort(),
      vatLiable,
      shiftCount:     rawShifts.length,
      totalHours,
      subtotal,
      btwAmount,
      total: subtotal + btwAmount,
      shifts: modalShifts.sort((a, b) => a.date.localeCompare(b.date)),
      suggestedInvoiceNumber: invoicePrefix
        ? `${invoicePrefix}-${String(invoiceNextNumber++).padStart(3, '0')}`
        : null,
    })
  }

  const pharmacyNameById = new Map((rawPharmacies ?? []).map(p => [p.user_id, p.company_name ?? '—']))

  const invoiceRows: InvoiceRow[] = (rawInvoices ?? []).map(inv => {
    const shiftArr = inv.shifts as unknown as { id: string }[]
    return {
      id:            inv.id,
      invoiceNumber: inv.invoice_number,
      invoiceDate:   inv.invoice_date,
      recipientId:   inv.recipient_id,
      recipientName: pharmacyNameById.get(inv.recipient_id) ?? '—',
      shiftCount:    shiftArr?.length ?? 0,
      subtotal:      Number(inv.subtotal),
      vatAmount:     Number(inv.vat_amount),
      total:         Number(inv.total),
      status:        inv.status as InvoiceRow['status'],
    }
  })

  const months = (monthDates as { month: string }[] | null ?? []).map(r => r.month)

  return (
    <FacturenApotheekClient
      uninvoicedRows={uninvoicedRows}
      invoiceRows={invoiceRows}
      month={month}
      months={months}
    />
  )
}
