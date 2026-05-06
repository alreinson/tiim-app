'use client'

import { useState } from 'react'
import { Archive } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend,
} from 'recharts'
import { TeamMemberCard } from './team-member-card'
import { HistoryTimeline } from './history-timeline'
import type { User, Checkin } from '@/types'

interface MemberStat {
  id: string
  name: string
  mood: number | null
  energy: number | null
  workload: number | null
  checkedIn: boolean
  streak: number
  blockerCount: number
  avatarGradient: string
}

interface TrendPoint {
  week: string
  mood: number | null
  energy: number | null
  workload: number | null
}

type TimelineCheckin = Checkin & { member: Pick<User, 'id' | 'name'> }

interface Props {
  teamMembers: User[]
  memberStats: MemberStat[]
  checkedInIds: string[]
  trendData: TrendPoint[]
  timelineCheckins: TimelineCheckin[]
  totalBlockers: number
  onTrackGoals: number
  totalGoals: number
  currentWeek: string
  managerId: string
}

export function TeamDashboardClient({
  teamMembers, memberStats, checkedInIds, trendData,
  timelineCheckins, totalBlockers, onTrackGoals, totalGoals,
  currentWeek, managerId,
}: Props) {
  const [tab, setTab] = useState<'team' | 'individuals' | 'history'>('team')

  const checkedInSet = new Set(checkedInIds)
  const members = teamMembers.filter((m) => m.id !== managerId)
  const checkedInCount = members.filter((m) => checkedInSet.has(m.id)).length

  const avgMood = memberStats.filter((m) => m.mood).length
    ? (memberStats.reduce((a, m) => a + (m.mood ?? 0), 0) / memberStats.filter((m) => m.mood).length).toFixed(1)
    : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header + tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Meeskonna ülevaade</h1>
          <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', marginTop: '6px' }}>
            {members.length} liiget · {checkedInCount}/{members.length} logisid sisse {currentWeek.replace('-', ' ')}
          </p>
        </div>
        <div style={{ display: 'inline-flex', padding: '4px', background: 'white', border: '1px solid var(--pz-border)', borderRadius: 'var(--pz-radius-pill)', gap: '2px' }}>
          {([
            ['team', 'Tiim'],
            ['individuals', 'Liikmed'],
            ['history', 'Ajalugu'],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                padding: '7px 16px',
                borderRadius: 'var(--pz-radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: tab === k ? 600 : 400,
                background: tab === k ? 'var(--pz-grad-primary)' : 'transparent',
                color: tab === k ? '#fff' : 'var(--pz-fg-3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background 180ms, color 180ms',
              }}
            >
              {k === 'history' && <Archive style={{ width: '13px', height: '13px' }} />}
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Team aggregate tab */}
      {tab === 'team' && (
        <>
          {/* Stat cards */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { label: 'Tiimi meeleolu', value: avgMood, tip: 'Keskmine kõikide aktiivsete liikmete seas.' },
              { label: 'Aktiivsed takistused', value: totalBlockers, warn: totalBlockers > 0 },
              { label: 'Sisselogimised', value: `${checkedInCount}/${members.length}` },
              { label: 'Eesmärgid graafikus', value: `${onTrackGoals}/${totalGoals}`, ok: true },
            ].map(({ label, value, warn, ok }) => (
              <div key={label} className="pz-card" style={{ padding: '20px', flex: '1 1 140px' }}>
                <div style={{ fontSize: '12px', color: 'var(--pz-fg-3)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{label}</div>
                <div className="font-display" style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1, color: warn ? 'var(--pz-danger)' : ok ? 'var(--pz-success)' : 'var(--pz-fg-1)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Trend chart + streak leaderboard */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '16px', alignItems: 'start' }}>
            <div className="pz-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Tiimi tervis · viimased 6 nädalat</h3>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="tMood" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6030FF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6030FF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tEnergy" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#49BBFF" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#49BBFF" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tWork" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--pz-border)" />
                    <XAxis dataKey="week" stroke="var(--pz-fg-4)" fontSize={11} />
                    <YAxis domain={[1, 5]} stroke="var(--pz-fg-4)" fontSize={11} ticks={[1,2,3,4,5]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--pz-border)', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030FF" fill="url(#tMood)"   strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="energy"   name="Energia"    stroke="#49BBFF" fill="url(#tEnergy)" strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="workload" name="Töökoormus" stroke="#F59E0B" fill="url(#tWork)"   strokeWidth={2} strokeDasharray="5 4" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Streak leaderboard */}
            <div className="pz-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px' }}>🔥 Streak edetabel</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...memberStats].sort((a, b) => b.streak - a.streak).map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--pz-fg-4)', width: '16px', textAlign: 'center' }}>{i + 1}</span>
                    <div
                      style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: m.avatarGradient, display: 'grid', placeItems: 'center',
                        fontSize: '11px', fontWeight: 700, color: '#fff', flexShrink: 0,
                      }}
                    >
                      {m.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                    </div>
                    <span style={{ flex: 1, fontSize: '13px', color: 'var(--pz-fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>{m.streak}🔥</span>
                  </div>
                ))}
                {memberStats.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--pz-fg-4)', margin: 0 }}>Andmed puuduvad.</p>
                )}
              </div>
            </div>
          </div>

          {/* Workload distribution */}
          {memberStats.some((m) => m.mood || m.energy || m.workload) && (
            <div className="pz-card" style={{ padding: '20px' }}>
              <h3 style={{ margin: '0 0 16px' }}>Selle nädala töökoormus</h3>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={memberStats.map((m) => ({ name: m.name.split(' ')[0], Meeleolu: m.mood, Energia: m.energy, Töökoormus: m.workload }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--pz-border)" />
                    <XAxis dataKey="name" stroke="var(--pz-fg-4)" fontSize={11} />
                    <YAxis domain={[0, 5]} stroke="var(--pz-fg-4)" fontSize={11} ticks={[0,1,2,3,4,5]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid var(--pz-border)', fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="Meeleolu"   fill="#6030FF" radius={[4,4,0,0]} />
                    <Bar dataKey="Energia"    fill="#49BBFF" radius={[4,4,0,0]} />
                    <Bar dataKey="Töökoormus" fill="#F59E0B" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {/* Individuals tab */}
      {tab === 'individuals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              hasCheckedInThisWeek={checkedInSet.has(member.id)}
              activeBlockerCount={memberStats.find((s) => s.id === member.id)?.blockerCount ?? 0}
            />
          ))}
        </div>
      )}

      {/* History tab */}
      {tab === 'history' && (
        <div>
          <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', marginBottom: '16px' }}>
            Kõik eesmärgid, projektid, ülesanded, takistused ja sisselogimised üle tiimi.
          </p>
          <HistoryTimeline checkins={timelineCheckins} />
        </div>
      )}
    </div>
  )
}
