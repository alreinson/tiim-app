import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { createCheckin } from '@/lib/db/checkins'
import { upsertStreak } from '@/lib/db/streaks'
import { checkAndGrantAchievements } from '@/lib/db/achievements'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  try {
    const { transcript, mood, energy, workload, progress, plans, problems, sharing, pending_ai_actions } = await request.json()

    const week = getCurrentWeek()

    const checkin = await createCheckin({
      user_id: user.id,
      type: 'weekly',
      week,
      transcript: transcript ?? '',
      progress: progress ?? [],
      plans: plans ?? [],
      problems: problems ?? [],
      sharing: sharing ?? {},
      mood: mood ?? null,
      energy: energy ?? null,
      workload: workload ?? null,
      ...(pending_ai_actions ? { pending_ai_actions } : {}),
    } as Parameters<typeof createCheckin>[0])

    const streakResult = await upsertStreak(user.id, week)
    const newAchievements = await checkAndGrantAchievements(user.id, {
      is_first_checkin: streakResult.is_first_checkin,
      current_streak: streakResult.current_streak,
    })

    return Response.json(
      { checkin, streak: streakResult, new_achievements: newAchievements },
      { status: 201 }
    )
  } catch (err) {
    console.error('[api/checkins] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
