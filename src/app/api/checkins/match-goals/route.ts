import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { getUserByClerkId } from '@/lib/db/users'
import { getGoalsByOwner } from '@/lib/db/goals'
import { updateCheckin } from '@/lib/db/checkins'
import type { Goal, GoalProposal, GoalStatus } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildGoalIndex(goals: Goal[]): string {
  return goals
    .map((g) => {
      const parts = [
        g.id.slice(0, 8),
        g.level,
        g.type,
        g.title,
        g.parent_id ? `parent:${g.parent_id.slice(0, 8)}` : null,
        `status:${g.status}`,
        `progress:${g.progress}%`,
      ].filter(Boolean)
      return parts.join(' | ')
    })
    .join('\n')
}

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const { checkin_id, progress, plans, problems } = await request.json()
  if (!checkin_id) return Response.json({ error: 'checkin_id required' }, { status: 400 })

  const goals = await getGoalsByOwner(user.id)
  if (goals.length === 0) {
    return Response.json({ proposals: [] })
  }

  const goalIndex = buildGoalIndex(goals)
  const pppText = [
    progress?.length ? `Progress:\n${progress.map((s: string) => `- ${s}`).join('\n')}` : '',
    plans?.length ? `Plans:\n${plans.map((s: string) => `- ${s}`).join('\n')}` : '',
    problems?.length ? `Problems:\n${problems.map((s: string) => `- ${s}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n')

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a goal-tracking assistant for tiim.space. Analyse this check-in summary and match it against the goal index.

Goal index (id_prefix | level | type | title | parent | status | progress):
${goalIndex}

Check-in summary:
${pppText}

For each clear match between check-in content and a goal:
- Use the full goal id (first 8 chars shown as prefix)
- Propose a status update if evidence is strong
- Set confidence: high if explicitly mentioned, low if inferred
- Quote the source text from the check-in

Return ONLY valid JSON, no extra text:
{
  "proposals": [
    {
      "goal_id_prefix": "first 8 chars of goal id",
      "goal_title": "goal title",
      "proposed_status": "not_started|in_progress|on_track|at_risk|done",
      "proposed_progress": null or 0-100,
      "confidence": "high|low",
      "source_text": "the snippet that triggered this"
    }
  ]
}

Only include proposals where there is real evidence. Return empty array if nothing matches.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return Response.json({ proposals: [] })

    const result = JSON.parse(jsonMatch[0])
    const rawProposals: Array<{
      goal_id_prefix: string
      goal_title: string
      proposed_status: GoalStatus
      proposed_progress?: number | null
      confidence: 'high' | 'low'
      source_text: string
    }> = result.proposals ?? []

    // Resolve prefix to full goal id
    const proposals: GoalProposal[] = rawProposals.reduce<GoalProposal[]>((acc, p) => {
      const goal = goals.find((g) => g.id.startsWith(p.goal_id_prefix))
      if (!goal) return acc
      acc.push({
        goal_id: goal.id,
        goal_title: p.goal_title || goal.title,
        proposed_status: p.proposed_status,
        ...(p.proposed_progress != null ? { proposed_progress: p.proposed_progress } : {}),
        confidence: p.confidence,
        source_text: p.source_text,
      })
      return acc
    }, [])

    // Store proposals back on the check-in
    if (proposals.length > 0) {
      await updateCheckin(checkin_id, { pending_ai_actions: proposals })
    }

    return Response.json({ proposals })
  } catch (err) {
    console.error('[api/checkins/match-goals] error:', err)
    return Response.json({ error: 'Goal matching failed' }, { status: 500 })
  }
}
