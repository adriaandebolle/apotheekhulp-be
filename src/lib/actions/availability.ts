'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function setMyAvailability(dayOfWeek: number, available: boolean) {
  const { data: { user } } = await (await createClient()).auth.getUser()
  if (!user) return

  const admin = createAdminClient()

  if (available) {
    const { error } = await admin
      .from('assistant_availability')
      .upsert(
        { assistant_id: user.id, day_of_week: dayOfWeek },
        { onConflict: 'assistant_id,day_of_week' },
      )
    if (error) throw new Error(error.message)
  } else {
    const { error } = await admin
      .from('assistant_availability')
      .delete()
      .eq('assistant_id', user.id)
      .eq('day_of_week', dayOfWeek)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/assistent/onbeschikbaarheid')
  revalidatePath('/admin/beschikbaarheid')
  revalidatePath('/admin/kalender')
}

export async function toggleAvailability(
  assistantId: string,
  dayOfWeek: number,
  available: boolean,
) {
  const admin = createAdminClient()

  if (available) {
    await admin
      .from('assistant_availability')
      .upsert(
        { assistant_id: assistantId, day_of_week: dayOfWeek },
        { onConflict: 'assistant_id,day_of_week' },
      )
  } else {
    await admin
      .from('assistant_availability')
      .delete()
      .eq('assistant_id', assistantId)
      .eq('day_of_week', dayOfWeek)
  }

  revalidatePath('/admin/beschikbaarheid')
  revalidatePath('/admin/kalender')
}
