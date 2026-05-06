'use client'

import { useRef, useState } from 'react'
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

const PPP_WELCOME: Message = {
  role: 'assistant',
  content:
    'Tere! Räägime sinu nädalast. Jaga julgelt:\n\n• Mida tegid eelmisel nädalal ära? Millega oled kõige rohkem rahul?\n• Millised on selle nädala plaanid?\n• Kas on blokkereid või probleeme, millega oleks abi vaja?',
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: '12px' }}>
      {!isUser && (
        <div
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'var(--pz-grad-primary)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: '15px', flexShrink: 0, marginRight: '10px', alignSelf: 'flex-end',
          }}
        >
          🤖
        </div>
      )}
      <div
        style={{
          maxWidth: '75%', padding: '12px 16px',
          borderRadius: isUser
            ? 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm) var(--pz-radius-lg)'
            : 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm)',
          background: isUser ? 'var(--pz-grad-primary)' : 'var(--pz-surface)',
          border: isUser ? 'none' : '1px solid var(--pz-border)',
          color: isUser ? '#fff' : 'var(--pz-fg-1)',
          fontSize: '14px', lineHeight: 1.6,
          boxShadow: 'var(--pz-shadow-sm)', whiteSpace: 'pre-wrap',
        }}
      >
        {message.content}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '12px', gap: '10px' }}>
      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--pz-grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', flexShrink: 0 }}>🤖</div>
      <div style={{ padding: '12px 16px', borderRadius: 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm)', background: 'var(--pz-surface)', border: '1px solid var(--pz-border)', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--pz-fg-3)', animation: `bounce 1.2s ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  )
}

function SliderRow({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{ fontSize: '12px', color: 'var(--pz-fg-3)', width: '80px', flexShrink: 0 }}>{label}</span>
      <div style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: '1.5px solid',
              borderColor: value === n ? 'var(--pz-violet)' : 'var(--pz-border)',
              background: value === n ? 'var(--pz-violet)' : 'transparent',
              color: value === n ? '#fff' : 'var(--pz-fg-3)',
              fontSize: '12px', fontWeight: 600,
              cursor: 'pointer', transition: 'all var(--pz-dur-base)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

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

  const sections: { key: keyof PPP; label: string; sharingKey: keyof CheckinSharing }[] = [
    { key: 'progress', label: 'Progress', sharingKey: 'progress' },
    { key: 'plans', label: 'Plaanid', sharingKey: 'plans' },
    { key: 'problems', label: 'Probleemid', sharingKey: 'problems' },
  ]

  return (
    <div
      style={{
        background: 'var(--pz-surface)', border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)', padding: '20px',
        boxShadow: 'var(--pz-shadow-md)', marginTop: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: 'var(--pz-fg-1)' }}>
        Sinu PPP
      </h3>
      {isManager && (
        <p style={{ margin: '0 0 16px', fontSize: '12px', color: 'var(--pz-fg-3)' }}>
          Vali, mida soovid tiimiga jagada (linnuke = nähtav tiimile)
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        {sections.map(({ key, label, sharingKey }) => (
          ppp[key].length > 0 && (
            <div key={key}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: 'var(--pz-violet)' }}>
                {label}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {ppp[key].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {isManager ? (
                      <input
                        type="checkbox"
                        checked={sharing[sharingKey].includes(idx)}
                        onChange={() => toggleShare(sharingKey, idx)}
                        style={{ marginTop: '3px', accentColor: 'var(--pz-violet)', flexShrink: 0 }}
                      />
                    ) : (
                      <span style={{ color: 'var(--pz-violet)', fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>•</span>
                    )}
                    <span style={{ fontSize: '14px', color: 'var(--pz-fg-1)', lineHeight: 1.5 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onSubmit}
          disabled={submitting}
          style={{
            padding: '8px 20px', borderRadius: 'var(--pz-radius-pill)',
            background: submitting ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
            border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600,
            cursor: submitting ? 'not-allowed' : 'pointer',
          }}
        >
          {submitting ? 'Salvestamine…' : 'Salvesta sisselogimine'}
        </button>
        <button
          onClick={onCancel}
          disabled={submitting}
          style={{
            padding: '8px 16px', borderRadius: 'var(--pz-radius-pill)',
            background: 'transparent', border: '1px solid var(--pz-border)',
            color: 'var(--pz-fg-3)', fontSize: '14px', cursor: 'pointer',
          }}
        >
          Tagasi
        </button>
      </div>
    </div>
  )
}

interface Props {
  userName: string
  userRole: UserRole
  hasCheckedInThisWeek: boolean
}

export function ChatClient({ userName: _userName, userRole, hasCheckedInThisWeek }: Props) {
  const [messages, setMessages] = useState<Message[]>([PPP_WELCOME])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [workload, setWorkload] = useState<number | null>(null)

  const [extracting, setExtracting] = useState(false)
  const [ppp, setPpp] = useState<PPP | null>(null)
  const [sharing, setSharing] = useState<CheckinSharing>({ progress: [], plans: [], problems: [] })
  const [submitting, setSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)

  const endRef = useRef<HTMLDivElement>(null)
  const isManager = userRole === 'manager' || userRole === 'admin'
  const showCheckinUI = !hasCheckedInThisWeek && !saved

  function scrollToBottom() {
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
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
      setSaved(true)
      setPpp(null)
      setMessages([{
        role: 'assistant',
        content: 'Sinu sisselogimine on salvestatud! Hea nädal! 🎉',
      }])
    } catch {
      setError('Sisselogimise salvestamine ebaõnnestus.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '12px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 4px' }}>Tiim AI</h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>Sinu isiklik meeskonna treener</p>
      </div>

      {/* Mood sliders — shown if not checked in yet */}
      {showCheckinUI && (
        <div
          style={{
            background: 'var(--pz-surface)', border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-md)', padding: '14px 16px',
            marginBottom: '12px', flexShrink: 0,
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}
        >
          <p style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: 'var(--pz-fg-3)' }}>
            SELLE NÄDALA HINNANGUD
          </p>
          <SliderRow label="Meeleolu" value={mood} onChange={setMood} />
          <SliderRow label="Energia" value={energy} onChange={setEnergy} />
          <SliderRow label="Töökoormus" value={workload} onChange={setWorkload} />
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 4px', display: 'flex', flexDirection: 'column' }}>
        {messages.map((m, i) => <ChatBubble key={i} message={m} />)}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && <TypingIndicator />}
        <div ref={endRef} />
      </div>

      {/* PPP review panel */}
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

      {error && <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--pz-danger)', flexShrink: 0 }}>{error}</p>}

      {/* Input area */}
      <div
        style={{
          flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '8px',
          background: 'var(--pz-surface)', border: '1px solid var(--pz-border)',
          borderRadius: 'var(--pz-radius-lg)', padding: '10px 14px',
          boxShadow: 'var(--pz-shadow-sm)', marginTop: '8px',
        }}
      >
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
            placeholder="Kirjuta sõnum… (Enter saadab)"
            rows={1}
            disabled={isStreaming}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: '14px', color: 'var(--pz-fg-1)', background: 'transparent',
              fontFamily: 'inherit', lineHeight: 1.5, maxHeight: '120px', overflowY: 'auto',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: !input.trim() || isStreaming ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
              border: 'none', color: '#fff', fontSize: '16px',
              cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            ↑
          </button>
        </div>

        {/* Save check-in button */}
        {showCheckinUI && !ppp && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={extractPPP}
              disabled={extracting || isStreaming}
              style={{
                padding: '5px 14px', borderRadius: 'var(--pz-radius-pill)',
                background: 'transparent', border: '1.5px solid var(--pz-violet)',
                color: 'var(--pz-violet)', fontSize: '12px', fontWeight: 600,
                cursor: extracting || isStreaming ? 'not-allowed' : 'pointer',
                opacity: extracting || isStreaming ? 0.5 : 1,
              }}
            >
              {extracting ? 'Töötlen PPP-d…' : 'Salvesta sisselogimine →'}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
      `}</style>
    </div>
  )
}
