import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { LanguageProvider } from '@/context/language-context'
import { TopNav } from '@/components/shared/top-nav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let dbUser = null
  try {
    dbUser = await getUser()
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e
    // DB unreachable — render a friendly error rather than crashing
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--pz-grad-app-bg)',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}
      >
        <div
          style={{
            background: 'var(--pz-surface)',
            border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-md)',
            boxShadow: 'var(--pz-shadow-sm)',
            padding: '32px 40px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          <p style={{ color: 'var(--pz-fg-1)', fontWeight: 600, marginBottom: '8px' }}>
            {/* TODO: i18n */}
            Ühenduse viga
          </p>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>
            {/* TODO: i18n */}
            Andmebaasiga ühenduse loomine ebaõnnestus. Palun proovi uuesti.
          </p>
        </div>
      </div>
    )
  }

  // ── Webhook not yet fired — user not in DB ─────────────────────────────────
  if (!dbUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--pz-grad-app-bg)',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
        }}
      >
        <div
          style={{
            background: 'var(--pz-surface)',
            border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-md)',
            boxShadow: 'var(--pz-shadow-sm)',
            padding: '32px 40px',
            textAlign: 'center',
            maxWidth: '400px',
          }}
        >
          {/* Spinner */}
          <div
            style={{
              width: '36px',
              height: '36px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              border: '3px solid var(--pz-border)',
              borderTopColor: 'var(--pz-violet)',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--pz-fg-1)', fontWeight: 600, marginBottom: '8px' }}>
            {/* TODO: i18n */}
            Konto seadistatakse…
          </p>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>
            {/* TODO: i18n */}
            Palun oota hetk. Lehekülg laadib automaatselt.
          </p>
        </div>
      </div>
    )
  }

  // ── Onboarding gate ────────────────────────────────────────────────────────
  if (!dbUser.onboarding_complete) {
    redirect('/onboarding')
  }

  // ── Render app shell ───────────────────────────────────────────────────────
  return (
    <LanguageProvider initialLanguage={dbUser.language}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          // Page background must never be pure white per design spec
          background: 'var(--pz-grad-app-bg)',
        }}
      >
        <TopNav user={dbUser} />

        <main
          style={{
            flex: 1,
            minHeight: 'calc(100vh - 60px)',
            padding: '32px',
            // Center content with max width
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '1280px',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {children}
          </div>
        </main>
      </div>
    </LanguageProvider>
  )
}
