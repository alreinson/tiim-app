import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { SettingsClient } from './settings-client'

export default async function SettingsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  return <SettingsClient user={user} />
}
