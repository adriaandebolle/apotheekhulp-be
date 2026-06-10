import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlatformConfig } from '@/lib/actions/platform-config'
import { AssistentDetail } from './AssistentDetail'

type Props = { params: Promise<{ id: string }> }

export default async function AssistentDetailPage({ params }: Props) {
  const { id } = await params
  const admin = await createClient()

  const [
    { data: userRow },
    { data: assistantProfile },
    { data: links },
    { data: pharmaciesRaw },
    config,
  ] = await Promise.all([
    admin.from('users').select('id, first_name, last_name, email, phone, color, is_active').eq('id', id).single(),
    admin.from('assistant_profiles').select('vat_number, vat_liable, company_name, street, house_number, postcode, city, iban, invoice_prefix, invoice_next_number').eq('user_id', id).maybeSingle(),
    admin.from('links').select(`
      id,
      hourly_rate_assistant,
      hourly_rate_pharmacy,
      km_allowance,
      distance_km,
      auto_confirm_assistent,
      auto_confirm_apotheek,
      locations ( id, name, pharmacy_id, pharmacy_profiles ( user_id, company_name ) )
    `).eq('assistant_id', id).is('deleted_at', null),
    admin.from('pharmacy_profiles').select('user_id, company_name, locations ( id, name, deleted_at )').order('company_name'),
    getPlatformConfig(),
  ])

  if (!userRow) notFound()

  const pharmacies = (pharmaciesRaw ?? []).map(p => ({
    user_id:      p.user_id,
    company_name: p.company_name,
    locations:    (p.locations ?? []).filter(l => !l.deleted_at).map(({ id, name }) => ({ id, name })),
  }))

  return (
    <div className="p-8">
      <p className="text-xs text-text-muted mb-1">Gebruikers / Assistenten</p>
      <h1 className="text-2xl font-bold text-text mb-6">
        {[userRow.first_name, userRow.last_name].filter(Boolean).join(' ') || userRow.email}
      </h1>

      <AssistentDetail
        userId={id}
        email={userRow.email ?? ''}
        user={userRow}
        assistantProfile={assistantProfile}
        links={links ?? []}
        pharmacies={pharmacies}
        defaultKmRate={config.km_rate}
        defaultHourlyRateAssistant={config.default_hourly_rate_assistant}
        defaultHourlyRatePharmacy={config.default_hourly_rate_pharmacy}
      />
    </div>
  )
}
