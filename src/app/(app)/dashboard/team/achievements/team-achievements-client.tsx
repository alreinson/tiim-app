'use client'

import { useState } from 'react'
import { Trophy, Flame } from 'lucide-react'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

interface Member {
  id: string
  name: string
  streak: number
  badgeCount: number
}

interface Badge {
  key: string
  emoji: string
  name: string
  desc: string
  earnerIds: string[]
}

interface Props {
  members: Member[]
  badges: Badge[]
  totalBadges: number
}

export function TeamAchievementsClient({ members, badges, totalBadges }: Props) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const memberMap: Record<string, Member> = {}
  for (const m of members) memberMap[m.id] = m

  const sortedMembers = [...members].sort((a, b) => b.streak - a.streak)
  const leaderboard = selectedMember ? sortedMembers.filter((m) => m.id === selectedMember) : sortedMembers
  const visibleBadges = selectedMember ? badges.filter((b) => b.earnerIds.includes(selectedMember)) : badges

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Tiimi saavutused
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Seeria edetabel ja märkide progress üle tiimi.
        </p>
      </div>

      {/* Member filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedMember(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '9999px',
            background: selectedMember === null ? 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)' : '#fff',
            border: selectedMember === null ? 'none' : '1px solid #e5e7eb',
            color: selectedMember === null ? '#fff' : '#4a5565',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            boxShadow: selectedMember === null ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          } as React.CSSProperties}
        >
          Kogu tiim
        </button>

        {members.map((m) => {
          const active = selectedMember === m.id
          return (
            <button
              key={m.id}
              onClick={() => setSelectedMember(active ? null : m.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px 6px 8px', borderRadius: '9999px',
                background: '#fff', cursor: 'pointer',
                border: `1px solid ${active ? '#6030ff' : '#e5e7eb'}`,
              }}
            >
              <div style={{
                width: '19px', height: '19px', borderRadius: '50%', flexShrink: 0,
                background: getAvatarGradient(m.id), display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '8px', fontWeight: 500, color: '#fff' }}>{getInitials(m.name)}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: active ? '#6030ff' : '#4a5565' }}>
                {m.name.split(' ')[0]}
              </span>
              <span style={{
                fontSize: '11px', fontWeight: 600,
                background: active ? 'rgba(96,48,255,0.1)' : '#f3f4f6',
                color: active ? '#6030ff' : '#667085',
                borderRadius: '9999px', padding: '1px 6px',
              }}>
                {m.badgeCount}
              </span>
            </button>
          )
        })}
      </div>

      {/* Streak leaderboard */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Trophy style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
          <p className="font-display" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            Seeria edetabel
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {leaderboard.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#667085', textAlign: 'center', padding: '20px 0' }}>
              Andmed puuduvad.
            </p>
          ) : leaderboard.map((m, idx) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '20px', textAlign: 'center', flexShrink: 0,
                fontSize: '13px', fontWeight: 600,
                color: idx === 0 ? '#f59e0b' : idx === 1 ? '#9ca3af' : idx === 2 ? '#92400e' : '#667085',
              }}>
                {selectedMember ? '—' : idx + 1}
              </span>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                background: getAvatarGradient(m.id), display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{getInitials(m.name)}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 500, color: '#101828' }}>{m.name}</p>
                <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>{m.badgeCount}/{totalBadges} märki</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '18px', fontWeight: 700, color: '#101828' }}>{m.streak}</span>
                <Flame style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Badge grid */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      }}>
        <p className="font-display" style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Märgid üle tiimi
        </p>

        {selectedMember && visibleBadges.length === 0 ? (
          <p style={{ margin: 0, fontSize: '13px', color: '#667085', textAlign: 'center', padding: '32px 0' }}>
            Ühtegi märki pole veel teenitud.
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            {visibleBadges.map((badge) => {
              const earners = badge.earnerIds.map((id) => memberMap[id]).filter(Boolean)
              return (
                <div
                  key={badge.key}
                  style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px' }}
                >
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px', marginBottom: '10px',
                    background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
                    display: 'grid', placeItems: 'center', fontSize: '18px',
                  }}>
                    {badge.emoji}
                  </div>
                  <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 600, color: '#101828' }}>
                    {badge.name}
                  </p>
                  <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#667085', lineHeight: 1.5 }}>
                    {badge.desc}
                  </p>

                  {earners.length === 0 ? (
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Keegi veel</p>
                  ) : (
                    <div style={{ display: 'flex' }}>
                      {earners.slice(0, 5).map((m, i) => (
                        <div
                          key={m.id}
                          title={m.name}
                          style={{
                            width: '24px', height: '24px', borderRadius: '50%',
                            background: getAvatarGradient(m.id),
                            border: '2px solid #fff',
                            display: 'grid', placeItems: 'center',
                            marginLeft: i === 0 ? 0 : '-6px',
                          }}
                        >
                          <span style={{ fontSize: '8px', fontWeight: 600, color: '#fff' }}>
                            {getInitials(m.name)}
                          </span>
                        </div>
                      ))}
                      {earners.length > 5 && (
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: '#f3f4f6', border: '2px solid #fff',
                          display: 'grid', placeItems: 'center',
                          marginLeft: '-6px', fontSize: '9px', fontWeight: 600, color: '#667085',
                        }}>
                          +{earners.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
