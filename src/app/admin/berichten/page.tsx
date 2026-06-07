import { createAdminClient } from '@/lib/supabase/admin'
import BerichtenClient, { type Message } from './BerichtenClient'

export default async function BerichtenPage() {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from('messages')
    .select('id, title, body, show_as_popup, notify_assistants, notify_pharmacies, created_at')
    .order('created_at', { ascending: false })

  return <BerichtenClient messages={(data ?? []) as Message[]} />
}
