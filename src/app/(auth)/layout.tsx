import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tiim — Sisselogimine',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--pz-grad-app-bg)',
        padding: '32px 16px',
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          marginBottom: '24px',
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-inter), Inter, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--pz-violet)',
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          Tiim
        </span>
        <p
          style={{
            marginTop: '6px',
            fontSize: '14px',
            color: 'var(--pz-fg-3)',
            fontFamily: 'var(--font-inter), Inter, sans-serif',
          }}
        >
          {/* TODO: i18n — translate tagline */}
          Meeskonna check-in ja eesmärgid
        </p>
      </div>

      {/* Clerk auth card */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  )
}
