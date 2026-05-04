import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId, getUsersByCompany } from '@/lib/db/users'
import type { User } from '@/types'

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

function getRoleColor(role: User['role']): string {
  if (role === 'manager') return '#6030FF'
  if (role === 'admin') return '#E12AFB'
  return '#94A3B8'
}

export default async function TeamDirectoryPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const teamMembers = await getUsersByCompany(user.company_id)
  const memberMap = new Map(teamMembers.map((m) => [m.id, m]))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--pz-fg-1)',
            margin: 0,
          }}
        >
          Meeskond
        </h1>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--pz-violet)',
            background: 'rgba(96,48,255,0.08)',
            border: '1px solid rgba(96,48,255,0.18)',
            borderRadius: 'var(--pz-radius-pill)',
            padding: '2px 10px',
          }}
        >
          {teamMembers.length} liiget
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {teamMembers.map((member) => {
          const managerUser = member.manager_id ? memberMap.get(member.manager_id) : undefined
          const roleColor = getRoleColor(member.role)

          return (
            <div
              key={member.id}
              style={{
                background: 'var(--pz-surface)',
                border: '1px solid var(--pz-border)',
                borderRadius: 'var(--pz-radius-md)',
                boxShadow: 'var(--pz-shadow-sm)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--pz-grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '18px',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(member.name)}
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--pz-fg-1)', marginBottom: '4px' }}>
                    {member.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--pz-fg-3)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '180px',
                      margin: '0 auto',
                    }}
                  >
                    {member.email}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: roleColor,
                    border: `1px solid ${roleColor}`,
                    borderRadius: 'var(--pz-radius-pill)',
                    padding: '2px 10px',
                    background: `${roleColor}14`,
                  }}
                >
                  {getRoleLabel(member.role)}
                </span>
              </div>

              {(managerUser || member.vacation_mode || !member.onboarding_complete) && (
                <div
                  style={{
                    borderTop: '1px solid var(--pz-border)',
                    paddingTop: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {managerUser && (
                    <div style={{ fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                      <span style={{ fontWeight: 500 }}>Juht:</span>{' '}
                      <span style={{ color: 'var(--pz-fg-2)' }}>{managerUser.name}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                        }}
                      >
                        Puhkusel
                      </span>
                    )}
                    {!member.onboarding_complete && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 500,
                          color: '#854d0e',
                          background: 'rgba(234,179,8,0.12)',
                          border: '1px solid rgba(234,179,8,0.4)',
                          borderRadius: 'var(--pz-radius-pill)',
                          padding: '2px 8px',
                        }}
                      >
                        Seadistamisel
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
