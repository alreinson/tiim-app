import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getUsersByCompany } from '@/lib/db/users'
import { TeamAnalyticsClient } from './analytics-client'

export default async function TeamAnalyticsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/dashboard/me')

  const [checkins, teamMembers] = await Promise.all([
    getCheckinsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
  ])

  // Build 6-week rolling averages
  const now = new Date()
  const weeks: string[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const week = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    weeks.push(`${d.getFullYear()}-W${String(week).padStart(2, '0')}`)
  }

  const trendData = weeks.map((week) => {
    const wCheckins = checkins.filter((c) => c.week === week)
    const count = wCheckins.length
    const avg = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null
    return {
      week: week.split('-W')[1] ? `N${week.split('-W')[1]}` : week,
      mood:     avg(wCheckins.map((c) => c.mood).filter(Boolean) as number[]),
      energy:   avg(wCheckins.map((c) => c.energy).filter(Boolean) as number[]),
      workload: avg(wCheckins.map((c) => c.workload).filter(Boolean) as number[]),
      checkins: count,
    }
  })

  const memberNames = teamMembers
    .filter((m) => m.id !== user.id)
    .map((m) => ({ id: m.id, name: m.name }))

  return <TeamAnalyticsClient trendData={trendData} memberNames={memberNames} totalMembers={teamMembers.length - 1} />
}
