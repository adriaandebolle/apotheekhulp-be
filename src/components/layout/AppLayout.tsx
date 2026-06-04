import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { IMPERSONATION_COOKIE, type Impersonation } from '@/lib/impersonation-types'
import { Sidebar } from './Sidebar'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'

async function getBadges(
  supabase: Awaited<ReturnType<typeof createClient>>,
  role: 'admin' | 'assistent' | 'apotheek',
  userId: string,
): Promise<Partial<Record<string, number>>> {
  if (role === 'assistent') {
    const [{ count: prestaties }, { count: facturen }] = await Promise.all([
      supabase.from('shifts').select('*', { count: 'exact', head: true })
        .eq('assistant_id', userId).eq('status', 'pending_assistant'),
      supabase.from('shifts').select('*', { count: 'exact', head: true })
        .eq('assistant_id', userId).eq('status', 'approved'),
    ])
    return {
      '/assistent/prestaties': prestaties ?? 0,
      '/assistent/facturen':   facturen   ?? 0,
    }
  }
  if (role === 'apotheek') {
    // Find all location IDs belonging to this pharmacy user
    const { data: locations } = await supabase
      .from('locations').select('id').eq('pharmacy_id', userId)
    const locationIds = (locations ?? []).map(l => l.id)
    if (!locationIds.length) return {}
    const [{ count: prestaties }] = await Promise.all([
      supabase.from('shifts').select('*', { count: 'exact', head: true })
        .in('location_id', locationIds).eq('status', 'pending_apotheek'),
    ])
    return { '/apotheek/prestaties': prestaties ?? 0 }
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
