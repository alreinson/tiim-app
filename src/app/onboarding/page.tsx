import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(userId)

  if (!user) {
    redirect('/sign-in')
  }

  if (user.onboarding_complete) {
    redirect('/dashboard')
  }

  const { invite } = await searchParams

  return <OnboardingWizard user={user} inviteToken={invite} />
}
