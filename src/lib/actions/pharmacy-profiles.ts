'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = void> = { error: string } | { data: T }

export async function upsertPharmacyProfile(
  userId: string,
  profile: {
    vat_number?:            string
    vat_liable?:            boolean
    company_name?:          string
    billing_street?:        string
    billing_house_number?:  string
    billing_postcode?:      string
    billing_city?:          string
  },
): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('pharmacy_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  revalidatePath(`/admin/gebruikers/apotheken/${userId}`)
  return { data: undefined }
}
