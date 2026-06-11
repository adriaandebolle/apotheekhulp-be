'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from '@/lib/effective-user-id'
import { sendWelcomeEmail } from '@/lib/email'

type ActionResult<T = void> = { error: string } | { data: T }

// Throw-away client for admin-side user creation: no cookies in or out,
// so signUp() neither inherits the admin's session nor overwrites it.
function createSignupClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )
}

export async function createAssistant(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const email      = (formData.get('email')      as string | null)?.trim()
  const password   = (formData.get('password')   as string | null)
  const first_name = (formData.get('first_name') as string | null)?.trim() || null
  const last_name  = (formData.get('last_name')  as string | null)?.trim() || null

  if (!email || !password) return { error: 'Email en wachtwoord zijn verplicht.' }

  const sendWelcome = formData.has('send_welcome_email')

  const { data, error } = await createSignupClient().auth.signUp({ email, password, options: { data: { role: 'assistent' } } })
  if (error) return { error: error.message }

  const userId = data.user!.id
  const supabase = await createClient()

  if (first_name || last_name) {
    const phone = (formData.get('phone') as string | null)?.trim() || null
    await supabase.from('users').update({ first_name, last_name, phone, updated_at: new Date().toISOString() }).eq('id', userId)
  }

  const vat_number   = (formData.get('vat_number')   as string | null)?.trim() || null
  const company_name = (formData.get('company_name') as string | null)?.trim() || null
  const street       = (formData.get('street')       as string | null)?.trim() || null
  const house_number = (formData.get('house_number') as string | null)?.trim() || null
  const postcode     = (formData.get('postcode')     as string | null)?.trim() || null
  const city         = (formData.get('city')         as string | null)?.trim() || null
  const iban         = (formData.get('iban')         as string | null)?.trim() || null
  const vat_liable   = formData.has('vat_liable')

  if (vat_number || company_name || street || iban) {
    await supabase.from('assistant_profiles').upsert({
      user_id: userId, vat_number, vat_liable, company_name, street, house_number, postcode, city, iban,
      updated_at: new Date().toISOString(),
    })
  }

  if (sendWelcome) await sendWelcomeEmail(email, password, 'assistent')

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: { id: userId } }
}

export async function createPharmacy(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const email    = (formData.get('email')    as string | null)?.trim()
  const password = (formData.get('password') as string | null)

  if (!email || !password) return { error: 'Email en wachtwoord zijn verplicht.' }

  const sendWelcome = formData.has('send_welcome_email')

  const { data, error } = await createSignupClient().auth.signUp({ email, password, options: { data: { role: 'apotheek' } } })
  if (error) return { error: error.message }

  const userId = data.user!.id
  const supabase = await createClient()

  const phone = (formData.get('phone') as string | null)?.trim() || null
  if (phone) {
    await supabase.from('users').update({ phone, updated_at: new Date().toISOString() }).eq('id', userId)
  }

  const vat_number           = (formData.get('vat_number')           as string | null)?.trim() || null
  const company_name         = (formData.get('company_name')         as string | null)?.trim() || null
  const billing_street       = (formData.get('billing_street')       as string | null)?.trim() || null
  const billing_house_number = (formData.get('billing_house_number') as string | null)?.trim() || null
  const billing_postcode     = (formData.get('billing_postcode')     as string | null)?.trim() || null
  const billing_city         = (formData.get('billing_city')         as string | null)?.trim() || null
  const vat_liable           = formData.has('vat_liable')

  if (vat_number || company_name || billing_street) {
    await supabase.from('pharmacy_profiles').upsert({
      user_id: userId, vat_number, vat_liable, company_name,
      billing_street, billing_house_number, billing_postcode, billing_city,
      updated_at: new Date().toISOString(),
    })
  }

  if (sendWelcome) await sendWelcomeEmail(email, password, 'apotheek')

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: { id: userId } }
}

export async function updateUserProfile(
  userId: string,
  profile: { first_name?: string; last_name?: string; phone?: string; avatar_url?: string; color?: string; is_active?: boolean },
): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function setUserActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('users')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function updateMyUserProfile(
  profile: { first_name?: string; last_name?: string; phone?: string },
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.' }

  const effectiveId = await getEffectiveUserId(user.id)
  const { error } = await supabase
    .from('users')
    .update({ ...profile, updated_at: new Date().toISOString() })
    .eq('id', effectiveId)
  if (error) return { error: error.message }

  revalidatePath('/assistent/profiel')
  return { data: undefined }
}

export async function adminSendPasswordReset(email: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return { error: error.message }
  return { data: undefined }
}
