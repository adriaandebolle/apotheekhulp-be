import { createClient } from '@/lib/supabase/server'
import FacturenAssistentClient from './FacturenAssistentClient'
import { calcHours, BTW_RATE } from '@/lib/pdf/pdf-utils'
import type { ModalShift } from '../CreateInvoiceModal'

export type AssistentUninvoicedRow = {
  id:                     string
  firstName:              string
  lastName:               string
  pharmacyNames:          string[]
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

export default async function FacturenAssistentPage({
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
    { data: rawUninvoiced },
    { data: rawLinks },
    { data: config },
    { data: rawUsers },
    { data: rawProfiles },
    { data: monthDates },
    { data: rawLocations },
    { data: rawInvoices },
  ] = await Promise.all([
    // Uninvoiced approved shifts for the month
    supabase.from('shifts')
      .select('id, assistant_id, location_id, date, start_time, end_time, break_minutes')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .is('assistent_invoice_id', null)
      .gte('date', monthStart)
      .lte('date', monthEnd),
    supabase.from('links')
      .select('assistant_id, location_id, hourly_rate_assistant')
      .is('deleted_at', null),
    supabase.from('platform_config')
      .select('default_hourly_rate_assistant')
      .single(),
    supabase.from('users')
      .select('id, first_name, last_name')
      .eq('role', 'assistent')
      .eq('is_active', true)
      .order('last_name'),
    supabase.from('assistant_profiles')
      .select('user_id, vat_liable, invoice_prefix, invoice_next_number'),
    supabase.from('shifts')
      .select('date')
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('date', { ascending: false })
      .limit(2000),
    supabase.from('locations')
      .select('id, pharmacy:pharmacy_profiles(company_name)')
      .is('deleted_at', null),
    // Invoices for this month (by invoice_date)
    supabase.from('invoices')
      .select(`
        id, invoice_number, invoice_date, recipient_id, status,
        subtotal, vat_amount, total,
        shifts!assistent_invoice_id(id)
      `)
      .eq('type', 'assistent')
      .gte('invoice_date', monthStart)
      .lte('invoice_date', monthEnd)
      .order('invoice_date', { ascending: false }),
  ])

  type ProfileRow = { vat_liable: boolean | null; invoice_prefix: string | null; invoice_next_number: number | null }
  const profileByUser = new Map<string, ProfileRow>(
    (rawProfiles ?? []).map(p => [p.user_id, p as ProfileRow])
  )

  const pharmacyByLocation = new Map<string, string>()
  for (const loc of rawLocations ?? []) {
    const pharm = loc.pharmacy as unknown as { company_name: string | null } | null
    if (pharm?.company_name) pharmacyByLocation.set(loc.id, pharm.company_name)
  }

  const rateByKey = new Map<string, number>()
  for (const link of rawLinks ?? []) {
    if (link.hourly_rate_assistant !== null) {
      rateByKey.set(`${link.assistant_id}:${link.location_id}`, link.hourly_rate_assistant)
    }
  }
  const defaultRate = config?.default_hourly_rate_assistant ?? 0

  // Group uninvoiced shifts by assistant
  const shiftsByAssistant = new Map<string, typeof rawUninvoiced>()
  for (const shift of rawUninvoiced ?? []) {
    const arr = shiftsByAssistant.get(shift.assistant_id) ?? []
    arr.push(shift)
    shiftsByAssistant.set(shift.assistant_id, arr)
  }

  const uninvoicedRows: AssistentUninvoicedRow[] = []
  for (const u of rawUsers ?? []) {
    const shifts = shiftsByAssistant.get(u.id)
    if (!shifts || shifts.length === 0) continue

    const profile   = profileByUser.get(u.id)
    const vatLiable = profile?.vat_liable ?? true
    const invPrefix = profile?.invoice_prefix ?? null
    const invNext   = profile?.invoice_next_number ?? 1
    const suggestedInvoiceNumber = invPrefix
      ? `${invPrefix}-${String(invNext).padStart(3, '0')}`
      : null

    let totalHours = 0
    let subtotal   = 0
    const seenPharmacies = new Set<string>()
    const modalShifts: ModalShift[] = []

    for (const s of shifts) {
      const hours = calcHours(s.start_time, s.end_time, s.break_minutes)
      const rate  = rateByKey.get(`${s.assistant_id}:${s.location_id}`) ?? defaultRate
      totalHours += hours
      subtotal   += hours * rate
      const pName = pharmacyByLocation.get(s.location_id) ?? '—'
      seenPharmacies.add(pName)
      modalShifts.push({
        id:            s.id,
        date:          s.date,
        pharmacyName:  pName,
        assistantName: '',
        locationName:  '',
        startTime:     s.start_time,
        endTime:       s.end_time,
        breakMinutes:  s.break_minutes,
        hourlyRate:    rate,
      })
    }
    const btwAmount = vatLiable ? subtotal * BTW_RATE : 0

    uninvoicedRows.push({
      id:            u.id,
      firstName:     u.first_name ?? '',
      lastName:      u.last_name  ?? '',
      pharmacyNames: [...seenPharmacies].sort(),
      vatLiable,
      shiftCount:    shifts.length,
      totalHours,
      subtotal,
      btwAmount,
      total: subtotal + btwAmount,
      shifts: modalShifts.sort((a, b) => a.date.localeCompare(b.date)),
      suggestedInvoiceNumber,
    })
  }

  // Build name lookup for invoices
  const nameById = new Map((rawUsers ?? []).map(u => [
    u.id,
    [u.first_name, u.last_name].filter(Boolean).join(' '),
  ]))

  const invoiceRows: InvoiceRow[] = (rawInvoices ?? []).map(inv => {
    const shiftArr = inv.shifts as unknown as { id: string }[]
    return {
      id:            inv.id,
      invoiceNumber: inv.invoice_number,
      invoiceDate:   inv.invoice_date,
      recipientId:   inv.recipient_id,
      recipientName: nameById.get(inv.recipient_id) ?? '—',
      shiftCount:    shiftArr?.length ?? 0,
      subtotal:      Number(inv.subtotal),
      vatAmount:     Number(inv.vat_amount),
      total:         Number(inv.total),
      status:        inv.status as InvoiceRow['status'],
    }
  })

  const months = [...new Set((monthDates ?? []).map(r => r.date.slice(0, 7)))].sort().reverse()

  return (
    <FacturenAssistentClient
      uninvoicedRows={uninvoicedRows}
      invoiceRows={invoiceRows}
      month={month}
      months={months}
    />
  )
}
