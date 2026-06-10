'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getEffectiveUserId } from '@/lib/effective-user-id'

type ActionResult<T = void> = { error: string } | { data: T }

export async function setMyAutoConfirm(linkId: string, value: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.' }

  const effectiveId = await getEffectiveUserId(user.id)
  const admin = await createClient()
  // Verify ownership before updating
  const { data: link } = await admin
    .from('links')
    .select('assistant_id')
    .eq('id', linkId)
    .is('deleted_at', null)
    .single()
  if (!link || link.assistant_id !== effectiveId) return { error: 'Geen toegang.' }

  const { error } = await admin
    .from('links')
    .update({ auto_confirm_assistent: value })
    .eq('id', linkId)
  if (error) return { error: error.message }

  revalidatePath('/assistent/profiel')
  return { data: undefined }
}

export async function createLink(data: {
  assistant_id: string
  location_id: string
  hourly_rate_assistant?: number | null
  hourly_rate_pharmacy?: number | null
  km_allowance?: number | null
  distance_km?: number | null
  auto_confirm_assistent?: boolean
  auto_confirm_apotheek?: boolean
}): Promise<ActionResult<{ id: string }>> {
  if (!data.assistant_id || !data.location_id) return { error: 'Assistent en locatie zijn verplicht.' }

  const admin = await createClient()
  const { data: row, error } = await admin
    .from('links')
    .insert(data)
    .select('id')
    .single()
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: { id: row.id } }
}

export async function updateLink(
  id: string,
  data: {
    hourly_rate_assistant?: number | null
    hourly_rate_pharmacy?: number | null
    km_allowance?: number | null
    distance_km?: number | null
    auto_confirm_assistent?: boolean
    auto_confirm_apotheek?: boolean
  },
): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin.from('links').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: undefined }
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('links')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: undefined }
}
