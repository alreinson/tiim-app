'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import type { NewsItem, User } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

type Item = NewsItem & { author: { name: string } }

interface Member {
  id: string
  name: string
}

interface Props {
  initialItems: Item[]
  user: User
  members: Member[]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${dayNames[d.getDay()]} ${monthNames[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
}

export function TeamNewsClient({ initialItems, user, members }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [pinned, setPinned] = useState(false)
  const [posting, setPosting] = useState(false)

  const userGradient = getAvatarGradient(user.id)
  const userInitials = getInitials(user.name)

  function authorPostCount(authorId: string) {
    return items.filter((i) => i.author_id === authorId).length
  }

  const filteredItems = selectedAuthor
    ? items.filter((i) => i.author_id === selectedAuthor)
    : items

  async function post() {
    const content = draft.trim()
    if (!content || posting) return
    setPosting(true)
    try {
      const res = await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, pinned }),
      })
      if (!res.ok) throw new Error('Failed')
      const newItem = await res.json()
      const withAuthor: Item = { ...newItem, author: { name: user.name } }
      setItems((prev) => {
        const next = [withAuthor, ...prev]
        return next.sort((a, b) => Number(b.pinned) - Number(a.pinned))
      })
      setDraft('')
      setPinned(false)
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Team News
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Sirvi kõiki teadaandeid või keskendu ühe tiimiliikme postitustele.
        </p>
      </div>

      {/* Compose box */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '20px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
      }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          {/* User avatar */}
          <div style={{
            width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
            background: userGradient, display: 'grid', placeItems: 'center',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff', lineHeight: 1 }}>
              {userInitials}
            </span>
          </div>

          {/* Compose area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); post() } }}
              placeholder="Jaga uuendust tiimiga. Esmaspäevane sisselogimine ilmub siia automaatselt."
              rows={3}
              style={{
                width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px',
                background: '#f9fafb', padding: '11px 12px', resize: 'none',
                outline: 'none', fontSize: '13px', color: '#101828', lineHeight: 1.5,
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  style={{ accentColor: '#6030ff', width: '13px', height: '13px' }}
                />
                <span style={{ fontSize: '11px', fontWeight: 500, color: '#4a5565' }}>Kinnita üles</span>
              </label>

              <button
                onClick={post}
                disabled={!draft.trim() || posting}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '8px 18px', borderRadius: '10px', border: 'none',
                  background: !draft.trim() || posting
                    ? '#f2f4f7'
                    : 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)',
                  color: !draft.trim() || posting ? '#667085' : '#fff',
                  fontSize: '13px', fontWeight: 500,
                  cursor: !draft.trim() || posting ? 'not-allowed' : 'pointer',
                }}
              >
                <Send style={{ width: '13px', height: '13px' }} />
                {posting ? '…' : 'Saada'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Author filter pills */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* All authors */}
        <button
          onClick={() => setSelectedAuthor(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '9999px',
            background: selectedAuthor === null ? 'linear-gradient(165deg, #6030ff 0%, #1f4fd8 100%)' : '#fff',
            border: selectedAuthor === null ? 'none' : '1px solid #e5e7eb',
            color: selectedAuthor === null ? '#fff' : '#4a5565',
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            boxShadow: selectedAuthor === null ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
          } as React.CSSProperties}
        >
          Kõik autorid
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '18px', height: '18px', borderRadius: '9999px', fontSize: '10px', fontWeight: 500,
            background: selectedAuthor === null ? 'rgba(255,255,255,0.2)' : '#f9fafb',
            color: selectedAuthor === null ? '#fff' : '#667085',
          }}>
            {items.length}
          </span>
        </button>

        {/* Per-member pills */}
        {members.map((member) => {
          const count = authorPostCount(member.id)
          if (count === 0) return null
          const active = selectedAuthor === member.id
          const memberGradient = getAvatarGradient(member.id)
          const memberInitials = getInitials(member.name)
          const firstName = member.name.split(' ')[0]

          return (
            <button
              key={member.id}
              onClick={() => setSelectedAuthor(active ? null : member.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '6px 10px 6px 8px', borderRadius: '9999px',
                background: '#fff', cursor: 'pointer',
                border: `1px solid ${active ? '#6030ff' : '#e5e7eb'}`,
              }}
            >
              <div style={{
                width: '19px', height: '19px', borderRadius: '50%', flexShrink: 0,
                background: memberGradient, display: 'grid', placeItems: 'center',
              }}>
                <span style={{ fontSize: '8px', fontWeight: 500, color: '#fff' }}>{memberInitials}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: active ? '#6030ff' : '#4a5565' }}>
                {firstName}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '17px', height: '17px', borderRadius: '9999px', fontSize: '10px', fontWeight: 500,
                background: '#f9fafb', color: '#667085',
              }}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* News cards */}
      {filteredItems.length === 0 ? (
        <div style={{
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
          padding: '48px', textAlign: 'center', color: '#667085', fontSize: '13px',
        }}>
          Valitud autoril pole teadaandeid.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredItems.map((item) => {
            const itemInitials = getInitials(item.author.name)
            const itemGradient = getAvatarGradient(item.author_id)
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
                  background: itemGradient, display: 'grid', placeItems: 'center',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#fff', lineHeight: 1 }}>
                    {itemInitials}
                  </span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828' }}>
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

                  <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#344054', lineHeight: 1.6 }}>
                    {item.content}
                  </p>

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

                {/* Pin toggle */}
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
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
