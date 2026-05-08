import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCompany } from '@/lib/db/companies'
import { LanguageProvider } from '@/context/language-context'
import { Sidebar, TopBar } from '@/components/shared/sidebar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  let dbUser = null
  let company = null

  try {
    dbUser = await getUser()
    if (dbUser && dbUser.company_id) {
      company = await getCompany(dbUser.company_id)
    }
  } catch (e) {
    if ((e as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')) throw e
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--pz-grad-app-bg)',
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
            Ühenduse viga
          </p>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>
            Andmebaasiga ühenduse loomine ebaõnnestus. Palun proovi uuesti.
          </p>
        </div>
      </div>
    )
  }

  if (!dbUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--pz-grad-app-bg)',
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
            Konto seadistatakse…
          </p>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>
            Palun oota hetk. Lehekülg laadib automaatselt.
          </p>
        </div>
      </div>
    )
  }

  if (!dbUser.onboarding_complete) {
    redirect('/onboarding')
  }

  return (
    <LanguageProvider initialLanguage={dbUser.language}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar user={dbUser} companyName={company?.name} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar user={dbUser} companyName={company?.name} />

          <main
            style={{
              flex: 1,
              padding: '32px',
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
      </div>
    </LanguageProvider>
  )
}
