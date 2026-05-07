'use client'

import { useState } from 'react'
import type { NewsItem } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

type Item = NewsItem & { author: { name: string } }

interface Props {
  initialItems: Item[]
  canPin: boolean
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${dayNames[d.getDay()]} ${monthNames[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Compose box — managers only */}
      {canPin && (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '16px 20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
          display: 'flex', gap: '12px', alignItems: 'flex-start',
        }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }}
            placeholder="Postita uuendus…"
            rows={2}
            style={{
              flex: 1, border: 'none', outline: 'none', resize: 'none',
              fontSize: '13px', color: '#101828', background: 'transparent',
              fontFamily: 'inherit', lineHeight: 1.5,
            }}
          />
          <button
            onClick={post}
            disabled={!draft.trim() || posting}
            style={{
              padding: '8px 16px', borderRadius: '9999px', flexShrink: 0,
              background: !draft.trim() || posting ? '#f2f4f7' : 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)',
              border: 'none', color: !draft.trim() || posting ? '#667085' : '#fff',
              fontSize: '13px', fontWeight: 600,
              cursor: !draft.trim() || posting ? 'not-allowed' : 'pointer',
            }}
          >
            {posting ? '…' : 'Postita'}
          </button>
        </div>
      )}

      {/* News items */}
      {items.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>Teadaandeid ei ole veel.</p>
      ) : (
        items.map((item) => {
          const initials = getInitials(item.author.name)
          const gradient = getAvatarGradient(item.author_id)
          return (
            <div
              key={item.id}
              style={{
                background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
                display: 'flex', gap: '12px', alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: gradient, display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff', lineHeight: 1 }}>
                  {initials}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', whiteSpace: 'nowrap' }}>
                    {item.author.name}
                  </span>
                  {item.pinned && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', color: '#6030ff', fontWeight: 500 }}>
                      📌 Kinnitatud
                    </span>
                  )}
                  <span style={{ fontSize: '11px', color: '#667085', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Content text */}
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#344054', lineHeight: 1.6 }}>
                  {item.content}
                </p>

                {/* Reactions row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '9999px',
                    border: '1px dashed #d0d5dd', background: 'transparent',
                    fontSize: '11px', fontWeight: 500, color: '#667085', cursor: 'pointer',
                  }}>
                    + Reageeri
                  </button>
                </div>
              </div>

              {/* Pin/unpin button for managers */}
              {canPin && (
                <button
                  onClick={() => togglePin(item)}
                  title={item.pinned ? 'Eemalda kinnitus' : 'Kinnita'}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '16px', opacity: item.pinned ? 1 : 0.3,
                    flexShrink: 0, padding: '2px', lineHeight: 1,
                    alignSelf: 'flex-start',
                  }}
                >
                  📌
                </button>
              )}
            </div>
          )
        })
      )}
    </div>
  )
}
