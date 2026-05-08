'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import {
  LayoutDashboard, MessageSquare, Target, Newspaper,
  BarChart3, Settings, LogOut, Sparkles, Users,
} from 'lucide-react'
import { LanguageToggle } from '@/components/shared/language-toggle'
import { UserMenu } from '@/components/shared/user-menu'
import type { User } from '@/types'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}

const personalNav: NavItem[] = [
  { href: '/dashboard/me',  label: 'Töölaud',                  icon: LayoutDashboard },
  { href: '/chat',          label: 'Nädalane sisselogimine',    icon: MessageSquare },
  { href: '/goals',         label: 'Eesmärgid ja ülesanded',   icon: Target },
  { href: '/news',          label: 'Tiimi uudised',            icon: Newspaper },
  { href: '/quarterly',     label: 'Kvartalisisselogimine',     icon: Sparkles },
]

const teamNav: NavItem[] = [
  { href: '/dashboard/team',             label: 'Tiimi töölaud',        icon: Users },
  { href: '/dashboard/team/checkins',    label: 'Tiimi sisselogimised', icon: MessageSquare },
  { href: '/dashboard/team/goals',       label: 'Tiimi eesmärgid',      icon: Target },
  { href: '/dashboard/team/news',        label: 'Tiimi uudised',        icon: Newspaper },
  { href: '/dashboard/team/analytics',   label: 'Analüütika',           icon: BarChart3 },
]

interface SidebarProps {
  user: User
  companyName?: string
}

export function Sidebar({ user, companyName }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const isManager = user.role === 'manager' || user.role === 'admin'

  const [view, setView] = useState<'personal' | 'team'>(
    isManager && pathname.startsWith('/dashboard/team') ? 'team' : 'personal'
  )

  const navItems = isManager ? (view === 'team' ? teamNav : personalNav) : personalNav

  const isActive = (href: string) => {
    if (href === '/dashboard/team' && pathname.startsWith('/dashboard/team/')) return false
    return pathname === href || (href !== '/dashboard/me' && href !== '/dashboard/team' && pathname.startsWith(href))
  }

  return (
    <aside
      style={{
        width: '240px',
        flexShrink: 0,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        borderRight: '1px solid var(--pz-border)',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--pz-border)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <div style={{
            fontSize: '18px', fontWeight: 700,
            fontFamily: '"Poppins", "Inter", sans-serif',
            letterSpacing: '-0.02em', lineHeight: 1,
          }}>
            <span style={{ color: 'var(--pz-fg-1)' }}>tiim</span>
            <span style={{
              background: 'linear-gradient(135deg, #A855F7, #E12AFB)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>.space</span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--pz-fg-4)', marginTop: '4px' }}>
            AI-toega tiimijuhtimine
          </div>
        </Link>
      </div>

      {/* Personal / Team toggle — managers only */}
      {isManager && (
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--pz-border)', flexShrink: 0 }}>
          <div style={{
            fontSize: '10px', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--pz-fg-4)',
            marginBottom: '7px', paddingLeft: '4px',
          }}>
            Vaade
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '3px', padding: '3px',
            background: 'var(--pz-surface-2)',
            borderRadius: '999px',
            border: '1px solid var(--pz-border)',
          }}>
            {(['personal', 'team'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  fontSize: '12px', padding: '5px 0',
                  borderRadius: '999px', border: 'none',
                  cursor: 'pointer', fontWeight: view === v ? 600 : 400,
                  background: view === v ? 'var(--pz-grad-primary)' : 'transparent',
                  color: view === v ? '#fff' : 'var(--pz-fg-3)',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                {v === 'personal' ? 'Isiklik' : 'Tiim'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {navItems.map((item) => {
            const active = isActive(item.href)
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: 'var(--pz-radius-md)',
                  fontSize: '13.5px', fontWeight: active ? 600 : 400,
                  textDecoration: 'none',
                  background: active ? 'var(--accent)' : 'transparent',
                  color: active ? 'var(--pz-violet)' : 'var(--pz-fg-3)',
                  transition: 'background var(--pz-dur-base), color var(--pz-dur-base)',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'var(--pz-surface-2)'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--pz-fg-1)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                    ;(e.currentTarget as HTMLElement).style.color = 'var(--pz-fg-3)'
                  }
                }}
              >
                <Icon className="size-[17px]" style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom: Settings + Sign out */}
      <div style={{
        padding: '12px', borderTop: '1px solid var(--pz-border)',
        display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0,
      }}>
        <Link
          href="/settings"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: 'var(--pz-radius-md)',
            fontSize: '13.5px', textDecoration: 'none',
            color: pathname === '/settings' ? 'var(--pz-violet)' : 'var(--pz-fg-3)',
            background: pathname === '/settings' ? 'var(--accent)' : 'transparent',
            fontWeight: pathname === '/settings' ? 600 : 400,
          }}
        >
          <Settings className="size-[17px]" style={{ flexShrink: 0 }} />
          Seaded
        </Link>
        <button
          onClick={() => signOut({ redirectUrl: '/sign-in' })}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', borderRadius: 'var(--pz-radius-md)',
            fontSize: '13.5px', color: 'var(--pz-fg-3)',
            background: 'transparent', border: 'none', cursor: 'pointer',
            width: '100%', textAlign: 'left',
          }}
          onMouseEnter={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'var(--pz-surface-2)' }}
          onMouseLeave={(e) => { ;(e.currentTarget as HTMLElement).style.background = 'transparent' }}
        >
          <LogOut className="size-[17px]" style={{ flexShrink: 0 }} />
          Logi välja
        </button>
      </div>
    </aside>
  )
}

interface TopBarProps {
  user: User
  companyName?: string
}

export function TopBar({ user, companyName }: TopBarProps) {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 20,
        height: '56px', background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--pz-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 32px', flexShrink: 0,
      }}
    >
      <div style={{ fontSize: '13px', color: 'var(--pz-fg-3)' }}>
        <span style={{ color: 'var(--pz-fg-4)' }}>
          {user.role === 'manager' || user.role === 'admin' ? 'Juht' : 'Tiimiliige'} ·{' '}
        </span>
        <span style={{ fontWeight: 500, color: 'var(--pz-fg-1)' }}>{companyName ?? 'Tiim.space'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <LanguageToggle />
        <UserMenu user={user} />
      </div>
    </header>
  )
}
