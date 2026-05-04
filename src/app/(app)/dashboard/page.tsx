import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId } from '@/lib/db/users'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') {
    redirect('/dashboard/me')
  } else {
    redirect('/dashboard/team')
  }
}
