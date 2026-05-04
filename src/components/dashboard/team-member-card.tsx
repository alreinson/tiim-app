import type { User } from '@/types'

interface TeamMemberCardProps {
  member: User
  hasCheckedInThisWeek: boolean
  activeBlockerCount: number
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function getRoleLabel(role: User['role']): string {
  if (role === 'manager') return 'Juht'
  if (role === 'admin') return 'Admin'
  return 'Tiimiliige'
}

export function TeamMemberCard({ member, hasCheckedInThisWeek, activeBlockerCount }: TeamMemberCardProps) {
  return (
    <div
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)',
        boxShadow: 'var(--pz-shadow-sm)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--pz-grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '15px',
            flexShrink: 0,
          }}
        >
          {getInitials(member.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '15px',
              color: 'var(--pz-fg-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {member.name}
          </div>
          <div
            style={{
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '11px',
              fontWeight: 500,
              color: 'var(--pz-fg-3)',
              background: 'rgba(148,163,184,0.12)',
              border: '1px solid var(--pz-border)',
              borderRadius: 'var(--pz-radius-pill)',
              padding: '1px 8px',
            }}
          >
            {getRoleLabel(member.role)}
          </div>
        </div>
        {member.vacation_mode && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#92400e',
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: 'var(--pz-radius-pill)',
              padding: '2px 8px',
              flexShrink: 0,
            }}
          >
            Puhkusel
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: hasCheckedInThisWeek ? 'var(--pz-success)' : 'var(--pz-danger)',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--pz-fg-2)' }}>
          {hasCheckedInThisWeek ? 'Sisselogitud' : 'Ootel'}
        </span>
        {activeBlockerCount > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              background: 'var(--pz-danger)',
              borderRadius: 'var(--pz-radius-pill)',
              padding: '1px 8px',
            }}
          >
            {activeBlockerCount} takistus{activeBlockerCount > 1 ? 't' : ''}
          </span>
        )}
      </div>
    </div>
  )
}
