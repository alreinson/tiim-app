import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCompany } from '@/lib/db/companies'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const company = await getCompany(user.company_id)

  return <SettingsClient user={user} companyName={company?.name ?? ''} />
}
