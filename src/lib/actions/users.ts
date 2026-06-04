'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createAssistant(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const email    = (formData.get('email')    as string | null)?.trim()
  const password = (formData.get('password') as string | null)
  if (!email || !password) return { error: 'Email en wachtwoord zijn verplicht.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    app_metadata: { role: 'assistent' },
    email_confirm: true,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: { id: data.user.id } }
}

export async function createPharmacy(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const email    = (formData.get('email')    as string | null)?.trim()
  const password = (formData.get('password') as string | null)
  if (!email || !password) return { error: 'Email en wachtwoord zijn verplicht.' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    app_metadata: { role: 'apotheek' },
    email_confirm: true,
  })
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: { id: data.user.id } }
}

export async function updateUserProfile(
  userId: string,
  profile: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string; color?: string },
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function adminChangePassword(userId: string, newPassword: string): Promise<ActionResult> {
  if (!newPassword || newPassword.length < 8) return { error: 'Wachtwoord moet minstens 8 tekens bevatten.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(userId, { password: newPassword })
  if (error) return { error: error.message }

  return { data: undefined }
}
