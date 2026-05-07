'use client'

import { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

const TOTAL_SECTIONS = 5
const SECTION_NAMES = [
  'Eesmärkide ülevaade',
  'Professionaalne areng',
  'Töösobivus',
  'Tagasiside juhile',
  'Üldine heaolu',
]

interface Member {
  id: string
  name: string
  sectionsCompleted: number
  submittedAt: string | null
}

interface Props {
  members: Member[]
  quarter: number
  year: number
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('et-EE', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function TeamQuarterlyClient({ members, quarter, year }: Props) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const visibleMembers = selectedMember ? members.filter((m) => m.id === selectedMember) : members

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Tiimi kvartalisisselogimised
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Q{quarter} {year} seis üle tiimi. {TOTAL_SECTIONS}/{TOTAL_SECTIONS} osa inimese kohta + väärtuste kooskõla.
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
          const pct = Math.round((m.sectionsCompleted / TOTAL_SECTIONS) * 100)
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
                {pct}%
              </span>
            </button>
          )
        })}
      </div>

      {/* Member cards grid */}
      {visibleMembers.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#667085', textAlign: 'center', padding: '32px 0' }}>
          Tiimiliikmed puuduvad.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {visibleMembers.map((m) => {
            const pct = Math.round((m.sectionsCompleted / TOTAL_SECTIONS) * 100)
            const submitted = m.sectionsCompleted >= TOTAL_SECTIONS
            const inProgress = m.sectionsCompleted > 0 && !submitted
            const notStarted = m.sectionsCompleted === 0

            return (
              <div
                key={m.id}
                style={{
                  background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                  padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}
              >
                {/* Member row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '41px', height: '41px', borderRadius: '50%', flexShrink: 0,
                    background: getAvatarGradient(m.id), display: 'grid', placeItems: 'center',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 500, color: '#fff' }}>{getInitials(m.name)}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 500, color: '#101828' }}>{m.name}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    {submitted && (
                      <>
                        <CheckCircle style={{ width: '11px', height: '11px', color: '#00a63e' }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#00a63e' }}>Esitatud</span>
                      </>
                    )}
                    {inProgress && (
                      <>
                        <Clock style={{ width: '11px', height: '11px', color: '#1f4fd8' }} />
                        <span style={{ fontSize: '11px', fontWeight: 500, color: '#1f4fd8' }}>{pct}%</span>
                      </>
                    )}
                    {notStarted && (
                      <span style={{ fontSize: '11px', fontWeight: 500, color: '#667085' }}>Alustamata</span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{
                  height: '6px', borderRadius: '9999px', background: '#f3f4f6', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: '9999px',
                    background: 'linear-gradient(90deg, #6030ff 0%, #1f4fd8 100%)',
                    width: `${pct}%`,
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                {/* Section pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {SECTION_NAMES.map((sectionName, idx) => {
                    const done = idx < m.sectionsCompleted
                    return (
                      <span
                        key={sectionName}
                        style={{
                          fontSize: '10px', fontWeight: 500,
                          padding: '3px 8px', borderRadius: '9999px',
                          background: done ? '#e6f7ec' : '#f9fafb',
                          color: done ? '#00a63e' : '#667085',
                        }}
                      >
                        {sectionName}
                      </span>
                    )
                  })}
                </div>

                {/* Submitted date */}
                {m.submittedAt && (
                  <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#667085' }}>
                    Esitatud {formatDate(m.submittedAt)}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
