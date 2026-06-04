'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

type ActionResult<T = void> = { error: string } | { data: T }

export async function createLocation(
  pharmacyId: string,
  data: { name: string; address?: string },
): Promise<ActionResult<{ id: string }>> {
  if (!data.name?.trim()) return { error: 'Naam is verplicht.' }

  const admin = createAdminClient()
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
  const admin = createAdminClient()
  const { error } = await admin.from('locations').update(data).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}

export async function deleteLocation(id: string): Promise<ActionResult> {
  const admin = createAdminClient()

  // Guard: refuse if any shift references this location
  const { count } = await admin
    .from('shifts')
    .select('id', { count: 'exact', head: true })
    .eq('location_id', id)
  if ((count ?? 0) > 0) return { error: 'Deze locatie heeft gekoppelde shifts en kan niet worden verwijderd.' }

  const { error } = await admin.from('locations').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/gebruikers/apotheken')
  return { data: undefined }
}
