'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

export default function AgendaAbonnementClient({ icalUrl }: { icalUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(icalUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select the input
      const el = document.getElementById('ical-url') as HTMLInputElement | null
      el?.select()
    }
  }

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="bg-info-light border border-info text-info rounded-xl px-4 py-3 text-sm">
        <strong>Wat is dit?</strong> Met deze link kan je al je shifts automatisch importeren in
        Google Calendar, Apple Calendar of Outlook. Je agenda wordt automatisch bijgewerkt wanneer
        er nieuwe shifts worden ingepland.
      </div>

      {/* Personal link */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h2 className="font-semibold text-text mb-1">Jouw persoonlijke agenda-link</h2>
        <p className="text-xs text-text-muted mb-3">
          Deze link is persoonlijk en geheim — deel hem niet met anderen.
        </p>
        <div className="flex gap-2">
          <input
            id="ical-url"
            type="text"
            value={icalUrl}
            readOnly
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background text-text font-mono select-all"
            onClick={e => (e.target as HTMLInputElement).select()}
          />
          <Button onClick={handleCopy} variant="primary">
            {copied ? 'Gekopieerd!' : 'Kopieer'}
          </Button>
        </div>
      </div>

      {/* One-time download */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h2 className="font-semibold text-text mb-1">Eenmalig downloaden</h2>
        <p className="text-xs text-text-muted mb-3">
          Download een .ics bestand met al je huidige shifts. Let op: dit bestand wordt niet
          automatisch bijgewerkt.
        </p>
        <a
          href={icalUrl}
          download="apotheekhulp-shifts.ics"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary border border-primary rounded-lg px-4 py-2 hover:bg-primary hover:text-white transition-colors"
        >
          Download .ics bestand
        </a>
      </div>

      {/* Instructions */}
      <div className="bg-surface rounded-xl border border-border p-5 shadow-sm">
        <h2 className="font-semibold text-text mb-4">Hoe toevoegen aan mijn agenda?</h2>
        <div className="space-y-2">

          <details className="group border border-border rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-text hover:bg-background list-none">
              Google Calendar
              <span className="text-text-muted group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-text-muted border-t border-border">
              <ol className="list-decimal list-inside space-y-1">
                <li>Ga naar <a href="https://calendar.google.com" target="_blank" rel="noreferrer" className="text-primary underline">calendar.google.com</a></li>
                <li>Klik links op het <strong className="text-text">+</strong> naast "Andere agenda's"</li>
                <li>Kies <strong className="text-text">"Via URL"</strong></li>
                <li>Plak de link hierboven en klik <strong className="text-text">"Agenda toevoegen"</strong></li>
              </ol>
            </div>
          </details>

          <details className="group border border-border rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-text hover:bg-background list-none">
              Apple Calendar (iPhone / Mac)
              <span className="text-text-muted group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-text-muted border-t border-border space-y-3">
              <div>
                <p className="font-medium text-text mb-1">Op Mac:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open Agenda → menu <strong className="text-text">Bestand</strong> → <strong className="text-text">Nieuwe agendaabonnement</strong></li>
                  <li>Plak de link en klik <strong className="text-text">Abonneren</strong></li>
                </ol>
              </div>
              <div>
                <p className="font-medium text-text mb-1">Op iPhone:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Ga naar <strong className="text-text">Instellingen</strong> → <strong className="text-text">Agenda</strong> → <strong className="text-text">Accounts</strong> → <strong className="text-text">Account toevoegen</strong></li>
                  <li>Kies <strong className="text-text">"Anders"</strong> → <strong className="text-text">"Geabonneerde agenda toevoegen"</strong></li>
                  <li>Plak de link en tik op <strong className="text-text">Volgende</strong></li>
                </ol>
              </div>
            </div>
          </details>

          <details className="group border border-border rounded-lg overflow-hidden">
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer text-sm font-medium text-text hover:bg-background list-none">
              Outlook
              <span className="text-text-muted group-open:rotate-180 transition-transform">▾</span>
            </summary>
            <div className="px-4 pb-4 pt-2 text-sm text-text-muted border-t border-border">
              <ol className="list-decimal list-inside space-y-1">
                <li>Ga naar <a href="https://outlook.office.com/calendar" target="_blank" rel="noreferrer" className="text-primary underline">outlook.office.com/calendar</a></li>
                <li>Klik op <strong className="text-text">"Agenda toevoegen"</strong></li>
                <li>Kies <strong className="text-text">"Abonneren via internet"</strong></li>
                <li>Plak de link en klik <strong className="text-text">"Importeren"</strong></li>
              </ol>
            </div>
          </details>

        </div>
      </div>
    </div>
  )
}
