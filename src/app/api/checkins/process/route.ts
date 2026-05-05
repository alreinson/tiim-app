import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { transcript, mood, energy, workload } = await request.json()

  if (!transcript) {
    return Response.json({ error: 'transcript is required' }, { status: 400 })
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Analyze this weekly work check-in. Detect the language and respond in the same language (Estonian or English).

Self-reported scores (1=very low, 5=very high):
- Mood: ${mood ?? '?'}/5
- Energy: ${energy ?? '?'}/5
- Workload: ${workload ?? '?'}/5

Check-in transcript:
"${transcript}"

Respond ONLY with valid JSON, no extra text:
{
  "highlights": ["max 3 short bullet points of what went well or was accomplished"],
  "blockers": ["max 2 short bullet points of challenges or blockers mentioned"],
  "mood_note": "one sentence interpreting the combined mood/energy/workload scores",
  "summary": "2-3 sentence supportive summary of this check-in"
}`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (err) {
    console.error('[api/checkins/process] error:', err)
    return Response.json({ error: 'AI processing failed' }, { status: 500 })
  }
}
