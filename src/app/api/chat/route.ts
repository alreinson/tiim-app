import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'
import { getUserByClerkId } from '@/lib/db/users'
import { getGoalsByOwner } from '@/lib/db/goals'
import { getBlockersByUser } from '@/lib/db/blockers'
import { getCheckinsByUser } from '@/lib/db/checkins'
import type { Goal, Blocker, Checkin } from '@/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildSystemPrompt(
  name: string,
  role: string,
  language: string,
  goals: Goal[],
  blockers: Blocker[],
  checkins: Checkin[]
): string {
  const lang = language === 'et' ? 'Estonian' : 'English'
  const activeGoals = goals
    .slice(0, 5)
    .map((g) => `- ${g.title} (${g.status}, ${g.progress}%)`)
    .join('\n')
  const activeBlockers = blockers
    .filter((b) => !b.resolved)
    .slice(0, 3)
    .map((b) => `- ${b.summary}`)
    .join('\n')
  const recentCheckin = checkins[0]
  const checkinContext = recentCheckin
    ? `Most recent check-in (${recentCheckin.week}): mood ${recentCheckin.mood ?? '?'}/5, energy ${recentCheckin.energy ?? '?'}/5, workload ${recentCheckin.workload ?? '?'}/5. "${recentCheckin.transcript ?? ''}"`
    : 'No recent check-ins.'

  return `You are Tiim, a supportive AI team coach. You help team members reflect on their work, goals, and challenges. Respond in ${lang}.

User: ${name} (${role})

Current goals:
${activeGoals || 'No goals set yet.'}

Active blockers:
${activeBlockers || 'No active blockers.'}

${checkinContext}

Be concise, warm, and actionable. Ask thoughtful follow-up questions when helpful. Keep responses under 150 words unless the user asks for more detail.`
}

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const { messages } = await request.json()

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages array is required' }, { status: 400 })
  }

  try {
    const [goals, blockers, checkins] = await Promise.all([
      getGoalsByOwner(user.id),
      getBlockersByUser(user.id),
      getCheckinsByUser(user.id, 3),
    ])

    const systemPrompt = buildSystemPrompt(
      user.name,
      user.role,
      user.language,
      goals,
      blockers,
      checkins
    )

    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text))
          }
        }
        controller.close()
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (err) {
    console.error('[api/chat] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
