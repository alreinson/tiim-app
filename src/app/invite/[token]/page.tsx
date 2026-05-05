'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface InviteInfo {
  inviter_name: string
  invitee_role: 'team_member' | 'manager'
  already_used: boolean
  connected: boolean | null
}

const ROLE_LABELS: Record<string, string> = {
  team_member: 'tiimiliige',
  manager: 'juht',
}

export default function InvitePage() {
  const params = useParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useUser()
  const token = params.token as string

  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/invites/${token}`)
        if (!res.ok) {
          const data = await res.json()
          throw new Error(data.error || 'Kutse ei leitud')
        }
        setInvite(await res.json())
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Viga kutsega')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  // Store token in localStorage for the onboarding flow
  useEffect(() => {
    if (invite && !invite.already_used) {
      localStorage.setItem('tiim_invite_token', token)
    }
  }, [invite, token])

  async function accept() {
    setAccepting(true)
    try {
      const res = await fetch(`/api/invites/${token}/use`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }
      router.push('/onboarding')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Viga kutse vastuvõtmisel')
      setAccepting(false)
    }
  }

  if (loading || !isLoaded) {
    return (
      <div style={centerStyle}>
        <div style={spinnerStyle} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={centerStyle}>
        <div style={cardStyle}>
          <p style={{ fontSize: '32px', marginBottom: '16px' }}>😕</p>
          <p style={{ fontWeight: 600, color: 'var(--pz-fg-1)', marginBottom: '8px' }}>
            Kutset ei leitud
          </p>
          <p style={{ fontSize: '14px', color: 'var(--pz-fg-3)', marginBottom: '24px' }}>
            {error}
          </p>
          <Link href="/sign-in" style={btnLinkStyle}>
            Mine sisselogimisele
          </Link>
        </div>
      </div>
    )
  }

  if (!invite) return null

  const roleLabel = ROLE_LABELS[invite.invitee_role] ?? invite.invitee_role

  return (
    <div style={{ ...centerStyle, background: 'var(--pz-grad-app-bg)', minHeight: '100vh' }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <span
          style={{
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--pz-violet)',
            letterSpacing: '-0.02em',
          }}
        >
          Tiim
        </span>
      </div>

      <div style={cardStyle}>
        {/* Invite header */}
        <div
          style={{
            textAlign: 'center',
            padding: '24px 24px 20px',
            borderBottom: '1px solid var(--pz-border)',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--pz-grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 14px',
            }}
          >
            👋
          </div>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: 'var(--pz-fg-1)',
              margin: '0 0 6px',
            }}
          >
            Sind on kutsutud Tiim.app-i
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
            <strong style={{ color: 'var(--pz-fg-2)' }}>{invite.inviter_name}</strong> kutsub sind
            liituma {roleLabel}na.
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          {invite.already_used ? (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--pz-radius-md)',
                padding: '16px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <p style={{ margin: 0, color: '#15803d', fontWeight: 600 }}>
                ✓ Kutse on juba kasutatud
              </p>
            </div>
          ) : isSignedIn ? (
            <>
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '14px',
                  color: 'var(--pz-fg-3)',
                  textAlign: 'center',
                }}
              >
                Sa oled sisse logitud. Vajuta nuppu, et kutse vastu võtta ja seadistus lõpule viia.
              </p>
              <button
                onClick={accept}
                disabled={accepting}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 'var(--pz-radius-pill)',
                  background: accepting ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: accepting ? 'not-allowed' : 'pointer',
                }}
              >
                {accepting ? 'Võtan vastu...' : 'Võta kutse vastu'}
              </button>
            </>
          ) : (
            <>
              <p
                style={{
                  margin: '0 0 20px',
                  fontSize: '14px',
                  color: 'var(--pz-fg-3)',
                  textAlign: 'center',
                }}
              >
                Loo konto või logi sisse, et kutse vastu võtta.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  href="/sign-up"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: 'var(--pz-radius-pill)',
                    background: 'var(--pz-grad-primary)',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  Loo konto
                </Link>
                <Link
                  href="/sign-in"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    padding: '11px',
                    borderRadius: 'var(--pz-radius-pill)',
                    background: 'var(--pz-surface)',
                    color: 'var(--pz-fg-2)',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    border: '1px solid var(--pz-border)',
                  }}
                >
                  Logi sisse
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--pz-fg-3)' }}>
        Tiim.app · Aus AI meeskonnatoe jaoks
      </p>
    </div>
  )
}

const centerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '32px 16px',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--pz-surface)',
  border: '1px solid var(--pz-border)',
  borderRadius: 'var(--pz-radius-lg)',
  boxShadow: 'var(--pz-shadow-md)',
  width: '100%',
  maxWidth: '400px',
  overflow: 'hidden',
}

const spinnerStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  border: '3px solid var(--pz-border)',
  borderTopColor: 'var(--pz-violet)',
  animation: 'spin 0.8s linear infinite',
}

const btnLinkStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 24px',
  borderRadius: 'var(--pz-radius-pill)',
  background: 'var(--pz-grad-primary)',
  color: '#fff',
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
}
