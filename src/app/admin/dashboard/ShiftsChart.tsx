'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

export type ShiftsPoint = {
  month: string
  approved: number
  pending: number
  denied: number
}

type Props = { data: ShiftsPoint[] }

export default function ShiftsChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="approved" name="Goedgekeurd" stackId="a" fill="#16a34a" />
        <Bar dataKey="pending"  name="In behandeling" stackId="a" fill="#d97706" />
        <Bar dataKey="denied"   name="Geweigerd"   stackId="a" fill="#dc2626" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
