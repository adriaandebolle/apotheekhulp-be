'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function upsertAssistantProfile(
  userId: string,
  profile: { vat_number?: string; company_name?: string; address?: string; iban?: string },
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('assistant_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  revalidatePath(`/admin/gebruikers/assistenten/${userId}`)
  return { data: undefined }
}
