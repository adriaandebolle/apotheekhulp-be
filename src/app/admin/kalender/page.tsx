import { createAdminClient } from '@/lib/supabase/admin'
import KalenderWrapper from './KalenderWrapper'

const ASSISTENT_COLORS = [
  '#3788d8', '#28a745', '#fd7e14', '#6f42c1', '#20c997',
  '#e83e8c', '#17a2b8', '#dc3545', '#ffc107', '#0d6efd',
  '#198754', '#6610f2', '#d63384', '#0dcaf0', '#6c757d',
]

function dateRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 4, 0)
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  }
}

export type Assistent = {
  id: string
  first_name: string | null
  last_name: string | null
  color: string
}

export type LocationOption = {
  id: string
  name: string
}

export type PharmacyOption = {
  id: string
  company_name: string
  locations: LocationOption[]
}

export type ShiftData = {
  id: string
  assistantId: string
  locationId: string
  date: string
  startTime: string
  endTime: string
  breakMinutes: number
  status: 'pending_assistant' | 'pending_apotheek' | 'approved' | 'denied'
  assistantName: string
  pharmacyName: string
  locationName: string
  color: string
}

export default async function KalenderPage() {
  const supabase = createAdminClient()
  const { start, end } = dateRange()

  const [{ data: rawAssistants }, { data: rawShifts }, { data: rawPharmacies }] = await Promise.all([
    supabase
      .from('users')
      .select('id, first_name, last_name, color')
      .eq('role', 'assistent')
      .eq('is_active', true)
      .order('last_name'),
    supabase
      .from('shifts')
      .select(`
        id, assistant_id, location_id, date, start_time, end_time, break_minutes, status,
        assistant:users(first_name, last_name, color),
        location:locations(name, pharmacy:pharmacy_profiles(company_name))
      `)
      .is('deleted_at', null)
      .gte('date', start)
      .lte('date', end),
    supabase
      .from('pharmacy_profiles')
      .select(`
        user_id, company_name,
        locations(id, name)
      `)
      .order('company_name')
      .filter('locations.is_active', 'eq', true)
      .filter('locations.deleted_at', 'is', null),
  ])

  const assistants: Assistent[] = (rawAssistants ?? []).map((a, i) => ({
    id:         a.id,
    first_name: a.first_name,
    last_name:  a.last_name,
    color:      (a.color as string | null) ?? ASSISTENT_COLORS[i % ASSISTENT_COLORS.length],
  }))

  const colorById = new Map(assistants.map(a => [a.id, a.color]))

  const shifts: ShiftData[] = (rawShifts ?? []).map(s => {
    const asst = s.assistant as unknown as { first_name: string | null; last_name: string | null } | null
    const loc  = s.location  as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    return {
      id:            s.id,
      assistantId:   s.assistant_id,
      locationId:    s.location_id,
      date:          s.date,
      startTime:     s.start_time,
      endTime:       s.end_time,
      breakMinutes:  s.break_minutes,
      status:        s.status as ShiftData['status'],
      assistantName: [asst?.first_name, asst?.last_name].filter(Boolean).join(' ') || '—',
      pharmacyName:  loc?.pharmacy?.company_name ?? '—',
      locationName:  loc?.name ?? '—',
      color:         colorById.get(s.assistant_id) ?? '#6c757d',
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
      <KalenderWrapper assistants={assistants} shifts={shifts} pharmacies={pharmacies} />
    </div>
  )
}
