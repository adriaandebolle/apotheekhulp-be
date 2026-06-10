import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from '@/lib/effective-user-id'
import KalenderAssistentWrapper from './KalenderAssistentWrapper'

export type ShiftData = {
  id:           string
  date:         string
  startTime:    string
  endTime:      string
  breakMinutes: number
  status:       'pending_assistant' | 'pending_apotheek' | 'approved' | 'denied'
  pharmacyName: string
  locationName: string
}

function dateRange() {
  const now   = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  const end   = new Date(now.getFullYear(), now.getMonth() + 4, 0)
  return {
    start: start.toISOString().split('T')[0],
    end:   end.toISOString().split('T')[0],
  }
}

export default async function AssistentKalenderPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const effectiveId = await getEffectiveUserId(user.id)
  const admin = await createClient()
  const { start, end } = dateRange()

  const { data: rawShifts } = await admin
    .from('shifts')
    .select(`
      id, date, start_time, end_time, break_minutes, status,
      location:locations(name, pharmacy:pharmacy_profiles(company_name))
    `)
    .eq('assistant_id', effectiveId)
    .is('deleted_at', null)
    .gte('date', start)
    .lte('date', end)

  const shifts: ShiftData[] = (rawShifts ?? []).map(s => {
    const loc = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    return {
      id:           s.id,
      date:         s.date,
      startTime:    s.start_time,
      endTime:      s.end_time,
      breakMinutes: s.break_minutes,
      status:       s.status as ShiftData['status'],
      pharmacyName: loc?.pharmacy?.company_name ?? '—',
      locationName: loc?.name ?? '—',
    }
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <KalenderAssistentWrapper shifts={shifts} />
    </div>
  )
}
