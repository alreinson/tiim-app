import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { getUnannouncedAchievements } from '@/lib/db/achievements'
import { Trophy, Flame, Star, Zap } from 'lucide-react'

const ACHIEVEMENT_META: Record<string, { icon: React.ReactNode; title: string }> = {
  first_checkin: { icon: <Star className="size-5" />, title: 'Esimene samm' },
  streak_3:      { icon: <Flame className="size-5" />, title: 'Tuleleek' },
  streak_7:      { icon: <Zap className="size-5" />, title: 'Teemant' },
  streak_30:     { icon: <Trophy className="size-5" />, title: 'Purustamatu' },
}

export default async function TeamAchievementsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/achievements')

  const teamMembers = await getUsersByCompany(user.company_id)
  const memberAchievements = await Promise.all(
    teamMembers.map(async (m) => ({
      member: m,
      achievements: await getUnannouncedAchievements(m.id),
    }))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Tiimi saavutused</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          Kõik teenitud märgid üle tiimi.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {memberAchievements
          .filter(({ achievements }) => achievements.length > 0)
          .map(({ member, achievements }) => (
            <div key={member.id} className="pz-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--pz-grad-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#fff',
                    flexShrink: 0,
                  }}
                >
                  {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>
                  {member.name}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {achievements.map((a) => {
                  const meta = ACHIEVEMENT_META[a.code]
                  return (
                    <div
                      key={a.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: 'var(--pz-radius-pill)',
                        background: 'linear-gradient(135deg, #F4F3FF, #FCE7FB)',
                        border: '1px solid rgba(96,48,255,0.15)',
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--pz-violet)',
                      }}
                    >
                      <span style={{ color: 'var(--pz-violet)' }}>{meta?.icon}</span>
                      {meta?.title ?? a.code}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

        {memberAchievements.every(({ achievements }) => achievements.length === 0) && (
          <div className="pz-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--pz-fg-3)', fontSize: '14px' }}>
            Saavutusi pole veel teenitud.
          </div>
        )}
      </div>
    </div>
  )
}
