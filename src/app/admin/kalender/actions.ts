'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type ShiftFormState =
  | null
  | { type: 'error'; message: string }
  | { type: 'success' }

export async function createShift(
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  const assistantId  = formData.get('assistant_id')  as string
  const locationId   = formData.get('location_id')   as string
  const date         = formData.get('date')           as string
  const startTime    = formData.get('start_time')     as string
  const endTime      = formData.get('end_time')       as string
  const breakMinutes = parseInt(formData.get('break_minutes') as string, 10) || 0

  if (!assistantId) return { type: 'error', message: 'Kies een assistent.' }
  if (!locationId)  return { type: 'error', message: 'Kies een locatie.' }
  if (!date)        return { type: 'error', message: 'Kies een datum.' }
  if (!startTime)   return { type: 'error', message: 'Vul een beginuur in.' }
  if (!endTime)     return { type: 'error', message: 'Vul een einduur in.' }
  if (startTime >= endTime) return { type: 'error', message: 'Einduur moet na beginuur liggen.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('shifts').insert({
    assistant_id:   assistantId,
    location_id:    locationId,
    date,
    start_time:     startTime,
    end_time:       endTime,
    break_minutes:  breakMinutes,
    status:         'pending_assistant',
  })

  if (error) return { type: 'error', message: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { type: 'success' }
}

export async function updateShift(
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  const id           = formData.get('id')             as string
  const date         = formData.get('date')           as string
  const startTime    = formData.get('start_time')     as string
  const endTime      = formData.get('end_time')       as string
  const breakMinutes = parseInt(formData.get('break_minutes') as string, 10) || 0

  if (!id)                              return { type: 'error', message: 'Ongeldige shift.' }
  if (!date || !startTime || !endTime)  return { type: 'error', message: 'Vul alle velden in.' }
  if (startTime >= endTime)             return { type: 'error', message: 'Einduur moet na beginuur liggen.' }

  const supabase = createAdminClient()
  const { error } = await supabase
    .from('shifts')
    .update({ date, start_time: startTime, end_time: endTime, break_minutes: breakMinutes })
    .eq('id', id)

  if (error) return { type: 'error', message: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { type: 'success' }
}

export async function approveShift(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('shifts').update({ status: 'approved' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
}

export async function denyShift(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase.from('shifts').update({ status: 'denied' }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
}

export async function createBulkShifts(
  _prev: ShiftFormState,
  formData: FormData,
): Promise<ShiftFormState> {
  const assistantId  = formData.get('assistant_id')  as string
  const locationId   = formData.get('location_id')   as string
  const startTime    = formData.get('start_time')     as string
  const endTime      = formData.get('end_time')       as string
  const breakMinutes = parseInt(formData.get('break_minutes') as string, 10) || 0
  const dates        = formData.getAll('dates[]')     as string[]

  if (!assistantId)    return { type: 'error', message: 'Kies een assistent.' }
  if (!locationId)     return { type: 'error', message: 'Kies een locatie.' }
  if (!startTime)      return { type: 'error', message: 'Vul een beginuur in.' }
  if (!endTime)        return { type: 'error', message: 'Vul een einduur in.' }
  if (startTime >= endTime) return { type: 'error', message: 'Einduur moet na beginuur liggen.' }

  const validDates = dates.filter(Boolean)
  if (validDates.length === 0) return { type: 'error', message: 'Voeg minstens één datum toe.' }

  const supabase = createAdminClient()
  const { error } = await supabase.from('shifts').insert(
    validDates.map(date => ({
      assistant_id: assistantId, location_id: locationId,
      date, start_time: startTime, end_time: endTime,
      break_minutes: breakMinutes, status: 'pending_assistant',
    }))
  )

  if (error) return { type: 'error', message: error.message }

  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
  return { type: 'success' }
}

export async function deleteShift(id: string): Promise<void> {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('shifts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/kalender')
  revalidatePath('/admin/prestaties')
}
