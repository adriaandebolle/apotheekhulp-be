type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger:  'bg-danger-light text-danger',
  info:    'bg-info-light text-info',
  neutral: 'bg-slate-100 text-slate-600',
}

// Map domain status strings to badge variants
const STATUS_MAP: Record<string, BadgeVariant> = {
  goedgekeurd:        'success',
  betaald:            'success',
  approved:           'success',
  paid:               'success',
  in_afwachting:      'warning',
  pending_assistent:  'warning',
  pending_apotheek:   'warning',
  te_betalen:         'warning',
  geweigerd:          'danger',
  denied_assistent:   'danger',
  unpaid:             'danger',
  gefactureerd:       'info',
  invoiced:           'info',
  inactief:           'neutral',
  inactive:           'neutral',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  status?: string
}

export function Badge({ children, variant, status }: BadgeProps) {
  const resolvedVariant = variant ?? (status ? STATUS_MAP[status.toLowerCase()] ?? 'neutral' : 'neutral')
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClasses[resolvedVariant]}`}>
      {children}
    </span>
  )
}
