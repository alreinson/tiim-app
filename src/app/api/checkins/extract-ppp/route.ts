import { auth } from '@clerk/nextjs/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { messages } = await request.json()
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'messages array is required' }, { status: 400 })
  }

  const transcript = messages
    .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Kasutaja' : 'tiim.space'}: ${m.content}`)
    .join('\n')

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Extract PPP (Progress, Plans, Problems) from this work check-in conversation. Detect the language (Estonian/English) and respond in the SAME language.

Conversation:
${transcript}

Return ONLY valid JSON, no extra text:
{
  "progress": ["max 3 short bullets of what was accomplished or went well"],
  "plans": ["max 3 short bullets of plans or goals for this week"],
  "problems": ["max 3 short bullets of blockers, challenges or problems mentioned"],
  "wins": ["max 2 short bullets of personal wins — things the person is proud of this week"]
}

If a category wasn't discussed, return an empty array for it. The wins array should capture moments of pride or personal achievement mentioned, distinct from general progress.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')

    const result = JSON.parse(jsonMatch[0])
    return Response.json(result)
  } catch (err) {
    console.error('[api/checkins/extract-ppp] error:', err)
    return Response.json({ error: 'Extraction failed' }, { status: 500 })
  }
}
