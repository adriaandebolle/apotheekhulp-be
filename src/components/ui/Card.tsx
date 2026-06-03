interface CardProps {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface rounded-xl border border-border shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  )
}

export function CardBody({ children, className = '' }: CardProps) {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ label, value, sub, trend }: StatCardProps) {
  return (
    <Card>
      <CardBody>
        <p className="text-sm text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text mt-1">{value}</p>
        {sub && (
          <p className={`text-xs mt-1 ${trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'}`}>
            {sub}
          </p>
        )}
      </CardBody>
    </Card>
  )
}
