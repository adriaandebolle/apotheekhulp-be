'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export type RevenuePoint = {
  month: string
  revenue: number
  cost: number
}

type Props = { data: RevenuePoint[] }

function fmtEuro(v: number) {
  return '€ ' + v.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function RevenueChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis tickFormatter={fmtEuro} tick={{ fontSize: 11, fill: '#64748b' }} width={70} />
        <Tooltip formatter={(v: unknown) => typeof v === 'number' ? fmtEuro(v) : String(v)} />
        <Legend />
        <Line type="monotone" dataKey="revenue" name="Apotheek omzet" stroke="#0d9488" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="cost"    name="Assistent kost" stroke="#94a3b8" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
