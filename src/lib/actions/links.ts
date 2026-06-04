'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createLink(data: {
  assistant_id: string
  location_id: string
  hourly_rate_assistant?: number | null
  hourly_rate_pharmacy?: number | null
  km_allowance?: number | null
  distance_km?: number | null
}): Promise<ActionResult<{ id: string }>> {
  if (!data.assistant_id || !data.location_id) return { error: 'Assistent en locatie zijn verplicht.' }

  const admin = createAdminClient()
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
  },
): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin.from('links').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: undefined }
}

export async function deleteLink(id: string): Promise<ActionResult> {
  const admin = createAdminClient()
  const { error } = await admin
    .from('links')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/assistenten')
  return { data: undefined }
}
