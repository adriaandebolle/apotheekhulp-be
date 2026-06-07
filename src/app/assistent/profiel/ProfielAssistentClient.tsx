'use client'

import { useState, useTransition } from 'react'
import { Label, Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { updateMyUserProfile } from '@/lib/actions/users'
import { updateMyAssistantProfile } from '@/lib/actions/assistant-profiles'
import { setMyAutoConfirm } from '@/lib/actions/links'
import type { LinkRow } from './page'

type UserData = {
  first_name: string | null
  last_name:  string | null
  phone:      string | null
}

type ProfileData = {
  vat_number:          string | null
  vat_liable:          boolean
  company_name:        string | null
  street:              string | null
  house_number:        string | null
  postcode:            string | null
  city:                string | null
  iban:                string | null
  invoice_prefix:      string | null
  invoice_next_number: number
} | null

function Feedback({ error, success }: { error?: string; success?: string }) {
  if (error)   return <p className="text-sm text-danger bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
  if (success) return <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{success}</p>
  return null
}

export default function ProfielAssistentClient({
  email,
  user,
  assistantProfile,
  links,
}: {
  email:            string
  user:             UserData
  assistantProfile: ProfileData
  links:            LinkRow[]
}) {
  // ── Personal info ────────────────────────────────────────────────────────────
  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [lastName,  setLastName]  = useState(user.last_name  ?? '')
  const [phone,     setPhone]     = useState(user.phone      ?? '')
  const [userFb,    setUserFb]    = useState<{ error?: string; success?: string }>({})
  const [, startUserTransition] = useTransition()

  function saveUserProfile() {
    startUserTransition(async () => {
      setUserFb({})
      const result = await updateMyUserProfile({
        first_name: firstName.trim() || undefined,
        last_name:  lastName.trim()  || undefined,
        phone:      phone.trim()     || undefined,
      })
      if ('error' in result) setUserFb({ error: result.error })
      else setUserFb({ success: 'Opgeslagen.' })
    })
  }

  // ── Company + invoice info ───────────────────────────────────────────────────
  const [vatNumber,    setVatNumber]    = useState(assistantProfile?.vat_number         ?? '')
  const [vatLiable,    setVatLiable]    = useState(assistantProfile?.vat_liable         ?? true)
  const [companyName,  setCompanyName]  = useState(assistantProfile?.company_name       ?? '')
  const [street,       setStreet]       = useState(assistantProfile?.street             ?? '')
  const [houseNumber,  setHouseNumber]  = useState(assistantProfile?.house_number       ?? '')
  const [postcode,     setPostcode]     = useState(assistantProfile?.postcode           ?? '')
  const [city,         setCity]         = useState(assistantProfile?.city               ?? '')
  const [iban,         setIban]         = useState(assistantProfile?.iban               ?? '')
  const [invPrefix,    setInvPrefix]    = useState(assistantProfile?.invoice_prefix     ?? '')
  const [invNextNum,   setInvNextNum]   = useState(assistantProfile?.invoice_next_number ?? 1)
  const [profFb,       setProfFb]       = useState<{ error?: string; success?: string }>({})
  const [, startProfTransition] = useTransition()

  function saveAssistantProfile() {
    startProfTransition(async () => {
      setProfFb({})
      const result = await updateMyAssistantProfile({
        vat_number:          vatNumber.trim()   || undefined,
        vat_liable:          vatLiable,
        company_name:        companyName.trim() || undefined,
        street:              street.trim()      || undefined,
        house_number:        houseNumber.trim() || undefined,
        postcode:            postcode.trim()    || undefined,
        city:                city.trim()        || undefined,
        iban:                iban.trim()        || undefined,
        invoice_prefix:      invPrefix.trim()   || undefined,
        invoice_next_number: invNextNum,
      })
      if ('error' in result) setProfFb({ error: result.error })
      else setProfFb({ success: 'Opgeslagen.' })
    })
  }

  // ── Auto-confirm per link ────────────────────────────────────────────────────
  const [autoConfirmMap, setAutoConfirmMap] = useState<Record<string, boolean>>(
    Object.fromEntries(links.map(l => [l.id, l.autoConfirmAssistent]))
  )
  const [, startLinkTransition] = useTransition()

  function toggleAutoConfirm(linkId: string, value: boolean) {
    setAutoConfirmMap(prev => ({ ...prev, [linkId]: value }))
    startLinkTransition(async () => {
      await setMyAutoConfirm(linkId, value)
    })
  }

  return (
    <div className="space-y-8">
      {/* ── Personal data ─────────────────────────��────────────────────────��─── */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text mb-4">Persoonlijke gegevens</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-mailadres</Label>
            <Input id="email" type="email" value={email} disabled />
            <p className="text-xs text-text-muted mt-1">Contacteer de beheerder om je e-mailadres te wijzigen.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="first_name">Voornaam</Label>
              <Input id="first_name" value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="last_name">Achternaam</Label>
              <Input id="last_name" value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Telefoonnummer</Label>
            <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <Feedback {...userFb} />
          <Button onClick={saveUserProfile}>Opslaan</Button>
        </div>
      </div>

      {/* ── Company data ─────────────────────────────────────────────────────── */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text mb-4">Bedrijfsgegevens</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vat_number">BTW-nummer</Label>
              <Input id="vat_number" value={vatNumber} onChange={e => setVatNumber(e.target.value)} placeholder="BE0123456789" />
            </div>
            <div className="flex items-end pb-2">
              <Checkbox
                label="BTW-plichtig"
                checked={vatLiable}
                onChange={e => setVatLiable(e.target.checked)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="company_name">Bedrijfsnaam</Label>
            <Input id="company_name" value={companyName} onChange={e => setCompanyName(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Label htmlFor="street">Straat</Label>
              <Input id="street" value={street} onChange={e => setStreet(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="house_number">Nr.</Label>
              <Input id="house_number" value={houseNumber} onChange={e => setHouseNumber(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postcode">Postcode</Label>
              <Input id="postcode" value={postcode} onChange={e => setPostcode(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">Gemeente</Label>
              <Input id="city" value={city} onChange={e => setCity(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="iban">IBAN</Label>
            <Input id="iban" value={iban} onChange={e => setIban(e.target.value)} placeholder="BE00 0000 0000 0000" />
          </div>
          <Feedback {...profFb} />
          <Button onClick={saveAssistantProfile}>Opslaan</Button>
        </div>
      </div>

      {/* ── Invoice settings ───────────────────────────���──────────────────────── */}
      <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-text mb-1">Factuurinstellingen</h2>
        <p className="text-sm text-text-muted mb-4">
          Gebruik dit om je eigen factuurnummering in te stellen. Facturen worden aangemaakt door de beheerder.
        </p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice_prefix">Factuurprefix</Label>
              <Input
                id="invoice_prefix"
                value={invPrefix}
                onChange={e => setInvPrefix(e.target.value)}
                placeholder="bijv. MAYA-2024"
              />
            </div>
            <div>
              <Label htmlFor="invoice_next_number">Volgend factuurnummer</Label>
              <Input
                id="invoice_next_number"
                type="number"
                min={1}
                value={invNextNum}
                onChange={e => setInvNextNum(parseInt(e.target.value, 10) || 1)}
              />
            </div>
          </div>
          {invPrefix && (
            <p className="text-xs text-text-muted">
              Volgende factuur: <strong>{invPrefix}-{String(invNextNum).padStart(3, '0')}</strong>
            </p>
          )}
          <Feedback {...profFb} />
          <Button onClick={saveAssistantProfile}>Opslaan</Button>
        </div>
      </div>

      {/* ── Linked pharmacies ─────────────────────────────────────────────────── */}
      {links.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-6 shadow-sm">
          <h2 className="text-base font-semibold text-text mb-1">Mijn apotheken</h2>
          <p className="text-sm text-text-muted mb-4">
            Tarieven en afstanden worden ingesteld door de beheerder. Je kan per apotheek instellen of shifts automatisch bevestigd worden.
          </p>
          <div className="space-y-3">
            {links.map(l => (
              <div key={l.id} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text">{l.pharmacyName}</p>
                  <p className="text-xs text-text-muted">{l.locationName}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-text-muted">
                    {l.hourlyRate !== null && (
                      <span>€ {l.hourlyRate.toFixed(2)}/u</span>
                    )}
                    {l.distanceKm !== null && (
                      <span>{l.distanceKm} km</span>
                    )}
                    {l.kmAllowance !== null && (
                      <span>€ {l.kmAllowance.toFixed(4)}/km</span>
                    )}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-text cursor-pointer whitespace-nowrap shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={autoConfirmMap[l.id] ?? false}
                    onChange={e => toggleAutoConfirm(l.id, e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Auto-bevestigen
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
