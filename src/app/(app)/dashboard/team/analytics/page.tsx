import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getUsersByCompany } from '@/lib/db/users'
import { getGoalsByCompany } from '@/lib/db/goals'
import { TeamAnalyticsClient } from './analytics-client'

function isoWeekStr(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

export default async function TeamAnalyticsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/dashboard/me')

  const [checkins, teamMembers, goals] = await Promise.all([
    getCheckinsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
    getGoalsByCompany(user.company_id),
  ])

  const now = new Date()
  const weeks: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    weeks.push(isoWeekStr(d))
  }

  const avg = (arr: number[]) =>
    arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : null

  const trendData = weeks.map((week, idx) => {
    const wc = checkins.filter((c) => c.week === week)
    return {
      week: `W${idx + 1}`,
      mood:     avg(wc.map((c) => c.mood).filter((v): v is number => v != null)),
      energy:   avg(wc.map((c) => c.energy).filter((v): v is number => v != null)),
      workload: avg(wc.map((c) => c.workload).filter((v): v is number => v != null)),
      checkins: wc.length,
    }
  })

  // Stat: check-in rate (members with any checkin in last 6 weeks / total)
  const membersWithCheckin = new Set(
    checkins.filter((c) => weeks.includes(c.week)).map((c) => c.user_id)
  )
  const checkinRate = teamMembers.length > 0
    ? Math.round((membersWithCheckin.size / teamMembers.length) * 100)
    : 0

  // Stat: goal completion
  const totalGoals = goals.length
  const onTrackGoals = goals.filter((g) => g.status === 'done' || g.status === 'on_track').length
  const goalCompletion = totalGoals > 0 ? Math.round((onTrackGoals / totalGoals) * 100) : 0

  // Stat: sentiment delta (last week mood vs week before)
  const lastMood  = avg(checkins.filter((c) => c.week === weeks[5]).map((c) => c.mood).filter((v): v is number => v != null))
  const prevMood  = avg(checkins.filter((c) => c.week === weeks[4]).map((c) => c.mood).filter((v): v is number => v != null))
  const sentimentDelta = lastMood != null && prevMood != null
    ? Math.round((lastMood - prevMood) * 10) / 10
    : null

  // Radar: per-member score from current week checkins
  const currentWc = checkins.filter((c) => c.week === weeks[5])
  const radarData = teamMembers
    .map((m) => {
      const mc = currentWc.filter((c) => c.user_id === m.id)
      const score = avg(mc.map((c) => c.mood).filter((v): v is number => v != null)) ?? 0
      return { name: m.name.split(' ')[0], score }
    })
    .filter((d) => d.score > 0)

  return (
    <TeamAnalyticsClient
      trendData={trendData}
      members={teamMembers.map((m) => ({ id: m.id, name: m.name }))}
      checkinRate={checkinRate}
      goalCompletion={goalCompletion}
      sentimentDelta={sentimentDelta}
      radarData={radarData}
      totalMembers={teamMembers.length}
    />
  )
}
