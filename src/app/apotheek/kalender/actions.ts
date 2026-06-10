'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getEffectiveUserId } from '@/lib/effective-user-id'
import { resolveInitialStatus } from '@/lib/actions/shifts'

export type ShiftFormState =
  | null
  | { type: 'error'; message: string }
  | { type: 'success' }

export async function createShift(
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { type: 'error', message: 'Niet ingelogd.' }

  const effectiveId  = await getEffectiveUserId(user.id)
  const assistantId  = formData.get('assistant_id')  as string
  const locationId   = formData.get('location_id')   as string
  const date         = formData.get('date')           as string
  const startTime    = formData.get('start_time')     as string
  const endTime      = formData.get('end_time')       as string
  const breakMinutes = parseInt(formData.get('break_minutes') as string, 10) || 0

  if (!locationId)           return { type: 'error', message: 'Kies een locatie.' }
  if (!date)                 return { type: 'error', message: 'Kies een datum.' }
  if (!startTime)            return { type: 'error', message: 'Vul een beginuur in.' }
  if (!endTime)              return { type: 'error', message: 'Vul een einduur in.' }
  const admin = createAdminClient()

  // Verify this location belongs to the pharmacy being impersonated (or the logged-in user).
  const { data: loc } = await admin
    .from('locations')
    .select('id')
    .eq('id', locationId)
    .eq('pharmacy_id', effectiveId)
    .is('deleted_at', null)
    .maybeSingle()
  if (!loc) return { type: 'error', message: 'Locatie niet gevonden.' }

  const status = assistantId
    ? await resolveInitialStatus(assistantId, locationId, admin)
    : 'pending_assistant'

  const { error } = await admin.from('shifts').insert({
    assistant_id:  assistantId || null,
    location_id:   locationId,
    date,
    start_time:    startTime,
    end_time:      endTime,
    break_minutes: breakMinutes,
    status,
  })

  if (error) return { type: 'error', message: error.message }

  revalidatePath('/apotheek/kalender')
  revalidatePath('/apotheek/dashboard')
  revalidatePath('/apotheek/prestaties')
  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { type: 'success' }
}
