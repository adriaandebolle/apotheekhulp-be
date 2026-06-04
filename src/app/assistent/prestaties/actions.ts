'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function confirmShift(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'confirmed' })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/assistent/prestaties')
}

export async function declineShift(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('shifts')
    .update({ status: 'denied' })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/assistent/prestaties')
}
