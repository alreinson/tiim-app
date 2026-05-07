import type { User } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
import { CheckCircle, AlertCircle, Flame } from 'lucide-react'

interface TeamMemberCardProps {
  member: User
  hasCheckedInThisWeek: boolean
  activeBlockerCount: number
  streak?: number
}

export function TeamMemberCard({ member, hasCheckedInThisWeek, activeBlockerCount, streak = 0 }: TeamMemberCardProps) {
  return (
    <div
      style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}
    >
      {/* Avatar + name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '44px', height: '44px', borderRadius: '50%',
            background: getAvatarGradient(member.id),
            display: 'grid', placeItems: 'center',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>{getInitials(member.name)}</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: '0 0 4px', fontWeight: 600, fontSize: '15px', color: '#101828',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {member.name}
          </p>
          {member.vacation_mode ? (
            <span style={{
              fontSize: '10px', fontWeight: 500, color: '#92400e',
              background: '#fef3c7', borderRadius: '9999px', padding: '2px 8px',
            }}>
              Puhkusel
            </span>
          ) : (
            <span style={{
              fontSize: '10px', fontWeight: 500, color: '#667085',
              background: '#f9fafb', border: '1px solid #e5e7eb',
              borderRadius: '9999px', padding: '2px 8px',
            }}>
              {member.role === 'manager' ? 'Juht' : member.role === 'admin' ? 'Admin' : 'Tiimiliige'}
            </span>
          )}
        </div>
      </div>

      {/* Status row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {hasCheckedInThisWeek ? (
          <>
            <CheckCircle style={{ width: '14px', height: '14px', color: '#00a63e', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#00a63e', fontWeight: 500 }}>Sisselogitud</span>
          </>
        ) : (
          <>
            <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b', flexShrink: 0 }} />
            <span style={{ fontSize: '13px', color: '#667085' }}>Sisselogimine ootel</span>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#101828' }}>{streak}</span>
          <Flame style={{ width: '13px', height: '13px', color: '#f59e0b' }} />
        </div>
      </div>

      {/* Blockers */}
      {activeBlockerCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '11px', fontWeight: 500,
          color: '#dc2626', background: '#fef2f2',
          borderRadius: '9999px', padding: '4px 10px', alignSelf: 'flex-start',
        }}>
          <span
            style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#dc2626', flexShrink: 0, display: 'inline-block' }}
          />
          {activeBlockerCount} aktiivsed takistus{activeBlockerCount > 1 ? 't' : ''}
        </div>
      )}
    </div>
  )
}
