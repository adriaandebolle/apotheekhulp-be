import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ApotheekDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text mb-1">Dashboard</h1>
      <p className="text-text-muted">Welkom, <strong>{user.email}</strong></p>
      <p className="text-sm text-text-muted mt-12">Apotheek portaal — wordt uitgewerkt in fase 12</p>
    </div>
  )
}
