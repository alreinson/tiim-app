'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { UserMenu } from '@/components/shared/user-menu'
import type { User, UserRole } from '@/types'

// ── Nav link definitions ──────────────────────────────────────────────────────

interface NavLink {
  href: string
  /** Estonian label (TODO: i18n — replace with translation key) */
  label: string
}

const NAV_LINKS_BY_ROLE: Record<UserRole, NavLink[]> = {
  team_member: [
    { href: '/dashboard', label: 'Töölaud' },
    { href: '/goals', label: 'Eesmärgid' },
    { href: '/chat', label: 'Vestlus' },
  ],
  manager: [
    { href: '/dashboard', label: 'Töölaud' },
    { href: '/team', label: 'Tiim' },
    { href: '/goals', label: 'Eesmärgid' },
    { href: '/chat', label: 'Vestlus' },
  ],
  admin: [
    { href: '/dashboard', label: 'Töölaud' },
    { href: '/team', label: 'Tiim' },
    { href: '/goals', label: 'Eesmärgid' },
    { href: '/chat', label: 'Vestlus' },
    { href: '/admin', label: 'Admin' },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TopNavProps {
  user: User
}

export function TopNav({ user }: TopNavProps) {
  const pathname = usePathname()
  const links = NAV_LINKS_BY_ROLE[user.role]

  /**
   * A link is "active" when the current pathname starts with the link's href.
   * /dashboard is only active when pathname === '/dashboard' (exact match)
   * to avoid it matching everything.
   */
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: '60px',
        background: 'var(--pz-surface)',
        borderBottom: '1px solid var(--pz-border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 32px',
        gap: '24px',
      }}
    >
      {/* ── Left: Wordmark ─────────────────────────────────────────────────── */}
      <Link
        href="/dashboard"
        style={{
          textDecoration: 'none',
          fontSize: '20px',
          fontWeight: 700,
          color: 'var(--pz-violet)',
          letterSpacing: '-0.02em',
          flexShrink: 0,
        }}
      >
        Tiim
      </Link>

      {/* ── Center: Navigation ─────────────────────────────────────────────── */}
      <nav
        aria-label="Peamine navigatsioon"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
        }}
      >
        {links.map(({ href, label }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              style={{
                textDecoration: 'none',
                padding: '5px 14px',
                borderRadius: 'var(--pz-radius-pill)',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                background: active ? 'var(--pz-grad-primary)' : 'transparent',
                color: active ? '#fff' : 'var(--pz-fg-3)',
                transition: `background var(--pz-dur-base), color var(--pz-dur-base)`,
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--pz-fg-1)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.color = 'var(--pz-fg-3)'
                }
              }}
            >
              {label}
            </Link>
          )
        })}
      </nav>

      {/* ── Right: Language toggle + User menu ─────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <LanguageToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
