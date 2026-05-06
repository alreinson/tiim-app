'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type Step = 1 | 2 | 3 | 4

interface AiSummary {
  highlights: string[]
  blockers: string[]
  mood_note: string
  summary: string
}

function SliderInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: string
  value: number
  onChange: (v: number) => void
}) {
  const labels = ['', 'Väga madal', 'Madal', 'Keskmine', 'Hea', 'Suurepärane']
  return (
    <div
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--pz-fg-1)' }}>{label}</span>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '13px',
            color: 'var(--pz-violet)',
            fontWeight: 600,
          }}
        >
          {value}/5 — {labels[value]}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--pz-fg-3)', minWidth: '8px' }}>1</span>
        <input
          type="range"
          min={1}
          max={5}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ flex: 1, accentColor: 'var(--pz-violet)' }}
        />
        <span style={{ fontSize: '12px', color: 'var(--pz-fg-3)', minWidth: '8px' }}>5</span>
      </div>
    </div>
  )
}

function StepDots({ current }: { current: Step }) {
  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {([1, 2, 3, 4] as Step[]).map((s) => (
        <div
          key={s}
          style={{
            width: s === current ? '24px' : '8px',
            height: '8px',
            borderRadius: 'var(--pz-radius-pill)',
            background: s <= current ? 'var(--pz-violet)' : 'var(--pz-border)',
            transition: 'all var(--pz-dur-slow) var(--pz-ease)',
          }}
        />
      ))}
    </div>
  )
}

export default function NewCheckinPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)

  // Step 1
  const [transcript, setTranscript] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Step 2
  const [mood, setMood] = useState(3)
  const [energy, setEnergy] = useState(3)
  const [workload, setWorkload] = useState(3)

  // Step 3 / 4
  const [aiSummary, setAiSummary] = useState<AiSummary | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await transcribeAudio(blob)
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch {
      setError('Mikrofoni juurdepääs ebaõnnestus. Proovi teksti sisestada.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    setIsRecording(false)
  }

  async function transcribeAudio(blob: Blob) {
    setIsTranscribing(true)
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')
      const res = await fetch('/api/checkins/transcribe', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTranscript(data.transcript)
    } catch (err) {
      setError('Transkribeerimine ebaõnnestus. Sisesta tekst käsitsi.')
      console.error(err)
    } finally {
      setIsTranscribing(false)
    }
  }

  async function goToStep3() {
    setStep(3)
    setIsProcessing(true)
    setError(null)
    try {
      const res = await fetch('/api/checkins/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, mood, energy, workload }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAiSummary(data)
      setStep(4)
    } catch (err) {
      setError('AI töötlemine ebaõnnestus. Saad siiski esitada.')
      setStep(4)
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  async function submit() {
    setIsSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          mood,
          energy,
          workload,
          pending_ai_actions: aiSummary,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      router.push('/dashboard/me')
      router.refresh()
    } catch (err) {
      setError('Esitamine ebaõnnestus. Proovi uuesti.')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const btnStyle = (disabled = false): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 24px',
    borderRadius: 'var(--pz-radius-pill)',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'opacity var(--pz-dur-base)',
  })

  return (
    <div
      style={{
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--pz-s-8)',
      }}
    >
      {/* Header */}
      <div>
        <h1
          style={{ fontSize: '26px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 4px' }}
        >
          Nädalane sisselogimine
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          Samm {step} / 4
        </p>
      </div>

      <StepDots current={step} />

      {/* Step 1 — Input */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-4)' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Kuidas läks sel nädalal?
          </p>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
            Räägi vabalt või kirjuta — mida tegid, mis läks hästi, mis oli keeruline.
          </p>

          {/* Voice recorder */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '24px',
              background: 'var(--pz-surface)',
              border: `2px ${isRecording ? 'solid' : 'dashed'} ${isRecording ? '#E12AFB' : 'var(--pz-border)'}`,
              borderRadius: 'var(--pz-radius-lg)',
              transition: 'border-color var(--pz-dur-base)',
            }}
          >
            {isTranscribing ? (
              <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', margin: 0 }}>
                Transkribeerin...
              </p>
            ) : isRecording ? (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#E12AFB20',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    animation: 'pulse 1.2s infinite',
                  }}
                >
                  🎙️
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#E12AFB', fontWeight: 500 }}>
                  Salvestan...
                </p>
                <button
                  onClick={stopRecording}
                  style={{
                    ...btnStyle(),
                    background: '#E12AFB',
                    color: '#fff',
                    padding: '8px 20px',
                  }}
                >
                  Lõpeta salvestus
                </button>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'var(--pz-grad-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    cursor: 'pointer',
                  }}
                  onClick={startRecording}
                >
                  🎙️
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-fg-3)' }}>
                  Vajuta mikrofoni ikooni, et alustada
                </p>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--pz-border)' }} />
            <span style={{ fontSize: '12px', color: 'var(--pz-fg-3)' }}>või kirjuta</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--pz-border)' }} />
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Kirjuta oma nädala kokkuvõte siia..."
            rows={5}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--pz-radius-md)',
              border: '1px solid var(--pz-border)',
              fontSize: '14px',
              color: 'var(--pz-fg-1)',
              background: 'var(--pz-surface)',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: 1.6,
            }}
          />

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-danger)' }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              disabled={!transcript.trim() || isTranscribing}
              onClick={() => setStep(2)}
              style={{
                ...btnStyle(!transcript.trim() || isTranscribing),
                background: 'var(--pz-grad-primary)',
                color: '#fff',
              }}
            >
              Edasi →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Sliders */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-4)' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Hinda oma nädalat
          </p>
          <SliderInput label="Meeleolu" icon="😊" value={mood} onChange={setMood} />
          <SliderInput label="Energia" icon="⚡" value={energy} onChange={setEnergy} />
          <SliderInput label="Töökoormus" icon="📊" value={workload} onChange={setWorkload} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button
              onClick={() => setStep(1)}
              style={{
                ...btnStyle(),
                background: 'var(--pz-surface)',
                color: 'var(--pz-fg-2)',
                border: '1px solid var(--pz-border)',
              }}
            >
              ← Tagasi
            </button>
            <button
              onClick={goToStep3}
              style={{
                ...btnStyle(),
                background: 'var(--pz-grad-primary)',
                color: '#fff',
              }}
            >
              Analüüsi →
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — AI processing */}
      {step === 3 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '48px 24px',
            background: 'var(--pz-surface)',
            border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-lg)',
            boxShadow: 'var(--pz-shadow-md)',
          }}
        >
          <div style={{ fontSize: '40px' }}>🤖</div>
          <p style={{ margin: 0, fontWeight: 600, color: 'var(--pz-fg-1)', fontSize: '16px' }}>
            Tiim analüüsib...
          </p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-fg-3)' }}>
            Hetk — töötlen sinu sisselogimist
          </p>
        </div>
      )}

      {/* Step 4 — Review + Submit */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-4)' }}>
          <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Ülevaade
          </p>

          {/* Scores */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--pz-s-3)',
              flexWrap: 'wrap',
            }}
          >
            {[
              { label: 'Meeleolu', icon: '😊', value: mood },
              { label: 'Energia', icon: '⚡', value: energy },
              { label: 'Töökoormus', icon: '📊', value: workload },
            ].map(({ label, icon, value }) => (
              <div
                key={label}
                style={{
                  flex: '1 1 100px',
                  background: 'var(--pz-surface)',
                  border: '1px solid var(--pz-border)',
                  borderRadius: 'var(--pz-radius-md)',
                  padding: '14px 16px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{icon}</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-violet)' }}>
                  {value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--pz-fg-3)', marginTop: '2px' }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* AI summary */}
          {aiSummary && !isProcessing && (
            <div
              style={{
                background: '#6030FF08',
                border: '1px solid #6030FF30',
                borderRadius: 'var(--pz-radius-md)',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--pz-violet)',
                }}
              >
                tiim.space kokkuvõte
              </p>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-2)', lineHeight: 1.6 }}>
                {aiSummary.summary}
              </p>
              {aiSummary.highlights.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--pz-fg-2)',
                    }}
                  >
                    Edusammud
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {aiSummary.highlights.map((h, i) => (
                      <li
                        key={i}
                        style={{ fontSize: '13px', color: 'var(--pz-fg-2)', marginBottom: '4px' }}
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {aiSummary.blockers.length > 0 && (
                <div>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--pz-fg-2)',
                    }}
                  >
                    Takistused
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    {aiSummary.blockers.map((b, i) => (
                      <li
                        key={i}
                        style={{ fontSize: '13px', color: 'var(--pz-fg-2)', marginBottom: '4px' }}
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--pz-fg-3)', fontStyle: 'italic' }}>
                {aiSummary.mood_note}
              </p>
            </div>
          )}

          {/* Transcript preview */}
          <div
            style={{
              background: 'var(--pz-surface)',
              border: '1px solid var(--pz-border)',
              borderRadius: 'var(--pz-radius-md)',
              padding: '16px 20px',
            }}
          >
            <p
              style={{
                margin: '0 0 8px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--pz-fg-3)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Sinu tekst
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                color: 'var(--pz-fg-2)',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
              }}
            >
              {transcript}
            </p>
          </div>

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-danger)' }}>{error}</p>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <button
              onClick={() => setStep(2)}
              disabled={isSubmitting}
              style={{
                ...btnStyle(isSubmitting),
                background: 'var(--pz-surface)',
                color: 'var(--pz-fg-2)',
                border: '1px solid var(--pz-border)',
              }}
            >
              ← Tagasi
            </button>
            <button
              onClick={submit}
              disabled={isSubmitting}
              style={{
                ...btnStyle(isSubmitting),
                background: 'var(--pz-grad-primary)',
                color: '#fff',
              }}
            >
              {isSubmitting ? 'Saadan...' : '✓ Esita sisselogimine'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
