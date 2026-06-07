'use client'

import dynamic from 'next/dynamic'
import type { ShiftData } from './page'

const KalenderAssistentClient = dynamic(() => import('./KalenderAssistentClient'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
      Kalender laden…
    </div>
  ),
})

export default function KalenderAssistentWrapper({ shifts }: { shifts: ShiftData[] }) {
  return <KalenderAssistentClient shifts={shifts} />
}
