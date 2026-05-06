import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUnannouncedAchievements } from '@/lib/db/achievements'
import { Trophy, Flame, Target, Star, Users, Zap } from 'lucide-react'

const ACHIEVEMENT_META: Record<string, { icon: React.ReactNode; title: string; desc: string; category: string }> = {
  first_checkin: {
    icon: <Star className="size-6" />,
    title: 'Esimene samm',
    desc: 'Esimene iganädalane sisselogimine tehtud.',
    category: 'Järjepidevus',
  },
  streak_3: {
    icon: <Flame className="size-6" />,
    title: 'Tuleleek',
    desc: '3 järjestikust nädalat sisselogimist.',
    category: 'Järjepidevus',
  },
  streak_7: {
    icon: <Zap className="size-6" />,
    title: 'Teemant',
    desc: '7 järjestikust nädalat sisselogimist.',
    category: 'Järjepidevus',
  },
  streak_30: {
    icon: <Trophy className="size-6" />,
    title: 'Purunema­tu',
    desc: '30 järjestikust nädalat sisselogimist.',
    category: 'Järjepidevus',
  },
}

const ALL_ACHIEVEMENTS = ['first_checkin', 'streak_3', 'streak_7', 'streak_30']

export default async function AchievementsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const unannounced = await getUnannouncedAchievements(user.id)
  const earnedCodes = new Set(unannounced.map((a) => a.code))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Saavutused</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          Teenitud märgid järjepidevuse, koostöö ja kasvu eest.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {ALL_ACHIEVEMENTS.map((code) => {
          const meta = ACHIEVEMENT_META[code]
          const earned = earnedCodes.has(code as any)
          if (!meta) return null
          return (
            <div
              key={code}
              className="pz-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '12px',
                opacity: earned ? 1 : 0.4,
                transition: 'opacity var(--pz-dur-base)',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  display: 'grid',
                  placeItems: 'center',
                  background: earned
                    ? 'linear-gradient(135deg, #F4F3FF 0%, #FCE7FB 100%)'
                    : 'var(--pz-surface-2)',
                  color: earned ? 'var(--pz-violet)' : 'var(--pz-fg-4)',
                  boxShadow: earned ? '0 0 0 2px rgba(96,48,255,0.15)' : 'none',
                }}
              >
                {meta.icon}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--pz-fg-1)' }}>
                  {meta.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--pz-fg-3)', marginTop: '4px' }}>
                  {meta.desc}
                </div>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 10px',
                  borderRadius: 'var(--pz-radius-pill)',
                  background: earned ? 'var(--pz-success-bg)' : 'var(--pz-surface-2)',
                  color: earned ? 'var(--pz-success)' : 'var(--pz-fg-4)',
                  border: `1px solid ${earned ? 'rgba(0,166,62,0.2)' : 'var(--pz-border)'}`,
                }}
              >
                {earned ? 'Teenitud' : 'Lukus'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
