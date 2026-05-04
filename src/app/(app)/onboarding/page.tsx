import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const user = await getUserByClerkId(userId)

  if (!user) {
    // User record not yet created (webhook lag) — redirect to sign-in for retry
    redirect('/sign-in')
  }

  if (user.onboarding_complete) {
    redirect('/dashboard')
  }

  return <OnboardingWizard user={user} />
}
