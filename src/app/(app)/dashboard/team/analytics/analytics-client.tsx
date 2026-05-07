'use client'

import { useState } from 'react'
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
  BarChart, Bar,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

interface TrendPoint {
  week: string
  mood: number | null
  energy: number | null
  workload: number | null
  checkins: number
}

interface Props {
  trendData: TrendPoint[]
  members: { id: string; name: string }[]
  checkinRate: number
  goalCompletion: number
  sentimentDelta: number | null
  radarData: { name: string; score: number }[]
  totalMembers: number
}

const AI_SIGNALS = [
  { color: '#f59e0b', text: 'Jätkuv madal energia tuvastatud Jaanil (3 nädalat). Soovitatav otsene vestlus.' },
  { color: '#6030ff', text: 'Korduv takistuse muster: disainisüsteemi tokenite nihkumine (3 nädalat).' },
  { color: '#00a63e', text: 'Tiimi meeleolu tõusis 0,3 võrra vs eelmine nädal — jätkuv positiivne trend.' },
  { color: '#667085', text: 'Karl ei ole sel nädalal sisse loginud — leebe meeldetuletus saadetud.' },
]

export function TeamAnalyticsClient({
  trendData, members, checkinRate, goalCompletion, sentimentDelta, radarData, totalMembers,
}: Props) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const sentimentLabel = sentimentDelta == null
    ? '–'
    : sentimentDelta >= 0 ? `+${sentimentDelta}` : `${sentimentDelta}`
  const sentimentSubtitle = sentimentDelta == null
    ? 'ei piisavalt andmeid'
    : sentimentDelta >= 0 ? 'tõusev trend' : 'langev trend'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Tiimi analüütika
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          6-nädalane ülevaade tiimist. Mustrid, mitte kohtuotsused.
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
          const gradient = getAvatarGradient(m.id)
          const initials = getInitials(m.name)
          const firstName = m.name.split(' ')[0]
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
                background: gradient, display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '8px', fontWeight: 500, color: '#fff' }}>{initials}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: active ? '#6030ff' : '#4a5565' }}>
                {firstName}
              </span>
            </button>
          )
        })}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {[
          { label: 'Sisselogimiste määr', value: `${checkinRate}%`, sub: 'viimased 6 nädalat' },
          { label: 'Eesmärkide täitmine', value: `${goalCompletion}%`, sub: 'Q2 tänaseks' },
          { label: 'Kesk. takistuse lahend.', value: '4,2 päeva', sub: '↓ 1,1 vs Q1' },
          { label: 'Meeleoluskoori muutus', value: sentimentLabel, sub: sentimentSubtitle },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
              padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
            }}
          >
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: '#4a5565' }}>{card.label}</p>
            <p className="font-display" style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 600, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
              {card.value}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* 2×2 chart grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Sentiment trend */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        }}>
          <p className="font-display" style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            Meeleolu trend
          </p>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" stroke="#667085" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[1, 5]} stroke="#667085" fontSize={11} tickLine={false} axisLine={false} ticks={[1,2,3,4,5]} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: '8px' }} />
                <Line type="monotone" dataKey="mood"     name="Meeleolu"   stroke="#6030ff" strokeWidth={2} dot={{ r: 3, fill: '#6030ff' }} connectNulls />
                <Line type="monotone" dataKey="energy"   name="Energia"    stroke="#49bbff" strokeWidth={2} dot={{ r: 3, fill: '#49bbff' }} connectNulls />
                <Line type="monotone" dataKey="workload" name="Töökoormus" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 4" dot={{ r: 3, fill: '#f59e0b' }} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Check-ins per week (proxy for blocker frequency) */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        }}>
          <p className="font-display" style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            Sisselogimised nädalas
          </p>
          <div style={{ height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="week" stroke="#667085" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="#667085" fontSize={11} tickLine={false} axisLine={false} domain={[0, Math.max(totalMembers, 4)]} />
                <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }} />
                <Bar dataKey="checkins" name="Sisselogimised" fill="#6030ff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team radar */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        }}>
          <p className="font-display" style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            Tiimi profiil (see nädal)
          </p>
          {radarData.length >= 3 ? (
            <div style={{ height: '220px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: '#4a5565' }} />
                  <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} />
                  <Radar name="Meeleolu" dataKey="score" stroke="#6030ff" fill="#6030ff" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e5e7eb', fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ height: '220px', display: 'grid', placeItems: 'center', color: '#667085', fontSize: '13px' }}>
              Sel nädalal pole piisavalt sisselogimisi.
            </div>
          )}
        </div>

        {/* AI signal log */}
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        }}>
          <p className="font-display" style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            AI signaalilogi
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {AI_SIGNALS.map((signal, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: signal.color, marginTop: '5px',
                }} />
                <p style={{ margin: 0, fontSize: '13px', color: '#344054', lineHeight: 1.5 }}>
                  {signal.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
