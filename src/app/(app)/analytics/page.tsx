import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'

export default async function AnalyticsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'manager' || user.role === 'admin') {
    redirect('/dashboard/team/analytics')
  }
  redirect('/dashboard/me')
}
