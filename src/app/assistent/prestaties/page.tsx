import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUserId } from '@/lib/effective-user-id'
import PrestatiesAssistentClient, { type AssistentShift } from './PrestatiesAssistentClient'

const PAGE = 25

const SHIFT_SELECT = `
  id, date, start_time, end_time, break_minutes, status, notes,
  location:locations(name, pharmacy:pharmacy_profiles(company_name))
`

export default async function AssistentPrestatiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const effectiveId = await getEffectiveUserId(user.id)
  const params   = await searchParams
  const pageHist = Math.max(0, parseInt(params.ph ?? '0', 10) || 0)

  // Admin client needed because pharmacy_profiles has no RLS policy for assistants.
  const adminSupabase = createAdminClient()

  const [pendingResult, histResult] = await Promise.all([
    adminSupabase.from('shifts').select(SHIFT_SELECT)
      .eq('assistant_id', effectiveId).eq('status', 'pending_assistant')
      .is('deleted_at', null).order('date', { ascending: true }),
    adminSupabase.from('shifts').select(SHIFT_SELECT, { count: 'exact' })
      .eq('assistant_id', effectiveId).neq('status', 'pending_assistant')
      .is('deleted_at', null).order('date', { ascending: false })
      .range(pageHist * PAGE, pageHist * PAGE + PAGE - 1),
  ])

  function mapShift(s: NonNullable<typeof pendingResult.data>[number]): AssistentShift {
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
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PrestatiesAssistentClient
        pending={(pendingResult.data ?? []).map(mapShift)}
        history={(histResult.data ?? []).map(mapShift)}
        historyTotal={histResult.count ?? 0}
        historyPage={pageHist}
        pageSize={PAGE}
      />
    </div>
  )
}
