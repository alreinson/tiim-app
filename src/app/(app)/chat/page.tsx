import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByUser } from '@/lib/db/checkins'
import { ChatClient } from './chat-client'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default async function ChatPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const checkins = await getCheckinsByUser(user.id, 1)
  const hasCheckedInThisWeek = checkins[0]?.week === getCurrentWeek()

  return (
    <ChatClient
      userName={user.name}
      userRole={user.role}
      hasCheckedInThisWeek={hasCheckedInThisWeek}
    />
  )
}
