'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createLocation(
  pharmacyId: string,
  data: { name: string; address?: string },
): Promise<ActionResult<{ id: string }>> {
  if (!data.name?.trim()) return { error: 'Naam is verplicht.' }

  const admin = await createClient()
  const { data: row, error } = await admin
    .from('locations')
    .insert({ pharmacy_id: pharmacyId, name: data.name.trim(), address: data.address ?? null })
    .select('id')
    .single()
  if (error) return { error: error.message }

  revalidatePath(`/admin/gebruikers/apotheken/${pharmacyId}`)
  return { data: { id: row.id } }
}

export async function updateLocation(
  id: string,
  data: { name?: string; address?: string; is_active?: boolean },
): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin.from('locations').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('locations')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}
