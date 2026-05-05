'use client'

import { useEffect, useState } from 'react'

interface Achievement {
  id: string
  code: string
  earned_at: string
}

const ACHIEVEMENT_META: Record<string, { icon: string; title: string; desc: string }> = {
  first_checkin: {
    icon: '🎉',
    title: 'Esimene sisselogimine!',
    desc: 'Tegid oma esimese nädalase sisselogimise.',
  },
  streak_3: {
    icon: '🔥',
    title: '3-nädalane järjestik!',
    desc: 'Oled sisselogimise harjumuse loonud.',
  },
  streak_7: {
    icon: '⚡',
    title: '7-nädalane järjestik!',
    desc: 'Suurepärane järjepidevus — 7 nädalat järjest!',
  },
  streak_30: {
    icon: '🏆',
    title: '30-nädalane järjestik!',
    desc: 'Erakordne pühendumine — 30 nädalat järjest!',
  },
}

interface Props {
  achievements: Achievement[]
}

export function AchievementBanner({ achievements }: Props) {
  const [visible, setVisible] = useState<Achievement[]>(achievements)
  const [dismissed, setDismissed] = useState<string[]>([])

  useEffect(() => {
    setVisible(achievements)
  }, [achievements])

  async function dismiss(id: string) {
    setDismissed((prev) => [...prev, id])
    try {
      await fetch('/api/achievements/announce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      })
    } catch {
      // non-critical
    }
  }

  const toShow = visible.filter((a) => !dismissed.includes(a.id))
  if (toShow.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
      {toShow.map((achievement) => {
        const meta = ACHIEVEMENT_META[achievement.code] ?? {
          icon: '🌟',
          title: 'Saavutus!',
          desc: achievement.code,
        }
        return (
          <div
            key={achievement.id}
            style={{
              background: 'var(--pz-grad-primary)',
              borderRadius: 'var(--pz-radius-md)',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: 'var(--pz-shadow-md)',
            }}
          >
            <span style={{ fontSize: '28px', flexShrink: 0 }}>{meta.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                {meta.title}
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                {meta.desc}
              </p>
            </div>
            <button
              onClick={() => dismiss(achievement.id)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: 'var(--pz-radius-pill)',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 500,
                padding: '4px 12px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              Sulge
            </button>
          </div>
        )
      })}
    </div>
  )
}
