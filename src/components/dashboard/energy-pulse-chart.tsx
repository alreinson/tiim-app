'use client'

import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'

interface TrendPoint {
  week: string
  mood: number | null
  energy: number | null
  workload: number | null
}

interface Props {
  data: TrendPoint[]
}

export function EnergyPulseChart({ data }: Props) {
  return (
    <div style={{ height: '220px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--pz-border)" />
          <XAxis dataKey="week" stroke="var(--pz-fg-4)" fontSize={11} />
          <YAxis domain={[1, 5]} stroke="var(--pz-fg-4)" fontSize={11} ticks={[1,2,3,4,5]} />
          <Tooltip
            contentStyle={{ borderRadius: 10, border: '1px solid var(--pz-border)', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030FF" strokeWidth={2.5} dot={{ r: 3, fill: '#6030FF' }} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="energy"   name="Energia"    stroke="#49BBFF" strokeWidth={2.5} dot={{ r: 3, fill: '#49BBFF' }} activeDot={{ r: 5 }} connectNulls />
          <Line type="monotone" dataKey="workload" name="Töökoormus" stroke="#F59E0B" strokeWidth={2.5} strokeDasharray="5 4" dot={{ r: 3, fill: '#F59E0B' }} activeDot={{ r: 5 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
