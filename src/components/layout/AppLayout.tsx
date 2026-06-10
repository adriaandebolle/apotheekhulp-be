import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPERSONATION_COOKIE, type Impersonation } from '@/lib/impersonation-types'
import { Sidebar } from './Sidebar'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'

async function getUnreadMessageCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<number> {
  const [{ count: total }, { count: read }] = await Promise.all([
    supabase.from('messages').select('*', { count: 'exact', head: true }),
    supabase.from('message_reads').select('*', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  return Math.max(0, (total ?? 0) - (read ?? 0))
}

async function getBadges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: 'admin' | 'assistent' | 'apotheek',
  userId: string,
): Promise<Partial<Record<string, number>>> {
  if (role === 'assistent') {
    const [{ count: prestaties }, { count: facturen }, unreadMessages] = await Promise.all([
      supabase.from('shifts').select('*', { count: 'exact', head: true })
        .eq('assistant_id', userId).eq('status', 'pending_assistant'),
      supabase.from('shifts').select('*', { count: 'exact', head: true })
        .eq('assistant_id', userId).eq('status', 'approved'),
      getUnreadMessageCount(supabase, userId),
    ])
    return {
      '/assistent/prestaties': prestaties ?? 0,
      '/assistent/facturen':   facturen   ?? 0,
      '/assistent/berichten':  unreadMessages,
    }
  }
  if (role === 'apotheek') {
    // Find all location IDs belonging to this pharmacy user
    const { data: locations } = await supabase
      .from('locations').select('id').eq('pharmacy_id', userId)
    const locationIds = (locations ?? []).map(l => l.id)
    const [prestaties, unreadMessages] = await Promise.all([
      locationIds.length
        ? supabase.from('shifts').select('*', { count: 'exact', head: true })
            .in('location_id', locationIds).eq('status', 'pending_apotheek')
        : Promise.resolve({ count: 0 }),
      getUnreadMessageCount(supabase, userId),
    ])
    return {
      '/apotheek/prestaties': (prestaties as { count: number | null }).count ?? 0,
      '/apotheek/berichten':  unreadMessages,
    }
  }
  return {}
}

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const authRole = user.app_metadata?.role as 'admin' | 'assistent' | 'apotheek'

  let impersonation: Impersonation | null = null
  if (authRole === 'admin') {
    const cookieStore = await cookies()
    const raw = cookieStore.get(IMPERSONATION_COOKIE)?.value
    if (raw) {
      try { impersonation = JSON.parse(raw) } catch { /* malformed cookie */ }
    }
  }

  const effectiveRole = impersonation?.role ?? authRole
  const effectiveUserId = impersonation?.userId ?? user?.id ?? ''
  const badges = await getBadges(supabase, effectiveRole, effectiveUserId)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={effectiveRole} badges={badges} />
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        {impersonation && (
          <ImpersonationBanner name={impersonation.name} role={impersonation.role} />
        )}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
