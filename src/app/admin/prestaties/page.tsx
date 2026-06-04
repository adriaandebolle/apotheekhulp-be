import { createAdminClient } from '@/lib/supabase/admin'
import PrestatiesClient from './PrestatiesClient'
import type { Assistent, PharmacyOption } from '../kalender/page'

const ASSISTENT_COLORS = [
  '#3788d8', '#28a745', '#fd7e14', '#6f42c1', '#20c997',
  '#e83e8c', '#17a2b8', '#dc3545', '#ffc107', '#0d6efd',
  '#198754', '#6610f2', '#d63384', '#0dcaf0', '#6c757d',
]

export type PrestatieShift = {
  id: string
  assistantId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  status: 'pending_assistant' | 'confirmed' | 'pending_admin' | 'approved' | 'denied'
  notes: string | null
  assistantName: string
  pharmacyName: string
  locationName: string
  hourlyRateAssistant: number | null
  hourlyRatePharmacy: number | null
  color: string
}

export type PlatformConfig = {
  defaultRateAssistant: number
  defaultRatePharmacy: number
}

export default async function PrestatiesPage() {
  const supabase = createAdminClient()

  const [
    { data: rawShifts },
    { data: rawLinks },
    { data: config },
    { data: rawAssistants },
    { data: rawPharmacies },
  ] = await Promise.all([
    supabase
      .from('shifts')
      .select(`
        id, assistant_id, location_id, date, start_time, end_time, break_minutes, status, notes,
        assistant:users(first_name, last_name, color),
        location:locations(name, pharmacy:pharmacy_profiles(company_name))
      `)
      .is('deleted_at', null)
      .order('date', { ascending: false }),
    supabase
      .from('links')
      .select('assistant_id, location_id, hourly_rate_assistant, hourly_rate_pharmacy')
      .is('deleted_at', null),
    supabase
      .from('platform_config')
      .select('default_hourly_rate_assistant, default_hourly_rate_pharmacy')
      .single(),
    supabase
      .from('users')
      .select('id, first_name, last_name, color')
      .eq('role', 'assistent')
      .eq('is_active', true)
      .order('last_name'),
    supabase
      .from('pharmacy_profiles')
      .select('user_id, company_name, locations(id, name)')
      .order('company_name')
      .filter('locations.is_active', 'eq', true)
      .filter('locations.deleted_at', 'is', null),
  ])

  // Build link rate lookup: "assistantId:locationId" → rates
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

  const shifts: PrestatieShift[] = (rawShifts ?? []).map(s => {
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
      color:         colorById.get(s.assistant_id) ?? asst?.color ?? '#6c757d',
    }
  })

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
        shifts={shifts}
        config={platformConfig}
        assistants={assistants}
        pharmacies={pharmacies}
      />
    </div>
  )
}
