import { stopImpersonation } from '@/lib/impersonation'

const roleLabel: Record<string, string> = {
  assistent: 'Assistent',
  apotheek: 'Apotheek',
}

interface Props {
  name: string
  role: string
}

export function ImpersonationBanner({ name, role }: Props) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2 text-sm text-amber-800">
        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Je bent aangemeld als <strong className="mx-1">{name}</strong>
        ({roleLabel[role] ?? role})
      </div>
      <form action={stopImpersonation}>
        <button
          type="submit"
          className="flex items-center gap-1.5 text-sm font-medium text-amber-900 hover:text-amber-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Terug naar admin
        </button>
      </form>
    </div>
  )
}
