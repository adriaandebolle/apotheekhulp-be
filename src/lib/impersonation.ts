'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function startImpersonation(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.app_metadata?.role !== 'admin') throw new Error('Unauthorized')

  const userId = formData.get('userId') as string
  const name   = formData.get('name')   as string
  const role   = formData.get('role')   as 'assistent' | 'apotheek'

  const cookieStore = await cookies()
  cookieStore.set('admin_impersonation', JSON.stringify({ userId, name, role }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  })

  if (role === 'assistent') redirect('/assistent/dashboard')
  if (role === 'apotheek')  redirect('/apotheek/dashboard')
  redirect('/admin/dashboard')
}

export async function stopImpersonation() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_impersonation')
  redirect('/admin/dashboard')
}
