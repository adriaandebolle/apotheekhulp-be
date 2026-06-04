import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ApotheekDetail } from './ApotheekDetail'

type Props = { params: Promise<{ id: string }> }

export default async function ApotheekDetailPage({ params }: Props) {
  const { id } = await params
  const admin = createAdminClient()

  const [
    { data: authData, error: authError },
    { data: userRow },
    { data: profile },
    { data: locations },
  ] = await Promise.all([
    admin.auth.admin.getUserById(id),
    admin.from('users').select('id, phone, is_active').eq('id', id).single(),
    admin.from('pharmacy_profiles').select('*').eq('user_id', id).maybeSingle(),
    admin.from('locations').select('id, name, address, is_active').eq('pharmacy_id', id).order('name'),
  ])

  if (authError || !authData?.user || !userRow) notFound()

  return (
    <div className="p-8 max-w-5xl">
      <p className="text-xs text-text-muted mb-1">Gebruikers / Apotheken</p>
      <h1 className="text-2xl font-bold text-text mb-6">
        {profile?.company_name ?? authData.user.email}
      </h1>
      <ApotheekDetail
        userId={id}
        email={authData.user.email ?? ''}
        user={userRow}
        pharmacyProfile={profile ?? null}
        locations={locations ?? []}
      />
    </div>
  )
}
