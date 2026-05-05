'use client'

import { useEffect, useRef, useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '12px',
      }}
    >
      {!isUser && (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--pz-grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '15px',
            flexShrink: 0,
            marginRight: '10px',
            alignSelf: 'flex-end',
          }}
        >
          🤖
        </div>
      )}
      <div
        style={{
          maxWidth: '75%',
          padding: '12px 16px',
          borderRadius: isUser
            ? 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm) var(--pz-radius-lg)'
            : 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm)',
          background: isUser ? 'var(--pz-grad-primary)' : 'var(--pz-surface)',
          border: isUser ? 'none' : '1px solid var(--pz-border)',
          color: isUser ? '#fff' : 'var(--pz-fg-1)',
          fontSize: '14px',
          lineHeight: 1.6,
          boxShadow: 'var(--pz-shadow-sm)',
          whiteSpace: 'pre-wrap',
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
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--pz-grad-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          flexShrink: 0,
        }}
      >
        🤖
      </div>
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 'var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-lg) var(--pz-radius-sm)',
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          display: 'flex',
          gap: '4px',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--pz-fg-3)',
              animation: `bounce 1.2s ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const WELCOME: Message = {
  role: 'assistant',
  content:
    'Tere! Olen Tiim, sinu AI meeskonna treener. Saan aidata sul mõtiskleda eesmärkide, väljakutsete ja nädala üle. Millest tahaksid rääkida?',
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  async function sendMessage() {
    const text = input.trim()
    if (!text || isStreaming) return

    setInput('')
    setError(null)

    const userMessage: Message = { role: 'user', content: text }
    const history = [...messages, userMessage]
    setMessages(history)
    setIsStreaming(true)

    const apiMessages = history
      .filter((m) => m !== WELCOME)
      .map((m) => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Viga')
      }

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
      }
    } catch (err) {
      setError('Sõnumi saatmine ebaõnnestus. Proovi uuesti.')
      console.error(err)
    } finally {
      setIsStreaming(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 120px)',
        maxWidth: '720px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 'var(--pz-s-4)', flexShrink: 0 }}>
        <h1
          style={{
            fontSize: '26px',
            fontWeight: 700,
            color: 'var(--pz-fg-1)',
            margin: '0 0 4px',
          }}
        >
          Tiim AI
        </h1>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          Sinu isiklik meeskonna treener
        </p>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 4px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((m, i) => (
          <ChatBubble key={i} message={m} />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <TypingIndicator />
        )}
        <div ref={endRef} />
      </div>

      {/* Error */}
      {error && (
        <p
          style={{
            margin: '0 0 8px',
            fontSize: '13px',
            color: 'var(--pz-danger)',
            flexShrink: 0,
          }}
        >
          {error}
        </p>
      )}

      {/* Input */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          borderRadius: 'var(--pz-radius-lg)',
          padding: '10px 14px',
          boxShadow: 'var(--pz-shadow-sm)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Kirjuta sõnum... (Enter saadab)"
          rows={1}
          disabled={isStreaming}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '14px',
            color: 'var(--pz-fg-1)',
            background: 'transparent',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            maxHeight: '120px',
            overflowY: 'auto',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || isStreaming}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: !input.trim() || isStreaming ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
            border: 'none',
            color: '#fff',
            fontSize: '16px',
            cursor: !input.trim() || isStreaming ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background var(--pz-dur-base)',
          }}
        >
          ↑
        </button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
