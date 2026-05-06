import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { Sparkles, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default async function TeamQuarterlyPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/quarterly')

  const quarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const year = new Date().getFullYear()
  const teamMembers = await getUsersByCompany(user.company_id)
  const members = teamMembers.filter((m) => m.id !== user.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Tiimi kvartali ülevaade</h1>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
            Q{quarter} {year} — tiimi eesmärkide ja arengu kvartalipeegeldus
          </p>
        </div>
        <Link
          href="/chat?type=quarterly"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--pz-radius-md)',
            background: 'var(--pz-grad-primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            textDecoration: 'none',
          }}
        >
          <MessageSquare className="size-4" />
          Alusta oma kvartalisisselogimist
        </Link>
      </div>

      {/* Team member status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
        {members.map((member) => (
          <div key={member.id} className="pz-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'var(--pz-grad-hero)',
                  display: 'grid', placeItems: 'center',
                  fontSize: '13px', fontWeight: 600, color: '#fff', flexShrink: 0,
                }}
              >
                {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--pz-fg-1)' }}>{member.name}</div>
            </div>
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: 'var(--pz-fg-4)',
              }}
            >
              <Sparkles className="size-3.5" />
              Q{quarter} peegeldus ootel
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
