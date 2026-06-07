import { createAdminClient } from '@/lib/supabase/admin'
import BeschikbaarheidClient from './BeschikbaarheidClient'

export type AssistantRow = {
  id: string
  name: string
  color: string
}

export default async function BeschikbaarheidPage() {
  const supabase = createAdminClient()

  const [{ data: rawAssistants }, { data: rawAvailability }] = await Promise.all([
    supabase
      .from('users')
      .select('id, first_name, last_name, color')
      .eq('role', 'assistent')
      .eq('is_active', true)
      .order('first_name'),
    supabase
      .from('assistant_availability')
      .select('assistant_id, day_of_week'),
  ])

  const assistants: AssistantRow[] = (rawAssistants ?? []).map(a => ({
    id:    a.id,
    name:  [a.first_name, a.last_name].filter(Boolean).join(' ') || '—',
    color: (a.color as string | null) ?? '#6c757d',
  }))

  // Rows = days the assistant CANNOT work (unavailability)
  const unavailable = new Set<string>(
    (rawAvailability ?? []).map(r => `${r.assistant_id}:${r.day_of_week}`)
  )

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text mb-1">Beschikbaarheid</h1>
      <p className="text-text-muted mb-6">Weekraster — een vinkje betekent de assistent is beschikbaar. Standaard beschikbaar op alle dagen.</p>
      <BeschikbaarheidClient assistants={assistants} unavailable={unavailable} />
    </div>
  )
}
