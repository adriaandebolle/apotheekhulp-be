import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { IMPERSONATION_COOKIE, type Impersonation } from '@/lib/impersonation-types'
import { Sidebar } from './Sidebar'
import { ImpersonationBanner } from '@/components/admin/ImpersonationBanner'

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const authRole = (user?.app_metadata?.role ?? 'assistent') as 'admin' | 'assistent' | 'apotheek'

  let impersonation: Impersonation | null = null
  if (authRole === 'admin') {
    const cookieStore = await cookies()
    const raw = cookieStore.get(IMPERSONATION_COOKIE)?.value
    if (raw) {
      try { impersonation = JSON.parse(raw) } catch { /* malformed cookie */ }
    }
  }

  const effectiveRole = impersonation?.role ?? authRole

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={effectiveRole} />
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
