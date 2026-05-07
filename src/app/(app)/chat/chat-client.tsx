'use client'

import { useRef, useState } from 'react'
import { Mic, Image as ImageIcon, Send, Sparkles } from 'lucide-react'
import type { UserRole, CheckinSharing } from '@/types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface PPP {
  progress: string[]
  plans: string[]
  problems: string[]
}

interface ActiveGoal {
  id: string
  title: string
  progress: number
  status: string
}

const PPP_WELCOME: Message = {
  role: 'assistant',
  content:
    'Tere! Räägime sinu nädalast. Jaga julgelt:\n\n• Mida tegid eelmisel nädalal ära? Millega oled kõige rohkem rahul?\n• Millised on selle nädala plaanid?\n• Kas on blokkereid või probleeme, millega oleks abi vaja?',
}

// ─── PulseSlider ──────────────────────────────────────────────────────────────

function PulseSlider({
  label, value, onChange, color, hint,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  color: string
  hint: string[]
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

// ─── ChatBubble ───────────────────────────────────────────────────────────────

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      <div style={{
        maxWidth: '75%', padding: '10px 16px',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        background: isUser ? 'var(--pz-grad-primary)' : '#fff',
        border: isUser ? 'none' : '1px solid #e5e7eb',
        color: isUser ? '#fff' : '#101828',
        fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap',
        boxShadow: isUser ? 'none' : '0 1px 2px rgba(16,24,40,0.04)',
      }}>
        {message.content}
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

// ─── PPPReview (inline card in messages) ─────────────────────────────────────

function PPPReview({
  ppp, isManager, sharing, onSharingChange, onSubmit, onCancel, submitting,
}: {
  ppp: PPP
  isManager: boolean
  sharing: CheckinSharing
  onSharingChange: (s: CheckinSharing) => void
  onSubmit: () => void
  onCancel: () => void
  submitting: boolean
}) {
  function toggleShare(category: keyof CheckinSharing, idx: number) {
    const current = sharing[category]
    const next = current.includes(idx) ? current.filter((i) => i !== idx) : [...current, idx]
    onSharingChange({ ...sharing, [category]: next })
  }

  const sections: { key: keyof PPP; label: string; color: string; sharingKey: keyof CheckinSharing }[] = [
    { key: 'progress', label: 'Progress', color: '#00a63e', sharingKey: 'progress' },
    { key: 'plans', label: 'Plaanid', color: '#6030ff', sharingKey: 'plans' },
    { key: 'problems', label: 'Probleemid', color: '#dc2626', sharingKey: 'problems' },
  ]

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
      <div style={{
        maxWidth: '90%', width: '100%',
        background: '#fff', border: '1px solid rgba(96,48,255,0.35)',
        borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(96,48,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <Sparkles style={{ width: '16px', height: '16px', color: '#6030ff' }} />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#6030ff' }}>
            Siin on, mida ma jäädvustasin
          </h3>
        </div>
        {isManager && (
          <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#9ca3af' }}>
            Vali, mida soovid tiimiga jagada (linnuke = nähtav tiimile)
          </p>
        )}
        {!isManager && <div style={{ marginBottom: '16px' }} />}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
          {sections.map(({ key, label, color, sharingKey }) =>
            ppp[key].length > 0 && (
              <div key={key}>
                <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {label}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                  {ppp[key].map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '12px', padding: '6px 0', borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flex: 1 }}>
                        {isManager ? (
                          <input
                            type="checkbox"
                            checked={sharing[sharingKey].includes(idx)}
                            onChange={() => toggleShare(sharingKey, idx)}
                            style={{ marginTop: '3px', accentColor: '#6030ff', flexShrink: 0 }}
                          />
                        ) : (
                          <span style={{ color, fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>•</span>
                        )}
                        <span style={{ fontSize: '13px', color: '#101828', lineHeight: 1.5 }}>{item}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', paddingTop: '4px', borderTop: '1px solid #f3f4f6' }}>
          <button
            onClick={onSubmit}
            disabled={submitting}
            style={{
              padding: '8px 18px', borderRadius: '9999px',
              background: submitting ? '#e5e7eb' : 'var(--pz-grad-primary)',
              border: 'none', color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? 'Salvestamine…' : 'Salvesta sisselogimine'}
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            style={{
              padding: '8px 14px', borderRadius: '9999px',
              background: 'transparent', border: '1px solid #e5e7eb',
              color: '#667085', fontSize: '13px', cursor: 'pointer',
            }}
          >
            Tagasi
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  userName: string
  userRole: UserRole
  hasCheckedInThisWeek: boolean
  weekDateRange: string
  lastCheckinPlans: string[]
  activeGoals: ActiveGoal[]
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ChatClient({
  userName: _userName, userRole, hasCheckedInThisWeek,
  weekDateRange, lastCheckinPlans, activeGoals,
}: Props) {
  const [messages, setMessages] = useState<Message[]>([PPP_WELCOME])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mood, setMood] = useState(4)
  const [energy, setEnergy] = useState(4)
  const [workload, setWorkload] = useState(3)

  const [extracting, setExtracting] = useState(false)
  const [ppp, setPpp] = useState<PPP | null>(null)
  const [sharing, setSharing] = useState<CheckinSharing>({ progress: [], plans: [], problems: [] })
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const endRef = useRef<HTMLDivElement>(null)
  const isManager = userRole === 'manager' || userRole === 'admin'
  const showCheckinUI = !hasCheckedInThisWeek && !saved

  function scrollToBottom() {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

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
          if (!res.ok) throw new Error('Transcription failed')
          const { transcript } = await res.json()
          if (transcript) setInput((prev) => prev ? `${prev} ${transcript}` : transcript)
        } catch {
          setError('Hääle transkribeerimine ebaõnnestus. Proovi uuesti.')
        } finally {
          setIsTranscribing(false)
        }
      }
      recorder.start()
      mediaRef.current = recorder
      setIsRecording(true)
    } catch {
      setError('Mikrofoni juurdepääs keelatud. Kontrolli brauseri luba.')
    }
  }

  function stopRecording() {
    mediaRef.current?.stop()
    mediaRef.current = null
    setIsRecording(false)
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    setError(null)

    const userMessage: Message = { role: 'user', content: text }
    const history = [...messages, userMessage]
    setMessages(history)
    setIsStreaming(true)
    scrollToBottom()

    const apiMessages = history
      .filter((m) => m !== PPP_WELCOME)
      .map((m) => ({ role: m.role, content: m.content }))

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
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantText += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: assistantText }
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

  async function extractPPP() {
    const conversationMessages = messages
      .filter((m) => m !== PPP_WELCOME)
      .map((m) => ({ role: m.role, content: m.content }))

    if (conversationMessages.length === 0) {
      setError('Räägi esmalt oma nädalast, seejärel saa sisselogimise salvestada.')
      return
    }

    setExtracting(true)
    setError(null)
    try {
      const res = await fetch('/api/checkins/extract-ppp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversationMessages }),
      })
      if (!res.ok) throw new Error('Extraction failed')
      const extracted: PPP = await res.json()
      setPpp(extracted)
      if (isManager) {
        setSharing({
          progress: extracted.progress.map((_, i) => i),
          plans: extracted.plans.map((_, i) => i),
          problems: extracted.problems.map((_, i) => i),
        })
      }
      scrollToBottom()
    } catch {
      setError('PPP ekstraheerimine ebaõnnestus. Proovi uuesti.')
    } finally {
      setExtracting(false)
    }
  }

  async function submitCheckin() {
    if (!ppp) return
    setSubmitting(true)
    try {
      const conversationText = messages
        .filter((m) => m !== PPP_WELCOME)
        .map((m) => `${m.role === 'user' ? 'Kasutaja' : 'AI'}: ${m.content}`)
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
          sharing: isManager ? sharing : {},
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      const { checkin } = await res.json()
      setSaved(true)
      setPpp(null)
      setMessages([{ role: 'assistant', content: 'Sinu sisselogimine on salvestatud! Hea nädal! 🎉' }])
      if (checkin?.id) {
        fetch('/api/checkins/match-goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            checkin_id: checkin.id,
            progress: ppp?.progress,
            plans: ppp?.plans,
            problems: ppp?.problems,
          }),
        }).catch(() => { /* non-critical */ })
      }
    } catch {
      setError('Sisselogimise salvestamine ebaõnnestus.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', height: 'calc(100vh - 9rem)' }}>

      {/* ── Left: Chat panel ── */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
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
              <div style={{ fontWeight: 600, fontSize: '14px', color: '#101828', lineHeight: 1.2 }}>Updates</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                Nädalane sisselogimine · {weekDateRange}
              </div>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>Eesti / English · auto</span>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '24px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          background: 'rgba(249,250,251,0.4)',
        }}>
          {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
          {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
          {ppp && (
            <PPPReview
              ppp={ppp}
              isManager={isManager}
              sharing={sharing}
              onSharingChange={setSharing}
              onSubmit={submitCheckin}
              onCancel={() => setPpp(null)}
              submitting={submitting}
            />
          )}
          <div ref={endRef} />
        </div>

        {/* Input bar */}
        <div style={{
          borderTop: '1px solid #e5e7eb', padding: '12px',
          background: '#fff', flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', border: '1px solid #e5e7eb',
            borderRadius: '10px', transition: 'border-color 0.15s',
          }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isStreaming || isTranscribing}
              title={isRecording ? 'Peata salvestamine' : 'Räägi'}
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: isRecording ? '#dc2626' : 'transparent',
                border: 'none', cursor: isStreaming || isTranscribing ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center', flexShrink: 0,
                color: isRecording ? '#fff' : '#9ca3af',
                opacity: isStreaming || isTranscribing ? 0.4 : 1,
              }}
            >
              <Mic style={{ width: '16px', height: '16px' }} />
            </button>
            <button
              disabled
              style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'transparent', border: 'none', cursor: 'default',
                display: 'grid', placeItems: 'center', flexShrink: 0, color: '#9ca3af',
              }}
            >
              <ImageIcon style={{ width: '16px', height: '16px' }} />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
              placeholder={isTranscribing ? 'Transkribeerin…' : 'Räägi või kirjuta — Tiim ehitab struktuuri sinu eest'}
              rows={1}
              disabled={isStreaming || isRecording}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none',
                fontSize: '14px', color: '#101828', background: 'transparent',
                fontFamily: 'inherit', lineHeight: 1.5,
                maxHeight: '120px', overflowY: 'auto',
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming || isRecording}
              style={{
                width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                background: !input.trim() || isStreaming || isRecording ? '#e5e7eb' : 'var(--pz-grad-primary)',
                border: 'none', color: '#fff',
                cursor: !input.trim() || isStreaming || isRecording ? 'not-allowed' : 'pointer',
                display: 'grid', placeItems: 'center',
                transition: 'background 0.15s',
              }}
            >
              <Send style={{ width: '16px', height: '16px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>
              Proovi: "Saatsin API dokumentatsiooni..." — Tiim pakub eesmärkide uuendusi.
            </span>
            {showCheckinUI && !ppp && (
              <button
                onClick={extractPPP}
                disabled={extracting || isStreaming}
                style={{
                  padding: '4px 12px', borderRadius: '9999px', whiteSpace: 'nowrap', flexShrink: 0,
                  background: 'transparent', border: '1.5px solid #6030ff',
                  color: '#6030ff', fontSize: '11px', fontWeight: 600,
                  cursor: extracting || isStreaming ? 'not-allowed' : 'pointer',
                  opacity: extracting || isStreaming ? 0.5 : 1,
                }}
              >
                {extracting ? 'Töötlen…' : 'Salvesta sisselogimine →'}
              </button>
            )}
          </div>
          {error && <p style={{ margin: '8px 4px 0', fontSize: '12px', color: '#dc2626' }}>{error}</p>}
        </div>
      </div>

      {/* ── Right: Sidebar ── */}
      <aside style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto',
      }}>
        {/* Sliders */}
        <div>
          <h4 style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 600, color: '#101828', letterSpacing: '-0.14px' }}>
            Kuidas sul läheb selle nädalal?
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <PulseSlider
              label="Meeleolu" value={mood} onChange={setMood} color="#6030ff"
              hint={['Raske', 'Madal', 'OK', 'Hea', 'Suurepärane']}
            />
            <PulseSlider
              label="Energia" value={energy} onChange={setEnergy} color="#49bbff"
              hint={['Kurnatud', 'Madal', 'Stabiilne', 'Laetud', 'Tippvorm']}
            />
            <PulseSlider
              label="Töökoormus" value={workload} onChange={setWorkload} color="#f59e0b"
              hint={['Kerge', 'Lihtne', 'Tasakaalus', 'Raske', 'Ülekoormatud']}
            />
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '11px', color: '#9ca3af' }}>
            Salvestatakse automaatselt koos sisselogimisega.
          </p>
        </div>

        {/* This week's plan */}
        {lastCheckinPlans.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#101828', letterSpacing: '-0.14px' }}>
              Selle nädala plaan
            </h4>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {lastCheckinPlans.map((plan, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#4a5565' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6030ff', flexShrink: 0, marginTop: '5px' }} />
                  {plan}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Active goals */}
        {activeGoals.length > 0 && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#101828', letterSpacing: '-0.14px' }}>
              Aktiivsed eesmärgid
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeGoals.map((g) => (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#101828', flex: 1, paddingRight: '8px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {g.title}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9ca3af', flexShrink: 0 }}>{g.progress}%</span>
                  </div>
                  <div style={{ height: '4px', background: '#f9fafb', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${g.progress}%`,
                      background: 'linear-gradient(90deg, #6030ff 0%, #1f4fd8 100%)',
                      borderRadius: '9999px',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Carry-over placeholder */}
        {lastCheckinPlans.length > 0 && !hasCheckedInThisWeek && (
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '16px', marginTop: '20px' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600, color: '#101828', letterSpacing: '-0.14px' }}>
              Eelmiselt nädalalt üle kantud
            </h4>
            <div style={{
              fontSize: '13px', color: '#4a5565', padding: '12px',
              borderRadius: '8px', background: '#fef3e2', border: '1px solid rgba(245,158,11,0.3)',
            }}>
              Tiim kontrollib, millised eelmise nädala plaanid said tehtud.
            </div>
          </div>
        )}
      </aside>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none; appearance: none;
          width: 14px; height: 14px; border-radius: 50%;
          background: #fff; border: 2px solid currentColor;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15); cursor: pointer;
        }
        input[type=range]::-moz-range-thumb {
          width: 14px; height: 14px; border-radius: 50%;
          background: #fff; border: 2px solid currentColor;
          box-shadow: 0 1px 3px rgba(0,0,0,0.15); cursor: pointer;
        }
      `}</style>
    </div>
  )
}
