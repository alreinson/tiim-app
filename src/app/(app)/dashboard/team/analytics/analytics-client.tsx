'use client'

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend, BarChart, Bar,
} from 'recharts'

interface TrendPoint {
  week: string
  mood: number | null
  energy: number | null
  workload: number | null
  checkins: number
}

interface Props {
  trendData: TrendPoint[]
  memberNames: { id: string; name: string }[]
  totalMembers: number
}

export function TeamAnalyticsClient({ trendData, memberNames, totalMembers }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Tiimi analüütika</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          6-nädalane trendiülevaade — meeleolu, energia, töökoormus ja sisselogimised.
        </p>
      </div>

      {/* Trend chart */}
      <div className="pz-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Tiimi tervis · viimased 6 nädalat</h3>
        </div>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="gMood" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#6030FF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6030FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gEnergy" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#49BBFF" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#49BBFF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gWorkload" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--pz-border)" />
              <XAxis dataKey="week" stroke="var(--pz-fg-4)" fontSize={12} />
              <YAxis domain={[1, 5]} stroke="var(--pz-fg-4)" fontSize={12} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--pz-border)', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030FF" fill="url(#gMood)"     strokeWidth={2} connectNulls />
              <Area type="monotone" dataKey="energy"   name="Energia"    stroke="#49BBFF" fill="url(#gEnergy)"   strokeWidth={2} connectNulls />
              <Area type="monotone" dataKey="workload" name="Töökoormus" stroke="#F59E0B" fill="url(#gWorkload)" strokeWidth={2} strokeDasharray="5 4" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Check-in rate */}
      <div className="pz-card" style={{ padding: '24px' }}>
        <h3 style={{ margin: '0 0 20px' }}>Sisselogimiste arv nädalas</h3>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--pz-border)" />
              <XAxis dataKey="week" stroke="var(--pz-fg-4)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--pz-fg-4)" fontSize={12} domain={[0, Math.max(totalMembers, 1)]} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--pz-border)', fontSize: 12 }} />
              <Bar dataKey="checkins" name="Sisselogimised" fill="#6030FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
