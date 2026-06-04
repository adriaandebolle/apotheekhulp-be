import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import PrestatiesAssistentClient, { type AssistentShift } from './PrestatiesAssistentClient'

export default async function AssistentPrestatiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Admin client needed because pharmacy_profiles has no RLS policy for assistants.
  // The assistant_id filter below limits results to the current user's shifts only.
  const adminSupabase = createAdminClient()
  const { data: rawShifts } = await adminSupabase
    .from('shifts')
    .select(`
      id, date, start_time, end_time, break_minutes, status, notes,
      location:locations(name, pharmacy:pharmacy_profiles(company_name))
    `)
    .eq('assistant_id', user.id)
    .is('deleted_at', null)
    .order('date', { ascending: false })

  const shifts: AssistentShift[] = (rawShifts ?? []).map(s => {
    const loc = s.location as unknown as { name: string; pharmacy: { company_name: string | null } | null } | null
    return {
      id:           s.id,
      date:         s.date,
      startTime:    s.start_time,
      endTime:      s.end_time,
      breakMinutes: s.break_minutes,
      status:       s.status,
      pharmacyName: loc?.pharmacy?.company_name ?? '—',
      locationName: loc?.name ?? '—',
      notes:        (s.notes as string | null) ?? null,
    }
  })

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PrestatiesAssistentClient shifts={shifts} />
    </div>
  )
}
