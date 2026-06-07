'use client'

import { useState, useTransition } from 'react'
import { createMessage, updateMessage, deleteMessage } from '@/lib/actions/messages'
import { RichTextEditor } from '@/components/RichTextEditor'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Label, Input } from '@/components/ui/Input'
import { Checkbox } from '@/components/ui/Checkbox'

export type Message = {
  id: string
  title: string
  body: string
  show_as_popup: boolean
  notify_assistants: boolean
  notify_pharmacies: boolean
  created_at: string
}

type Mode = { type: 'list' } | { type: 'create' } | { type: 'edit'; message: Message }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nl-BE', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

type FormSubmit = (
  title: string,
  body: string,
  showAsPopup: boolean,
  notifyAssistants: boolean,
  notifyPharmacies: boolean,
) => void

function MessageForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  isEdit,
}: {
  initial?: Message
  onSubmit: FormSubmit
  onCancel: () => void
  loading: boolean
  isEdit: boolean
}) {
  const [title, setTitle]                       = useState(initial?.title ?? '')
  const [body, setBody]                         = useState(initial?.body ?? '')
  const [showAsPopup, setShowAsPopup]           = useState(initial?.show_as_popup ?? false)
  const [notifyAssistants, setNotifyAssistants] = useState(false)
  const [notifyPharmacies, setNotifyPharmacies] = useState(false)

  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="msg-title">Titel</Label>
        <Input
          id="msg-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Bijv. Tariefswijziging per 1 juli 2026"
        />
      </div>

      <div>
        <Label>Inhoud</Label>
        <RichTextEditor value={body} onChange={setBody} placeholder="Typ hier het bericht…" />
      </div>

      <div className="space-y-3 pt-1">
        <p className="text-sm font-medium text-text">Opties</p>

        <div>
          <Checkbox
            name="show_as_popup"
            label="Toon als popup op de startpagina"
            checked={showAsPopup}
            onChange={e => setShowAsPopup(e.target.checked)}
          />
          <p className="text-xs text-text-muted mt-0.5 ml-6">
            Slechts één bericht kan tegelijk als popup worden getoond. Het vorige popup-bericht wordt automatisch uitgeschakeld.
          </p>
        </div>

        <div>
          <Checkbox
            name="notify_assistants"
            label="Stuur e-mail naar alle assistenten"
            checked={notifyAssistants}
            onChange={e => setNotifyAssistants(e.target.checked)}
          />
          {isEdit && notifyAssistants && (
            <p className="text-xs text-warning mt-0.5 ml-6">Verstuurt opnieuw naar alle assistenten.</p>
          )}
        </div>

        <div>
          <Checkbox
            name="notify_pharmacies"
            label="Stuur e-mail naar alle apotheken"
            checked={notifyPharmacies}
            onChange={e => setNotifyPharmacies(e.target.checked)}
          />
          {isEdit && notifyPharmacies && (
            <p className="text-xs text-warning mt-0.5 ml-6">Verstuurt opnieuw naar alle apotheken.</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          onClick={() => onSubmit(title, body, showAsPopup, notifyAssistants, notifyPharmacies)}
          loading={loading}
          disabled={!title.trim() || !body.trim()}
        >
          {isEdit ? 'Opslaan' : 'Aanmaken'}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Annuleren
        </Button>
      </div>
    </div>
  )
}

export default function BerichtenClient({ messages }: { messages: Message[] }) {
  const [mode, setMode]              = useState<Mode>({ type: 'list' })
  const [error, setError]            = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleCreate(title: string, body: string, showAsPopup: boolean, notifyAssistants: boolean, notifyPharmacies: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await createMessage({
        title, body,
        show_as_popup:     showAsPopup,
        notify_assistants: notifyAssistants,
        notify_pharmacies: notifyPharmacies,
      })
      if ('error' in result) { setError(result.error); return }
      setMode({ type: 'list' })
    })
  }

  function handleUpdate(id: string, title: string, body: string, showAsPopup: boolean, notifyAssistants: boolean, notifyPharmacies: boolean) {
    setError(null)
    startTransition(async () => {
      const result = await updateMessage(id, {
        title, body,
        show_as_popup:     showAsPopup,
        notify_assistants: notifyAssistants,
        notify_pharmacies: notifyPharmacies,
      })
      if ('error' in result) { setError(result.error); return }
      setMode({ type: 'list' })
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Weet je zeker dat je dit bericht wil verwijderen?')) return
    setError(null)
    startTransition(async () => {
      const result = await deleteMessage(id)
      if ('error' in result) setError(result.error)
    })
  }

  // ── Form view ────────────────────────────────────────────────────────────────

  if (mode.type === 'create' || mode.type === 'edit') {
    return (
      <div className="p-8">
        <button
          type="button"
          onClick={() => setMode({ type: 'list' })}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Terug naar berichten
        </button>

        <h1 className="text-2xl font-bold text-text mb-6">
          {mode.type === 'create' ? 'Nieuw bericht' : 'Bericht bewerken'}
        </h1>

        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-5">
            {error}
          </div>
        )}

        <MessageForm
          initial={mode.type === 'edit' ? mode.message : undefined}
          isEdit={mode.type === 'edit'}
          onSubmit={(title, body, showAsPopup, notifyAssistants, notifyPharmacies) =>
            mode.type === 'edit'
              ? handleUpdate(mode.message.id, title, body, showAsPopup, notifyAssistants, notifyPharmacies)
              : handleCreate(title, body, showAsPopup, notifyAssistants, notifyPharmacies)
          }
          onCancel={() => setMode({ type: 'list' })}
          loading={isPending}
        />
      </div>
    )
  }

  // ── List view ────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs text-text-muted mb-1">Beheer</p>
          <h1 className="text-2xl font-bold text-text">Berichten</h1>
          <p className="text-sm text-text-muted mt-1">
            Berichten worden getoond aan assistenten en apotheken in hun portaal.
          </p>
        </div>
        <Button onClick={() => setMode({ type: 'create' })}>
          + Nieuw bericht
        </Button>
      </div>

      {error && (
        <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-lg px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="text-center py-24 text-text-muted text-sm">
          Nog geen berichten. Maak het eerste bericht aan.
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-surface border border-border rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-text">{msg.title}</h2>
                    {msg.show_as_popup      && <Badge variant="info">Popup</Badge>}
                    {msg.notify_assistants  && <Badge variant="neutral">✉ Assistenten</Badge>}
                    {msg.notify_pharmacies  && <Badge variant="neutral">✉ Apotheken</Badge>}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{formatDate(msg.created_at)}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMode({ type: 'edit', message: msg })}
                    disabled={isPending}
                  >
                    Bewerken
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(msg.id)}
                    disabled={isPending}
                  >
                    Verwijderen
                  </Button>
                </div>
              </div>
              <div
                className="rich-text text-text mt-3"
                dangerouslySetInnerHTML={{ __html: msg.body }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
