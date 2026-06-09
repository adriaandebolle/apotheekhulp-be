'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

export type HoursPoint = {
  month: string
  hours: number
}

export default function HoursChart({ data }: { data: HoursPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(v: number) => `${v}u`}
        />
        <Tooltip formatter={(v: unknown) => [`${v} uur`, 'Uren']} />
        <Bar dataKey="hours" name="Uren" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
