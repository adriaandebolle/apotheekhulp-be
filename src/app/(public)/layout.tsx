import { createClient } from '@/lib/supabase/server'
import { PublicNav } from '@/components/layout/PublicNav'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role
  const dashboardHref = role === 'admin' ? '/admin/dashboard' : '/assistent/dashboard'

  return (
    <div className="flex min-h-screen bg-background">
      <PublicNav isLoggedIn={!!user} dashboardHref={dashboardHref} />
      <main className="flex-1 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
