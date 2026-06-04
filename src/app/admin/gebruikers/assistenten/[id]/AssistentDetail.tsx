'use client'

import { useState, useTransition } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { Label, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { updateUserProfile, adminChangePassword } from '@/lib/actions/users'
import { upsertAssistantProfile } from '@/lib/actions/assistant-profiles'
import { createLink, deleteLink } from '@/lib/actions/links'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'

// ─── Types ───────────────────────────────────────────────────────────────────

type UserRow = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  color: string | null
  is_active: boolean
}

type AssistantProfileRow = {
  vat_number:   string | null
  vat_liable:   boolean
  company_name: string | null
  street:       string | null
  house_number: string | null
  postcode:     string | null
  city:         string | null
  iban:         string | null
} | null

type LinkRow = {
  id: string
  hourly_rate_assistant: number | null
  hourly_rate_pharmacy: number | null
  km_allowance: number | null
  distance_km: number | null
  locations: {
    id: string
    name: string
    pharmacy_id: string
    pharmacy_profiles: { user_id: string; company_name: string | null }[]
  }[]
}

type PharmacyRow = {
  user_id: string
  company_name: string | null
  locations: { id: string; name: string }[]
}

interface Props {
  userId: string
  email: string
  user: UserRow
  assistantProfile: AssistantProfileRow
  links: LinkRow[]
  pharmacies: PharmacyRow[]
  defaultKmRate: number
  defaultHourlyRateAssistant: number
  defaultHourlyRatePharmacy: number
}

// ─── Shared feedback component ────────────────────────────────────────────────

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error)   return <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
  if (success) return <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
  return null
}

// ─── Tab 1: Persoonsgegevens ──────────────────────────────────────────────────

function PersoonsgegevensTab({ userId, email, user }: { userId: string; email: string; user: UserRow }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setFeedback({})
    startTransition(async () => {
      const result = await updateUserProfile(userId, {
        first_name: (fd.get('first_name') as string).trim() || undefined,
        last_name:  (fd.get('last_name')  as string).trim() || undefined,
        phone:      (fd.get('phone')      as string).trim() || undefined,
        color:      (fd.get('color')      as string) || undefined,
        is_active:  fd.has('is_active'),
      })
      if ('error' in result) setFeedback({ error: result.error })
      else setFeedback({ success: 'Persoonsgegevens opgeslagen.' })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" value={email} disabled />
        <p className="mt-1 text-xs text-text-muted">E-mailadres kan niet gewijzigd worden via dit formulier.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="first_name">Voornaam</Label>
          <Input id="first_name" name="first_name" defaultValue={user.first_name ?? ''} />
        </div>
        <div>
          <Label htmlFor="last_name">Achternaam</Label>
          <Input id="last_name" name="last_name" defaultValue={user.last_name ?? ''} />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Telefoonnummer</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ''} />
      </div>

      <div>
        <Label htmlFor="color">Kalenderkleur</Label>
        <div className="flex items-center gap-3">
          <input
            id="color"
            name="color"
            type="color"
            defaultValue={user.color ?? '#0d9488'}
            className="h-9 w-16 cursor-pointer rounded border border-border bg-surface p-0.5"
          />
          <span className="text-xs text-text-muted">Kleurcodering op de kalender</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          defaultChecked={user.is_active}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <Label htmlFor="is_active">Account actief</Label>
      </div>

      <Feedback {...feedback} />

      <Button type="submit" loading={isPending}>Opslaan</Button>
    </form>
  )
}

// ─── Tab 2: Bedrijfsgegevens ──────────────────────────────────────────────────

function BedrijfsgegevensTab({ userId, profile }: { userId: string; profile: AssistantProfileRow }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setFeedback({})
    startTransition(async () => {
      const result = await upsertAssistantProfile(userId, {
        vat_number:   (fd.get('vat_number')   as string).trim() || undefined,
        vat_liable:   fd.has('vat_liable'),
        company_name: (fd.get('company_name') as string).trim() || undefined,
        street:       (fd.get('street')       as string).trim() || undefined,
        house_number: (fd.get('house_number') as string).trim() || undefined,
        postcode:     (fd.get('postcode')     as string).trim() || undefined,
        city:         (fd.get('city')         as string).trim() || undefined,
        iban:         (fd.get('iban')         as string).trim() || undefined,
      })
      if ('error' in result) setFeedback({ error: result.error })
      else setFeedback({ success: 'Bedrijfsgegevens opgeslagen.' })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="vat_number">BTW-nummer</Label>
          <Input id="vat_number" name="vat_number" placeholder="BE 0000.000.000" defaultValue={profile?.vat_number ?? ''} />
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm text-text cursor-pointer select-none">
            <input
              type="checkbox"
              name="vat_liable"
              defaultChecked={profile?.vat_liable ?? false}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            />
            BTW plichtig
          </label>
        </div>
      </div>

      <div>
        <Label htmlFor="company_name">Naam onderneming</Label>
        <Input id="company_name" name="company_name" defaultValue={profile?.company_name ?? ''} />
      </div>

      <AddressAutocomplete
        names={{ street: 'street', house_number: 'house_number', postcode: 'postcode', city: 'city' }}
        defaults={{
          street:       profile?.street       ?? '',
          house_number: profile?.house_number ?? '',
          postcode:     profile?.postcode     ?? '',
          city:         profile?.city         ?? '',
        }}
      />

      <div>
        <Label htmlFor="iban">Rekeningnummer (IBAN)</Label>
        <Input id="iban" name="iban" placeholder="BE00 0000 0000 0000" defaultValue={profile?.iban ?? ''} />
      </div>

      <Feedback {...feedback} />

      <Button type="submit" loading={isPending}>Opslaan</Button>
    </form>
  )
}

// ─── Tab 3: Verbonden Apotheken ───────────────────────────────────────────────

function VerbondenApothekenTab({
  userId,
  initialLinks,
  pharmacies,
  defaultKmRate,
  defaultHourlyRateAssistant,
  defaultHourlyRatePharmacy,
}: {
  userId: string
  initialLinks: LinkRow[]
  pharmacies: PharmacyRow[]
  defaultKmRate: number
  defaultHourlyRateAssistant: number
  defaultHourlyRatePharmacy: number
}) {
  const [links, setLinks] = useState(initialLinks)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState('')
  const [addError, setAddError] = useState<string>()
  const [isPendingAdd, startAdd] = useTransition()
  const [deletingId, setDeletingId] = useState<string>()

  const selectedPharmacy = pharmacies.find(p => p.user_id === selectedPharmacyId)
  const availableLocations = selectedPharmacy?.locations ?? []

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setAddError(undefined)
    startAdd(async () => {
      const result = await createLink({
        assistant_id:          userId,
        location_id:           fd.get('location_id') as string,
        hourly_rate_assistant: parseFloat(fd.get('hourly_rate_assistant') as string) || null,
        hourly_rate_pharmacy:  parseFloat(fd.get('hourly_rate_pharmacy')  as string) || null,
        km_allowance:          parseFloat(fd.get('km_allowance')          as string) || null,
        distance_km:           parseFloat(fd.get('distance_km')           as string) || null,
      })
      if ('error' in result) {
        setAddError(result.error)
      } else {
        // Optimistically reload by refreshing the page data via router
        window.location.reload()
      }
    })
  }

  async function handleDelete(linkId: string) {
    setDeletingId(linkId)
    const result = await deleteLink(linkId)
    if ('error' in result) {
      alert(result.error)
      setDeletingId(undefined)
    } else {
      setLinks(prev => prev.filter(l => l.id !== linkId))
      setDeletingId(undefined)
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing links */}
      <Table>
        <Thead>
          <Tr>
            <Th>Apotheek</Th>
            <Th>Locatie</Th>
            <Th>Tarief assistent</Th>
            <Th>Tarief apotheek</Th>
            <Th>Afstand</Th>
            <Th>KM-verg.</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {links.length === 0 && <EmptyRow colSpan={7} message="Nog geen gekoppelde apotheken." />}
          {links.map(link => (
            <Tr key={link.id}>
              <Td>{link.locations?.[0]?.pharmacy_profiles?.[0]?.company_name ?? '—'}</Td>
              <Td>{link.locations?.[0]?.name ?? '—'}</Td>
              <Td>{link.hourly_rate_assistant != null ? `€${link.hourly_rate_assistant}/u` : '—'}</Td>
              <Td>{link.hourly_rate_pharmacy  != null ? `€${link.hourly_rate_pharmacy}/u`  : '—'}</Td>
              <Td>{link.distance_km           != null ? `${link.distance_km} km`           : '—'}</Td>
              <Td>{link.km_allowance          != null ? `€${link.km_allowance}/km`         : '—'}</Td>
              <Td className="text-right">
                <button
                  type="button"
                  disabled={deletingId === link.id}
                  onClick={() => handleDelete(link.id)}
                  className="text-xs text-danger hover:underline disabled:opacity-40"
                >
                  Verwijderen
                </button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add link form */}
      <div className="border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">Apotheek koppelen</h3>
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pharmacy_select" required>Apotheek</Label>
              <select
                id="pharmacy_select"
                value={selectedPharmacyId}
                onChange={e => setSelectedPharmacyId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">— Kies apotheek —</option>
                {pharmacies.map(p => (
                  <option key={p.user_id} value={p.user_id}>
                    {p.company_name ?? p.user_id}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="location_id" required>Locatie</Label>
              <select
                id="location_id"
                name="location_id"
                required
                disabled={!selectedPharmacyId}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-slate-50 disabled:text-text-muted"
              >
                <option value="">— Kies locatie —</option>
                {availableLocations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hourly_rate_assistant">Uurtarief assistent (€)</Label>
              <Input id="hourly_rate_assistant" name="hourly_rate_assistant" type="number" step="0.01" min="0" defaultValue={defaultHourlyRateAssistant || undefined} placeholder="0.00" />
            </div>
            <div>
              <Label htmlFor="hourly_rate_pharmacy">Uurtarief apotheek (€)</Label>
              <Input id="hourly_rate_pharmacy" name="hourly_rate_pharmacy" type="number" step="0.01" min="0" defaultValue={defaultHourlyRatePharmacy || undefined} placeholder="0.00" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance_km">Afstand (km)</Label>
              <Input id="distance_km" name="distance_km" type="number" step="0.1" min="0" placeholder="0" />
            </div>
            <div>
              <Label htmlFor="km_allowance">KM-vergoeding (€/km)</Label>
              <Input id="km_allowance" name="km_allowance" type="number" step="0.0001" min="0" defaultValue={defaultKmRate} />
              <p className="mt-1 text-xs text-text-muted">Standaard: €{defaultKmRate}/km (platforminstelling)</p>
            </div>
          </div>

          {addError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{addError}</p>
          )}

          <Button type="submit" size="sm" loading={isPendingAdd}>Koppeling toevoegen</Button>
        </form>
      </div>
    </div>
  )
}

// ─── Tab 4: Wachtwoord ────────────────────────────────────────────────────────

function WachtwoordTab({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const confirm  = fd.get('confirm')  as string
    setFeedback({})

    if (password !== confirm) {
      setFeedback({ error: 'Wachtwoorden komen niet overeen.' })
      return
    }

    startTransition(async () => {
      const result = await adminChangePassword(userId, password)
      if ('error' in result) setFeedback({ error: result.error })
      else {
        setFeedback({ success: 'Wachtwoord gewijzigd.' })
        ;(e.target as HTMLFormElement).reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="password" required>Nieuw wachtwoord</Label>
        <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      <div>
        <Label htmlFor="confirm" required>Bevestig wachtwoord</Label>
        <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
      </div>

      <Feedback {...feedback} />

      <Button type="submit" loading={isPending}>Wachtwoord wijzigen</Button>
    </form>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const TABS = [
  { key: 'persoonsgegevens',   label: 'Persoonsgegevens' },
  { key: 'bedrijfsgegevens',   label: 'Bedrijfsgegevens' },
  { key: 'verbonden_apotheken', label: 'Verbonden apotheken' },
  { key: 'wachtwoord',         label: 'Wachtwoord' },
]

export function AssistentDetail({ userId, email, user, assistantProfile, links, pharmacies, defaultKmRate, defaultHourlyRateAssistant, defaultHourlyRatePharmacy }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0"
          style={{ backgroundColor: user.color ?? '#0d9488' }}
        >
          {(user.first_name?.[0] ?? email[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-text">
            {[user.first_name, user.last_name].filter(Boolean).join(' ') || email}
          </p>
          <p className="text-xs text-text-muted">{email}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={user.is_active ? 'success' : 'neutral'}>
            {user.is_active ? 'Actief' : 'Inactief'}
          </Badge>
        </div>
      </div>

      <Tabs tabs={TABS}>
        {activeKey => (
          <>
            {activeKey === 'persoonsgegevens'   && <PersoonsgegevensTab userId={userId} email={email} user={user} />}
            {activeKey === 'bedrijfsgegevens'   && <BedrijfsgegevensTab userId={userId} profile={assistantProfile} />}
            {activeKey === 'verbonden_apotheken' && <VerbondenApothekenTab userId={userId} initialLinks={links} pharmacies={pharmacies} defaultKmRate={defaultKmRate} defaultHourlyRateAssistant={defaultHourlyRateAssistant} defaultHourlyRatePharmacy={defaultHourlyRatePharmacy} />}
            {activeKey === 'wachtwoord'          && <WachtwoordTab userId={userId} />}
          </>
        )}
      </Tabs>
    </div>
  )
}
