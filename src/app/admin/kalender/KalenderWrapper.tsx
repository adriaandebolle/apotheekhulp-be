'use client'

import dynamic from 'next/dynamic'
import type { Assistent, ShiftData, PharmacyOption } from './page'

const KalenderClient = dynamic(() => import('./KalenderClient'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
      Kalender laden…
    </div>
  ),
})

export default function KalenderWrapper({
  assistants,
  shifts,
  pharmacies,
}: {
  assistants: Assistent[]
  shifts: ShiftData[]
  pharmacies: PharmacyOption[]
}) {
  return <KalenderClient assistants={assistants} shifts={shifts} pharmacies={pharmacies} />
}
