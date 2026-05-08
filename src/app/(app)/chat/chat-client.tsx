'use client'

import { useRef, useState } from 'react'
import { Mic, Send, Sparkles, AlertCircle } from 'lucide-react'
import type { UserRole } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

type CheckInStep = 'mood' | 'context' | 'progress' | 'wins' | 'plans' | 'problems' | 'carryover' | 'summary' | 'done'

interface Msg {
  id: number
  from: 'tiim' | 'user'
  text?: string
  type?: 'sliders' | 'context' | 'summary'
  sliderValues?: { mood: number; energy: number; workload: number }
  contextData?: { lastWeekPlans: string[]; carryOvers: string[] }
  summaryData?: PPP
}

interface PPP {
  progress: string[]
  plans: string[]
  problems: string[]
  wins: string[]
}

interface Props {
  userName: string
  userRole: UserRole
  hasCheckedInThisWeek: boolean
  weekDateRange: string
  lastCheckinPlans: string[]
}

// ─── PulseSlider ──────────────────────────────────────────────────────────────

function PulseSlider({
  label, value, onChange, color, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; color: string; hint: string[]
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
        <span style={{ fontWeight: 500, color: '#344054' }}>{label}</span>
        <span style={{ color: '#9ca3af' }}>
          <span style={{ fontWeight: 500, color }}>{value}</span>/5 · {hint[value - 1]}
        </span>
      </div>
      <input
        type="range" min={1} max={5} step={1} value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{
          width: '100%', height: '6px', borderRadius: '9999px',
          appearance: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, ${color} 0%, ${color} ${(value - 1) * 25}%, #f9fafb ${(value - 1) * 25}%, #f9fafb 100%)`,
          accentColor: color,
        } as React.CSSProperties}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9ca3af', marginTop: '4px', padding: '0 2px' }}>
        {[1, 2, 3, 4, 5].map((n) => <span key={n}>{n}</span>)}
      </div>
    </div>
  )
}

// ─── InlineSlidersCard — interactive, appears in messages area ────────────────

function InlineSlidersCard({
  mood, energy, workload,
  onMoodChange, onEnergyChange, onWorkloadChange,
  onContinue,
}: {
  mood: number; energy: number; workload: number
  onMoodChange: (v: number) => void
  onEnergyChange: (v: number) => void
  onWorkloadChange: (v: number) => void
  onContinue: () => void
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        maxWidth: '85%', width: '100%',
        background: '#fff', border: '1px solid rgba(96,48,255,0.35)',
        borderRadius: '12px', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#101828' }}>
          Kuidas tunned end sel nädalal?
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <PulseSlider label="Meeleolu" value={mood} onChange={onMoodChange} color="#6030ff" hint={['Raske', 'Madal', 'OK', 'Hea', 'Suurepärane']} />
          <PulseSlider label="Energia" value={energy} onChange={onEnergyChange} color="#49bbff" hint={['Kurnatud', 'Madal', 'Stabiilne', 'Laetud', 'Tippvorm']} />
          <PulseSlider label="Töökoormus" value={workload} onChange={onWorkloadChange} color="#f59e0b" hint={['Kerge', 'Lihtne', 'Tasakaalus', 'Raske', 'Ülekoormatud']} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
          <button
            onClick={onContinue}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '8px',
              background: 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
              border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Jätka <Send style={{ width: '13px', height: '13px' }} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SliderDisplay — submitted values shown as user message ───────────────────

function SliderDisplay({ values }: { values: { mood: number; energy: number; workload: number } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{
        maxWidth: '85%', background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '12px 12px 2px 12px', padding: '16px 20px',
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', textAlign: 'center' }}>
          {[
            { label: 'Meeleolu', value: values.mood, color: '#6030ff' },
            { label: 'Energia', value: values.energy, color: '#49bbff' },
            { label: 'Töökoormus', value: values.workload, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>{label}</div>
              <div className="font-display" style={{ fontSize: '24px', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ContextCard ──────────────────────────────────────────────────────────────

function ContextCard({ data }: { data: { lastWeekPlans: string[]; carryOvers: string[] } }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        maxWidth: '85%', background: '#fff', border: '1px solid #e5e7eb',
        borderRadius: '12px 12px 12px 2px', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Eelmise nädala plaan
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.lastWeekPlans.map((plan, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#344054' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6030ff', flexShrink: 0 }} />
                {plan}
              </li>
            ))}
          </ul>
        </div>
        {data.carryOvers.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              Veel pooleli
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.carryOvers.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#344054' }}>
                  <AlertCircle style={{ width: '13px', height: '13px', color: '#f59e0b', flexShrink: 0 }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({
  data, mood, energy, workload, onSave, onEdit, submitting, saved,
}: {
  data: PPP; mood: number; energy: number; workload: number
  onSave: () => void; onEdit: () => void; submitting: boolean; saved: boolean
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        maxWidth: '90%', width: '100%',
        background: '#fff', border: '1px solid rgba(96,48,255,0.35)',
        borderRadius: '12px', padding: '20px',
        boxShadow: '0 4px 16px rgba(96,48,255,0.08)',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#6030ff' }} />
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#6030ff' }}>
            Siin on sinu nädal — kas kõik tundub õige?
          </h4>
        </div>

        {/* Mood grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '12px', borderRadius: '10px', background: '#f9fafb' }}>
          {[
            { label: 'Meeleolu', value: mood, color: '#6030ff' },
            { label: 'Energia', value: energy, color: '#49bbff' },
            { label: 'Töökoormus', value: workload, color: '#f59e0b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
              <div className="font-display" style={{ fontSize: '22px', fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {data.progress.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#00a63e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>✓ Progress</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.progress.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#344054' }}>
                  <span style={{ color: '#00a63e', flexShrink: 0 }}>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.plans.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6030ff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>→ Plaanid</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.plans.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#344054' }}>
                  <span style={{ color: '#6030ff', flexShrink: 0 }}>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.wins.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>⭐ Võidud</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.wins.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#344054' }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.problems.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>! Probleemid</div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {data.problems.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '13px', color: '#344054' }}>
                  <span style={{ color: '#f59e0b', flexShrink: 0 }}>•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!saved && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f3f4f6' }}>
            <button
              onClick={onEdit}
              disabled={submitting}
              style={{
                padding: '8px 16px', fontSize: '13px', color: '#667085',
                background: 'transparent', border: 'none', cursor: 'pointer',
              }}
            >
              Muuda
            </button>
            <button
              onClick={onSave}
              disabled={submitting}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 18px', borderRadius: '8px',
                background: submitting ? '#e5e7eb' : 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
                border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
                cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Salvestamine…' : 'Salvesta sisselogimine ✓'}
            </button>
          </div>
        )}
        {saved && (
          <div style={{ textAlign: 'center', fontSize: '13px', color: '#00a63e', fontWeight: 600, paddingTop: '4px' }}>
            ✓ Sisselogimine salvestatud!
          </div>
        )}
      </div>
    </div>
  )
}

// ─── ChatBubble ───────────────────────────────────────────────────────────────

function ChatBubble({ msg }: { msg: Msg }) {
  const isUser = msg.from === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '75%', padding: '10px 16px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        background: isUser ? 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)' : '#fff',
        border: isUser ? 'none' : '1px solid #e5e7eb',
        color: isUser ? '#fff' : '#101828',
        fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap',
      }}>
        {msg.text}
      </div>
    </div>
  )
}

// ─── TypingIndicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        padding: '10px 16px', borderRadius: '12px 12px 12px 2px',
        background: '#fff', border: '1px solid #e5e7eb',
        display: 'flex', gap: '4px', alignItems: 'center',
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af',
            animation: `bounce 1.2s ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatClient({
  userRole, hasCheckedInThisWeek, weekDateRange, lastCheckinPlans,
}: Props) {
  const isManager = userRole === 'manager' || userRole === 'admin'

  const initialMsg: Msg = {
    id: 1, from: 'tiim',
    text: hasCheckedInThisWeek
      ? 'Tere! Oled juba selle nädala sisselogimise teinud. Kuidas läheb?'
      : 'Tere! 👋 Alustame selle nädala sisselogimisega. Räägime kõigepealt sellest, kuidas sul sel nädalal läheb.',
  }

  const [step, setStep] = useState<CheckInStep>(hasCheckedInThisWeek ? 'done' : 'mood')
  const [msgs, setMsgs] = useState<Msg[]>([initialMsg])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const [mood, setMood] = useState(4)
  const [energy, setEnergy] = useState(4)
  const [workload, setWorkload] = useState(3)

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const endRef = useRef<HTMLDivElement>(null)

  function scrollToBottom() {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  function addTimMsg(text: string) {
    setMsgs((prev) => [...prev, { id: prev.length + 1, from: 'tiim', text }])
    scrollToBottom()
  }

  // ── Step 1: mood sliders submitted ──────────────────────────────────────────
  function handleMoodContinue() {
    setMsgs((prev) => [...prev, { id: prev.length + 1, from: 'user', type: 'sliders', sliderValues: { mood, energy, workload } }])
    setStep('context')
    setIsThinking(true)
    scrollToBottom()

    setTimeout(() => {
      setIsThinking(false)
      if (lastCheckinPlans.length > 0) {
        setMsgs((prev) => [
          ...prev,
          { id: prev.length + 1, from: 'tiim', text: 'Eelmisel nädalal planeerisid sa järgmist...' },
          {
            id: prev.length + 2, from: 'tiim', type: 'context',
            contextData: { lastWeekPlans: lastCheckinPlans, carryOvers: [] },
          },
          { id: prev.length + 3, from: 'tiim', text: 'Mida said sel nädalal tehtud? Räägi vabalt — ma struktureerin selle sinu eest.' },
        ])
      } else {
        setMsgs((prev) => [...prev, {
          id: prev.length + 1, from: 'tiim',
          text: 'Mida said sel nädalal tehtud? Räägi vabalt — ma struktureerin selle sinu eest.',
        }])
      }
      setStep('progress')
      scrollToBottom()
    }, 800)
  }

  // ── Guided check-in send ─────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming || isThinking) return
    setInput('')
    setError(null)
    setIsRecording(false)

    const userMsg: Msg = { id: msgs.length + 1, from: 'user', text }
    const updatedMsgs = [...msgs, userMsg]
    setMsgs(updatedMsgs)
    scrollToBottom()

    if (step === 'progress') {
      setIsThinking(true)
      setTimeout(() => {
        setIsThinking(false)
        addTimMsg('Tubli töö! 🎉 Millega oled sel nädalal kõige rohkem rahul?')
        setStep('wins')
      }, 700)
      return
    }

    if (step === 'wins') {
      setIsThinking(true)
      setTimeout(() => {
        setIsThinking(false)
        addTimMsg('Tore kuulda! Mida plaanid järgmisel nädalal teha?')
        setStep('plans')
      }, 700)
      return
    }

    if (step === 'plans') {
      setIsThinking(true)
      setTimeout(() => {
        setIsThinking(false)
        addTimMsg('Hästi! Kas on mingeid takistusi või väljakutseid? Kui ei ole, võid ka lihtsalt öelda "ei ole".')
        setStep('problems')
      }, 700)
      return
    }

    if (step === 'problems') {
      if (lastCheckinPlans.length > 0) {
        setIsThinking(true)
        setTimeout(() => {
          setIsThinking(false)
          addTimMsg(`Märkan, et sul oli eelmisel nädalal plaanides mõni punkt. Kas need said tehtud või kanduvad edasi?`)
          setStep('carryover')
        }, 700)
      } else {
        goToSummary(updatedMsgs)
      }
      return
    }

    if (step === 'carryover') {
      goToSummary(updatedMsgs)
      return
    }

    if (step === 'done') {
      await streamAIResponse(updatedMsgs)
    }
  }

  // ── Extract PPP and show summary card ────────────────────────────────────────
  async function goToSummary(currentMsgs: Msg[]) {
    setIsThinking(true)
    const conversationMsgs = currentMsgs
      .filter((m) => m.text)
      .map((m) => ({ role: (m.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text! }))

    try {
      const res = await fetch('/api/checkins/extract-ppp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMsgs }),
      })
      const ppp: PPP = res.ok ? await res.json() : { progress: [], plans: [], problems: [], wins: [] }

      setIsThinking(false)
      setMsgs((prev) => [
        ...prev,
        { id: prev.length + 1, from: 'tiim', text: 'Suurepärane! Siin on kokkuvõte meie vestlusest. Kas kõik tundub õige?' },
        { id: prev.length + 2, from: 'tiim', type: 'summary', summaryData: ppp },
      ])
      setStep('summary')
      scrollToBottom()
    } catch {
      setIsThinking(false)
      setError('Kokkuvõtte loomine ebaõnnestus. Proovi uuesti.')
    }
  }

  // ── Save check-in ────────────────────────────────────────────────────────────
  async function submitCheckin() {
    const summaryMsg = msgs.find((m) => m.type === 'summary')
    const ppp = summaryMsg?.summaryData ?? { progress: [], plans: [], problems: [], wins: [] }

    setSubmitting(true)
    try {
      const conversationText = msgs
        .filter((m) => m.text)
        .map((m) => `${m.from === 'user' ? 'Kasutaja' : 'AI'}: ${m.text}`)
        .join('\n')

      const res = await fetch('/api/checkins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: conversationText,
          mood, energy, workload,
          progress: ppp.progress,
          plans: ppp.plans,
          problems: ppp.problems,
          wins: ppp.wins ?? [],
          sharing: isManager ? {
            progress: ppp.progress.map((_, i) => i),
            plans: ppp.plans.map((_, i) => i),
            problems: ppp.problems.map((_, i) => i),
          } : {},
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const { checkin } = await res.json()
      setSaved(true)
      setStep('done')
      setTimeout(() => {
        addTimMsg('Sinu sisselogimine on salvestatud! 🎉 Hea nädal! Nüüd saad minuga vabalt vestelda.')
      }, 500)

      if (checkin?.id) {
        fetch('/api/checkins/match-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkin_id: checkin.id, progress: ppp.progress, plans: ppp.plans, problems: ppp.problems }),
        }).catch(() => {})
      }
    } catch {
      setError('Sisselogimise salvestamine ebaõnnestus.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Edit: go back to let user add more ───────────────────────────────────────
  function handleEdit() {
    setMsgs((prev) => prev.filter((m) => m.type !== 'summary'))
    addTimMsg('Okei, jätka — lisa või muuda mida vaja.')
    setStep('progress')
  }

  // ── Free AI chat ─────────────────────────────────────────────────────────────
  async function streamAIResponse(history: Msg[]) {
    setIsStreaming(true)
    scrollToBottom()
    const apiMessages = history
      .filter((m) => m.text)
      .map((m) => ({ role: (m.from === 'user' ? 'user' : 'assistant') as 'user' | 'assistant', content: m.text! }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      if (!res.ok) throw new Error('Viga')

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''
      setMsgs((prev) => [...prev, { id: prev.length + 1, from: 'tiim', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMsgs((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...updated[updated.length - 1], text: assistantText }
          return updated
        })
        scrollToBottom()
      }
    } catch {
      setError('Sõnumi saatmine ebaõnnestus. Proovi uuesti.')
    } finally {
      setIsStreaming(false)
    }
  }

  // ── Voice recording ──────────────────────────────────────────────────────────
  async function startRecording() {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsTranscribing(true)
        try {
          const fd = new FormData()
          fd.append('audio', blob)
          const res = await fetch('/api/checkins/transcribe', { method: 'POST', body: fd })
          if (!res.ok) throw new Error()
          const { transcript } = await res.json()
          if (transcript) setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
        } catch {
          setError('Hääle transkribeerimine ebaõnnestus.')
        } finally {
          setIsTranscribing(false)
        }
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch {
      setError('Mikrofoni juurdepääs keelatud.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    setIsRecording(false)
  }

  const showSliders = step === 'mood'
  const showInput = step !== 'mood' && step !== 'summary'
  const isCheckIn = step !== 'done'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Page header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#101828', letterSpacing: '-0.26px' }}>
          {isCheckIn ? 'Nädalane sisselogimine' : 'Chat Tiimiga'}
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#667085' }}>
          {isCheckIn ? weekDateRange : 'Küsi midagi, jaga uuendusi või mõtle oma töö üle'}
        </p>
      </div>

      {/* Chat card */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        height: 'calc(100vh - 200px)', minHeight: '600px',
      }}>

        {/* Card header */}
        <div style={{
          padding: '14px 20px', borderBottom: '1px solid #e5e7eb',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: 'var(--pz-grad-hero)', display: 'grid', placeItems: 'center',
            }}>
              <Sparkles style={{ width: '20px', height: '20px', color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#101828', lineHeight: 1.2 }}>
                {isCheckIn ? 'Nädalane sisselogimine' : 'Chat'}
              </div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {isCheckIn ? 'Juhitud vestlus Tiimiga' : 'Räägi looduslikult — Tiim ehitab struktuuri sinu eest'}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Eesti / English · auto</span>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          background: 'rgba(249,250,251,0.4)',
        }}>
          {msgs.map((m) => (
            <div key={m.id}>
              {m.text && <ChatBubble msg={m} />}
              {m.type === 'sliders' && m.sliderValues && <SliderDisplay values={m.sliderValues} />}
              {m.type === 'context' && m.contextData && <ContextCard data={m.contextData} />}
              {m.type === 'summary' && m.summaryData && (
                <SummaryCard
                  data={m.summaryData}
                  mood={mood} energy={energy} workload={workload}
                  onSave={submitCheckin}
                  onEdit={handleEdit}
                  submitting={submitting}
                  saved={saved}
                />
              )}
            </div>
          ))}

          {/* Interactive sliders card — appears at bottom when step === mood */}
          {showSliders && (
            <InlineSlidersCard
              mood={mood} energy={energy} workload={workload}
              onMoodChange={setMood} onEnergyChange={setEnergy} onWorkloadChange={setWorkload}
              onContinue={handleMoodContinue}
            />
          )}

          {(isThinking || (isStreaming && msgs[msgs.length - 1]?.from !== 'tiim')) && <TypingIndicator />}

          <div ref={endRef} />
        </div>

        {/* Input bar */}
        {showInput && (
          <div style={{ borderTop: '1px solid #e5e7eb', padding: '12px', background: '#fff', flexShrink: 0 }}>
            {isRecording && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '8px', padding: '8px 12px', borderRadius: '8px',
                background: '#fef2f2',
              }}>
                <span style={{ position: 'relative', display: 'inline-flex', width: '10px', height: '10px', flexShrink: 0 }}>
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: '50%', background: '#dc2626',
                    opacity: 0.75, animation: 'ping 1s ease-in-out infinite',
                  }} />
                  <span style={{ position: 'relative', width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626' }} />
                </span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#dc2626' }}>Salvestamine...</span>
                <button
                  onClick={stopRecording}
                  style={{
                    marginLeft: 'auto', fontSize: '11px', padding: '3px 10px', borderRadius: '6px',
                    background: '#fff', border: '1px solid #dc2626', color: '#dc2626', cursor: 'pointer',
                  }}
                >
                  Peata
                </button>
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '10px',
            }}>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isTranscribing}
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: isRecording ? '#dc2626' : 'transparent',
                  border: 'none', cursor: 'pointer', display: 'grid', placeItems: 'center',
                  color: isRecording ? '#fff' : '#9ca3af',
                  opacity: isTranscribing ? 0.4 : 1,
                }}
              >
                <Mic style={{ width: '16px', height: '16px' }} />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder={isTranscribing ? 'Transkribeerin…' : 'Räägi või kirjuta looduslikult...'}
                rows={1}
                disabled={isStreaming || isThinking}
                style={{
                  flex: 1, border: 'none', outline: 'none', resize: 'none',
                  fontSize: '14px', color: '#101828', background: 'transparent',
                  fontFamily: 'inherit', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming || isThinking || isRecording}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                  background: !input.trim() || isStreaming || isThinking || isRecording
                    ? '#e5e7eb'
                    : 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
                  border: 'none', color: '#fff', cursor: !input.trim() || isStreaming || isThinking || isRecording ? 'not-allowed' : 'pointer',
                  display: 'grid', placeItems: 'center',
                }}
              >
                <Send style={{ width: '16px', height: '16px' }} />
              </button>
            </div>

            {error && <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        @keyframes ping { 0%{transform:scale(1);opacity:0.75} 75%,100%{transform:scale(2);opacity:0} }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance:none; appearance:none;
          width:14px; height:14px; border-radius:50%;
          background:#fff; border:2px solid currentColor;
          box-shadow:0 1px 3px rgba(0,0,0,0.15); cursor:pointer;
        }
        input[type=range]::-moz-range-thumb {
          width:14px; height:14px; border-radius:50%;
          background:#fff; border:2px solid currentColor;
          box-shadow:0 1px 3px rgba(0,0,0,0.15); cursor:pointer;
        }
      `}</style>
    </div>
  )
}
