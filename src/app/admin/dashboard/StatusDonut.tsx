'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export type StatusSlice = {
  status: string
  count: number
  color: string
}

type Props = { data: StatusSlice[] }

export default function StatusDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) {
    return <p className="text-center text-text-muted py-16 text-sm">Geen shifts gevonden</p>
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="count"
          nameKey="status"
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map(entry => (
            <Cell key={entry.status} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(v: unknown) => [`${v} shifts`, '']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
