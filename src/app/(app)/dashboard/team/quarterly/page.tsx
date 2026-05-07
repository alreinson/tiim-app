import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { TeamQuarterlyClient } from './team-quarterly-client'

export default async function TeamQuarterlyPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/quarterly')

  const now = new Date()
  const quarter = Math.ceil((now.getMonth() + 1) / 3)
  const year = now.getFullYear()

  const teamMembers = await getUsersByCompany(user.company_id)

  const members = teamMembers.map((m) => ({
    id: m.id,
    name: m.name,
    sectionsCompleted: 0,
    submittedAt: null as string | null,
  }))

  return (
    <TeamQuarterlyClient
      members={members}
      quarter={quarter}
      year={year}
    />
  )
}
