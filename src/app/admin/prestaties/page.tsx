import { createAdminClient } from '@/lib/supabase/admin'
import PrestatiesClient from './PrestatiesClient'
import type { Assistent, PharmacyOption } from '../kalender/page'

const ASSISTENT_COLORS = [
  '#3788d8', '#28a745', '#fd7e14', '#6f42c1', '#20c997',
  '#e83e8c', '#17a2b8', '#dc3545', '#ffc107', '#0d6efd',
  '#198754', '#6610f2', '#d63384', '#0dcaf0', '#6c757d',
]

const PAGE = 25

const SHIFT_SELECT = `
  id, assistant_id, location_id, date, start_time, end_time, break_minutes, status, notes,
  assistent_invoice_id, apotheek_invoice_id,
  assistant:users(first_name, last_name, color),
  location:locations(name, pharmacy:pharmacy_profiles(company_name))
`

export type PrestatieShift = {
  id: string
  assistantId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  status: 'pending_assistant' | 'pending_apotheek' | 'approved' | 'denied'
  notes: string | null
  assistantName: string
  pharmacyName: string
  locationName: string
  hourlyRateAssistant: number | null
  hourlyRatePharmacy: number | null
  color: string
  assistentInvoiceId: string | null
  apotheekInvoiceId:  string | null
}

export type PlatformConfig = {
  defaultRateAssistant: number
  defaultRatePharmacy: number
}

export default async function PrestatiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const page1 = Math.max(0, parseInt(params.p1 ?? '0', 10) || 0)
  const page2 = Math.max(0, parseInt(params.p2 ?? '0', 10) || 0)
  const page3 = Math.max(0, parseInt(params.p3 ?? '0', 10) || 0)
  const month = params.month ?? new Date().toISOString().slice(0, 7)

  const [y, m] = month.split('-').map(Number)
  const monthStart = `${month}-01`
  const monthEnd   = new Date(Date.UTC(y, m, 0)).toISOString().split('T')[0]

  const supabase = createAdminClient()

  const [
    { data: raw1, count: count1 },
    { data: raw2, count: count2 },
    { data: raw3, count: count3 },
    { data: monthDates },
    { data: rawLinks },
    { data: config },
    { data: rawAssistants },
    { data: rawPharmacies },
  ] = await Promise.all([
    supabase.from('shifts').select(SHIFT_SELECT, { count: 'exact' })
      .eq('status', 'pending_assistant').is('deleted_at', null)
      .order('date', { ascending: true })
      .range(page1 * PAGE, page1 * PAGE + PAGE - 1),
    supabase.from('shifts').select(SHIFT_SELECT, { count: 'exact' })
      .eq('status', 'pending_apotheek').is('deleted_at', null)
      .order('date', { ascending: true })
      .range(page2 * PAGE, page2 * PAGE + PAGE - 1),
    supabase.from('shifts').select(SHIFT_SELECT, { count: 'exact' })
      .eq('status', 'approved').is('deleted_at', null)
      .gte('date', monthStart).lte('date', monthEnd)
      .order('date', { ascending: false })
      .range(page3 * PAGE, page3 * PAGE + PAGE - 1),
    supabase.from('shifts').select('date').eq('status', 'approved').is('deleted_at', null)
      .order('date', { ascending: false }).limit(2000),
    supabase.from('links').select('assistant_id, location_id, hourly_rate_assistant, hourly_rate_pharmacy')
      .is('deleted_at', null),
    supabase.from('platform_config').select('default_hourly_rate_assistant, default_hourly_rate_pharmacy').single(),
    supabase.from('users').select('id, first_name, last_name, color').eq('role', 'assistent').eq('is_active', true).order('last_name'),
    supabase.from('pharmacy_profiles').select('user_id, company_name, locations(id, name)')
      .order('company_name')
      .filter('locations.is_active', 'eq', true)
      .filter('locations.deleted_at', 'is', null),
  ])

  const linkMap = new Map<string, { rateAssistant: number | null; ratePharmacy: number | null }>()
  for (const link of rawLinks ?? []) {
    linkMap.set(`${link.assistant_id}:${link.location_id}`, {
      rateAssistant: link.hourly_rate_assistant ?? null,
      ratePharmacy:  link.hourly_rate_pharmacy  ?? null,
    })
  }

  const platformConfig: PlatformConfig = {
    defaultRateAssistant: config?.default_hourly_rate_assistant ?? 0,
    defaultRatePharmacy:  config?.default_hourly_rate_pharmacy  ?? 0,
  }

  const assistants: Assistent[] = (rawAssistants ?? []).map((a, i) => ({
    id:         a.id,
    first_name: a.first_name,
    last_name:  a.last_name,
    color:      (a.color as string | null) ?? ASSISTENT_COLORS[i % ASSISTENT_COLORS.length],
  }))

  const colorById = new Map(assistants.map(a => [a.id, a.color]))

  function mapShift(s: NonNullable<typeof raw1>[number]): PrestatieShift {
    const asst = s.assistant as unknown as { first_name: string | null; last_name: string | null; color: string | null } | null
    const loc  = s.location  as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    const link = linkMap.get(`${s.assistant_id}:${s.location_id}`)
    return {
      id:            s.id,
      assistantId:   s.assistant_id,
      locationId:    s.location_id,
      date:          s.date,
      startTime:     s.start_time,
      endTime:       s.end_time,
      breakMinutes:  s.break_minutes,
      status:        s.status as PrestatieShift['status'],
      notes:         (s.notes as string | null) ?? null,
      assistantName: [asst?.first_name, asst?.last_name].filter(Boolean).join(' ') || '—',
      pharmacyName:  loc?.pharmacy?.company_name ?? '—',
      locationName:  loc?.name ?? '—',
      hourlyRateAssistant: link?.rateAssistant ?? null,
      hourlyRatePharmacy:  link?.ratePharmacy  ?? null,
      color:              colorById.get(s.assistant_id) ?? asst?.color ?? '#6c757d',
      assistentInvoiceId: (s.assistent_invoice_id as string | null) ?? null,
      apotheekInvoiceId:  (s.apotheek_invoice_id  as string | null) ?? null,
    }
  }

  const months = [...new Set((monthDates ?? []).map(r => r.date.slice(0, 7)))].sort().reverse()

  const pharmacies: PharmacyOption[] = (rawPharmacies ?? []).map(p => {
    const locs = p.locations as unknown as { id: string; name: string }[]
    return {
      id:           p.user_id,
      company_name: p.company_name ?? '—',
      locations:    (locs ?? []).map(l => ({ id: l.id, name: l.name })),
    }
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PrestatiesClient
        section1={{ shifts: (raw1 ?? []).map(mapShift), total: count1 ?? 0, page: page1 }}
        section2={{ shifts: (raw2 ?? []).map(mapShift), total: count2 ?? 0, page: page2 }}
        section3={{ shifts: (raw3 ?? []).map(mapShift), total: count3 ?? 0, page: page3, month, months }}
        config={platformConfig}
        assistants={assistants}
        pharmacies={pharmacies}
        pageSize={PAGE}
      />
    </div>
  )
}
