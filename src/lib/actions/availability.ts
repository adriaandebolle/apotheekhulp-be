'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleAvailability(
  assistantId: string,
  dayOfWeek: number,
  available: boolean,
) {
  const supabase = await createClient()

  if (available) {
    await supabase
      .from('assistant_availability')
      .insert({ assistant_id: assistantId, day_of_week: dayOfWeek })
  } else {
    await supabase
      .from('assistant_availability')
      .delete()
      .eq('assistant_id', assistantId)
      .eq('day_of_week', dayOfWeek)
  }

  revalidatePath('/admin/beschikbaarheid')
  revalidatePath('/admin/kalender')
}
