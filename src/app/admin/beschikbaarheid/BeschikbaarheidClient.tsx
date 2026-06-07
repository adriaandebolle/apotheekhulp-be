'use client'

import { useOptimistic, useTransition } from 'react'
import { toggleAvailability } from '@/lib/actions/availability'
import type { AssistantRow } from './page'

const DAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

type Props = {
  assistants: AssistantRow[]
  unavailable: Set<string>
}

export default function BeschikbaarheidClient({ assistants, unavailable }: Props) {
  // State tracks UNAVAILABLE days (rows in DB). Checked = available = NOT in this set.
  const [optimistic, applyOptimistic] = useOptimistic(
    unavailable,
    (state, { key, checked }: { key: string; checked: boolean }) => {
      const next = new Set(state)
      if (checked) next.delete(key)  // marking available → remove from unavailable set
      else next.add(key)             // marking unavailable → add to unavailable set
      return next
    },
  )
  const [, startTransition] = useTransition()

  function handleChange(assistantId: string, dayOfWeek: number, checked: boolean) {
    const key = `${assistantId}:${dayOfWeek}`
    startTransition(async () => {
      applyOptimistic({ key, checked })
      // checked=true means "mark available" = delete row → pass false to action (action: false = delete)
      await toggleAvailability(assistantId, dayOfWeek, !checked)
    })
  }

  if (assistants.length === 0) {
    return <p className="text-text-muted">Geen actieve assistenten gevonden.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-surface rounded-xl border border-border shadow-sm text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left px-4 py-3 font-medium text-text-muted w-48">Assistent</th>
            {DAYS.map(d => (
              <th key={d} className="px-4 py-3 font-medium text-text-muted text-center w-16">{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {assistants.map((a, i) => (
            <tr
              key={a.id}
              className={`border-b border-border last:border-0 ${i % 2 === 1 ? 'bg-background' : ''}`}
            >
              <td className="px-4 py-3">
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: a.color }}
                  />
                  <span className="text-text font-medium">{a.name}</span>
                </span>
              </td>
              {DAYS.map((_, dayIdx) => {
                const key = `${a.id}:${dayIdx}`
                const checked = !optimistic.has(key) // available = no row = checked
                return (
                  <td key={dayIdx} className="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={e => handleChange(a.id, dayIdx, e.target.checked)}
                      className="w-4 h-4 accent-primary cursor-pointer"
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
