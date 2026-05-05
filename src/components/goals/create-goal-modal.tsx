'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  onClose: () => void
}

const LEVEL_OPTIONS = [
  { value: 'yearly', label: 'Aastane' },
  { value: 'quarterly', label: 'Kvartaalne' },
] as const

const TYPE_OPTIONS = [
  { value: 'work', label: 'Töö' },
  { value: 'development', label: 'Areng' },
] as const

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 'var(--pz-radius-md)',
  border: '1px solid var(--pz-border)',
  fontSize: '14px',
  color: 'var(--pz-fg-1)',
  background: 'var(--pz-surface)',
  outline: 'none',
  fontFamily: 'inherit',
}

const inputStyle: React.CSSProperties = {
  ...selectStyle,
}

const labelStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--pz-fg-2)',
  display: 'block',
  marginBottom: '6px',
}

export function CreateGoalModal({ open, onClose }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [level, setLevel] = useState<'yearly' | 'quarterly'>('quarterly')
  const [type, setType] = useState<'work' | 'development'>('work')
  const [quarter, setQuarter] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setTitle('')
    setLevel('quarterly')
    setType('work')
    setQuarter('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function save() {
    if (!title.trim()) return
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          level,
          type,
          quarter: quarter.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      handleClose()
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Salvestamine ebaõnnestus')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Lisa eesmärk</DialogTitle>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
          <div>
            <label style={labelStyle}>Eesmärgi nimetus *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mis on sinu eesmärk?"
              style={inputStyle}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tase</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as 'yearly' | 'quarterly')}
                style={selectStyle}
              >
                {LEVEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tüüp</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'work' | 'development')}
                style={selectStyle}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {level === 'quarterly' && (
            <div>
              <label style={labelStyle}>Kvartal (valikuline)</label>
              <input
                type="text"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                placeholder="nt Q2-2026"
                style={inputStyle}
              />
            </div>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-danger)' }}>{error}</p>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={isSaving}
            style={{
              padding: '8px 18px',
              borderRadius: 'var(--pz-radius-pill)',
              border: '1px solid var(--pz-border)',
              background: 'var(--pz-surface)',
              color: 'var(--pz-fg-2)',
              fontSize: '14px',
              fontWeight: 500,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              opacity: isSaving ? 0.5 : 1,
            }}
          >
            Tühista
          </button>
          <button
            onClick={save}
            disabled={!title.trim() || isSaving}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--pz-radius-pill)',
              border: 'none',
              background: !title.trim() || isSaving ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: !title.trim() || isSaving ? 'not-allowed' : 'pointer',
            }}
          >
            {isSaving ? 'Salvestan...' : 'Lisa eesmärk'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
