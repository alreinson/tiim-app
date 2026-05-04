import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import type { Language } from '@/types'

interface CompleteOnboardingBody {
  language: Language
  support_style: number
  feedback_directness: 'direct' | 'balanced' | 'gentle'
  timezone: string
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CompleteOnboardingBody
  try {
    body = (await request.json()) as CompleteOnboardingBody
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { language, support_style, feedback_directness, timezone } = body

  // Validate
  if (!['et', 'en'].includes(language)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 422 })
  }
  if (typeof support_style !== 'number' || support_style < 1 || support_style > 5) {
    return NextResponse.json({ error: 'Invalid support_style' }, { status: 422 })
  }
  if (!['direct', 'balanced', 'gentle'].includes(feedback_directness)) {
    return NextResponse.json({ error: 'Invalid feedback_directness' }, { status: 422 })
  }

  const user = await getUserByClerkId(userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Update user
  const updatedUser = await updateUser(user.id, {
    onboarding_complete: true,
    language,
    support_style,
    feedback_directness,
    timezone: timezone ?? 'Europe/Tallinn',
  })

  // Create streak row — ignore conflict if already exists
  const supabase = await createServiceClient()
  const { error: streakError } = await supabase
    .from('streaks')
    .insert({ user_id: user.id })
    .select()
    .maybeSingle()

  if (streakError && streakError.code !== '23505') {
    // 23505 = unique_violation — streak already exists, that's fine
    console.error('[api/onboarding/complete] streak insert error:', streakError)
  }

  return NextResponse.json({ user: updatedUser })
}
