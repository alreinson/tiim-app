import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { getStreaksByUserIds } from '@/lib/db/streaks'
import { getAllAchievementsByUser } from '@/lib/db/achievements'
import { getShoutoutsByCompany } from '@/lib/db/shoutouts'
import { getResolvedBlockerUserIdsByCompany } from '@/lib/db/blockers'
import { TeamAchievementsClient } from './team-achievements-client'

const BADGE_DEFS = [
  { key: 'streak_3',      emoji: '🔥', name: 'Tuleleek',           desc: '3+ nädala järjestikune sisselogimine' },
  { key: 'streak_7',      emoji: '💎', name: 'Teemant',            desc: '7+ nädala järjestikune sisselogimine' },
  { key: 'streak_30',     emoji: '🛡️', name: 'Purustamatu',        desc: 'Terve kvartali järjestikune sisselogimine' },
  { key: 'first_checkin', emoji: '🎯', name: 'Esimene samm',       desc: 'Esimene sisselogimine' },
  { key: 'level_up',      emoji: '📈', name: 'Arenguhüpe',         desc: 'Arenguseesmärk täidetud' },
  { key: 'team_player',   emoji: '🤝', name: 'Tiimimängija',       desc: '3+ tänamist saanud' },
  { key: 'problem_solver',emoji: '🧩', name: 'Probleemilahendaja', desc: 'Takistus lahendatud' },
  { key: 'glow_up',       emoji: '✨', name: 'Meeleolu tõus',      desc: 'Märkimisväärne meeleolu paranemine' },
]

export default async function TeamAchievementsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/achievements')

  const members = await getUsersByCompany(user.company_id)
  const memberIds = members.map((m) => m.id)

  const [streaks, achievementsPerUser, shoutouts, resolvedBlockerUserIds] = await Promise.all([
    getStreaksByUserIds(memberIds),
    Promise.all(memberIds.map((id) => getAllAchievementsByUser(id).then((a) => ({ id, codes: a.map((x) => x.code) })))),
    getShoutoutsByCompany(user.company_id, 1000),
    getResolvedBlockerUserIdsByCompany(user.company_id),
  ])

  const achievementMap: Record<string, Set<string>> = {}
  for (const { id, codes } of achievementsPerUser) {
    achievementMap[id] = new Set(codes)
  }

  const shoutoutCounts: Record<string, number> = {}
  for (const s of shoutouts) {
    shoutoutCounts[s.to_user_id] = (shoutoutCounts[s.to_user_id] ?? 0) + 1
  }
  const teamPlayerIds = new Set(memberIds.filter((id) => (shoutoutCounts[id] ?? 0) >= 3))
  const problemSolverIds = new Set(resolvedBlockerUserIds)

  const badgeEarners: Record<string, string[]> = {}
  for (const def of BADGE_DEFS) {
    if (def.key === 'team_player') {
      badgeEarners[def.key] = memberIds.filter((id) => teamPlayerIds.has(id))
    } else if (def.key === 'problem_solver') {
      badgeEarners[def.key] = memberIds.filter((id) => problemSolverIds.has(id))
    } else if (def.key === 'level_up' || def.key === 'glow_up') {
      badgeEarners[def.key] = []
    } else {
      badgeEarners[def.key] = memberIds.filter((id) => achievementMap[id]?.has(def.key))
    }
  }

  const memberBadgeCounts: Record<string, number> = {}
  for (const m of members) {
    memberBadgeCounts[m.id] = BADGE_DEFS.filter((def) => badgeEarners[def.key].includes(m.id)).length
  }

  const clientMembers = members.map((m) => ({
    id: m.id,
    name: m.name,
    streak: streaks[m.id] ?? 0,
    badgeCount: memberBadgeCounts[m.id] ?? 0,
  }))

  const clientBadges = BADGE_DEFS.map((def) => ({
    key: def.key,
    emoji: def.emoji,
    name: def.name,
    desc: def.desc,
    earnerIds: badgeEarners[def.key],
  }))

  return (
    <TeamAchievementsClient
      members={clientMembers}
      badges={clientBadges}
      totalBadges={BADGE_DEFS.length}
    />
  )
}
