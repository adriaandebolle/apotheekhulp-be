import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = user.app_metadata?.role
    if (role === 'admin') redirect('/admin/dashboard')
    if (role === 'assistent') redirect('/assistent/dashboard')
  }

  // Public landing — marketing page added in fase 10
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Apotheekhulp</h1>
        <p className="text-gray-500 mb-6">Platform voor apotheekassistenten</p>
        <Link
          href="/login"
          className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Aanmelden
        </Link>
      </div>
    </div>
  )
}
