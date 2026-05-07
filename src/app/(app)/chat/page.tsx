import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByUser } from '@/lib/db/checkins'
import { getGoalsByOwner } from '@/lib/db/goals'
import { ChatClient } from './chat-client'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getWeekDateRange(weekKey: string): string {
  const [yearStr, weekStr] = weekKey.split('-W')
  const year = parseInt(yearStr)
  const week = parseInt(weekStr)
  const jan4 = new Date(year, 0, 4)
  const dow = jan4.getDay()
  const weekOneMonday = new Date(jan4)
  weekOneMonday.setDate(jan4.getDate() - (dow === 0 ? 6 : dow - 1))
  const monday = new Date(weekOneMonday)
  monday.setDate(weekOneMonday.getDate() + (week - 1) * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const months = ['jaan', 'veebr', 'märts', 'apr', 'mai', 'juuni', 'juuli', 'aug', 'sept', 'okt', 'nov', 'dets']
  const fmt = (d: Date) => `${d.getDate()}. ${months[d.getMonth()]}`
  return `${fmt(monday)} — ${fmt(sunday)} ${year}`
}

export default async function ChatPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const currentWeek = getCurrentWeek()

  const [checkins, goals] = await Promise.all([
    getCheckinsByUser(user.id, 5),
    getGoalsByOwner(user.id),
  ])

  const hasCheckedInThisWeek = checkins[0]?.week === currentWeek
  const lastCheckin = hasCheckedInThisWeek ? checkins[1] : checkins[0]
  const lastCheckinPlans = lastCheckin?.plans ?? []

  const activeGoals = goals
    .filter((g) => g.status !== 'done')
    .slice(0, 4)
    .map((g) => ({ id: g.id, title: g.title, progress: g.progress, status: g.status }))

  return (
    <ChatClient
      userName={user.name}
      userRole={user.role}
      hasCheckedInThisWeek={hasCheckedInThisWeek}
      weekDateRange={getWeekDateRange(currentWeek)}
      lastCheckinPlans={lastCheckinPlans}
      activeGoals={activeGoals}
    />
  )
}
