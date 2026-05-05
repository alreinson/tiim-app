import { createServiceClient } from '@/lib/supabase/server'

function getPrevWeek(week: string): string {
  const [yearStr, wStr] = week.split('-W')
  const year = Number(yearStr)
  const w = Number(wStr)
  if (w === 1) return `${year - 1}-W52`
  return `${year}-W${String(w - 1).padStart(2, '0')}`
}

export async function upsertStreak(
  userId: string,
  currentWeek: string
): Promise<{ current_streak: number; longest_streak: number; is_first_checkin: boolean }> {
  const supabase = await createServiceClient()

  const { data: existing } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.last_checkin_week === currentWeek) {
    return {
      current_streak: existing.current_streak,
      longest_streak: existing.longest_streak,
      is_first_checkin: false,
    }
  }

  const prevWeek = getPrevWeek(currentWeek)
  const is_first_checkin = !existing
  let newCurrent = 1
  let newLongest = 1

  if (existing) {
    if (existing.last_checkin_week === prevWeek) {
      newCurrent = existing.current_streak + 1
    }
    newLongest = Math.max(existing.longest_streak, newCurrent)
  }

  const { error } = await supabase.from('streaks').upsert(
    {
      user_id: userId,
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_checkin_week: currentWeek,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) throw new Error(`Failed to upsert streak: ${error.message}`)

  return { current_streak: newCurrent, longest_streak: newLongest, is_first_checkin }
}
