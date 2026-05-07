import { redirect } from 'next/navigation'
import { Flame, Trophy } from 'lucide-react'
import { getUser } from '@/lib/auth/session'
import { getAllAchievementsByUser } from '@/lib/db/achievements'
import { getStreaksByUserIds } from '@/lib/db/streaks'
import { getUsersByCompany } from '@/lib/db/users'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
import type { AchievementCode } from '@/lib/db/achievements'

// ─── Badge config ─────────────────────────────────────────────────────────────

const BADGES: Array<{
  code: AchievementCode | null
  emoji: string
  title: string
  desc: string
}> = [
  { code: 'streak_3',     emoji: '🔥', title: 'On Fire',        desc: '3 järjestikust nädalat' },
  { code: 'streak_7',     emoji: '💎', title: 'Diamond',        desc: '7 järjestikust nädalat' },
  { code: 'streak_30',    emoji: '🛡️', title: 'Purunematu',     desc: '30 järjestikust nädalat' },
  { code: 'first_checkin',emoji: '🎯', title: 'Esimene samm',   desc: 'Esimene iganädalane sissekanne' },
  { code: null,           emoji: '📈', title: 'Level Up',       desc: 'Arengu-eesmärk täidetud' },
  { code: null,           emoji: '🤝', title: 'Tiimimängija',   desc: '3+ tunnustust antud' },
  { code: null,           emoji: '🧩', title: 'Probleemilahendaja', desc: 'Takistus lahendatud' },
  { code: null,           emoji: '✨', title: 'Glow Up',        desc: 'Meeleolu pikaajaline paranemine' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AchievementsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const [allAchievements, companyUsers] = await Promise.all([
    getAllAchievementsByUser(user.id),
    getUsersByCompany(user.company_id),
  ])

  const streakMap = await getStreaksByUserIds(companyUsers.map((u) => u.id))
  const myStreak = streakMap[user.id] ?? 0

  const earnedCodes = new Set(allAchievements.map((a) => a.code))
  const earnedCount = BADGES.filter((b) => b.code && earnedCodes.has(b.code)).length

  // Top 5 by streak
  const leaderboard = companyUsers
    .map((u) => ({ ...u, streak: streakMap[u.id] ?? 0 }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5)

  const weeksToUnbreakable = Math.max(0, 30 - myStreak)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Saavutused ja streakid
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          {earnedCount} / {BADGES.length} teenitud · {myStreak}-nädala sissekande streak aktiivne
        </p>
      </div>

      {/* ── Streak card + Leaderboard ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', alignItems: 'stretch' }}>

        {/* Active streak card */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '22px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
          display: 'flex', gap: '20px', alignItems: 'center', overflow: 'hidden', position: 'relative',
        }}>
          {/* Background glow */}
          <div style={{
            position: 'absolute', right: '-20px', top: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #e12afb)',
            opacity: 0.12, filter: 'blur(40px)',
          }} />
          {/* Flame icon box */}
          <div style={{
            width: '62px', height: '75px', borderRadius: '15px', flexShrink: 0,
            background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
            boxShadow: '0 6px 24px rgba(96,48,255,0.25)',
            display: 'grid', placeItems: 'center',
          }}>
            <Flame style={{ width: '36px', height: '36px', color: '#6030ff' }} />
          </div>
          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 500, color: '#6030ff', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Aktiivne streak
            </p>
            <p className="font-display" style={{ margin: '0 0 6px', fontSize: '34px', fontWeight: 700, color: '#101828', letterSpacing: '-0.34px', lineHeight: 1 }}>
              {myStreak} nädalat
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#4a5565', lineHeight: 1.5 }}>
              {weeksToUnbreakable > 0
                ? `${weeksToUnbreakable} nädalat veel "Purunematu" märgi saamiseni. Puhkuserežiim peatab streaki — ei lõpeta seda.`
                : 'Purunematu märk teenitud! Jätka nii.'}
            </p>
          </div>
        </div>

        {/* Team leaderboard */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Trophy style={{ width: '15px', height: '15px', color: '#f59e0b' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
              Tiimi edetabel
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {leaderboard.map((member, idx) => {
              const gradient = getAvatarGradient(member.id)
              const initials = getInitials(member.name)
              const isMe = member.id === user.id
              return (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#667085', width: '16px', textAlign: 'center', flexShrink: 0 }}>
                    {idx + 1}
                  </span>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0,
                    background: gradient, display: 'grid', placeItems: 'center',
                  }}>
                    <span style={{ fontSize: '10px', fontWeight: 500, color: '#fff' }}>{initials}</span>
                  </div>
                  <span style={{ flex: 1, fontSize: '13px', color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isMe ? 600 : 400 }}>
                    {member.name}{isMe ? ' (mina)' : ''}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', whiteSpace: 'nowrap' }}>
                    {member.streak}🔥
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── All badges ────────────────────────────────────────────────────── */}
      <div>
        <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Kõik märgid
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {BADGES.map((badge) => {
            const earned = badge.code !== null && earnedCodes.has(badge.code)
            return (
              <div
                key={badge.emoji + badge.title}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                  padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px',
                  opacity: earned ? 1 : 0.5,
                }}
              >
                {/* Emoji badge */}
                <div style={{
                  width: '60px', height: '60px', borderRadius: '15px',
                  background: earned
                    ? 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)'
                    : '#f9fafb',
                  boxShadow: earned ? '0 4px 20px rgba(96,48,255,0.25)' : '0 0 0 1px #e5e7eb',
                  display: 'grid', placeItems: 'center', fontSize: '28px',
                  filter: earned ? 'none' : 'grayscale(0.3)',
                }}>
                  {badge.emoji}
                </div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#101828', letterSpacing: '-0.14px' }}>
                  {badge.title}
                </p>
                <p style={{ margin: 0, fontSize: '11px', color: '#4a5565', lineHeight: 1.4 }}>
                  {badge.desc}
                </p>
                <span style={{
                  fontSize: '10px', fontWeight: 500, letterSpacing: '0.25px', textTransform: 'uppercase',
                  color: earned ? '#00a63e' : '#667085',
                }}>
                  {earned ? '✓ Teenitud' : 'Lukus'}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
