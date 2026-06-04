'use client'

import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin  from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin     from '@fullcalendar/list'
import interactionPlugin, { type DateClickArg } from '@fullcalendar/interaction'
import type { EventClickArg, EventInput } from '@fullcalendar/core'
import nlLocale from '@fullcalendar/core/locales/nl'
import { Button } from '@/components/ui/Button'
import type { Assistent, ShiftData, PharmacyOption } from './page'
import ShiftAddModal from './ShiftAddModal'
import ShiftEditModal from './ShiftEditModal'
import BulkShiftModal from './BulkShiftModal'

// ── Status styling ─────────────────────────────────────────────────────────────

const STATUS_OPACITY: Record<string, number> = {
  approved:          1,
  pending_apotheek:  0.75,
  pending_assistant: 0.5,
  denied:            0.35,
}

function hexWithOpacity(hex: string, opacity: number): string {
  if (opacity === 1) return hex
  const clean = hex.replace('#', '')
  if (clean.length !== 6) return hex
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return hex
  return `rgba(${r},${g},${b},${opacity})`
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function KalenderClient({
  assistants,
  shifts,
  pharmacies,
}: {
  assistants: Assistent[]
  shifts: ShiftData[]
  pharmacies: PharmacyOption[]
}) {
  const ALL_STATUSES = ['approved', 'pending_apotheek', 'pending_assistant', 'denied'] as const
  type Status = typeof ALL_STATUSES[number]

  const [visibleIds, setVisibleIds] = useState<Set<string>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('kalender_visible_assistants') ?? 'null') as string[] | null
      if (stored) {
        const valid = stored.filter(id => assistants.some(a => a.id === id))
        if (valid.length) return new Set(valid)
      }
    } catch {}
    return new Set(assistants.map(a => a.id))
  })

  const [visibleStatuses, setVisibleStatuses] = useState<Set<Status>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('kalender_visible_statuses') ?? 'null') as Status[] | null
      if (stored) {
        const valid = stored.filter((s): s is Status => (ALL_STATUSES as readonly string[]).includes(s))
        if (valid.length) return new Set(valid)
      }
    } catch {}
    return new Set(ALL_STATUSES)
  })

  useEffect(() => {
    localStorage.setItem('kalender_visible_assistants', JSON.stringify([...visibleIds]))
  }, [visibleIds])

  useEffect(() => {
    localStorage.setItem('kalender_visible_statuses', JSON.stringify([...visibleStatuses]))
  }, [visibleStatuses])
  const [addDate, setAddDate]     = useState<string | null>(null)
  const [editShift, setEditShift] = useState<ShiftData | null>(null)
  const [bulkOpen, setBulkOpen]   = useState(false)

  function toggleAssistent(id: string) {
    setVisibleIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleStatus(s: Status) {
    setVisibleStatuses(prev => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })
  }

  function selectAll()  { setVisibleIds(new Set(assistants.map(a => a.id))) }
  function selectNone() { setVisibleIds(new Set()) }

  function openAddModal() {
    setAddDate(new Date().toISOString().split('T')[0])
  }

  const events: EventInput[] = shifts
    .filter(s => visibleIds.has(s.assistantId) && visibleStatuses.has(s.status as Status))
    .map(s => {
      const opacity  = STATUS_OPACITY[s.status] ?? 0.5
      const bg       = hexWithOpacity(s.color, opacity)
      const isDashed = s.status !== 'approved'
      return {
        id:              s.id,
        title:           `${s.assistantName} - ${s.startTime?.slice(0, 5) ?? ''}`,
        start:           `${s.date}T${s.startTime}`,
        end:             `${s.date}T${s.endTime}`,
        backgroundColor: bg,
        borderColor:     s.color,
        textColor:       opacity < 0.7 ? '#444' : '#fff',
        classNames:      isDashed ? ['fc-event--pending'] : [],
        extendedProps:   { shift: s },
      }
    })

  function handleDateClick(arg: DateClickArg) {
    setAddDate(arg.dateStr.slice(0, 10))
  }

  function handleEventClick(arg: EventClickArg) {
    const shift = arg.event.extendedProps.shift as ShiftData
    setEditShift(shift)
  }

  return (
    <>
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-6 border-b border-border shrink-0">
        <div>
          <p className="text-xs text-text-muted mb-1">Kalender</p>
          <h1 className="text-2xl font-bold text-text">Kalender</h1>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>Bulk shifts</Button>
          <Button size="sm" onClick={openAddModal}>+ Shift inplannen</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Filter sidebar ────────────────────────────────────────────────── */}
        <aside className="w-52 shrink-0 border-r border-border overflow-y-auto px-4 py-5 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-text uppercase tracking-wide">
                Assistenten
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-xs text-primary hover:underline">
                  Alle
                </button>
                <span className="text-text-muted">·</span>
                <button type="button" onClick={selectNone} className="text-xs text-text-muted hover:text-text hover:underline">
                  Geen
                </button>
              </div>
            </div>

            <ul className="space-y-1.5">
              {assistants.map(a => {
                const name = [a.first_name, a.last_name].filter(Boolean).join(' ') || '—'
                return (
                  <li key={a.id}>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={visibleIds.has(a.id)}
                        onChange={() => toggleAssistent(a.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-sm text-text truncate">{name}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Status filter */}
          <div>
            <p className="text-xs font-semibold text-text uppercase tracking-wide mb-3">Status</p>
            <ul className="space-y-1.5">
              {(
                [
                  { status: 'approved'          as Status, label: 'Goedgekeurd',              color: '#28a745', opacity: 1    },
                  { status: 'pending_apotheek'  as Status, label: 'In afwachting apotheek',  color: '#fd7e14', opacity: 0.75 },
                  { status: 'pending_assistant' as Status, label: 'In afwachting assistent', color: '#6c757d', opacity: 0.5  },
                  { status: 'denied'            as Status, label: 'Geweigerd',               color: '#dc3545', opacity: 0.35 },
                ] as const
              ).map(({ status, label, color, opacity }) => (
                <li key={status}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visibleStatuses.has(status)}
                      onChange={() => toggleStatus(status)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: hexWithOpacity(color, opacity) }}
                    />
                    <span className="text-sm text-text">{label}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* ── Calendar ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 overflow-hidden p-4">
          <style>{`
            .fc-event--pending .fc-event-main { border-left: 3px dashed currentColor; }
            .fc .fc-button { background: var(--color-primary) !important; border-color: var(--color-primary) !important; }
            .fc .fc-button:hover { filter: brightness(0.9); }
            .fc .fc-button-active, .fc .fc-button:focus { background: var(--color-primary) !important; outline: none !important; box-shadow: none !important; }
            .fc .fc-toolbar-title { font-size: 1.1rem; font-weight: 600; }
            .fc-theme-standard td, .fc-theme-standard th { border-color: var(--color-border); }
            .fc-daygrid-day-number { color: var(--color-text); font-size: 0.8rem; }
            .fc-col-header-cell-cushion { color: var(--color-text-muted); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
            .fc-event { cursor: pointer; font-size: 0.78rem; }
            .fc-list-event:hover td { background: var(--color-primary-light) !important; }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            locale={nlLocale}
            firstDay={1}
            headerToolbar={{
              left:   'prev,next today',
              center: 'title',
              right:  'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
            }}
            buttonText={{ today: 'Vandaag', month: 'Maand', week: 'Week', day: 'Dag', list: 'Lijst' }}
            events={events}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            height="100%"
            dayMaxEvents={4}
            nowIndicator
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          />
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      {addDate && (
        <ShiftAddModal
          date={addDate}
          assistants={assistants}
          pharmacies={pharmacies}
          onClose={() => setAddDate(null)}
        />
      )}
      {editShift && (
        <ShiftEditModal
          shift={editShift}
          onClose={() => setEditShift(null)}
        />
      )}
      {bulkOpen && (
        <BulkShiftModal
          assistants={assistants}
          pharmacies={pharmacies}
          onClose={() => setBulkOpen(false)}
        />
      )}
    </>
  )
}
