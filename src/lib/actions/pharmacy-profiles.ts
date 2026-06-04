'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function upsertPharmacyProfile(
  userId: string,
  profile: { vat_number?: string; company_name?: string; billing_address?: string },
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('pharmacy_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  revalidatePath(`/admin/gebruikers/apotheken/${userId}`)
  return { data: undefined }
}
