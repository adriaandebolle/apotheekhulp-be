'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function confirmShift(id: string): Promise<void> {
  const admin = await createClient()

  // Look up the shift to find assistant_id + location_id for auto-confirm check
  const { data: shift } = await admin
    .from('shifts')
    .select('assistant_id, location_id')
    .eq('id', id)
    .single()

  let newStatus = 'pending_apotheek'
  if (shift) {
    const { data: link } = await admin
      .from('links')
      .select('auto_confirm_apotheek')
      .eq('assistant_id', shift.assistant_id)
      .eq('location_id', shift.location_id)
      .is('deleted_at', null)
      .maybeSingle()
    if (link?.auto_confirm_apotheek) newStatus = 'approved'
  }

  const { error } = await admin
    .from('shifts')
    .update({ status: newStatus })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/assistent/prestaties')
}

export async function declineShift(id: string): Promise<void> {
  const admin = await createClient()
  const { error } = await admin
    .from('shifts')
    .update({ status: 'denied' })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/assistent/prestaties')
}
