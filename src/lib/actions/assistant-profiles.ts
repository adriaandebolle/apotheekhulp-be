'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from '@/lib/effective-user-id'

type ActionResult<T = void> = { error: string } | { data: T }

export async function updateMyAssistantProfile(
  profile: {
    vat_number?:          string
    vat_liable?:          boolean
    company_name?:        string
    street?:              string
    house_number?:        string
    postcode?:            string
    city?:                string
    iban?:                string
    invoice_prefix?:      string
    invoice_next_number?: number
  },
): Promise<ActionResult> {
  const userClient = await createClient()
  const { data: { user } } = await userClient.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.' }

  const effectiveId = await getEffectiveUserId(user.id)
  const admin = await createClient()
  const { error } = await admin
    .from('assistant_profiles')
    .upsert({ user_id: effectiveId, ...profile, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  revalidatePath('/assistent/profiel')
  return { data: undefined }
}

export async function upsertAssistantProfile(
  userId: string,
  profile: {
    vat_number?:          string
    vat_liable?:          boolean
    company_name?:        string
    street?:              string
    house_number?:        string
    postcode?:            string
    city?:                string
    iban?:                string
    invoice_prefix?:      string
    invoice_next_number?: number
  },
): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('assistant_profiles')
    .upsert({ user_id: userId, ...profile, updated_at: new Date().toISOString() })
  if (error) return { error: error.message }

  revalidatePath(`/admin/gebruikers/assistenten/${userId}`)
  return { data: undefined }
}
