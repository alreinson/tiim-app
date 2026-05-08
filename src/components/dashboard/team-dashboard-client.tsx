'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Archive, Sparkles, TrendingUp, TrendingDown, Minus, Activity, Megaphone, ChevronRight } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { TeamMemberCard } from './team-member-card'
import { HistoryTimeline } from './history-timeline'
import { BlockerKanban } from './blocker-kanban'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
import type { User, Checkin, SupportType } from '@/types'
import type { KanbanBlocker } from './blocker-kanban'

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ShoutoutItem {
  id: string
  from_user_id: string
  to_user_id: string
  message: string
  anonymous: boolean
  created_at: string
  from_user: { name: string } | null
  to_user: { name: string }
}

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
  weekDateRange: string
  managerId: string
  companyName: string
  shoutouts: ShoutoutItem[]
  allBlockers: KanbanBlocker[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(vals: (number | null)[]): number | null {
  const nums = vals.filter((v): v is number => v != null)
  return nums.length ? Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10 : null
}

function memberStatus(mood: number | null): 'thriving' | 'on_track' | 'needs_attention' | null {
  if (mood == null) return null
  if (mood >= 4) return 'thriving'
  if (mood >= 3) return 'on_track'
  return 'needs_attention'
}

function daysAgo(dateStr: string): string {
  const d = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (d === 0) return 'täna'
  if (d === 1) return '1p tagasi'
  return `${d}p tagasi`
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_META = {
  thriving:         { label: 'Särav',           bg: '#e6f7ec', color: '#00a63e', dot: '#00a63e' },
  on_track:         { label: 'Graafikus',        bg: '#eef4ff', color: '#1f4fd8', dot: '#1f4fd8' },
  needs_attention:  { label: 'Vajab tähelepanu', bg: '#fef3e2', color: '#f59e0b', dot: '#f59e0b' },
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatMetaCard({ label, value, delta }: { label: string; value: number | null; delta: number | null }) {
  const dir = delta !== null ? (delta > 0.05 ? 'up' : delta < -0.05 ? 'down' : 'neutral') : null
  const color = dir === 'up' ? '#00a63e' : dir === 'down' ? '#f59e0b' : '#9ca3af'
  const DeltaIcon = dir === 'up' ? TrendingUp : dir === 'down' ? TrendingDown : Minus
  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
    }}>
      <div style={{ fontSize: '13px', color: '#4a5565', marginBottom: '10px' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: '#101828', lineHeight: 1, letterSpacing: '-0.28px' }}>
          {value ?? '—'}
        </span>
        {delta !== null && dir && (
          <span style={{ fontSize: '13px', color, display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 500 }}>
            <DeltaIcon style={{ width: '13px', height: '13px' }} />
            {Math.abs(delta).toFixed(1)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function TeamDashboardClient({
  teamMembers, memberStats, checkedInIds, trendData,
  timelineCheckins, onTrackGoals, totalGoals,
  currentWeek, weekDateRange, managerId, companyName,
  shoutouts, allBlockers,
}: Props) {
  const [tab, setTab] = useState<'team' | 'individuals' | 'history'>('team')

  const checkedInSet = new Set(checkedInIds)
  const members = teamMembers.filter((m) => m.id !== managerId)
  const checkedInCount = members.filter((m) => checkedInSet.has(m.id)).length

  const teamMood     = avg(memberStats.map((m) => m.mood))
  const teamEnergy   = avg(memberStats.map((m) => m.energy))
  const teamWorkload = avg(memberStats.map((m) => m.workload))

  const weekLabel = currentWeek.replace(/\d{4}-W/, 'N')

  const prevTrend = trendData[trendData.length - 2] ?? null
  const moodDelta     = teamMood     !== null && prevTrend?.mood     != null ? +(teamMood     - prevTrend.mood    ).toFixed(1) : null
  const energyDelta   = teamEnergy   !== null && prevTrend?.energy   != null ? +(teamEnergy   - prevTrend.energy  ).toFixed(1) : null
  const workloadDelta = teamWorkload !== null && prevTrend?.workload != null ? +(teamWorkload - prevTrend.workload).toFixed(1) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header + tabs */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h1 className="font-display" style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
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
          {/* AI digest header — purple gradient */}
          <div style={{
            background: 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
            borderRadius: '10px', padding: '20px',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(96,48,255,0.25)',
          }}>
            <div style={{
              position: 'absolute', right: '-40px', top: '-40px',
              width: '180px', height: '180px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', filter: 'blur(32px)',
              pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '12px', flexShrink: 0,
                background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
                display: 'grid', placeItems: 'center',
              }}>
                <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <p className="font-display" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff', letterSpacing: '-0.16px' }}>
                    AI nädalane ülevaade · {weekLabel}
                  </p>
                  <span style={{
                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em',
                    background: 'rgba(255,255,255,0.2)', color: '#fff',
                    padding: '2px 8px', borderRadius: '9999px',
                  }}>
                    {weekDateRange}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                  Reaalajas andmed · {members.length} tiimiliige{members.length !== 1 ? 't' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* 3 stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <StatMetaCard label="Tiimi meeleolu"  value={teamMood}     delta={moodDelta} />
            <StatMetaCard label="Tiimi energia"    value={teamEnergy}   delta={energyDelta} />
            <StatMetaCard label="Töökoormus"       value={teamWorkload} delta={workloadDelta} />
          </div>

          {/* 6-week trend chart */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Activity style={{ width: '14px', height: '14px', color: '#6030ff' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#101828' }}>6-nädalane trend</p>
            </div>
            <div style={{ height: '160px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="week" stroke="#667085" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[1, 5]} stroke="#667085" fontSize={11} tickLine={false} axisLine={false} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }} />
                  <Line type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030ff" strokeWidth={2} dot={{ r: 2.5, fill: '#6030ff' }}  connectNulls />
                  <Line type="monotone" dataKey="energy"   name="Energia"    stroke="#49bbff" strokeWidth={2} dot={{ r: 2.5, fill: '#49bbff' }}  connectNulls />
                  <Line type="monotone" dataKey="workload" name="Töökoormus" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2.5, fill: '#f59e0b' }} strokeDasharray="5 4" connectNulls />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Team status this week */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
          }}>
            <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>Tiimi staatus sel nädalal</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {memberStats.map((m) => {
                const status = memberStatus(m.mood)
                const sm = status ? STATUS_META[status] : null
                return (
                  <div key={m.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    padding: '12px', borderRadius: '10px',
                    border: '1px solid #e5e7eb', background: '#f9fafb',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                      background: getAvatarGradient(m.id), display: 'grid', placeItems: 'center',
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: '#fff' }}>{getInitials(m.name)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828' }}>{m.name}</span>
                        {sm && (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            fontSize: '10px', fontWeight: 500, padding: '2px 7px',
                            borderRadius: '9999px', background: sm.bg, color: sm.color,
                          }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: sm.dot, flexShrink: 0 }} />
                            {sm.label}
                          </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: 'auto' }}>{m.streak}🔥</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Patterns card */}
          <div style={{
            background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
          }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: 500, color: '#101828', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles style={{ width: '14px', height: '14px', color: '#6030ff' }} />
              Mustrid
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>
              AI mustrite analüüs ilmub pärast mitme nädala andmete kogumist.
            </p>
          </div>

          {/* Team shoutouts */}
          {shoutouts.length > 0 && (
            <div style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
              boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
            }}>
              <p style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 500, color: '#101828', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Megaphone style={{ width: '14px', height: '14px', color: '#6030ff' }} />
                Tiimi tunnustused
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                {shoutouts.map((s) => {
                  const fromName = s.anonymous ? 'Anonüümne' : (s.from_user?.name ?? 'Anonüümne')
                  return (
                    <div key={s.id} style={{
                      background: '#f9fafb', border: '1px solid #e5e7eb',
                      borderRadius: '10px', padding: '12px',
                    }}>
                      <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 500, color: '#344054' }}>
                        <span>{fromName}</span>
                        <span style={{ color: '#667085' }}> → </span>
                        <span>{s.to_user.name}</span>
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}> · {daysAgo(s.created_at)}</span>
                      </p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#344054', lineHeight: 1.5 }}>"{s.message}"</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Blockers kanban */}
          {allBlockers.length > 0 && <BlockerKanban blockers={allBlockers} />}
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
