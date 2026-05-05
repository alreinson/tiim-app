import { auth } from '@clerk/nextjs/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const audio = formData.get('audio') as Blob | null

  if (!audio || audio.size === 0) {
    return Response.json({ error: 'No audio provided' }, { status: 400 })
  }

  try {
    const file = new File([audio], 'recording.webm', { type: audio.type || 'audio/webm' })

    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
    })

    return Response.json({ transcript: transcription.text })
  } catch (err) {
    console.error('[api/checkins/transcribe] error:', err)
    return Response.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
