'use client'

import { useState } from 'react'
import type { NewsItem } from '@/types'

type Item = NewsItem & { author: { name: string } }

interface Props {
  initialItems: Item[]
  canPin: boolean
}

export function AnnouncementsFeed({ initialItems, canPin }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [draft, setDraft] = useState('')
  const [posting, setPosting] = useState(false)

  async function post() {
    const content = draft.trim()
    if (!content || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('Failed')
      const newItem = await res.json()
      setItems((prev) => [newItem, ...prev])
      setDraft('')
    } catch {
      alert('Postitamine ebaõnnestus.')
    } finally {
      setPosting(false)
    }
  }

  async function togglePin(item: Item) {
    const updated = { ...item, pinned: !item.pinned }
    setItems((prev) => {
      const next = prev.map((i) => (i.id === item.id ? updated : i))
      return [...next].sort((a, b) => Number(b.pinned) - Number(a.pinned))
    })
    try {
      await fetch(`/api/news/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: updated.pinned }),
      })
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? item : i)))
    }
  }

  return (
    <section>
      <h2 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
        Teadaanded
      </h2>

      {/* Post form */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '16px',
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          borderRadius: 'var(--pz-radius-md)',
          padding: '10px 14px',
          boxShadow: 'var(--pz-shadow-sm)',
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }}
          placeholder="Lisa teadaanne…"
          rows={1}
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
          }}
        />
        <button
          onClick={post}
          disabled={!draft.trim() || posting}
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--pz-radius-pill)',
            background: !draft.trim() || posting ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
            border: 'none',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: !draft.trim() || posting ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          {posting ? '…' : 'Postita'}
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>Teadaandeid ei ole veel.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'var(--pz-surface)',
                border: item.pinned ? '1px solid var(--pz-violet)' : '1px solid var(--pz-border)',
                borderRadius: 'var(--pz-radius-md)',
                padding: '14px 16px',
                boxShadow: 'var(--pz-shadow-sm)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}
            >
              {item.pinned && (
                <span style={{ fontSize: '14px', flexShrink: 0, marginTop: '2px' }}>📌</span>
              )}
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 6px', fontSize: '14px', color: 'var(--pz-fg-1)', lineHeight: 1.5 }}>
                  {item.content}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                  {item.author.name} · {new Date(item.created_at).toLocaleDateString('et-EE')}
                </p>
              </div>
              {canPin && (
                <button
                  onClick={() => togglePin(item)}
                  title={item.pinned ? 'Eemalda kinnitus' : 'Kinnita'}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    opacity: item.pinned ? 1 : 0.35,
                    flexShrink: 0,
                    padding: '2px',
                    lineHeight: 1,
                  }}
                >
                  📌
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
