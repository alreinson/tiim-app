'use client'

import { useState } from 'react'
import { Archive, Flame } from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { TeamMemberCard } from './team-member-card'
import { HistoryTimeline } from './history-timeline'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
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
  companyName: string
}

function avg(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v != null)
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null
}

function StatBar({ label, value, max = 5, color }: { label: string; value: number | null; max?: number; color: string }) {
  const pct = value != null ? (value / max) * 100 : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', color: '#667085' }}>{label}</span>
        <span style={{ fontSize: '22px', fontWeight: 700, color: '#101828', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value != null ? value : '—'}
          <span style={{ fontSize: '13px', fontWeight: 400, color: '#9ca3af', marginLeft: '2px' }}>/ 5</span>
        </span>
      </div>
      <div style={{ height: '5px', background: '#f3f4f6', borderRadius: '9999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '9999px', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  )
}

export function TeamDashboardClient({
  teamMembers, memberStats, checkedInIds, trendData,
  timelineCheckins, onTrackGoals, totalGoals,
  currentWeek, managerId, companyName,
}: Props) {
  const [tab, setTab] = useState<'team' | 'individuals' | 'history'>('team')

  const checkedInSet = new Set(checkedInIds)
  const members = teamMembers.filter((m) => m.id !== managerId)
  const checkedInCount = members.filter((m) => checkedInSet.has(m.id)).length

  const teamMood     = avg(memberStats.map((m) => m.mood))
  const teamEnergy   = avg(memberStats.map((m) => m.energy))
  const teamWorkload = avg(memberStats.map((m) => m.workload))

  const weekLabel = currentWeek.replace(/\d{4}-W/, 'N')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header + tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
            {companyName ? `${companyName} — Tiimi ülevaade` : 'Tiimi ülevaade'}
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
            {members.length} tiimiliige{members.length !== 1 ? 't' : ''} · {checkedInCount}/{members.length} logisid sisse {weekLabel}
          </p>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '9999px',
          padding: '4px', gap: '2px',
        }}>
          {([
            ['team',        'Koondvaade'],
            ['individuals', 'Liikmed'],
            ['history',     'Ajalugu'],
          ] as const).map(([k, l]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '9999px', border: 'none',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                background: tab === k ? 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)' : 'transparent',
                color: tab === k ? '#fff' : '#4a5565',
                boxShadow: tab === k ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
                transition: 'background 150ms, color 150ms',
              } as React.CSSProperties}
            >
              {k === 'history' && <Archive style={{ width: '12px', height: '12px' }} />}
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* ── Team aggregate tab ── */}
      {tab === 'team' && (
        <>
          {/* Weekly digest card */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden',
          }}>
            {/* Digest header */}
            <div style={{
              padding: '18px 20px 16px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
                display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '16px' }}>✨</span>
              </div>
              <div style={{ flex: 1 }}>
                <p className="font-display" style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 600, color: '#101828', letterSpacing: '-0.15px' }}>
                  AI koondülevaade · {weekLabel}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>
                  Reaalajas andmed · {members.length} tiimiliige{members.length !== 1 ? 't' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{
                  fontSize: '11px', fontWeight: 500,
                  background: onTrackGoals >= totalGoals && totalGoals > 0 ? '#ecfdf3' : '#f9fafb',
                  color: onTrackGoals >= totalGoals && totalGoals > 0 ? '#00a63e' : '#667085',
                  padding: '3px 10px', borderRadius: '9999px',
                }}>
                  {onTrackGoals}/{totalGoals} eesmärki graafikus
                </div>
              </div>
            </div>

            {/* Stat bars */}
            <div style={{ padding: '20px', display: 'flex', gap: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <StatBar label="Tiimi meeleolu"   value={teamMood}     color="#6030ff" />
              <StatBar label="Tiimi energia"     value={teamEnergy}   color="#49bbff" />
              <StatBar label="Töökoormus"        value={teamWorkload}  color="#f59e0b" />
            </div>

            {/* 6-week trend */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>
                6-nädalane trend
              </p>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tMood" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#6030ff" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#6030ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tEnergy" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#49bbff" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#49bbff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="tWork" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis dataKey="week" stroke="#667085" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} stroke="#667085" fontSize={11} tickLine={false} axisLine={false} ticks={[1,2,3,4,5]} />
                    <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }} />
                    <Area type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030ff" fill="url(#tMood)"   strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="energy"   name="Energia"    stroke="#49bbff" fill="url(#tEnergy)" strokeWidth={2} connectNulls />
                    <Area type="monotone" dataKey="workload" name="Töökoormus" stroke="#f59e0b" fill="url(#tWork)"   strokeWidth={2} strokeDasharray="5 4" connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Streak leaderboard */}
            <div style={{ padding: '20px' }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 500, color: '#101828', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Flame style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                Seeria edetabel
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[...memberStats].sort((a, b) => b.streak - a.streak).map((m, i) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '18px', textAlign: 'center', flexShrink: 0,
                      fontSize: '12px', fontWeight: 600,
                      color: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#92400e' : '#667085',
                    }}>
                      {i + 1}
                    </span>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: getAvatarGradient(m.id), display: 'grid', placeItems: 'center',
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{getInitials(m.name)}</span>
                    </div>
                    <span style={{ flex: 1, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.name}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#101828' }}>{m.streak}</span>
                    <Flame style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0 }} />
                  </div>
                ))}
                {memberStats.length === 0 && (
                  <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>Andmed puuduvad.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Individuals tab ── */}
      {tab === 'individuals' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {members.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              hasCheckedInThisWeek={checkedInSet.has(member.id)}
              activeBlockerCount={memberStats.find((s) => s.id === member.id)?.blockerCount ?? 0}
              streak={memberStats.find((s) => s.id === member.id)?.streak ?? 0}
            />
          ))}
        </div>
      )}

      {/* ── History tab ── */}
      {tab === 'history' && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        }}>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#4a5565' }}>
            Kõik eesmärgid, projektid, ülesanded, takistused ja sisselogimised üle tiimi.
          </p>
          <HistoryTimeline checkins={timelineCheckins} />
        </div>
      )}
    </div>
  )
}
