'use client'

import { useState } from 'react'
import { Target } from 'lucide-react'
import type { Goal, GoalStatus, GoalLevel, GoalType, WorkItem } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

// ─── Status / level config ─────────────────────────────────────────────────────

const STATUS_CFG: Record<GoalStatus, { label: string; bg: string; color: string }> = {
  on_track:    { label: 'On track',    bg: '#e6f7ec', color: '#00a63e' },
  in_progress: { label: 'In progress', bg: '#eef4ff', color: '#1f4fd8' },
  at_risk:     { label: 'At risk',     bg: '#fef3e2', color: '#f59e0b' },
  done:        { label: 'Done',        bg: '#e6f7ec', color: '#00a63e' },
  not_started: { label: 'Not started', bg: '#f9fafb', color: '#667085' },
}

const LEVEL_LABEL: Record<GoalLevel, string> = {
  yearly: 'YEARLY',
  quarterly: 'QUARTERLY',
}

const ITEM_STATUS_DOT: Record<string, string> = {
  done:        '#00a63e',
  on_track:    '#00a63e',
  in_progress: '#6030ff',
  at_risk:     '#f59e0b',
  not_started: '#667085',
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Member {
  id: string
  name: string
}

interface Props {
  goals: Goal[]
  workItems: WorkItem[]
  members: Member[]
  userMap: Record<string, string>
}

// ─── Sub-component: Goal Card ─────────────────────────────────────────────────

function GoalCard({ goal, workItems, userMap }: { goal: Goal; workItems: WorkItem[]; userMap: Record<string, string> }) {
  const statusCfg = STATUS_CFG[goal.status]

  const linkedItems = workItems.filter((w) => w.goal_ids.includes(goal.id))
  const projects    = linkedItems.filter((w) => w.type === 'project')
  const directTasks = linkedItems.filter((w) => w.type === 'task')

  const ownerName = goal.owner_id ? (userMap[goal.owner_id] ?? null) : null
  const contributorNames = goal.contributor_ids
    .map((id) => userMap[id])
    .filter(Boolean)

  const subtitleParts: string[] = []
  subtitleParts.push(goal.type === 'work' ? 'Work' : 'Personal')
  if (ownerName) subtitleParts.push(`Owner: ${ownerName}`)
  else if (contributorNames.length > 0) {
    const initials = goal.contributor_ids.map((id) => {
      const name = userMap[id] ?? ''
      return name.split(' ').map((p) => p[0]).join('')
    }).filter(Boolean)
    subtitleParts.push(`Contributors: ${initials.join(', ')}`)
  }

  const hasSubItems = projects.length > 0 || directTasks.length > 0

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)', overflow: 'hidden',
    }}>
      {/* Main row */}
      <div style={{ padding: '18px 20px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: '38px', height: '38px', borderRadius: '14px', flexShrink: 0,
          background: 'linear-gradient(135deg, #f4f3ff 0%, #fce7fb 100%)',
          display: 'grid', placeItems: 'center',
        }}>
          <Target style={{ width: '19px', height: '19px', color: '#6030ff' }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title + badges */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <p className="font-display" style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px', flex: 1 }}>
              {goal.title}
            </p>
            <div style={{ display: 'flex', gap: '6px', flexShrink: 0, alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontWeight: 400, color: '#6030ff', background: '#f4f3ff', borderRadius: '9999px', padding: '3px 8px', letterSpacing: '0.25px' }}>
                {LEVEL_LABEL[goal.level]}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: statusCfg.color, background: statusCfg.bg, borderRadius: '9999px', padding: '3px 8px' }}>
                {statusCfg.label}
              </span>
            </div>
          </div>

          {/* Subtitle */}
          <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#667085', textTransform: 'capitalize' }}>
            {subtitleParts.join(' · ')}
          </p>

          {/* Progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '6px', background: '#f9fafb', borderRadius: '9999px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${goal.progress}%`, borderRadius: '9999px',
                background: 'linear-gradient(180deg, #6030ff 0%, #1f4fd8 100%)',
              }} />
            </div>
            <span className="font-display" style={{ fontSize: '22px', fontWeight: 600, color: '#101828', letterSpacing: '-0.22px', whiteSpace: 'nowrap', minWidth: '46px', textAlign: 'right' }}>
              {goal.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Sub-items */}
      {hasSubItems && (
        <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {projects.length > 0 && (
            <>
              <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 500, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.25px' }}>
                Projects ({projects.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {projects.map((proj) => (
                  <div key={proj.id} style={{
                    background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px',
                    padding: '10px 12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', flex: 1 }}>
                        {proj.title}
                      </span>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, padding: '2px 8px', borderRadius: '9999px',
                        background: STATUS_CFG[proj.status].bg, color: STATUS_CFG[proj.status].color,
                      }}>
                        {STATUS_CFG[proj.status].label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {directTasks.length > 0 && (
            <>
              <p style={{ margin: `${projects.length > 0 ? '4px' : '0'} 0 4px`, fontSize: '10px', fontWeight: 500, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.25px' }}>
                Direct tasks
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {directTasks.map((task) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                      background: ITEM_STATUS_DOT[task.status] ?? '#667085',
                    }} />
                    <span style={{
                      fontSize: '11px', color: '#344054', flex: 1,
                      textDecoration: task.status === 'done' ? 'line-through' : 'none',
                    }}>
                      {task.title}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main client component ────────────────────────────────────────────────────

export function TeamGoalsClient({ goals, workItems, members, userMap }: Props) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  // Count goals per member
  function memberGoalCount(memberId: string): number {
    return goals.filter((g) => g.owner_id === memberId || g.contributor_ids.includes(memberId)).length
  }

  // Filter goals by selected member
  const filteredGoals = selectedMember
    ? goals.filter((g) => g.owner_id === selectedMember || g.contributor_ids.includes(selectedMember))
    : goals

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* All team pill */}
        <button
          onClick={() => setSelectedMember(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '9999px',
            background: selectedMember === null ? 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)' : '#fff',
            border: selectedMember === null ? 'none' : '1px solid #e5e7eb',
            color: selectedMember === null ? '#fff' : '#4a5565',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            boxShadow: selectedMember === null ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          } as React.CSSProperties}
        >
          Kogu tiim
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '18px', height: '18px', borderRadius: '9999px', fontSize: '10px', fontWeight: 500,
            background: selectedMember === null ? 'rgba(255,255,255,0.2)' : '#f9fafb',
            color: selectedMember === null ? '#fff' : '#667085',
          }}>
            {goals.length}
          </span>
        </button>

        {/* Member pills */}
        {members.map((member) => {
          const count = memberGoalCount(member.id)
          if (count === 0) return null
          const active = selectedMember === member.id
          const gradient = getAvatarGradient(member.id)
          const initials = getInitials(member.name)
          const firstName = member.name.split(' ')[0]

          return (
            <button
              key={member.id}
              onClick={() => setSelectedMember(active ? null : member.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px 6px 8px', borderRadius: '9999px',
                background: '#fff', cursor: 'pointer',
                border: `1px solid ${active ? '#6030ff' : '#e5e7eb'}`,
              } as React.CSSProperties}
            >
              <div style={{
                width: '19px', height: '19px', borderRadius: '50%', flexShrink: 0,
                background: gradient, display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '8px', fontWeight: 500, color: '#fff' }}>{initials}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: active ? '#6030ff' : '#4a5565' }}>
                {firstName}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '17px', height: '17px', borderRadius: '9999px', fontSize: '10px', fontWeight: 500,
                background: '#f9fafb', color: '#667085',
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Goal list */}
      {filteredGoals.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '48px', textAlign: 'center', color: '#667085', fontSize: '13px',
        }}>
          Valitud tiimiliikmel pole eesmärke.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} workItems={workItems} userMap={userMap} />
          ))}
        </div>
      )}
    </div>
  )
}
