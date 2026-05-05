import { createServiceClient } from '@/lib/supabase/server'

export type AchievementCode = 'first_checkin' | 'streak_3' | 'streak_7' | 'streak_30'

async function grantAchievement(userId: string, code: AchievementCode): Promise<boolean> {
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('achievements')
    .insert({ user_id: userId, code, announced: false })

  if (!error) return true
  if (error.code === '23505') return false
  throw new Error(`Failed to grant achievement ${code}: ${error.message}`)
}

export async function checkAndGrantAchievements(
  userId: string,
  { is_first_checkin, current_streak }: { is_first_checkin: boolean; current_streak: number }
): Promise<AchievementCode[]> {
  const granted: AchievementCode[] = []

  const checks: Array<[boolean, AchievementCode]> = [
    [is_first_checkin, 'first_checkin'],
    [current_streak >= 3, 'streak_3'],
    [current_streak >= 7, 'streak_7'],
    [current_streak >= 30, 'streak_30'],
  ]

  for (const [condition, code] of checks) {
    if (condition && (await grantAchievement(userId, code))) {
      granted.push(code)
    }
  }

  return granted
}

export async function getUnannouncedAchievements(
  userId: string
): Promise<{ id: string; code: AchievementCode; earned_at: string }[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('achievements')
    .select('id, code, earned_at')
    .eq('user_id', userId)
    .eq('announced', false)
    .order('earned_at', { ascending: true })

  if (error) throw new Error(`Failed to fetch unannounced achievements: ${error.message}`)
  return (data ?? []) as { id: string; code: AchievementCode; earned_at: string }[]
}

export async function markAchievementsAnnounced(ids: string[]): Promise<void> {
  if (ids.length === 0) return
  const supabase = await createServiceClient()

  const { error } = await supabase
    .from('achievements')
    .update({ announced: true })
    .in('id', ids)

  if (error) throw new Error(`Failed to mark achievements announced: ${error.message}`)
}
