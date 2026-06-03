'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardBody, StatCard } from '@/components/ui/Card'
import { Input, Select, Textarea, Label, FieldError } from '@/components/ui/Input'
import { Table, Thead, Tbody, Th, Td, Tr, EmptyRow } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Tabs } from '@/components/ui/Tabs'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="text-lg font-semibold text-text mb-4 pb-2 border-b border-border">{title}</h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>
}

export function DesignSystemClient() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-text">Design System</h1>
          <p className="text-text-muted mt-1">Apotheekhulp — component bibliotheek</p>
          <div className="mt-3 inline-flex items-center gap-2 bg-warning-light text-warning text-xs font-medium px-3 py-1.5 rounded-lg">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Primaire kleur is een placeholder (#0d9488). Bevestig via DevTools op apotheekhulp.be.
          </div>
        </div>

        {/* Colors */}
        <Section title="Kleuren">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'primary', bg: 'bg-primary', label: '#0d9488 (TBC)' },
              { name: 'primary-dark', bg: 'bg-primary-dark', label: '#0f766e (TBC)' },
              { name: 'primary-light', bg: 'bg-primary-light', label: '#ccfbf1 (TBC)' },
              { name: 'background', bg: 'bg-background border', label: '#f8fafc' },
              { name: 'surface', bg: 'bg-surface border', label: '#ffffff' },
              { name: 'border', bg: 'bg-border', label: '#e2e8f0' },
              { name: 'text', bg: 'bg-text', label: '#0f172a' },
              { name: 'text-muted', bg: 'bg-text-muted', label: '#64748b' },
            ].map(c => (
              <div key={c.name}>
                <div className={`h-12 rounded-lg ${c.bg}`} />
                <p className="text-xs font-medium text-text mt-1.5">{c.name}</p>
                <p className="text-xs text-text-muted">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { name: 'success', bg: 'bg-success', label: '#16a34a' },
              { name: 'warning', bg: 'bg-warning', label: '#d97706' },
              { name: 'danger', bg: 'bg-danger', label: '#dc2626' },
              { name: 'info', bg: 'bg-info', label: '#2563eb' },
            ].map(c => (
              <div key={c.name}>
                <div className={`h-12 rounded-lg ${c.bg}`} />
                <p className="text-xs font-medium text-text mt-1.5">{c.name}</p>
                <p className="text-xs text-text-muted">{c.label}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typografie">
          <div className="space-y-3">
            <p className="text-3xl font-bold text-text">H1 — Paginatitel</p>
            <p className="text-2xl font-bold text-text">H2 — Sectietitel</p>
            <p className="text-xl font-semibold text-text">H3 — Kaarttitel</p>
            <p className="text-base text-text">Body — Normale tekst voor inhoud en beschrijvingen.</p>
            <p className="text-sm text-text-muted">Small / muted — Labels, subtekst, metadata</p>
            <p className="text-xs text-text-muted uppercase tracking-wide font-medium">Caps label — Tabelkoptekst</p>
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Knoppen">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-text-muted mb-2">Varianten</p>
              <Row>
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="ghost">Ghost</Button>
              </Row>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Groottes</p>
              <Row>
                <Button size="sm">Klein</Button>
                <Button size="md">Normaal</Button>
                <Button size="lg">Groot</Button>
              </Row>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-2">Staten</p>
              <Row>
                <Button loading>Laden...</Button>
                <Button disabled>Uitgeschakeld</Button>
              </Row>
            </div>
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges / Status">
          <Row>
            <Badge status="goedgekeurd">Goedgekeurd</Badge>
            <Badge status="in_afwachting">In afwachting</Badge>
            <Badge status="geweigerd">Geweigerd</Badge>
            <Badge status="betaald">Betaald</Badge>
            <Badge status="te_betalen">Te betalen</Badge>
            <Badge status="gefactureerd">Gefactureerd</Badge>
            <Badge status="inactief">Inactief</Badge>
          </Row>
        </Section>

        {/* Cards */}
        <Section title="Kaarten">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <StatCard label="Assistenten" value={15} sub="↑ 2 deze maand" trend="up" />
            <StatCard label="Apotheken" value={32} />
            <StatCard label="Openstaande facturen" value={18} sub="↓ 3 vs vorige maand" trend="down" />
          </div>
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-text">Kaart met header</h3>
            </CardHeader>
            <CardBody>
              <p className="text-sm text-text-muted">Inhoud van de kaart.</p>
            </CardBody>
          </Card>
        </Section>

        {/* Form inputs */}
        <Section title="Formuliervelden">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
            <div>
              <Label htmlFor="ex-input" required>E-mailadres</Label>
              <Input id="ex-input" type="email" placeholder="naam@voorbeeld.be" />
            </div>
            <div>
              <Label htmlFor="ex-select">Rol</Label>
              <Select id="ex-select">
                <option>Admin</option>
                <option>Assistent</option>
                <option>Apotheek</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="ex-error">Met fout</Label>
              <Input id="ex-error" defaultValue="ongeldig" error="Dit veld is verplicht." />
              <FieldError message="Dit veld is verplicht." />
            </div>
            <div>
              <Label htmlFor="ex-disabled">Uitgeschakeld</Label>
              <Input id="ex-disabled" defaultValue="Niet bewerkbaar" disabled />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="ex-textarea">Opmerking</Label>
              <Textarea id="ex-textarea" placeholder="Schrijf hier..." />
            </div>
          </div>
        </Section>

        {/* Table */}
        <Section title="Tabel">
          <Card>
            <Table>
              <Thead>
                <tr>
                  <Th>Naam</Th>
                  <Th>Apotheek</Th>
                  <Th>Datum</Th>
                  <Th>Status</Th>
                </tr>
              </Thead>
              <Tbody>
                {[
                  { name: 'Maya Abdo', apotheek: 'Apotheek De Bolle', date: '02/06/2026', status: 'goedgekeurd' },
                  { name: 'Sara Claes', apotheek: 'Apotheek Centrale', date: '03/06/2026', status: 'in_afwachting' },
                  { name: 'Lena Martens', apotheek: 'Apotheek Noord', date: '04/06/2026', status: 'geweigerd' },
                ].map(row => (
                  <Tr key={row.name}>
                    <Td className="font-medium">{row.name}</Td>
                    <Td>{row.apotheek}</Td>
                    <Td>{row.date}</Td>
                    <Td><Badge status={row.status}>{row.status.replace('_', ' ')}</Badge></Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>
          <Card className="mt-4">
            <Table>
              <Thead><tr><Th>Leeg voorbeeld</Th></tr></Thead>
              <Tbody><EmptyRow colSpan={1} /></Tbody>
            </Table>
          </Card>
        </Section>

        {/* Tabs */}
        <Section title="Tabs">
          <Tabs
            tabs={[
              { key: 'persoonsgegevens', label: 'Persoonsgegevens' },
              { key: 'bedrijfsgegevens', label: 'Bedrijfsgegevens' },
              { key: 'facturen', label: 'Facturen' },
            ]}
          >
            {(active) => (
              <p className="text-sm text-text-muted">
                Actief tabblad: <strong>{active}</strong>
              </p>
            )}
          </Tabs>
        </Section>

        {/* Modal */}
        <Section title="Modal">
          <Button onClick={() => setModalOpen(true)}>Open modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Voorbeeld modal">
            <p className="text-sm text-text-muted mb-4">
              Dit is de inhoud van de modal. Sluit via het kruisje, de knop hieronder, of de Escape-toets.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuleren</Button>
              <Button onClick={() => setModalOpen(false)}>Bevestigen</Button>
            </div>
          </Modal>
        </Section>

      </div>
    </div>
  )
}
