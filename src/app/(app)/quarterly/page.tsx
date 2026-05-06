import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { Sparkles, MessageSquare } from 'lucide-react'

export default async function QuarterlyPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const quarter = Math.ceil((new Date().getMonth() + 1) / 3)
  const year = new Date().getFullYear()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Kvartalisisselogimine</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          Q{quarter} {year} — süvapeegeldus eesmärkide, kasvu ja tagasiside üle.
        </p>
      </div>

      <div
        className="pz-card"
        style={{
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '20px',
          maxWidth: '560px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '18px',
            background: 'var(--pz-grad-hero)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <Sparkles className="size-7 text-white" />
        </div>
        <div>
          <h2 style={{ margin: '0 0 8px' }}>Q{quarter} peegeldus</h2>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>
            Kvartalisisselogimine toimub vestluse kaudu. AI juhib sind läbi eesmärkide ülevaate,
            kasvu ja tagasiside. See võtab umbes 10–15 minutit.
          </p>
        </div>
        <Link
          href="/chat?type=quarterly"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: 'var(--pz-radius-md)',
            background: 'var(--pz-grad-primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
          }}
        >
          <MessageSquare className="size-4" />
          Alusta kvartalisisselogimist
        </Link>
      </div>
    </div>
  )
}
