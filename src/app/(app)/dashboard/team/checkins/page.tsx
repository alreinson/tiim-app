import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getUsersByCompany } from '@/lib/db/users'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
import { CheckCircle, Clock } from 'lucide-react'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getWeekDateRange(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan4 = new Date(year, 0, 4)
  const dow = jan4.getDay()
  const weekOneMonday = new Date(jan4)
  weekOneMonday.setDate(jan4.getDate() - (dow === 0 ? 6 : dow - 1))
  const monday = new Date(weekOneMonday)
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const months = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets']
  const fmt = (d: Date) => `${d.getDate()}. ${months[d.getMonth()]}`
  return `${fmt(monday)} — ${fmt(sunday)} ${year}`
}

function formatCheckinDate(dateStr: string): string {
  const d = new Date(dateStr)
  const months = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets']
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`
}

function getStatusBadge(mood: number | null | undefined): { label: string; bg: string; color: string } | null {
  if (mood == null) return null
  if (mood >= 4) return { label: 'Särav', bg: '#e6f7ec', color: '#00a63e' }
  if (mood >= 3) return { label: 'Graafikus', bg: '#eef4ff', color: '#1f4fd8' }
  return { label: 'Vajab tähelepanu', bg: '#fef3e2', color: '#f59e0b' }
}

function roleLabel(role: string): string {
  if (role === 'manager') return 'Juht'
  if (role === 'admin') return 'Admin'
  return 'Tiimiliige'
}

export default async function TeamCheckinsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/dashboard/me')

  const currentWeek = getCurrentWeek()
  const [allCheckins, teamMembers] = await Promise.all([
    getCheckinsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
  ])

  const members = teamMembers.filter((m) => m.id !== user.id)
  const weekCheckins = allCheckins.filter((c) => c.week === currentWeek)
  const checkedInThisWeek = new Set(weekCheckins.map((c) => c.user_id))
  const weekDateRange = getWeekDateRange(currentWeek)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h1
          className="font-display"
          style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}
        >
          Tiimi sisselogimised
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Vali tiimiliige, et vaadata nende nädalaste sisselogimiste ajalugu.
        </p>
      </div>

      {/* This week card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '18px 20px',
        display: 'flex', flexDirection: 'column', gap: '10px',
      }}>
        {/* Card header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p
            className="font-display"
            style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}
          >
            Selle nädal — kiirülevaade
          </p>
          <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>{weekDateRange}</p>
        </div>

        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          {checkedInThisWeek.size}/{members.length} sisse loginud
        </p>

        {/* Member grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px', marginTop: '4px' }}>
          {members.map((member) => {
            const thisWeekCheckin = weekCheckins.find((c) => c.user_id === member.id)
            const latestCheckin = allCheckins
              .filter((c) => c.user_id === member.id)
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
            const statusMood = thisWeekCheckin?.mood ?? latestCheckin?.mood
            const badge = getStatusBadge(statusMood)
            const checkedIn = checkedInThisWeek.has(member.id)

            return (
              <div key={member.id} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '16px', display: 'flex', alignItems: 'flex-start', gap: '12px',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '41px', height: '41px', borderRadius: '50%', flexShrink: 0,
                  background: getAvatarGradient(member.id), display: 'grid', placeItems: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{getInitials(member.name)}</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {/* Name + status badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828' }}>
                      {member.name}
                    </span>
                    {badge && (
                      <span style={{
                        fontSize: '10px', fontWeight: 500, color: badge.color,
                        background: badge.bg, borderRadius: '9999px', padding: '2px 8px', whiteSpace: 'nowrap',
                      }}>
                        {badge.label}
                      </span>
                    )}
                  </div>

                  {/* Role */}
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#667085' }}>
                    {roleLabel(member.role)}
                  </span>

                  {/* Check-in status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '5px' }}>
                    {checkedIn && thisWeekCheckin ? (
                      <>
                        <CheckCircle style={{ width: '11px', height: '11px', color: '#00a63e', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#00a63e' }}>
                          Sisse loginud {formatCheckinDate(thisWeekCheckin.created_at)}
                        </span>
                      </>
                    ) : (
                      <>
                        <Clock style={{ width: '11px', height: '11px', color: '#f59e0b', flexShrink: 0 }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#f59e0b' }}>
                          Pole veel sisse loginud
                        </span>
                      </>
                    )}
                  </div>

                  {/* Mood / Energy / Workload */}
                  {checkedIn && thisWeekCheckin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px' }}>
                      {thisWeekCheckin.mood != null && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#4a5565' }}>Meeleolu {thisWeekCheckin.mood}</span>
                      )}
                      {thisWeekCheckin.energy != null && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#4a5565' }}>Energia {thisWeekCheckin.energy}</span>
                      )}
                      {thisWeekCheckin.workload != null && (
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#4a5565' }}>Töökoormus {thisWeekCheckin.workload}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* View history */}
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#6030ff', whiteSpace: 'nowrap', flexShrink: 0, alignSelf: 'flex-start', cursor: 'default' }}>
                  Vaata ajalugu →
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
