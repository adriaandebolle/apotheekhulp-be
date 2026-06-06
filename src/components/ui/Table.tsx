interface TableProps {
  children?: React.ReactNode
  className?: string
  title?: string
}

export function Table({ children, className = '' }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-sm text-left ${className}`}>
        {children}
      </table>
    </div>
  )
}

export function Thead({ children }: TableProps) {
  return (
    <thead className="bg-slate-50 border-b border-border text-xs text-text-muted uppercase tracking-wide">
      {children}
    </thead>
  )
}

export function Tbody({ children }: TableProps) {
  return (
    <tbody className="divide-y divide-border">
      {children}
    </tbody>
  )
}

export function Th({ children, className = '', title }: TableProps) {
  return (
    <th className={`px-4 py-3 font-medium ${className}`} title={title}>
      {children}
    </th>
  )
}

export function Td({ children, className = '' }: TableProps) {
  return (
    <td className={`px-4 py-3 text-text ${className}`}>
      {children}
    </td>
  )
}

export function Tr({ children, className = '' }: TableProps) {
  return (
    <tr className={`hover:bg-slate-50 transition-colors ${className}`}>
      {children}
    </tr>
  )
}

interface EmptyRowProps { colSpan: number; message?: string }
export function EmptyRow({ colSpan, message = 'Geen resultaten gevonden.' }: EmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-8 text-center text-sm text-text-muted">
        {message}
      </td>
    </tr>
  )
}
