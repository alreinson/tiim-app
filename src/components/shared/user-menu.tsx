'use client'

import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LanguageToggle } from '@/components/shared/language-toggle'
import type { User, UserRole } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

// ── Label helpers ─────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  // TODO: i18n — move to translation keys
  team_member: 'Tiimiliige',
  manager: 'Juht',
  admin: 'Admin',
}

const ROLE_COLORS: Record<UserRole, string> = {
  team_member: 'var(--pz-fg-3)',
  manager: 'var(--pz-violet)',
  admin: 'var(--pz-fuchsia)',
}

// ── Component ─────────────────────────────────────────────────────────────────

interface UserMenuProps {
  user: User
}

export function UserMenu({ user }: UserMenuProps) {
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 8px 4px 4px',
          borderRadius: 'var(--pz-radius-pill)',
          border: '1px solid var(--pz-border)',
          background: 'var(--pz-surface)',
          cursor: 'pointer',
          transition: `box-shadow var(--pz-dur-base)`,
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--pz-shadow-sm)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
        }}
      >
        <Avatar size="sm">
          <AvatarFallback
            style={{
              background: getAvatarGradient(user.id),
              color: '#fff',
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--pz-fg-1)',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {user.name}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} style={{ minWidth: '220px' }}>
        {/* User info header */}
        <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--pz-border)' }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--pz-fg-1)',
              marginBottom: '2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: '12px',
              color: 'var(--pz-fg-3)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginBottom: '6px',
            }}
          >
            {user.email}
          </div>
          {/* Role badge */}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '1px 8px',
              borderRadius: 'var(--pz-radius-pill)',
              fontSize: '11px',
              fontWeight: 600,
              border: `1px solid ${ROLE_COLORS[user.role]}`,
              color: ROLE_COLORS[user.role],
            }}
          >
            {ROLE_LABELS[user.role]}
          </span>
        </div>

        {/* Language toggle inline */}
        <div
          style={{
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--pz-border)',
          }}
        >
          <DropdownMenuLabel
            style={{ padding: 0, fontSize: '12px', color: 'var(--pz-fg-3)' }}
          >
            {/* TODO: i18n */}
            Keel
          </DropdownMenuLabel>
          <LanguageToggle />
        </div>

        {/* Settings */}
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          style={{ margin: '4px', borderRadius: 'var(--pz-radius-sm)' }}
        >
          {/* TODO: i18n */}
          Seaded
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          variant="destructive"
          style={{ margin: '4px', borderRadius: 'var(--pz-radius-sm)' }}
        >
          {/* TODO: i18n */}
          Logi välja
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
