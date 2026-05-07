import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ArrowRight, Sparkles, Target } from 'lucide-react'
import { getUser } from '@/lib/auth/session'
type SectionStatus = 'not_started' | 'in_progress' | 'done'

const SECTIONS: Array<{
  num: number
  title: string
  desc: string
  status: SectionStatus
  anonymous: boolean
}> = [
  {
    num: 1,
    title: 'Eesmärkide ülevaade',
    desc: 'Mis läks plaanipäraselt, mis mitte, ja mida kanda järgmisesse kvartalisse.',
    status: 'in_progress' as const,
    anonymous: false,
  },
  {
    num: 2,
    title: 'Professionaalne areng',
    desc: 'Mida said selles kvartalis õppida? Kus soovid areneda?',
    status: 'not_started' as const,
    anonymous: false,
  },
  {
    num: 3,
    title: 'Töösobivus',
    desc: 'Rolli selgus, motivatsioon, tugi — ole iseendaga aus.',
    status: 'not_started' as const,
    anonymous: false,
  },
  {
    num: 4,
    title: 'Tagasiside juhile',
    desc: 'Valikuline anonüümne kanal. Tiim võtab kokku teemad, mitte autorid.',
    status: 'not_started' as const,
    anonymous: true,
  },
  {
    num: 5,
    title: 'Üldine heaolu',
    desc: 'Kuidas töö praegu tundub? Mida saaks tiim paremini teha?',
    status: 'not_started' as const,
    anonymous: false,
  },
]

const STATUS_LABELS = {
  not_started: 'Alustamata',
  in_progress: 'Pooleli',
  done: 'Valmis',
}

export default async function QuarterlyPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  const year = now.getFullYear()

  const completedCount = SECTIONS.filter((s) => s.status === 'done').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Hero banner */}
      <div style={{
        borderRadius: '14px', overflow: 'hidden', position: 'relative',
        background: 'linear-gradient(165deg, #a855f7 0%, #e12afb 100%)',
        padding: '30px',
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', right: '-30px', top: '40px',
          width: '270px', height: '270px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', filter: 'blur(64px)',
        }} />

        {/* Q label pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.15)', borderRadius: '9999px',
          padding: '4px 12px', marginBottom: '14px',
        }}>
          <Sparkles style={{ width: '13px', height: '13px', color: '#fff' }} />
          <span style={{ fontSize: '11px', color: '#fff' }}>
            Q{quarter} kokkuvõte · soovitab Tiim
          </span>
        </div>

        <h1 style={{
          margin: '0 0 10px', fontSize: '28px', fontWeight: 700,
          color: '#fff', letterSpacing: '-0.28px', lineHeight: 1.2,
        }}>
          Kvartali sisselogimine on avatud
        </h1>
        <p style={{ margin: '0 0 24px', fontSize: '15px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, maxWidth: '630px' }}>
          6 vestlusosaga sisselogimine, ~25 minutit. Saad pausi teha ja jätkata sealt, kus pooleli jäi — Tiim mäletab konteksti.
        </p>

        <Link
          href="/chat?type=quarterly"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '10px',
            background: '#fff', color: '#6030ff',
            fontSize: '15px', fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          Alusta vestluses
          <ArrowRight style={{ width: '15px', height: '15px' }} />
        </Link>
      </div>

      {/* Sections accordion (expanded) */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 16px 14px',
          display: 'flex', alignItems: 'center', gap: '12px',
          borderBottom: '1px solid #e5e7eb',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
            background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
            display: 'grid', placeItems: 'center',
          }}>
            <Target style={{ width: '15px', height: '15px', color: '#6030ff' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>Osad</p>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#667085' }}>
              {completedCount}/{SECTIONS.length} esitatud
            </p>
          </div>
          <ChevronUp style={{ width: '15px', height: '15px', color: '#667085', flexShrink: 0 }} />
        </div>

        {/* Section cards grid */}
        <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {SECTIONS.map((section) => (
            <div
              key={section.num}
              style={{
                border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '15px',
              }}
            >
              {/* Number + status badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                  background: '#f4f3ff', display: 'grid', placeItems: 'center',
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#6030ff' }}>{section.num}</span>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: 500, padding: '3px 8px', borderRadius: '9999px',
                  background: section.status === 'in_progress' ? '#eef4ff' : section.status === 'done' ? '#ecfdf3' : '#f9fafb',
                  color: section.status === 'in_progress' ? '#1f4fd8' : section.status === 'done' ? '#00a63e' : '#667085',
                }}>
                  {STATUS_LABELS[section.status]}
                </span>
                {section.anonymous && (
                  <span style={{
                    fontSize: '10px', fontWeight: 500, color: '#6030ff',
                    display: 'inline-flex', alignItems: 'center', gap: '3px',
                  }}>
                    🔒 Anonüümne
                  </span>
                )}
              </div>

              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>
                {section.title}
              </p>
              <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#4a5565', lineHeight: 1.5 }}>
                {section.desc}
              </p>

              <Link
                href={`/chat?type=quarterly&section=${section.num}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  fontSize: '11px', fontWeight: 500, color: '#6030ff',
                  textDecoration: 'none',
                }}
              >
                Ava
                <ArrowRight style={{ width: '11px', height: '11px' }} />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Values alignment (collapsed) */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        padding: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
          display: 'grid', placeItems: 'center',
        }}>
          <span style={{ fontSize: '15px' }}>🎯</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>Väärtuste kooskõla</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#667085' }}>keskmiselt 3.0/5 üle 5 väärtuse</p>
        </div>
        <ChevronDown style={{ width: '15px', height: '15px', color: '#667085', flexShrink: 0 }} />
      </div>

      {/* AI themes (collapsed) */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        padding: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '10px', flexShrink: 0,
          background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
          display: 'grid', placeItems: 'center',
        }}>
          <span style={{ fontSize: '15px' }}>✨</span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>AI teemad</p>
          <p style={{ margin: 0, fontSize: '11px', fontWeight: 500, color: '#667085' }}>3 mustrit</p>
        </div>
        <ChevronDown style={{ width: '15px', height: '15px', color: '#667085', flexShrink: 0 }} />
      </div>

    </div>
  )
}
