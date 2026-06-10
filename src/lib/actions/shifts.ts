'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ShiftStatus = 'pending_assistant' | 'pending_apotheek' | 'approved'

const ALLOWED_TRANSITIONS: Record<ShiftStatus, ShiftStatus[]> = {
  pending_assistant: ['pending_apotheek'],
  pending_apotheek:  ['approved', 'pending_assistant'],
  approved:          ['pending_apotheek'],
}

type ActionResult<T = void> = { error: string } | { data: T }

export async function resolveInitialStatus(
  assistant_id: string,
  location_id: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<ShiftStatus> {
  const { data: link } = await supabase
    .from('links')
    .select('auto_confirm_assistent, auto_confirm_apotheek')
    .eq('assistant_id', assistant_id)
    .eq('location_id', location_id)
    .is('deleted_at', null)
    .maybeSingle()
  const autoAss = link?.auto_confirm_assistent ?? false
  const autoApo = link?.auto_confirm_apotheek  ?? false
  if (autoAss && autoApo) return 'approved'
  if (autoAss)            return 'pending_apotheek'
  return 'pending_assistant'
}

export async function createShift(data: {
  assistant_id: string
  location_id: string
  date: string          // ISO date "YYYY-MM-DD"
  start_time: string    // "HH:MM"
  end_time: string      // "HH:MM"
  break_minutes?: number
  notes?: string
}): Promise<ActionResult<{ id: string }>> {
  if (!data.assistant_id || !data.location_id || !data.date || !data.start_time || !data.end_time) {
    return { error: 'Assistent, locatie, datum en uren zijn verplicht.' }
  }

  const admin = await createClient()
  const initialStatus = await resolveInitialStatus(data.assistant_id, data.location_id, admin)

  const { data: row, error } = await admin
    .from('shifts')
    .insert({
      assistant_id:  data.assistant_id,
      location_id:   data.location_id,
      date:          data.date,
      start_time:    data.start_time,
      end_time:      data.end_time,
      break_minutes: data.break_minutes ?? 0,
      notes:         data.notes ?? null,
      status:        initialStatus,
    })
    .select('id')
    .single()
  if (error) return { error: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { data: { id: row.id } }
}

export async function updateShift(
  id: string,
  data: {
    assistant_id?: string
    location_id?: string
    date?: string
    start_time?: string
    end_time?: string
    break_minutes?: number
    notes?: string
  },
): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('shifts')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { data: undefined }
}

export async function deleteShift(id: string): Promise<ActionResult> {
  const admin = await createClient()
  const { error } = await admin
    .from('shifts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { data: undefined }
}

export async function updateShiftStatus(id: string, newStatus: ShiftStatus): Promise<ActionResult> {
  const admin = await createClient()

  const { data: shift, error: fetchError } = await admin
    .from('shifts')
    .select('status')
    .eq('id', id)
    .single()
  if (fetchError) return { error: fetchError.message }

  const current = shift.status as ShiftStatus
  if (!ALLOWED_TRANSITIONS[current]?.includes(newStatus)) {
    return { error: `Overgang van '${current}' naar '${newStatus}' is niet toegestaan.` }
  }

  const { error } = await admin
    .from('shifts')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { data: undefined }
}
