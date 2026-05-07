import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { getGoalsByCompany } from '@/lib/db/goals'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getActiveBlockersByCompany } from '@/lib/db/blockers'
import { getNewsByCompany } from '@/lib/db/news'
import { getStreaksByUserIds } from '@/lib/db/streaks'
import { getCompany } from '@/lib/db/companies'
import { TeamDashboardClient } from '@/components/dashboard/team-dashboard-client'
import { AnnouncementsFeed } from '@/components/shared/announcements-feed'
import { PendingProposals } from '@/components/goals/pending-proposals'
import { getAvatarGradient } from '@/lib/avatar'
import type { SupportType } from '@/types'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function buildTrendData(checkins: Awaited<ReturnType<typeof getCheckinsByCompany>>) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (5 - i) * 7)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const w = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const weekKey = `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
    const wCheckins = checkins.filter((c) => c.week === weekKey)
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    return {
      week: `N${String(w).padStart(2, '0')}`,
      mood:     avg(wCheckins.map((c) => c.mood).filter((v): v is number => v != null)),
      energy:   avg(wCheckins.map((c) => c.energy).filter((v): v is number => v != null)),
      workload: avg(wCheckins.map((c) => c.workload).filter((v): v is number => v != null)),
    }
  })
}

function supportTypeLabel(type: SupportType): string {
  if (type === 'feel_heard') return 'Tahan olla kuuldud'
  if (type === 'want_solution') return 'Tahan lahendust'
  return 'Tahan läbi mõelda'
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}

export default async function TeamDashboardPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/dashboard/me')

  const currentWeek = getCurrentWeek()

  const [teamMembers, weekCheckins, activeBlockers, goals, myCheckins, newsItems, historyCheckins, company] = await Promise.all([
    getUsersByCompany(user.company_id),
    getCheckinsByCompany(user.company_id, currentWeek),
    getActiveBlockersByCompany(user.company_id),
    getGoalsByCompany(user.company_id),
    getCheckinsByCompany(user.company_id, currentWeek),
    getNewsByCompany(user.company_id),
    getCheckinsByCompany(user.company_id),
    getCompany(user.company_id),
  ])

  const streakMap = await getStreaksByUserIds(teamMembers.map((m) => m.id))

  const myThisWeekCheckin = myCheckins.find((c) => c.user_id === user.id) ?? null
  const checkedInUserIds = weekCheckins.map((c) => c.user_id)
  const onTrackGoals = goals.filter((g) => g.status === 'on_track' || g.status === 'done').length

  const trendData = buildTrendData(historyCheckins)

  const memberStats = teamMembers
    .filter((m) => m.id !== user.id)
    .map((m) => {
      const latestCheckin = historyCheckins
        .filter((c) => c.user_id === m.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]
      return {
        id: m.id,
        name: m.name,
        mood:     latestCheckin?.mood     ?? null,
        energy:   latestCheckin?.energy   ?? null,
        workload: latestCheckin?.workload ?? null,
        checkedIn: checkedInUserIds.includes(m.id),
        streak: streakMap[m.id] ?? 0,
        blockerCount: activeBlockers.filter((b) => b.user_id === m.id).length,
        avatarGradient: getAvatarGradient(m.id),
      }
    })

  const timelineCheckins = historyCheckins
    .map((c) => ({ ...c, member: { id: c.user.id, name: c.user.name } }))
    .slice(0, 150)

  // Pending AI proposals from manager's own check-ins
  const pendingProposals = myThisWeekCheckin?.pending_ai_actions ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Pending goal proposals */}
      {pendingProposals.length > 0 && (
        <PendingProposals checkinId={myThisWeekCheckin!.id} proposals={pendingProposals} />
      )}

      {/* Main dashboard with tabs */}
      <TeamDashboardClient
        teamMembers={teamMembers}
        memberStats={memberStats}
        checkedInIds={checkedInUserIds}
        trendData={trendData}
        timelineCheckins={timelineCheckins}
        totalBlockers={activeBlockers.length}
        onTrackGoals={onTrackGoals}
        totalGoals={goals.length}
        currentWeek={currentWeek}
        managerId={user.id}
        companyName={company?.name ?? ''}
      />

      {/* Active blockers */}
      {activeBlockers.length > 0 && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#101828' }}>Lahendamist vajavad takistused</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff', background: '#dc2626', borderRadius: '9999px', padding: '2px 8px' }}>
              {activeBlockers.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeBlockers.map((blocker) => (
              <div key={blocker.id} style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '16px',
                boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', marginTop: '5px', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#101828' }}>
                      {teamMembers.find((m) => m.id === blocker.user_id)?.name ?? ''}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#667085', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '9999px', padding: '1px 8px' }}>
                      {supportTypeLabel(blocker.support_type)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#4a5565', marginBottom: '6px' }}>
                    {truncate(blocker.summary, 100)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {daysSince(blocker.created_at) === 0 ? 'Täna' : `${daysSince(blocker.created_at)} päeva tagasi`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Manager's own PPP */}
      {myThisWeekCheckin && (myThisWeekCheckin.progress.length > 0 || myThisWeekCheckin.plans.length > 0 || myThisWeekCheckin.problems.length > 0) && (
        <section>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#101828' }}>Minu PPP selle nädal</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Progress', items: myThisWeekCheckin.progress, color: '#00a63e' },
              { label: 'Plaanid', items: myThisWeekCheckin.plans, color: '#6030ff' },
              { label: 'Probleemid', items: myThisWeekCheckin.problems, color: '#dc2626' },
            ].map(({ label, items, color }) => items.length > 0 && (
              <div key={label} style={{
                flex: '1 1 200px',
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '16px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
              }}>
                <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, i) => <li key={i} style={{ fontSize: '13px', color: '#344054', lineHeight: 1.5 }}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Team members' shared PPP */}
      {weekCheckins.some((c) => c.user_id !== user.id && (c.progress.length > 0 || c.plans.length > 0 || c.problems.length > 0)) && (
        <section>
          <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: '#101828' }}>Tiimi PPP selle nädal</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weekCheckins
              .filter((c) => c.user_id !== user.id)
              .map((checkin) => {
                const member = teamMembers.find((m) => m.id === checkin.user_id)
                if (!member) return null
                const sharing = checkin.sharing ?? {}
                const sharedProgress = (sharing.progress ?? checkin.progress.map((_: string, i: number) => i)).map((i: number) => checkin.progress[i]).filter(Boolean)
                const sharedPlans = (sharing.plans ?? checkin.plans.map((_: string, i: number) => i)).map((i: number) => checkin.plans[i]).filter(Boolean)
                const sharedProblems = (sharing.problems ?? checkin.problems.map((_: string, i: number) => i)).map((i: number) => checkin.problems[i]).filter(Boolean)
                if (!sharedProgress.length && !sharedPlans.length && !sharedProblems.length) return null
                return (
                  <div key={checkin.id} style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                    padding: '16px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                  }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px', color: '#101828' }}>{member.name}</p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Progress', items: sharedProgress, color: '#00a63e' },
                        { label: 'Plaanid', items: sharedPlans, color: '#6030ff' },
                        { label: 'Probleemid', items: sharedProblems, color: '#dc2626' },
                      ].map(({ label, items, color }) => items.length > 0 && (
                        <div key={label} style={{ flex: '1 1 140px' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                          <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {items.map((item: string, i: number) => <li key={i} style={{ fontSize: '12px', color: '#4a5565', lineHeight: 1.5 }}>{item}</li>)}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* Announcements */}
      <AnnouncementsFeed initialItems={newsItems} canPin={true} />
    </div>
  )
}
