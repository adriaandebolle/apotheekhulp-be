'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { Tabs } from '@/components/ui/Tabs'
import { Label, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { updateUserProfile, adminChangePassword } from '@/lib/actions/users'
import { upsertPharmacyProfile } from '@/lib/actions/pharmacy-profiles'
import { createLocation, updateLocation, deleteLocation } from '@/lib/actions/locations'
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete'

// ─── Single-field address autocomplete ───────────────────────────────────────

type NominatimResult = {
  place_id: number
  display_name: string
  address: {
    road?: string
    house_number?: string
    postcode?: string
    city?: string
    town?: string
    village?: string
    municipality?: string
    suburb?: string
  }
}

function formatAddress(a: NominatimResult['address']): string {
  const street = [a.road, a.house_number].filter(Boolean).join(' ')
  const place  = a.postcode
    ? `${a.postcode} ${a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? ''}`.trim()
    : (a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? '')
  return [street, place].filter(Boolean).join(', ')
}

function AddressInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([])
  const [open, setOpen]               = useState(false)
  const [loading, setLoading]         = useState(false)
  const debounceRef  = useRef<ReturnType<typeof setTimeout>>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length < 3) { setSuggestions([]); setOpen(false); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res  = await fetch(`/api/address-search?q=${encodeURIComponent(value)}`)
        const data: NominatimResult[] = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch { /* silent */ }
      finally { setLoading(false) }
    }, 320)
    return () => clearTimeout(debounceRef.current)
  }, [value])

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const inputBase = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Typ adres om te zoeken…"
          autoComplete="off"
          className={inputBase}
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="animate-spin h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </span>
        )}
      </div>
      {open && (
        <ul className="absolute z-50 w-full mt-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden divide-y divide-border">
          {suggestions.map(s => (
            <li key={s.place_id}>
              <button
                type="button"
                onClick={() => { onChange(formatAddress(s.address)); setOpen(false) }}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-primary-light hover:text-primary transition-colors leading-snug"
              >
                {s.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Types ───────────────────────────────────────────────────────────────────

type UserRow = {
  id: string
  phone: string | null
  is_active: boolean
}

type PharmacyProfileRow = {
  vat_number:           string | null
  vat_liable:           boolean
  company_name:         string | null
  billing_street:       string | null
  billing_house_number: string | null
  billing_postcode:     string | null
  billing_city:         string | null
} | null

type LocationRow = {
  id:        string
  name:      string
  address:   string | null
  is_active: boolean
}

interface Props {
  userId:          string
  email:           string
  user:            UserRow
  pharmacyProfile: PharmacyProfileRow
  locations:       LocationRow[]
}

// ─── Shared feedback ──────────────────────────────────────────────────────────

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error)   return <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
  if (success) return <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
  return null
}

// ─── Tab 1: Gegevens ─────────────────────────────────────────────────────────

function GegevensTab({ userId, email, user }: { userId: string; email: string; user: UserRow }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setFeedback({})
    startTransition(async () => {
      const result = await updateUserProfile(userId, {
        phone:     (fd.get('phone') as string).trim() || undefined,
        is_active: fd.has('is_active'),
      })
      if ('error' in result) setFeedback({ error: result.error })
      else setFeedback({ success: 'Gegevens opgeslagen.' })
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
      <div>
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" value={email} disabled />
        <p className="mt-1 text-xs text-text-muted">E-mailadres kan niet gewijzigd worden via dit formulier.</p>
      </div>

      <div>
        <Label htmlFor="phone">Telefoonnummer</Label>
        <Input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ''} />
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

function BedrijfsgegevensTab({ userId, profile }: { userId: string; profile: PharmacyProfileRow }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ error?: string; success?: string }>({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setFeedback({})
    startTransition(async () => {
      const result = await upsertPharmacyProfile(userId, {
        vat_number:           (fd.get('vat_number')           as string).trim() || undefined,
        vat_liable:           fd.has('vat_liable'),
        company_name:         (fd.get('company_name')         as string).trim() || undefined,
        billing_street:       (fd.get('billing_street')       as string).trim() || undefined,
        billing_house_number: (fd.get('billing_house_number') as string).trim() || undefined,
        billing_postcode:     (fd.get('billing_postcode')     as string).trim() || undefined,
        billing_city:         (fd.get('billing_city')         as string).trim() || undefined,
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
        <Label htmlFor="company_name">Apotheeknaam</Label>
        <Input id="company_name" name="company_name" defaultValue={profile?.company_name ?? ''} />
      </div>

      <AddressAutocomplete
        names={{
          street:       'billing_street',
          house_number: 'billing_house_number',
          postcode:     'billing_postcode',
          city:         'billing_city',
        }}
        defaults={{
          street:       profile?.billing_street       ?? '',
          house_number: profile?.billing_house_number ?? '',
          postcode:     profile?.billing_postcode     ?? '',
          city:         profile?.billing_city         ?? '',
        }}
      />

      <Feedback {...feedback} />

      <Button type="submit" loading={isPending}>Opslaan</Button>
    </form>
  )
}

// ─── Tab 3: Locaties ──────────────────────────────────────────────────────────

function LocatiesTab({ pharmacyId, initialLocations }: { pharmacyId: string; initialLocations: LocationRow[] }) {
  const [locations, setLocations]     = useState(initialLocations)
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [formMode, setFormMode]       = useState<'add' | 'edit'>('add')
  const [formName, setFormName]       = useState('')
  const [formAddress, setFormAddress] = useState('')
  const [formError, setFormError]     = useState<string>()
  const [isPendingForm, startForm]    = useTransition()
  const [togglingId, setTogglingId]   = useState<string>()
  const [deletingId, setDeletingId]   = useState<string>()

  function openAdd() {
    setFormMode('add')
    setEditingId(null)
    setFormName('')
    setFormAddress('')
    setFormError(undefined)
  }

  function openEdit(loc: LocationRow) {
    setFormMode('edit')
    setEditingId(loc.id)
    setFormName(loc.name)
    setFormAddress(loc.address ?? '')
    setFormError(undefined)
  }

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(undefined)

    if (formMode === 'add') {
      startForm(async () => {
        const result = await createLocation(pharmacyId, {
          name:    formName.trim(),
          address: formAddress.trim() || undefined,
        })
        if ('error' in result) {
          setFormError(result.error)
        } else {
          setLocations(prev => [...prev, {
            id:        result.data.id,
            name:      formName.trim(),
            address:   formAddress.trim() || null,
            is_active: true,
          }])
          setFormName('')
          setFormAddress('')
        }
      })
    } else if (editingId) {
      startForm(async () => {
        const result = await updateLocation(editingId, {
          name:    formName.trim(),
          address: formAddress.trim() || undefined,
        })
        if ('error' in result) {
          setFormError(result.error)
        } else {
          setLocations(prev =>
            prev.map(l => l.id === editingId
              ? { ...l, name: formName.trim(), address: formAddress.trim() || null }
              : l
            )
          )
          openAdd()
        }
      })
    }
  }

  async function handleToggle(loc: LocationRow) {
    setTogglingId(loc.id)
    const result = await updateLocation(loc.id, { is_active: !loc.is_active })
    if ('error' in result) {
      alert(result.error)
    } else {
      setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, is_active: !l.is_active } : l))
    }
    setTogglingId(undefined)
  }

  async function handleDelete(locId: string) {
    if (!confirm('Locatie verwijderen? Dit kan niet ongedaan gemaakt worden.')) return
    setDeletingId(locId)
    const result = await deleteLocation(locId)
    if ('error' in result) {
      alert(result.error)
    } else {
      setLocations(prev => prev.filter(l => l.id !== locId))
      if (editingId === locId) openAdd()
    }
    setDeletingId(undefined)
  }

  return (
    <div className="space-y-6">
      <Table>
        <Thead>
          <Tr>
            <Th>Naam</Th>
            <Th>Adres</Th>
            <Th>Status</Th>
            <Th className="text-right">Acties</Th>
          </Tr>
        </Thead>
        <Tbody>
          {locations.length === 0 && <EmptyRow colSpan={4} message="Nog geen locaties aangemaakt." />}
          {locations.map(loc => (
            <Tr key={loc.id} className={editingId === loc.id ? 'bg-primary-light/40' : undefined}>
              <Td className="font-medium">{loc.name}</Td>
              <Td className="text-text-muted">{loc.address ?? '—'}</Td>
              <Td>
                <Badge variant={loc.is_active ? 'success' : 'neutral'}>
                  {loc.is_active ? 'Actief' : 'Inactief'}
                </Badge>
              </Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => openEdit(loc)}
                    className="text-xs text-primary hover:underline"
                  >
                    Bewerken
                  </button>
                  <button
                    type="button"
                    disabled={togglingId === loc.id}
                    onClick={() => handleToggle(loc)}
                    className="text-xs text-text-muted hover:text-text hover:underline disabled:opacity-40"
                  >
                    {loc.is_active ? 'Deactiveren' : 'Activeren'}
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === loc.id}
                    onClick={() => handleDelete(loc.id)}
                    className="text-xs text-danger hover:underline disabled:opacity-40"
                  >
                    Verwijderen
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Add / Edit form */}
      <div className="border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text mb-4">
          {formMode === 'edit' ? 'Locatie bewerken' : 'Locatie toevoegen'}
        </h3>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loc_name" required>Naam</Label>
              <Input
                id="loc_name"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                required
                placeholder="Hoofdvestiging"
              />
            </div>
            <div>
              <Label htmlFor="loc_address">Adres</Label>
              <AddressInput value={formAddress} onChange={setFormAddress} />
            </div>
          </div>

          {formError && (
            <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
          )}

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" loading={isPendingForm}>
              {formMode === 'edit' ? 'Wijzigingen opslaan' : 'Locatie toevoegen'}
            </Button>
            {formMode === 'edit' && (
              <button
                type="button"
                onClick={openAdd}
                className="text-sm text-text-muted hover:text-text"
              >
                Annuleren
              </button>
            )}
          </div>
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
    const fd       = new FormData(e.currentTarget)
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
  { key: 'gegevens',         label: 'Gegevens' },
  { key: 'bedrijfsgegevens', label: 'Bedrijfsgegevens' },
  { key: 'locaties',         label: 'Locaties' },
  { key: 'wachtwoord',       label: 'Wachtwoord' },
]

export function ApotheekDetail({ userId, email, user, pharmacyProfile, locations }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white text-sm font-semibold shrink-0">
          {(pharmacyProfile?.company_name?.[0] ?? email[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-text">
            {pharmacyProfile?.company_name ?? email}
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
            {activeKey === 'gegevens'         && <GegevensTab         userId={userId} email={email} user={user} />}
            {activeKey === 'bedrijfsgegevens' && <BedrijfsgegevensTab userId={userId} profile={pharmacyProfile} />}
            {activeKey === 'locaties'         && <LocatiesTab         pharmacyId={userId} initialLocations={locations} />}
            {activeKey === 'wachtwoord'       && <WachtwoordTab       userId={userId} />}
          </>
        )}
      </Tabs>
    </div>
  )
}
