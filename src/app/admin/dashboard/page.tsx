import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  'use server'
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <form action={signOut}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Afmelden
            </button>
          </form>
        </div>
        <p className="text-gray-500">Ingelogd als <strong>{user.email}</strong></p>
        <p className="text-sm text-gray-400 mt-12">Dashboard — wordt uitgewerkt in fase 4</p>
      </div>
    </div>
  )
}
